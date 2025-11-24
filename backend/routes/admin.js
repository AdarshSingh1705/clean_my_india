const express = require('express');
const pool = require('../db');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get system statistics
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const issuesCount = await pool.query('SELECT COUNT(*) FROM issues');
    const resolvedIssuesCount = await pool.query('SELECT COUNT(*) FROM issues WHERE status = $1', ['resolved']);
    const pendingIssuesCount = await pool.query('SELECT COUNT(*) FROM issues WHERE status != $1', ['resolved']);

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalIssues: parseInt(issuesCount.rows[0].count),
      resolvedIssues: parseInt(resolvedIssuesCount.rows[0].count),
      pendingIssues: parseInt(pendingIssuesCount.rows[0].count)
    });
  } catch (error) {
    console.error("🔥 ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const users = await pool.query(
      'SELECT id, name, email, role, ward_number, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: users.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.patch('/users/:id/role', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['citizen', 'official', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, ward_number',
      [role, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
