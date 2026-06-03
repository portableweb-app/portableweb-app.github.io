const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const PROD = process.env.NODE_ENV === 'production';

// Force HTTPS in production (Cloud Run sets X-Forwarded-Proto)
if (PROD) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Security headers
app.use((_req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// .pweb MIME type
express.static.mime.define({ 'application/vnd.portableweb+zip': ['pweb'] });

// Serve JSZip from node_modules at a stable URL the PWA app can reference
app.get('/app/jszip.min.js', (_req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules/jszip/dist/jszip.min.js'));
});

// Static assets
app.use(express.static(PUBLIC));

// SPA fallback: any /app/* path returns the app shell
app.get('/app/*', (_req, res) => {
  res.sendFile(path.join(PUBLIC, 'app', 'index.html'));
});

// Root fallback: marketing homepage
app.get('*', (_req, res) => {
  res.sendFile(path.join(PUBLIC, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PortableWeb web server → http://localhost:${PORT}`);
  console.log(`  Marketing homepage → http://localhost:${PORT}/`);
  console.log(`  PWA viewer        → http://localhost:${PORT}/app/`);
});
