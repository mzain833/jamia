const express = require('express');
const { body, validationResult } = require('express-validator');
const Inquiry = require('../models/Inquiry');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();
function validate(req, res, next) { const r = validationResult(req); if (!r.isEmpty()) return res.status(400).json({ message: r.array()[0].msg }); next(); }
router.post('/', [body('name').trim().notEmpty().withMessage('Please enter your name.').isLength({ max: 100 }), body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(), body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 40 }), body('program').optional({ values: 'falsy' }).trim().isLength({ max: 120 }), body('message').trim().notEmpty().withMessage('Please write a message.').isLength({ max: 2000 })], validate, async (req, res, next) => {
  try { const inquiry = await Inquiry.create({ name: req.body.name, email: req.body.email, phone: req.body.phone || '', program: req.body.program || 'General inquiry', message: req.body.message }); res.status(201).json({ message: 'Thank you. Your message has been received.', inquiryId: inquiry._id }); } catch (e) { next(e); }
});
router.get('/', requireAdmin, async (req, res, next) => { try { const inquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(200).lean(); res.json({ inquiries }); } catch (e) { next(e); } });
router.patch('/:id', requireAdmin, [body('status').isIn(['new', 'in-progress', 'resolved']).withMessage('Choose a valid inquiry status.')], validate, async (req, res, next) => { try { const item = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!item) return res.status(404).json({ message: 'Inquiry not found.' }); res.json({ inquiry: item }); } catch (e) { next(e); } });
module.exports = router;
