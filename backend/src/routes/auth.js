const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).json({ message: result.array()[0].msg });
  next();
}

router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required.')
], validate, async (req, res, next) => {
  try {
    const email = String(req.body.email).toLowerCase();
    const admin = await Admin.findOne({ email }).select('+passwordHash');
    const valid = admin && admin.active && await bcrypt.compare(String(req.body.password), admin.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Email or password is incorrect.' });
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(500).json({ message: 'Server JWT_SECRET must be at least 32 characters.' });
    }
    admin.lastLoginAt = new Date();
    await admin.save();
    const token = jwt.sign({ sub: admin._id.toString(), role: admin.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) { next(error); }
});

router.get('/me', requireAdmin, (req, res) => res.json({ admin: req.admin }));
module.exports = router;
