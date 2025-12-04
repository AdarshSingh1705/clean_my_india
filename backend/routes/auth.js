const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
const { auth } = require('../middleware/auth');

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  throw new Error('JWT_SECRET must be defined');
}

console.log('[auth.js] Routes being defined...');

// Register new user
router.post('/register', async (req, res) => {
  try {
    console.log('[register] POST /register received');
    console.log('[register] Request body:', req.body);
    console.log('[register] Content-Type:', req.headers['content-type']);

    const { name, email, password, role, pin_code } = req.body;

    // Validate input
    if (!name || !email || !password || !pin_code) {
      return res.status(400).json({ message: 'Name, email, password, and pin code are required' });
    }

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      console.log('Registration failed: User already exists with email:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('[register] Password hashed successfully');

    // Create user
    console.log('[register] Attempting to insert user into database...');
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, role, pin_code) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, role, pin_code, created_at`,
      [name, email, hashedPassword, role || 'citizen', pin_code]
    );
    console.log('[register] User inserted successfully:', newUser.rows[0]);

    // Generate JWT token
    console.log('[register] Generating JWT token...');
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    console.log('[register] JWT token generated successfully');

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    console.error("REGISTER ERROR STACK:", err.stack);
    res.status(500).json({ message: err.message || "server error" });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log('Login failed: User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0]; // <-- user object

    // Check password
    const isMatch = await bcrypt.compare(password, user.password); // ✅ user.password
    if (!isMatch) {
      console.log('Login failed: Password mismatch for user:', user.email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (error) {
    console.error("🔥 ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});

// Forgot Password - Send Reset Email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }
    
    const user = result.rows[0];
    
    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Send email
    const EmailService = require('../services/EmailService');
    await EmailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    
    res.json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password with Token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;
    
    if (!token || !new_password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, decoded.id]
    );
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, name, email, role, ward_number, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (error) {
    console.error("🔥 ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
