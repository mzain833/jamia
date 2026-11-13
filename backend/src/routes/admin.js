const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const Program = require('../models/Program');
const Notice = require('../models/Notice');
const Inquiry = require('../models/Inquiry');
const router = express.Router();
router.use(requireAdmin);
router.get('/overview', async (req, res, next) => { try { const [programs, notices, inquiries, newInquiries] = await Promise.all([Program.countDocuments({ active: true }), Notice.countDocuments({ active: true }), Inquiry.countDocuments(), Inquiry.countDocuments({ status: 'new' })]); res.json({ overview: { programs, notices, inquiries, newInquiries }, admin: req.admin }); } catch (e) { next(e); } });
module.exports = router;
