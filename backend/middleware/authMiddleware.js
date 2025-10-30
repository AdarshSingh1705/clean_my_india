// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // so routes can use req.user.id and req.user.role
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message || err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticateToken;
