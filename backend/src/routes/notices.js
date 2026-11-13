const express = require('express');
const { body, validationResult } = require('express-validator');
const Notice = require('../models/Notice');
const { requireAdmin } = require('../middleware/auth');
const slugify = require('../utils/slug');
const router = express.Router();
function validate(req, res, next) { const r = validationResult(req); if (!r.isEmpty()) return res.status(400).json({ message: r.array()[0].msg }); next(); }
const checks = [body('title').trim().notEmpty().withMessage('Notice title is required.').isLength({ max: 160 }), body('titleUrdu').optional({ checkFalsy: true }).trim().isLength({ max: 160 }), body('excerpt').trim().notEmpty().withMessage('Notice text is required.').isLength({ max: 1400}), body('excerptUrdu').optional({ checkFalsy: true }).trim().isLength({ max: 1400}), body('category').optional().trim().isLength({ max: 60 }), body('categoryUrdu').optional({ checkFalsy: true }).trim().isLength({ max: 60 })];
router.get('/', async (req, res, next) => { try { const items = await Notice.find({ active: true }).sort({ publishedAt: -1 }).limit(20).lean(); res.json({ notices: items }); } catch (e) { next(e); } });
router.post('/', requireAdmin, checks, validate, async (req, res, next) => { try { const item = await Notice.create({ ...req.body, slug: slugify(req.body.title), publishedAt: req.body.publishedAt || new Date() }); res.status(201).json({ notice: item }); } catch (e) { next(e); } });
router.delete('/:id', requireAdmin, async (req, res, next) => { try { const item = await Notice.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ message: 'Notice not found.' }); res.json({ message: 'Notice deleted.' }); } catch (e) { next(e); } });
module.exports = router;
