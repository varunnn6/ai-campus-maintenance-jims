import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, ActivityLog } from '../models/index.js';
import { getDb } from '../config/firebase.js';

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
