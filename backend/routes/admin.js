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

// Get activity logs
router.get('/activity-logs', auth, isAdmin, async (req, res) => {
  try {
    const logs = await pool.query(`
      SELECT * FROM (
        SELECT 
          'Issue Created' as action,
          u.name as user_name,
          'Created issue: ' || i.title as details,
          i.created_at
        FROM issues i
        LEFT JOIN users u ON i.created_by = u.id
        
        UNION ALL
        
        SELECT 
          'Comment Added' as action,
          u.name as user_name,
          'Commented on: ' || i.title as details,
          c.created_at
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN issues i ON c.issue_id = i.id
        
        UNION ALL
        
        SELECT 
          'Issue Liked' as action,
          u.name as user_name,
          'Liked issue: ' || i.title as details,
          l.created_at
        FROM likes l
        LEFT JOIN users u ON l.user_id = u.id
        LEFT JOIN issues i ON l.issue_id = i.id
        
        UNION ALL
        
        SELECT 
          'User Registered' as action,
          u.name as user_name,
          'Joined as ' || u.role as details,
          u.created_at
        FROM users u
      ) activities
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json({ logs: logs.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user ward
router.patch('/users/:id/ward', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ward_number } = req.body;

    const updatedUser = await pool.query(
      'UPDATE users SET ward_number = $1 WHERE id = $2 RETURNING id, name, email, role, ward_number',
      [ward_number, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Ward updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update issue priority
router.patch('/issues/:id/priority', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    const updatedIssue = await pool.query(
      'UPDATE issues SET priority = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [priority, new Date(), id]
    );

    if (updatedIssue.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({
      message: 'Issue priority updated successfully',
      issue: updatedIssue.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send reminder emails to officials with pending issues
router.post('/send-reminders', auth, isAdmin, async (req, res) => {
  try {
    const officials = await pool.query(
      'SELECT id, name, email FROM users WHERE role = $1',
      ['official']
    );

    let remindersSent = 0;
    const EmailService = require('../services/EmailService');

    for (const official of officials.rows) {
      const pendingIssues = await pool.query(
        'SELECT id, title, category, created_at FROM issues WHERE assigned_to = $1 AND status IN ($2, $3)',
        [official.id, 'pending', 'in_progress']
      );

      if (pendingIssues.rows.length > 0) {
        // Skip email in production if service not configured
        if (process.env.NODE_ENV !== 'production' || EmailService.transporter || EmailService.useSendGrid) {
          try {
            await Promise.race([
              EmailService.sendIssueReminderEmail(
                official.email,
                official.name,
                pendingIssues.rows
              ),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
          } catch (emailError) {
            console.log('⚠️ Email skipped for', official.email);
          }
        }
        remindersSent++;
      }
    }

    res.json({ message: `Reminders processed for ${remindersSent} official(s)` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
