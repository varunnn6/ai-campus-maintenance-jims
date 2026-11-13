import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, ActivityLog } from '../models/index.js';

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { _id: user._id, id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await ActivityLog.create({
      action: 'USER_LOGGED_IN',
      userId: user._id,
      userName: user.name,
      details: { role: user.role }
    });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      // In demo mode or if not found, return req.user
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
      phone: t.phone
    }));
    return res.json(sanitized);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching technicians', error: err.message });
  }
};
