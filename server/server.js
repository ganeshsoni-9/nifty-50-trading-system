require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const socketHandler = require('./services/websocket/socketHandler');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const marketRoutes = require('./routes/marketRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const tradePlanRoutes = require('./routes/tradePlanRoutes');
const paperTradeRoutes = require('./routes/paperTradeRoutes');
const backtestRoutes = require('./routes/backtestRoutes');
const alertRoutes = require('./routes/alertRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const server = http.createServer(app);

// Security & Base Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Connect Database
connectDB();

// Initialize Socket.IO Streaming
socketHandler.init(server);

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/tradeplans', tradePlanRoutes);
app.use('/api/papertrades', paperTradeRoutes);
app.use('/api/backtest', backtestRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/health', healthRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Welcome to NiftyTrade AI / NiftyPulse Server API',
    status: 'ONLINE',
    docs: '/api/health'
  });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 NiftyTrade AI Backend Server running on port ${PORT}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ WebSocket Stream Live Endpoint: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
