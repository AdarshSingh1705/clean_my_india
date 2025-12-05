const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db');
const { auth, isOfficial } = require('../middleware/auth');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');

// Configure multer for memory storage (Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 5MB limit
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

/**
 * ✅ Public: Get all issues
 */
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        issues.*, 
        users.name as creator_name,
        COALESCE(comment_counts.count, 0) AS comment_count,
        COALESCE(like_counts.count, 0) AS like_count
      FROM issues 
      LEFT JOIN users ON issues.created_by = users.id
      LEFT JOIN (
        SELECT issue_id, COUNT(*) AS count FROM comments GROUP BY issue_id
      ) AS comment_counts ON issues.id = comment_counts.issue_id
      LEFT JOIN (
        SELECT issue_id, COUNT(*) AS count FROM likes GROUP BY issue_id
      ) AS like_counts ON issues.id = like_counts.issue_id
    `;

    let countQuery = 'SELECT COUNT(*) FROM issues';
    let conditions = [];
    let params = [];
    let paramCount = 0;

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

    query += ' ORDER BY issues.created_at DESC';
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const issuesResult = await pool.query(query, params);
    const countResult = await pool.query(countQuery, params.slice(0, conditions.length));

    res.json({
      issues: issuesResult.rows || [],
      total: parseInt(countResult.rows[0]?.count || 0),
      page: parseInt(page),
      totalPages: Math.ceil((countResult.rows[0]?.count || 0) / limit)
    });
  } catch (error) {
    console.error("🔥 ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ Public: Get single issue by ID
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

    const commentsResult = await pool.query(`
      SELECT comments.*, users.name as user_name 
      FROM comments 
      LEFT JOIN users ON comments.user_id = users.id 
      WHERE issue_id = $1 
      ORDER BY created_at ASC
    `, [id]);

    const likesResult = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE issue_id = $1',
      [id]
    );

    // ✅ Default for non-logged-in users
    let userLiked = false;

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userLikeResult = await pool.query(
          'SELECT 1 FROM likes WHERE issue_id = $1 AND user_id = $2',
          [id, decoded.id]
        );

        userLiked = userLikeResult.rows.length > 0;
      } catch (error) {
        // ignore invalid/expired tokens
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

/**
 * ✅ Protected: Create new issue
 */
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Creating issue - req.body:', req.body);
    console.log('Creating issue - req.user:', req.user);
    console.log('Creating issue - req.file:', req.file);

    const { title, description, category, address, latitude, longitude, priority } = req.body;

    if (!title || !description || !category || !address || !latitude || !longitude) {
      console.log('Missing required fields:', { title, description, category, address, latitude, longitude });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Image is mandatory
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // ML Classification
    const wasteModel = req.app.get('wasteModel');
    if (wasteModel) {
      try {
        const resized = await sharp(req.file.buffer)
          .resize(256, 256)
          .raw()
          .toBuffer();

        const tensor = tf.tensor3d(resized, [256, 256, 3])
          .expandDims(0)
          .div(255.0);

        const prediction = wasteModel.predict(tensor);
        const wasteConfidence = prediction.dataSync()[0];
        const isWaste = wasteConfidence >= 0.5;

        console.log(`ML Classification: ${isWaste ? 'Waste' : 'Not Waste'} (${(wasteConfidence * 100).toFixed(2)}%)`);
        
        tensor.dispose();
        prediction.dispose();

        // Reject if not waste
        if (!isWaste) {
          return res.status(400).json({ 
            message: 'Image does not appear to contain waste. Please upload an image showing a civic issue.',
            isWaste: false,
            confidence: wasteConfidence
          });
        }
      } catch (mlError) {
        console.error('ML classification error:', mlError);
        // Continue if ML fails
      }
    }

    let image_url = null;
    if (req.file) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'clean-india-issues' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      image_url = result.secure_url;
      console.log('Image uploaded to Cloudinary:', image_url);
    }

    console.log('Inserting issue into database...');
    const newIssue = await pool.query(
      `INSERT INTO issues
       (title, description, category, address, latitude, longitude, image_url, created_by, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, category, address, latitude, longitude, image_url, req.user.id, priority || 'medium']
    );
    console.log('Issue inserted successfully:', newIssue.rows[0]);

    // Send notification to all officials (non-blocking)
    try {
      console.log('Fetching officials...');
      const officials = await pool.query(
        'SELECT id FROM users WHERE role = $1',
        ['official']
      );
      console.log('Officials found:', officials.rows.length);

      const Notification = require('../models/Notification');

      // Notify the creator
      console.log('Creating notification for creator...');
      await Notification.create(
        req.user.id,
        'Issue Reported Successfully',
        `Your issue "${title}" has been successfully reported.`,
        'issue_created',
        newIssue.rows[0].id
      );
      console.log('Creator notification created');

      // Notify all officials
      for (const official of officials.rows) {
        console.log('Creating notification for official:', official.id);
        await Notification.create(
          official.id,
          'New Issue Reported',
          `A new issue "${title}" has been reported in your area.`,
          'new_issue',
          newIssue.rows[0].id
        );
      }
      console.log('All notifications created');
    } catch (notificationError) {
      console.error('Error creating notifications (non-blocking):', notificationError.message);
      // Continue even if notifications fail
    }

    // Emit socket event
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('new-issue', newIssue.rows[0]);
        console.log('Socket event emitted');
      }
    } catch (socketError) {
      console.error('Error emitting socket event:', socketError.message);
    }

    // Return success immediately
    res.status(201).json({
      message: 'Issue reported successfully',
      issue: newIssue.rows[0]
    });
  } catch (err) {
    console.error('Error creating issue - Full error:', err);
    console.error('Error stack:', err.stack);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({ 
      message: 'Something went wrong!', 
      error: isProduction ? undefined : err.message
    });
  }
});

/**
 * ✅ Protected: Update status
 */
// Separate multer for proof images (with file filter for image validation)
const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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

router.patch('/:id/status', auth, isOfficial, proofUpload.single('proof_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Require proof image for resolved/closed
    if ((status === 'resolved' || status === 'closed') && !req.file) {
      return res.status(400).json({ message: 'Proof image is required to mark issue as resolved or closed' });
    }

    // AI verification for resolved/closed
    let proof_image_url = null;
    if (req.file && (status === 'resolved' || status === 'closed')) {
      const wasteModel = req.app.get('wasteModel');
      if (wasteModel) {
        try {
          const { data, info } = await sharp(req.file.buffer)
            .resize(256, 256)
            .raw()
            .toBuffer({ resolveWithObject: true });

          const tensor = tf.tensor3d(new Uint8Array(data), [256, 256, 3])
            .expandDims(0)
            .div(255.0);

          const prediction = wasteModel.predict(tensor);
          const wasteConfidence = prediction.dataSync()[0];
          
          tensor.dispose();
          prediction.dispose();

          console.log(`Proof verification: ${(wasteConfidence * 100).toFixed(2)}% waste detected`);
          
          // If waste confidence > 30%, reject (issue not resolved)
          if (wasteConfidence > 0.30) {
            return res.status(400).json({ 
              message: 'Proof image shows waste is still present. Cannot mark as resolved.',
              isWaste: true,
              confidence: wasteConfidence
            });
          }
        } catch (mlError) {
          console.error('ML verification error:', mlError);
        }
      }

      // Upload proof to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'clean-india-proofs' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      proof_image_url = result.secure_url;
    }

    // Get old status and user info
    const issueData = await pool.query(
      'SELECT issues.*, users.email, users.name FROM issues LEFT JOIN users ON issues.created_by = users.id WHERE issues.id = $1',
      [id]
    );
    
    if (issueData.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    const oldStatus = issueData.rows[0].status;
    const userEmail = issueData.rows[0].email;
    const userName = issueData.rows[0].name;
    const issueTitle = issueData.rows[0].title;

    const updatedIssue = await pool.query(
      'UPDATE issues SET status = $1, updated_at = $2, resolved_at = $3, proof_image_url = $4 WHERE id = $5 RETURNING *',
      [status, new Date(), status === 'resolved' ? new Date() : null, proof_image_url, id]
    );

    // Send email notification
    try {
      const EmailService = require('../services/EmailService');
      if (status === 'resolved') {
        await EmailService.sendIssueResolvedNotification(userEmail, userName, issueTitle);
      } else {
        await EmailService.sendIssueStatusUpdate(userEmail, userName, issueTitle, oldStatus, status);
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError.message);
    }

    const io = req.app.get('io');
    io.to(id).emit('issue-updated', updatedIssue.rows[0]);

    res.json({
      message: 'Issue status updated successfully',
      issue: updatedIssue.rows[0]
    });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

/**
 * ✅ Protected: Assign issue
 */
router.patch('/:id/assign', auth, isOfficial, async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    const issueData = await pool.query(
      'SELECT title FROM issues WHERE id = $1',
      [id]
    );

    const updatedIssue = await pool.query(
      'UPDATE issues SET assigned_to = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [assigned_to, new Date(), id]
    );

    if (updatedIssue.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Send email to assigned official
    if (assigned_to) {
      try {
        const officialData = await pool.query(
          'SELECT name, email FROM users WHERE id = $1',
          [assigned_to]
        );
        if (officialData.rows.length > 0) {
          const EmailService = require('../services/EmailService');
          await EmailService.sendIssueAssignmentEmail(
            officialData.rows[0].email,
            officialData.rows[0].name,
            issueData.rows[0].title,
            id
          );
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError.message);
      }
    }

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

/**
 * ✅ Protected: Like an issue
 */
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // check if already liked
    const existing = await pool.query(
      'SELECT 1 FROM likes WHERE issue_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Already liked' });
    }

    await pool.query(
      'INSERT INTO likes (issue_id, user_id) VALUES ($1, $2)',
      [id, req.user.id]
    );

    const likeCount = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE issue_id = $1',
      [id]
    );

    res.json({ likes: parseInt(likeCount.rows[0].count) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * ✅ Protected: Unlike an issue
 */
router.delete('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM likes WHERE issue_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    const likeCount = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE issue_id = $1',
      [id]
    );

    res.json({ likes: parseInt(likeCount.rows[0].count) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * ✅ Protected: Delete issue (creator or official only)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const issueResult = await pool.query(
      'SELECT i.*, u.email, u.name FROM issues i LEFT JOIN users u ON i.created_by = u.id WHERE i.id = $1',
      [id]
    );
    if (issueResult.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const issue = issueResult.rows[0];
    if (issue.created_by !== req.user.id && req.user.role !== 'official') {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }

    await pool.query('DELETE FROM comments WHERE issue_id = $1', [id]);
    await pool.query('DELETE FROM likes WHERE issue_id = $1', [id]);
    await pool.query('DELETE FROM issues WHERE id = $1', [id]);

    // Send deletion email to issue creator
    if (issue.email && issue.created_by !== req.user.id) {
      try {
        const EmailService = require('../services/EmailService');
        await EmailService.sendIssueDeletionEmail(
          issue.email,
          issue.name,
          issue.title,
          'Deleted by official'
        );
      } catch (emailError) {
        console.error('Email notification error:', emailError.message);
      }
    }

    const io = req.app.get('io');
    if (io) io.emit('issue-deleted', { id });

    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * ✅ Protected: Add comment
 */
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Get issue creator info
    const issueData = await pool.query(
      'SELECT issues.title, issues.created_by, users.email, users.name FROM issues LEFT JOIN users ON issues.created_by = users.id WHERE issues.id = $1',
      [id]
    );

    const newComment = await pool.query(
      'INSERT INTO comments (issue_id, user_id, text) VALUES ($1, $2, $3) RETURNING *',
      [id, req.user.id, text]
    );

    const commentWithUser = await pool.query(
      `SELECT comments.*, users.name AS user_name 
       FROM comments 
       LEFT JOIN users ON comments.user_id = users.id
       WHERE comments.id = $1`,
      [newComment.rows[0].id]
    );

    // Send email notification to issue creator (if not commenting on own issue)
    if (issueData.rows.length > 0 && issueData.rows[0].created_by !== req.user.id) {
      try {
        const EmailService = require('../services/EmailService');
        await EmailService.sendNewCommentNotification(
          issueData.rows[0].email,
          issueData.rows[0].name,
          issueData.rows[0].title,
          commentWithUser.rows[0].user_name,
          text
        );
      } catch (emailError) {
        console.error('Email notification error:', emailError.message);
      }
    }

    res.status(201).json(commentWithUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
