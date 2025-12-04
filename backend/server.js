const express = require('express');
const port = process.env.PORT || 4000 
const cors = require('cors');
const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const multer = require('multer');
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

// Socket.IO configuration
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://clean-india-frontend.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  path: '/socket.io/'
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    // Allow unauthenticated connections for now
    return next();
  }
  
  // Token validation can be added here if needed
  next();
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(compression()); // Added compression middleware for gzip
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://clean-india-frontend.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware: log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.use('/model', express.static(path.join(__dirname, 'model')));

// Load ML model manually from JSON and weights
let wasteModel;
const loadModel = async () => {
  try {
    const modelDir = path.join(__dirname, 'model');
    const modelJsonPath = path.join(modelDir, 'model.json');
    
    console.log('Loading model from:', modelJsonPath);
    
    // Read model.json
    const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf8'));
    
    // Read weight files
    const weightSpecs = modelJson.weightsManifest[0].paths;
    const weightBuffers = [];
    
    for (const weightFile of weightSpecs) {
      const weightPath = path.join(modelDir, weightFile);
      const buffer = fs.readFileSync(weightPath);
      weightBuffers.push(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
    }
    
    // Concatenate all weight buffers
    const totalLength = weightBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const allWeights = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of weightBuffers) {
      allWeights.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }
    
    // Create ModelArtifacts object
    const modelArtifacts = {
      modelTopology: modelJson.modelTopology,
      weightSpecs: modelJson.weightsManifest[0].weights,
      weightData: allWeights.buffer,
      format: modelJson.format,
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy
    };
    
    // Load model from artifacts
    wasteModel = await tf.loadLayersModel(tf.io.fromMemory(modelArtifacts));
    app.set('wasteModel', wasteModel);
    
    console.log('✅ Waste classifier model loaded successfully');
  } catch (err) {
    console.error('❌ Failed to load waste model:', err.message);
    // Don't crash the server if model fails to load
  }
};

// Load model after a short delay to ensure app is initialized
setTimeout(loadModel, 100);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const upload = multer({ storage: multer.memoryStorage() });

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
let authRoutes, userRoutes, issueRoutes, commentRoutes, likeRoutes, adminRoutes, notificationRoutes, statsRoutes;
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
try {
  statsRoutes = require('./routes/stats');
  console.log('Loaded stats routes');
} catch (err) {
  console.error('Failed to load stats routes:', err);
}

// Mount only those that loaded successfully
if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/users', userRoutes);
if (issueRoutes) app.use('/api/issues', issueRoutes);
if (commentRoutes) app.use('/api/comments', commentRoutes);
if (likeRoutes) app.use('/api/likes', likeRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (notificationRoutes) app.use('/api/notifications', notificationRoutes);
if (statsRoutes) app.use('/api/stats', statsRoutes);



// Waste classifier endpoint
app.post('/api/classify', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    if (!wasteModel) {
      return res.status(503).json({ error: 'ML model not loaded yet. Please try again in a moment.' });
    }

    const resized = await sharp(req.file.buffer)
      .resize(256, 256)
      .raw()
      .toBuffer();

    const tensor = tf.tensor3d(resized, [256, 256, 3])
      .expandDims(0)
      .div(255.0);

    const prediction = wasteModel.predict(tensor);
    const prob = prediction.dataSync()[0];
    const waste = prob >= 0.5;

    tensor.dispose();
    prediction.dispose();

    console.log(`Classify API: ${waste ? 'Waste' : 'Not Waste'} (${(prob * 100).toFixed(1)}%)`);
    res.json({ probability: prob, waste });
  } catch (err) {
    console.error('Classification Error:', err);
    res.status(500).json({ error: 'Failed to classify image', details: err.message });
  }
});

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


