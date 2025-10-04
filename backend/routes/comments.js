const express = require('express');
const pool = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get comments for an issue
router.get('/issue/:issueId', async (req, res) => {
  try {
    const { issueId } = req.params;

    const comments = await pool.query(`
      SELECT comments.*, users.name as user_name 
      FROM comments 
      LEFT JOIN users ON comments.user_id = users.id 
      WHERE issue_id = $1 
      ORDER BY created_at ASC
    `, [issueId]);

    res.json(comments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to issue (support /comments/:issueId/comment)
router.post('/:issueId/comment', auth, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // check issue exists
    const issueCheck = await pool.query('SELECT * FROM issues WHERE id=$1', [issueId]);
    if (issueCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const newComment = await pool.query(
      'INSERT INTO comments (issue_id, user_id, text) VALUES ($1, $2, $3) RETURNING *',
      [issueId, req.user.id, text]
    );

    const commentWithUser = await pool.query(`
      SELECT comments.*, users.name as user_name 
      FROM comments 
      LEFT JOIN users ON comments.user_id = users.id 
      WHERE comments.id = $1
    `, [newComment.rows[0].id]);

    res.status(201).json(commentWithUser.rows[0]);
  } catch (err) {
    console.error('Error adding comment:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
