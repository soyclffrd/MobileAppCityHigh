const express = require('express');
const cors = require('cors');
const path = require('path');
const authRouter = require('./routes/auth');
const teachersRouter = require('./routes/teachers');
const subjectsRouter = require('./routes/subjects');
const strandsRouter = require('./routes/strands');
const gradeLevelsRouter = require('./routes/grade-levels');

const app = express();

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/students', require('./routes/students'));
app.use('/api/subjects', subjectsRouter);
app.use('/api/strands', strandsRouter);
app.use('/api/grade-levels', gradeLevelsRouter);

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
app.listen(PORT, '0.0.0.0', () => {
  console.log('=== Server Started ===');
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is accessible at:`);
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Network: http://192.168.0.102:${PORT}`);
  console.log(`- All interfaces: 0.0.0.0:${PORT}`);
  console.log('=====================');
}); 