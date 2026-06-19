const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const path     = require('path');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Lab-Session']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve entire frontend project as static
// index.html, pages/, css/, js/, diagrams/ — sab accessible
app.use(express.static(path.join(__dirname, '..')));

// Lab API routes
app.use('/api/lab/web01', require('./labs/web01-sqli/routes'));
app.use('/api/lab/web02', require('./labs/web02-xss/routes'));
app.use('/api/lab/hidden', require('./labs/hidden-sight/routes'));
app.use('/api/lab/cookie', require('./labs/web02-cookie/routes'));
app.use('/api/lab/robots', require('./labs/web04-robots/routes'));
app.use('/api/lab/packet', require('./labs/for01-packet/routes'));
app.use('/api/lab/metadata', require('./labs/for02-metadata/routes'));

// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// SPA catch-all: sab clean URLs index.html pe serve hongi
// (Lab pages /pages/labs/ ke under hain - static middleware unhe serve karega pehle)
app.get([
  '/rooms', '/rooms/*',
  '/tutorials', '/tutorials/*',
  '/tools', '/profile',
  '/privacy-policy', '/terms-of-service', '/disclaimer',
  '/refund-policy', '/cookie-notice', '/do-not-sell', '/legal-warning'
], (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AlexCyberX CTF running on http://localhost:${PORT}`);
});
