require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/db');
const Admin = require('../src/models/Admin');
(async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } = process.env;
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in the environment first.');
    if (/^(site administrator|jamia website administrator)$/i.test(ADMIN_NAME.trim())) throw new Error('Replace the example ADMIN_NAME with the real authorized administrator name.');
    if (/example\.com|replace|your-email/i.test(ADMIN_EMAIL)) throw new Error('Replace the example ADMIN_EMAIL with a real address controlled by the administrator.');
    if (String(ADMIN_PASSWORD).length < 12 || /replace[_ -]?with|change[_ -]?me|your[_ -]?password/i.test(ADMIN_PASSWORD)) throw new Error('Set a unique ADMIN_PASSWORD of at least 12 characters; do not leave the example placeholder.');
    if (!JWT_SECRET || JWT_SECRET.length < 32 || /replace[_ -]?with|change[_ -]?me|your[_ -]?secret|example[_ -]?secret/i.test(JWT_SECRET)) throw new Error('Set a unique random JWT_SECRET of at least 32 characters in the environment.');
    await connectDB();
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await Admin.findOneAndUpdate({ email }, { name: ADMIN_NAME.trim(), email, passwordHash, role: 'admin', active: true }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
    console.log(`Admin account is ready for ${email}. Keep your password private.`);
  } catch (e) { console.error(e.message); process.exitCode = 1; }
  finally { await require('mongoose').disconnect(); }
})();
