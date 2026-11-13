require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const programRoutes = require('./routes/programs');
const noticeRoutes = require('./routes/notices');
const inquiryRoutes = require('./routes/inquiries');
const adminRoutes = require('./routes/admin');
const mediaRoutes = require('./routes/media');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
app.disable('x-powered-by');

function assertRuntimeConfiguration() {
  const mongoUri = String(process.env.MONGO_URI || '').trim();
  if (!mongoUri || /YOUR_USER|YOUR_PASSWORD|YOUR_CLUSTER|replace[_ -]?with/i.test(mongoUri)) {
    throw new Error('MONGO_URI is missing or still contains example placeholders. Configure a real MongoDB connection string.');
  }
  const secret = String(process.env.JWT_SECRET || '');
  if (secret.length < 32 || /replace[_ -]?with|change[_ -]?me|your[_ -]?secret|example[_ -]?secret/i.test(secret)) {
    throw new Error('JWT_SECRET must be a unique, randomly generated secret of at least 32 characters. Replace the example value in your environment.');
  }
}

// if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
// app.use(helmet({
//   // The public app uses Google Fonts. Keep the CSP restrictive while explicitly
//   // allowing only the stylesheet/font hosts it needs.
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
//       imgSrc: ["'self'", 'data:', 'blob:'],
//       objectSrc: ["'none'"],
//       scriptSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
//       connectSrc: ["'self'"],
//       frameAncestors: ["'none'"],
//       formAction: ["'self'"]
//     }
//   },
//   hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false
// }));

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },

    hsts:
      process.env.NODE_ENV === 'production'
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
          }
        : false,

    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
        ],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
      },
    },
  })
);


const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);
const allowAnyOrigin = process.env.NODE_ENV !== 'production' && allowedOrigins.includes('*');
app.use(cors({ origin(origin, callback) { if (!origin || allowAnyOrigin || allowedOrigins.includes(origin)) return callback(null, true); const error = new Error('CORS origin is not allowed.'); error.statusCode = 403; return callback(error); }, credentials: false }));
app.use(express.json({ limit: '30kb' }));
app.use(express.urlencoded({ extended: false, limit: '30kb' }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many login attempts. Please try again later.' } }));
app.use('/api/inquiries', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many requests. Please try again later.' } }));
app.get('/api/health', (req, res) => { const connected = require('mongoose').connection.readyState === 1; res.status(connected ? 200 : 503).json({ ok: connected, api: 'running', database: connected ? 'connected' : 'disconnected' }); });
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);

// Uploaded images are served read-only; upload and mutation APIs remain admin-authenticated.
const uploadedMediaDir = path.resolve(process.env.MEDIA_UPLOAD_DIR || path.resolve(__dirname, '../uploads/media'));
fs.mkdirSync(uploadedMediaDir, { recursive: true });
// app.use('/uploads/media', express.static(uploadedMediaDir, {
//   index: false, dotfiles: 'deny', fallthrough: false,
//   setHeaders(res) { res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Cache-Control', 'public, max-age=3600'); }
// }));

app.use('/uploads/media', express.static(uploadedMediaDir, {
  index: false,
  dotfiles: 'deny',
  fallthrough: false,

  setHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// In production, serve the built Vite site from this same Node service when
// SERVE_FRONTEND=true. This creates a simple one-service deployment target and
// keeps browser API calls same-origin. Local development still uses Vite on :5173.
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (process.env.SERVE_FRONTEND === 'true' && fs.existsSync(frontendDist)) {
  const escapeHtmlAttribute = value => String(value).replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function serveSpaIndex(req, res, next) {
    fs.readFile(path.join(frontendDist, 'index.html'), 'utf8', (error, html) => {
      if (error) return next(error);
      // Use a configured canonical origin when supplied; otherwise derive it
      // from the current request so custom domains and preview deployments work.
      const candidate = process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get('host')}`;
      let siteOrigin;
      try {
        const parsed = new URL(candidate);
        if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('SITE_URL must use HTTP or HTTPS.');
        siteOrigin = parsed.origin;
      } catch (originError) {
        return next(new Error('Unable to determine the public site origin. Set SITE_URL to an absolute HTTP(S) URL.'));
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.type('html').send(html.replaceAll('__SITE_URL__', escapeHtmlAttribute(siteOrigin)));
    });
  }
  app.get('/index.html', serveSpaIndex);
  app.use(express.static(frontendDist, {
    index: false,
    etag: true,
    maxAge: '1h',
    setHeaders(res, filePath) {
      if (path.basename(filePath) === 'index.html') res.setHeader('Cache-Control', 'no-cache');
      if (filePath.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path === '/api' || req.path.startsWith('/api/') || path.extname(req.path) || !req.accepts('html')) return next();
    serveSpaIndex(req, res, next);
  });
}

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
try {
  assertRuntimeConfiguration();
  connectDB().then(() => app.listen(port, () => console.log(`Jamia-tur-Raza Ghousia Mehria service listening on port ${port}`))).catch(error => { console.error(`Startup failed: ${error.message}`); process.exit(1); });
} catch (error) {
  console.error(`Startup configuration error: ${error.message}`);
  process.exit(1);
}
