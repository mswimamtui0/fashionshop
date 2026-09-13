const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ── CORS ────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true
}));

// ── Body parsers ────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static files ────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Fashion Shop API is running 🚀',
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// ── Routes ──────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/sms',      require('./routes/sms'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/variants', require('./routes/variants'));
app.use('/api/ratings',  require('./routes/ratings'));
app.use('/api/wishlist', require('./routes/wishlist'));

// ── 404 handler ─────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found: ' + req.method + ' ' + req.originalUrl });
});

// ── Error handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// ── Start ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Local dev: run a real listening server
// Vercel serverless: just export the app (Vercel handles routing)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
  });
}

module.exports = app;