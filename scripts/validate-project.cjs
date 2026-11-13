/* Lightweight source/assets validation. This does not replace a production build or browser tests. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const failures = [];
const checks = [];
function check(label, condition, details = '') {
  checks.push({ label, ok: Boolean(condition), details });
  if (!condition) failures.push(`${label}${details ? ` — ${details}` : ''}`);
}
function readJson(relative) {
  try { return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8')); }
  catch (error) { failures.push(`Valid JSON: ${relative} — ${error.message}`); return null; }
}

for (const file of [
  'frontend/package.json', 'backend/package.json', 'frontend/public/site.webmanifest',
  'frontend/src/MediaManager.jsx', 'frontend/src/media-manager.css',
  'backend/src/routes/media.js', 'backend/src/models/MediaAsset.js', 'backend/src/utils/cloudinary.js',
  '.env.example', 'backend/.env.example', 'frontend/.env.example', 'Dockerfile',
  'docker-compose.yml', 'render.yaml', 'README.md', 'deployment/DEPLOYMENT-GUIDE.md'
]) check(`Required file: ${file}`, fs.existsSync(path.join(root, file)));

const frontendPackage = readJson('frontend/package.json');
const backendPackage = readJson('backend/package.json');
const manifest = readJson('frontend/public/site.webmanifest');
check('Frontend build script exists', Boolean(frontendPackage?.scripts?.build));
check('Backend start script exists', Boolean(backendPackage?.scripts?.start));
check('Cloudinary SDK dependency exists', Boolean(backendPackage?.dependencies?.cloudinary));
check('PWA manifest has name and icons', Boolean(manifest?.name && Array.isArray(manifest?.icons) && manifest.icons.length >= 2));

const appPath = path.join(root, 'frontend/src/App.jsx');
let appSource = '';
try { appSource = fs.readFileSync(appPath, 'utf8'); } catch (error) { failures.push(`Read App.jsx — ${error.message}`); }
const imageRefs = [...appSource.matchAll(/['"`]((?:\/images\/)[^'"`]+)['"`]/g)].map(match => match[1]).filter(ref => !ref.includes('${'));
const missingImages = [...new Set(imageRefs)].filter(ref => !fs.existsSync(path.join(root, 'frontend/public', ref.slice(1))));
check('Static local image references resolve', missingImages.length === 0, missingImages.join(', '));
for (const file of ['jamia-logo-mark.webp', 'jamia-logo-full.webp', 'qari-ali-akhtar-awan.webp', 'favicon-32.png', 'apple-touch-icon.png', 'app-icon-192.png', 'app-icon-512.png', 'social-card.png', 'visual-placeholder.svg']) {
  check(`Required image asset: ${file}`, fs.existsSync(path.join(root, 'frontend/public/images', file)));
}
for (const file of ['backend/src/server.js', 'backend/src/config/db.js', 'backend/scripts/seed.js', 'backend/scripts/create-admin.js']) {
  const source = path.join(root, file);
  check(`Server source exists: ${file}`, fs.existsSync(source));
}
const mediaRoute = fs.readFileSync(path.join(root, 'backend/src/routes/media.js'), 'utf8');
const mediaModel = fs.readFileSync(path.join(root, 'backend/src/models/MediaAsset.js'), 'utf8');
const cloudinary = fs.readFileSync(path.join(root, 'backend/src/utils/cloudinary.js'), 'utf8');
const mediaManager = fs.readFileSync(path.join(root, 'frontend/src/MediaManager.jsx'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'frontend/src/styles.css'), 'utf8');
check('Media APIs require admin auth for management routes', /router\.use\('\/admin', requireAdmin\)/.test(mediaRoute));
check('Media upload size limit configured', /MAX_UPLOAD_BYTES\s*=\s*5\s*\*\s*1024\s*\*\s*1024/.test(mediaRoute));
check('Media upload verifies image signature', /async function detectMime/.test(mediaRoute));
check('Media replacement flow is wired to API', /\/replace/.test(mediaManager) && /admin\/\$\{id\}\/replace/.test(mediaManager));
check('Media storage supports Cloudinary and local assets', /enum: \['local', 'cloudinary'\]/.test(mediaModel) && /isCloudinaryConfigured/.test(mediaRoute));
check('Cloudinary delivery uses automatic image optimization', /quality: 'auto'/.test(cloudinary) && /fetch_format: 'auto'/.test(cloudinary));
check('Cloudinary credentials are backend environment variables', ['CLOUDINARY_CLOUD_NAME=', 'CLOUDINARY_API_KEY=', 'CLOUDINARY_API_SECRET='].every(key => fs.readFileSync(path.join(root, 'backend/.env.example'), 'utf8').includes(key)));
check('Mobile accessibility refinements exist', /prefers-reduced-motion/.test(styles) && /aspect-ratio: 4 \/ 3/.test(styles) && /min-height: 50px/.test(styles));
check('Mobile hero keeps text and image side by side', /grid-template-columns: minmax\(0, 1\.04fr\) minmax\(0, \.96fr\)/.test(styles));
check('Program cards use two columns on phones', /\.program-grid, \.program-grid-page \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/.test(styles));
check('Admin image uploads are JPG/PNG/WEBP only', !/image\/gif/.test(mediaRoute) && !/image\/gif/.test(mediaManager));
check('Admin media uploads are rate limited', /mediaUploadLimiter/.test(mediaRoute) && /limit: 20/.test(mediaRoute));
check('Production does not allow wildcard CORS', /process\.env\.NODE_ENV !== 'production' && allowedOrigins\.includes\('\*'\)/.test(fs.readFileSync(path.join(root, 'backend/src/server.js'), 'utf8')));
const envExample = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
for (const key of ['MONGO_URI=', 'JWT_SECRET=', 'ADMIN_NAME=', 'ADMIN_EMAIL=', 'ADMIN_PASSWORD=', 'CLIENT_URL=']) {
  check(`Root environment template includes ${key.slice(0, -1)}`, envExample.includes(key));
}
for (const file of ['frontend/src/App.jsx', 'frontend/src/styles.css', 'backend/src/server.js']) check(`Non-empty source: ${file}`, fs.existsSync(path.join(root, file)) && fs.statSync(path.join(root, file)).size > 500);

for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.label}${item.details ? `: ${item.details}` : ''}`);
console.log(`\n${checks.filter(item => item.ok).length}/${checks.length} checks passed.`);
if (failures.length) process.exit(1);
console.log('Note: dependency install, Vite build, API/database tests, and browser/mobile QA must be run separately.');
