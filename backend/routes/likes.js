const express = require('express');
const pool = require('../db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Like/Unlike an issue (toggle)
router.post('/:issueId', auth, async (req, res) => {
  try {
    const { issueId } = req.params;

    // Check if already liked
    const existingLike = await pool.query(
      'SELECT * FROM likes WHERE issue_id = $1 AND user_id = $2',
      [issueId, req.user.id]
    );

    if (existingLike.rows.length > 0) {
      // Unlike: Remove the like
      await pool.query(
        'DELETE FROM likes WHERE issue_id = $1 AND user_id = $2',
        [issueId, req.user.id]
      );
    } else {
      // Like: Add the like
      await pool.query(
        'INSERT INTO likes (issue_id, user_id) VALUES ($1, $2)',
        [issueId, req.user.id]
      );
    }

    // Get updated like count
    const likeCount = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE issue_id = $1',
      [issueId]
    );

    res.json({ likes: parseInt(likeCount.rows[0].count) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unlike an issue
router.delete('/:issueId', auth, async (req, res) => {
  try {
    const { issueId } = req.params;
    
    // Remove like
    await pool.query(
      'DELETE FROM likes WHERE issue_id = $1 AND user_id = $2',
      [issueId, req.user.id]
    );
    
    // Get like count
    const likeCount = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE issue_id = $1',
      [issueId]
    );
    
    res.json({ likes: parseInt(likeCount.rows[0].count) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get like count for an issue
router.get('/:issueId/count', async (req, res) => {
  try {
    const { issueId } = req.params;
    
    const likeCount = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE issue_id = $1',
      [issueId]
    );
    
    res.json({ likes: parseInt(likeCount.rows[0].count) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
