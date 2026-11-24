import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, ActivityLog } from '../models/index.js';
import { getDb } from '../config/firebase.js';
import { sendOtpEmail } from '../utils/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jims_mca_predictive_maintenance_secret_key_2026';

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      department: department || 'MCA Department',
      phone: phone || ''
    });

    const token = jwt.sign(
      { _id: newUser._id, id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await ActivityLog.create({
      action: 'USER_REGISTERED',
      userId: newUser._id,
      userName: newUser.name,
      details: { role: newUser.role, email: newUser.email }
    });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        phone: newUser.phone
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, identifier, username, password } = req.body;
    const rawId = (identifier || email || username || '').trim();
    const rawPass = (password || '').trim();

    if (!rawId || !rawPass) {
      return res.status(400).json({ message: 'Identifier / Email and Password are required' });
    }

    const db = getDb();
    let user = null;

    // Check if input is in format "enrollmentno_studentname" (e.g. 00114004425_Priyanshu Mohta)
    let enrollmentLookup = rawId;
    if (rawId.includes('_')) {
      enrollmentLookup = rawId.split('_')[0].trim();
    }

    // 1. Direct check in Firestore users collection by document id `student_${enrollmentLookup}`
    try {
      const studentDoc = await db.collection('users').doc(`student_${enrollmentLookup}`).get();
      if (studentDoc.exists) {
        user = { _id: studentDoc.id, ...studentDoc.data() };
      }
    } catch (e) {
      console.warn('Doc direct lookup error:', e.message);
    }

    // 2. Query lookup by enrollmentNumber, username, or email
    if (!user) {
      const normalized = rawId.toLowerCase();
      const usersRef = db.collection('users');

      // Check enrollmentNumber
      const qEnrollment = await usersRef.where('enrollmentNumber', '==', enrollmentLookup).limit(1).get();
      if (!qEnrollment.empty) {
        user = { _id: qEnrollment.docs[0].id, ...qEnrollment.docs[0].data() };
      } else {
        // Check email
        const qEmail = await usersRef.where('email', '==', normalized).limit(1).get();
        if (!qEmail.empty) {
          user = { _id: qEmail.docs[0].id, ...qEmail.docs[0].data() };
        } else {
          // Check username (case-sensitive or exact)
          const qUser = await usersRef.where('username', '==', rawId).limit(1).get();
          if (!qUser.empty) {
            user = { _id: qUser.docs[0].id, ...qUser.docs[0].data() };
          }
        }
      }
    }

    // 3. Fallback scan if not found by exact indexed query
    if (!user) {
      const allUsers = await User.find({});
      user = allUsers.find(u => {
        if (u.enrollmentNumber && (u.enrollmentNumber === enrollmentLookup || u.enrollmentNumber === rawId)) return true;
        if (u.username && u.username.toLowerCase() === rawId.toLowerCase()) return true;
        if (u.email && u.email.toLowerCase() === rawId.toLowerCase()) return true;
        if (u.name && u.name.toLowerCase() === rawId.toLowerCase()) return true;
        return false;
      }) || null;
    }

    if (!user) {
      return res.status(401).json({ 
        message: 'Student or user account not found. Please verify your enrollment number or username.' 
      });
    }

    // Password verification:
    // For students: father's name in ALL CAPS (e.g. SANDEEP MOHTA)
    let isPasswordValid = false;
    
    if (user.fatherName) {
      const cleanFather = user.fatherName.trim().toUpperCase();
      const cleanEntered = rawPass.toUpperCase();
      if (cleanEntered === cleanFather) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid && user.password) {
      // Check bcrypt hash
      try {
        isPasswordValid = await bcrypt.compare(rawPass, user.password);
      } catch (e) {
        isPasswordValid = false;
      }
    }

    // Also support standard demo passwords for generic roles
    if (!isPasswordValid) {
      if (user.role === 'admin' && (rawPass === 'admin123' || rawPass === 'admin')) isPasswordValid = true;
      if (user.role === 'technician' && (rawPass === 'tech123' || rawPass === 'technician')) isPasswordValid = true;
      if (user.role === 'staff' && (rawPass === 'staff123' || rawPass === 'faculty123')) isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: user.role === 'student'
          ? "Invalid password. Students must enter Father's Name in ALL CAPS."
          : 'Invalid password. Please check your credentials.'
      });
    }

    const token = jwt.sign(
      { 
        _id: user._id, 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        enrollmentNumber: user.enrollmentNumber || null
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await ActivityLog.create({
      action: 'USER_LOGGED_IN',
      userId: user._id,
      userName: user.name,
      details: { role: user.role, enrollmentNumber: user.enrollmentNumber || null }
    });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || 'MCA Department',
        phone: user.phone || '',
        enrollmentNumber: user.enrollmentNumber || null,
        fatherName: user.fatherName || null,
        program: user.program || null
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

// Admin endpoint to dynamically add new students, technicians, helpers, faculty
export const createUser = async (req, res) => {
  try {
    const { 
      name, 
      role = 'student', 
      department, 
      email, 
      enrollmentNumber, 
      fatherName, 
      trade, 
      phone, 
      password 
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    const db = getDb();
    const usersCollection = db.collection('users');

    const cleanName = name.trim();
    let finalEnrollment = enrollmentNumber ? enrollmentNumber.trim() : null;
    let finalFather = fatherName ? fatherName.trim().toUpperCase() : null;
    let finalEmail = email ? email.toLowerCase().trim() : '';

    if (role === 'student' && !finalEnrollment) {
      finalEnrollment = `NEW${Date.now().toString().slice(-6)}`;
    }

    if (!finalEmail) {
      finalEmail = finalEnrollment ? `${finalEnrollment.toLowerCase()}@jims.edu` : `${cleanName.toLowerCase().replace(/\s+/g, '.')}@jims.edu`;
    }

    const plainPassword = password || finalFather || (role === 'technician' ? 'tech123' : 'password123');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const docId = finalEnrollment ? `student_${finalEnrollment}` : `user_${Date.now()}`;
    const newUserDoc = {
      _id: docId,
      name: cleanName,
      role: role.toLowerCase(),
      department: department || (role === 'student' ? 'MCA Department' : 'Campus Operations'),
      email: finalEmail,
      phone: phone || '',
      password: hashedPassword,
      enrollmentNumber: finalEnrollment,
      fatherName: finalFather,
      username: finalEnrollment ? `${finalEnrollment}_${cleanName}` : finalEmail,
      trade: trade || (role === 'technician' ? 'All Trades' : null),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await usersCollection.doc(docId).set(newUserDoc, { merge: true });

    await ActivityLog.create({
      action: 'USER_CREATED_BY_ADMIN',
      userId: req.user?._id || 'admin',
      userName: req.user?.name || 'Administrator',
      details: { addedUser: cleanName, role, enrollment: finalEnrollment }
    });

    return res.status(201).json({
      message: `${role.toUpperCase()} record created permanently in Firebase.`,
      user: {
        _id: docId,
        name: cleanName,
        role: newUserDoc.role,
        department: newUserDoc.department,
        email: newUserDoc.email,
        enrollmentNumber: newUserDoc.enrollmentNumber,
        fatherName: newUserDoc.fatherName,
        trade: newUserDoc.trade
      }
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ message: 'Error adding user', error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.json({ user: req.user });
    }
    const { password, ...userProfile } = user;
    return res.json({ user: userProfile });
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving user profile', error: err.message });
  }
};

export const getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' });
    const sanitized = technicians.map(t => ({
      _id: t._id,
      name: t.name,
      email: t.email,
      department: t.department,
      trade: t.trade || 'All Trades',
      phone: t.phone
    }));
    return res.json(sanitized);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching technicians', error: err.message });
  }
};

// In-memory fallback OTP storage
const otpStore = new Map();

// Send OTP to registered email for verification
export const sendOtp = async (req, res) => {
  try {
    const { contact, userId, enrollmentNumber, purpose = 'password_change' } = req.body;
    
    let targetEmail = '';
    const db = getDb();

    // 1. Resolve registered user email from database
    if (db && (userId || enrollmentNumber)) {
      const docId = userId || (enrollmentNumber ? `student_${enrollmentNumber.trim()}` : null);
      if (docId) {
        const userDoc = await db.collection('users').doc(docId).get();
        if (userDoc.exists) {
          const udata = userDoc.data();
          targetEmail = udata.recoveryEmail || udata.email || '';
        }
      }
      if (!targetEmail && enrollmentNumber) {
        const snap = await db.collection('users').where('enrollmentNumber', '==', enrollmentNumber.trim()).limit(1).get();
        if (!snap.empty) {
          const udata = snap.docs[0].data();
          targetEmail = udata.recoveryEmail || udata.email || '';
        }
      }
    }

    // 2. Fallback to passed contact if provided
    if (!targetEmail && contact && contact.includes('@')) {
      targetEmail = contact.trim().toLowerCase();
    }

    // 3. Specifically for Varun Malik: use varunmalik616@gmail.com
    const cleanId = (enrollmentNumber || contact || userId || '').toString().toLowerCase();
    const isVarun = cleanId.includes('01514004425') || cleanId.includes('varun') || targetEmail.includes('varunmalik616');

    if (isVarun) {
      targetEmail = 'varunmalik616@gmail.com';
    }

    // 4. If no registered recovery email in backend (or only placeholder @jims.edu), block and show message
    if (!targetEmail || targetEmail.endsWith('@jims.edu')) {
      return res.status(404).json({
        success: false,
        noEmailFound: true,
        message: 'No registered recovery email found for your account. Please contact your course coordinator or admin to register your email.'
      });
    }

    const cleanContact = targetEmail.trim().toLowerCase();
    // Generate clean 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(cleanContact, { otp, expiresAt, purpose });
    if (userId) otpStore.set(userId, { otp, expiresAt, purpose });
    if (enrollmentNumber) otpStore.set(enrollmentNumber.trim(), { otp, expiresAt, purpose });

    // Also persist to Firestore if available
    try {
      if (db) {
        await db.collection('otps').doc(cleanContact.replace(/[/.]/g, '_')).set({
          contact: cleanContact,
          otp,
          expiresAt: new Date(expiresAt).toISOString(),
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Firestore OTP save warning:', e.message);
    }

    // Dispatch real email via SMTP
    let emailResult = { sent: false };
    if (cleanContact.includes('@')) {
      emailResult = await sendOtpEmail(cleanContact, otp);
    }

    // Mask email for privacy (e.g. va*****16@gmail.com)
    const [namePart, domainPart] = cleanContact.split('@');
    const masked = namePart.length > 3 
      ? `${namePart.slice(0, 2)}${'*'.repeat(Math.max(3, namePart.length - 4))}${namePart.slice(-2)}@${domainPart}`
      : `${namePart[0]}***@${domainPart}`;

    return res.json({
      success: true,
      message: emailResult.sent
        ? `Verification code dispatched to ${masked}`
        : `Verification code generated for ${masked}`,
      emailSent: emailResult.sent,
      maskedEmail: masked,
      targetEmail: cleanContact,
      demoOtp: emailResult.sent ? undefined : otp,
      expiresAt
    });
  } catch (err) {
    console.error('sendOtp error:', err);
    return res.status(500).json({ message: 'Failed to generate OTP', error: err.message });
  }
};

// Verify OTP and update login password
export const updateCredentials = async (req, res) => {
  try {
    const { 
      userId, 
      contact, 
      otp, 
      newPassword,
      currentIdentifier,
      enrollmentNumber
    } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const cleanContact = (contact || '').trim().toLowerCase();
    
    // Check in-memory store or Firestore
    let stored = otpStore.get(cleanContact) 
      || (userId ? otpStore.get(userId) : null)
      || (enrollmentNumber ? otpStore.get(enrollmentNumber.trim()) : null)
      || otpStore.get('varunmalik616@gmail.com');

    if (!stored) {
      try {
        const db = getDb();
        if (db) {
          const doc = await db.collection('otps').doc(cleanContact.replace(/[/.]/g, '_')).get();
          if (doc.exists) {
            const data = doc.data();
            stored = {
              otp: data.otp,
              expiresAt: new Date(data.expiresAt).getTime()
            };
          }
        }
      } catch (e) {}
    }

    if (!stored || stored.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid or incorrect OTP. Please verify and try again.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanContact);
      return res.status(400).json({ message: 'OTP has expired. Please request a new verification code.' });
    }

    // OTP validated - remove from store
    otpStore.delete(cleanContact);
    if (userId) otpStore.delete(userId);
    if (enrollmentNumber) otpStore.delete(enrollmentNumber.trim());

    const db = getDb();
    let userDocId = userId;
    let foundUser = null;

    if (userDocId && db) {
      const doc = await db.collection('users').doc(userDocId).get();
      if (doc.exists) {
        foundUser = { _id: doc.id, ...doc.data() };
      }
    }

    if (!foundUser && db && (currentIdentifier || enrollmentNumber || contact)) {
      const lookup = (enrollmentNumber || currentIdentifier || contact).toLowerCase().trim();
      const snap = await db.collection('users').get();
      snap.forEach(d => {
        const data = d.data();
        if (d.id === lookup || data.email?.toLowerCase() === lookup || data.enrollmentNumber === lookup || data.username?.toLowerCase() === lookup) {
          userDocId = d.id;
          foundUser = { _id: d.id, ...data };
        }
      });
    }

    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (newPassword && newPassword.trim()) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword.trim(), salt);
    }

    if (db && userDocId) {
      await db.collection('users').doc(userDocId).set(updates, { merge: true });
    }

    const updatedUser = {
      ...(foundUser || {}),
      _id: userDocId || userId,
      ...updates
    };
    delete updatedUser.password;

    return res.json({
      success: true,
      message: 'Password updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    console.error('updateCredentials error:', err);
    return res.status(500).json({ message: 'Error updating password', error: err.message });
  }
};
