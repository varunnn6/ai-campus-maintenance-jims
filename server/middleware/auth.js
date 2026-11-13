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
      req.user = {
        _id: `demo-${demoRole}`,
        role: demoRole,
        name: `Demo ${demoRole.toUpperCase()}`,
        email: `${demoRole}@jims.edu`
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
