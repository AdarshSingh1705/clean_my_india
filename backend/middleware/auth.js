const jwt = require('jsonwebtoken');
const pool = require('../db');

// Auth middleware: verifies JWT, loads user from DB and attaches to req.user
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ message: 'Please authenticate' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Fetch full user from DB to get current role and other details
    const result = await pool.query(
      'SELECT id, name, email, role, ward_number FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!result.rows.length) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = result.rows[0];
    req.userRole = result.rows[0].role;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Generic role checker
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ message: 'Please authenticate' });
    }
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Access denied: insufficient privileges' });
    }
    next();
  };
};

// Backwards-compatible helpers
const isOfficial = checkRole('official', 'admin');
const isAdmin = checkRole('admin');

module.exports = { auth, checkRole, isOfficial, isAdmin };
