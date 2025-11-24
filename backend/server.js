const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const compression = require('compression');
const fs = require('fs');
const errorHandler = require('./middleware/errorHandler');
const NotificationService = require('./services/NotificationService');
// load env early and robustly
if (process.env.NODE_ENV === 'production') {
  // try loading .env.production if present (useful for local prod testing)
  const prodEnvPath = path.join(__dirname, '.env.production');
  if (fs.existsSync(prodEnvPath)) {
    require('dotenv').config({ path: prodEnvPath });
  }
} else {
  // development / default .env
  require('dotenv').config();
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression()); // Added compression middleware for gzip
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-issue-room', (issueId) => {
    socket.join(issueId);
    console.log(`User ${socket.id} joined issue room ${issueId}`);
  });
  
  socket.on('leave-issue-room', (issueId) => {
    socket.leave(issueId);
    console.log(`User ${socket.id} left issue room ${issueId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Make NotificationService available BEFORE mounting routes so routes can read app.locals if needed
app.locals.NotificationService = NotificationService;

// Routes: import with safety logs so import-time errors are visible
let authRoutes, userRoutes, issueRoutes, commentRoutes, likeRoutes, adminRoutes, notificationRoutes;
try {
  authRoutes = require('./routes/auth');
  console.log('Loaded auth routes');
} catch (err) {
  console.error('Failed to load auth routes:', err);
}
try {
  userRoutes = require('./routes/users');
  console.log('Loaded user routes');
} catch (err) {
  console.error('Failed to load user routes:', err);
}
try {
  issueRoutes = require('./routes/issues');
  console.log('Loaded issue routes');
} catch (err) {
  console.error('Failed to load issue routes:', err);
}
try {
  commentRoutes = require('./routes/comments');
  console.log('Loaded comment routes');
} catch (err) {
  console.error('Failed to load comment routes:', err);
}
try {
  likeRoutes = require('./routes/likes');
  console.log('Loaded like routes');
} catch (err) {
  console.error('Failed to load like routes:', err);
}
try {
  adminRoutes = require('./routes/admin');
  console.log('Loaded admin routes');
} catch (err) {
  console.error('Failed to load admin routes:', err);
}
try {
  notificationRoutes = require('./routes/notifications');
  console.log('Loaded notification routes');
} catch (err) {
  console.error('Failed to load notification routes:', err);
}

// Mount only those that loaded successfully
if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/users', userRoutes);
if (issueRoutes) app.use('/api/issues', issueRoutes);
if (commentRoutes) app.use('/api/comments', commentRoutes);
if (likeRoutes) app.use('/api/likes', likeRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (notificationRoutes) app.use('/api/notifications', notificationRoutes);



// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
// Make NotificationService available to routes
app.locals.notifications = NotificationService;

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Global error handlers to surface unexpected failures
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // optionally process.exit(1) in production after logging
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
