const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db');
const { auth, isOfficial, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all issues with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        issues.*, 
        users.name as creator_name,
        (SELECT COUNT(*) FROM comments WHERE issue_id = issues.id) AS comment_count,
        (SELECT COUNT(*) FROM likes WHERE issue_id = issues.id) AS like_count
      FROM issues 
      LEFT JOIN users ON issues.created_by = users.id
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM issues';
    let conditions = [];
    let params = [];
    let paramCount = 0;
    
    // Add filters if provided
    if (status) {
      paramCount++;
      conditions.push(`status = $${paramCount}`);
      params.push(status);
    }
    
    if (category) {
      paramCount++;
      conditions.push(`category = $${paramCount}`);
      params.push(category);
    }
    
    if (priority) {
      paramCount++;
      conditions.push(`priority = $${paramCount}`);
      params.push(priority);
    }
    
    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }
    
    // Add ordering and pagination
    query += ' ORDER BY issues.created_at DESC';
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);
    
    // Execute queries
    const issuesResult = await pool.query(query, params);
    const countResult = await pool.query(countQuery, params.slice(0, conditions.length));
    
    res.json({
      issues: issuesResult.rows || [], // ✅ Always return an array
      total: parseInt(countResult.rows[0]?.count || 0),
      page: parseInt(page),
      totalPages: Math.ceil((countResult.rows[0]?.count || 0) / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});
  /**
   * ✅ Get single issue by ID
   */
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const issueResult = await pool.query(
        `
        SELECT 
          issues.*, 
          users.name AS creator_name,
          assigned.name AS assigned_to_name
        FROM issues 
        LEFT JOIN users ON issues.created_by = users.id
        LEFT JOIN users AS assigned ON issues.assigned_to = assigned.id
        WHERE issues.id = $1
      `,
        [id]
      );   
       if (issueResult.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // Get comments
    const commentsResult = await pool.query(`
      SELECT comments.*, users.name as user_name 
      FROM comments 
      LEFT JOIN users ON comments.user_id = users.id 
      WHERE issue_id = $1 
      ORDER BY created_at ASC
    `, [id]);
    
    // Get like count
    const likesResult = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE issue_id = $1',
      [id]
    );
    
    // Check if current user has liked this issue
    let userLiked = false;
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const userLikeResult = await pool.query(
          'SELECT * FROM likes WHERE issue_id = $1 AND user_id = $2',
          [id, decoded.id]
        );
        
        userLiked = userLikeResult.rows.length > 0;
      } catch (error) {
        // Token is invalid or not provided, user is not logged in
        userLiked = false;
      }
    }
    
    res.json({
      ...issueResult.rows[0],
      comments: commentsResult.rows,
      like_count: parseInt(likesResult.rows[0].count),
      user_liked: userLiked
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new issue
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, priority } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    // Create issue
    const newIssue = await pool.query(
      `INSERT INTO issues 
       (title, description, category, latitude, longitude, image_url, created_by, priority) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [title, description, category, latitude, longitude, image_url, req.user.id, priority || 'medium']
    );
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.emit('new-issue', newIssue.rows[0]);
    
    res.status(201).json({
      message: 'Issue reported successfully',
      issue: newIssue.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update issue status
router.patch('/:id/status', auth, isOfficial, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updateData = { status, updated_at: new Date() };
    
    // If resolving, set resolved_at timestamp
    if (status === 'resolved') {
      updateData.resolved_at = new Date();
    }
    
    const updatedIssue = await pool.query(
      'UPDATE issues SET status = $1, updated_at = $2, resolved_at = $3 WHERE id = $4 RETURNING *',
      [updateData.status, updateData.updated_at, updateData.resolved_at, id]
    );
    
    if (updatedIssue.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(id).emit('issue-updated', updatedIssue.rows[0]);
    
    res.json({
      message: 'Issue status updated successfully',
      issue: updatedIssue.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign issue to official
router.patch('/:id/assign', auth, isOfficial, async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;
    
    const updatedIssue = await pool.query(
      'UPDATE issues SET assigned_to = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [assigned_to, new Date(), id]
    );
    
    if (updatedIssue.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(id).emit('issue-updated', updatedIssue.rows[0]);
    
    res.json({
      message: 'Issue assigned successfully',
      issue: updatedIssue.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
