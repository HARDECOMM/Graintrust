const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const grainRoutes = require('./routes/grainRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const escrowRoutes = require('./routes/escrowRoutes');

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  
  const PORT = process.env.PORT || 5000;

  // Connect to Database
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }

  // --- UPDATED CORS SECTION ---
  app.use(cors({
    // This reads the FRONTEND_URL you set in the Render dashboard
    // If it's not set (like in local dev), it falls back to localhost
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  // ----------------------------

  app.use(express.json());

  // Root & Health Check
  app.get('/', (req, res) => {
    res.send('GrainTrust AI Backend Running');
  });

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'GrainTrust AI API is running',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/grains", grainRoutes);
  app.use("/api/escrow", escrowRoutes);
  app.use("/api/notification", notificationRoutes);

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();