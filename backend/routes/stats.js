const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get platform statistics
router.get('/', async (req, res) => {
  try {
    console.log('Stats endpoint called');
    
    // Total issues
    const totalIssuesResult = await pool.query('SELECT COUNT(*) FROM issues');
    console.log('Total issues query result:', totalIssuesResult.rows[0]);
    const totalIssues = parseInt(totalIssuesResult.rows[0].count);

    // Resolved issues
    const resolvedIssuesResult = await pool.query(
      "SELECT COUNT(*) FROM issues WHERE status = 'resolved'"
    );
    console.log('Resolved issues query result:', resolvedIssuesResult.rows[0]);
    const resolvedIssues = parseInt(resolvedIssuesResult.rows[0].count);

    // Total users
    const totalUsersResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log('Total users query result:', totalUsersResult.rows[0]);
    const activeUsers = parseInt(totalUsersResult.rows[0].count);

    // Cities covered (unique pin codes from users table)
    let citiesCovered = 0;
    try {
      const citiesCoveredResult = await pool.query(
        'SELECT COUNT(DISTINCT pin_code) FROM users WHERE pin_code IS NOT NULL AND pin_code != \'\''
      );
      console.log('Cities covered query result:', citiesCoveredResult.rows[0]);
      citiesCovered = parseInt(citiesCoveredResult.rows[0].count) || 0;
    } catch (err) {
      console.log('pin_code column error:', err.message);
      citiesCovered = 0;
    }

    const stats = {
      totalIssues,
      resolvedIssues,
      activeUsers,
      citiesCovered
    };
    
    console.log('Sending stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
