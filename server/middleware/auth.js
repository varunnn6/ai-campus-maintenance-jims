import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jims_mca_predictive_maintenance_secret_key_2026';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Check if demo user header is passed for seamless testing
    const demoRole = req.headers['x-demo-role'];
    if (demoRole) {
      // Pick up real identity hints if provided alongside x-demo-role
      const demoName = req.headers['x-demo-name'];
      const demoEmail = req.headers['x-demo-email'];
      const demoEnrollment = req.headers['x-demo-enrollment'];
      req.user = {
        _id: `demo-${demoRole}`,
        role: demoRole,
        name: demoName || `Demo ${demoRole.charAt(0).toUpperCase() + demoRole.slice(1)}`,
        email: demoEmail || `${demoRole}@jims.edu`,
        enrollmentNumber: demoEnrollment || null
      };
      return next();
    }
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Soft auth: attaches user if token or demo header present, but never blocks unauthenticated requests
export const softAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) {}
  } else {
    const demoRole = req.headers['x-demo-role'];
    if (demoRole) {
      const demoName = req.headers['x-demo-name'];
      const demoEmail = req.headers['x-demo-email'];
      const demoEnrollment = req.headers['x-demo-enrollment'];
      req.user = {
        _id: `demo-${demoRole}`,
        role: demoRole,
        name: demoName || `Demo ${demoRole.charAt(0).toUpperCase() + demoRole.slice(1)}`,
        email: demoEmail || `${demoRole}@jims.edu`,
        enrollmentNumber: demoEnrollment || null
      };
    }
  }
  next();
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Role '${req.user ? req.user.role : 'anonymous'}' is not authorized.` 
      });
    }
    next();
  };
};
