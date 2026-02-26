require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = [
  'http://localhost:5173',                    // Local development
  'https://social9-ul4j.vercel.app',         // Dev Vercel
  'https://social9.io',                       // Production
  'https://www.social9.io',                   // Production www
  'https://social9-backend.onrender.com',     // Backend itself
  'https://social9-backend-prod.onrender.com' // Prod backend
];

console.log('🔒 CORS configured for origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      console.log('✅ Request with no origin - allowed');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/posts', require('./routes/posts.routes'));
app.use('/api/templates', require('./routes/templates.routes'));
app.use('/api/social-accounts', require('./routes/social-accounts.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/billing', require('./routes/billing.routes'));

// OAuth callback routes (separate from API routes)
const socialAccountsController = require('./controllers/social-accounts.controller');
app.get('/api/oauth/instagram/callback', socialAccountsController.handleInstagramCallback);
app.get('/api/oauth/linkedin/callback', socialAccountsController.handleLinkedInCallback);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
