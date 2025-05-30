const express = require('express');
const cors = require('cors');
const path = require('path');
const authRouter = require('./routes/auth');
const teachersRouter = require('./routes/teachers');
const subjectsRouter = require('./routes/subjects');
const strandsRouter = require('./routes/strands');
const gradeLevelsRouter = require('./routes/grade-levels');
const usersRouter = require('./routes/users');
const sectionsRouter = require('./routes/sections');

const app = express();

// Configure CORS with specific origins
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.100:3000', 'http://192.168.0.102:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Increase JSON payload limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/students', require('./routes/students'));
app.use('/api/subjects', subjectsRouter);
app.use('/api/strands', strandsRouter);
app.use('/api/grade-levels', gradeLevelsRouter);
app.use('/api/users', usersRouter);
app.use('/api/sections', sectionsRouter);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
const startServer = (port) => {
  app.listen(port, '0.0.0.0', () => {
    console.log('=== Server Started ===');
    console.log(`Server is running on port ${port}`);
    console.log(`Server is accessible at:`);
    console.log(`- Local: http://localhost:${port}`);
    console.log(`- Network: http://192.168.0.102:${port}`);
    console.log(`- All interfaces: 0.0.0.0:${port}`);
    console.log('=====================');
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT); 