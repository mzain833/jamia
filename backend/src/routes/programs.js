const express = require('express');
const { body, validationResult } = require('express-validator');
const Program = require('../models/Program');
const { requireAdmin } = require('../middleware/auth');
const slugify = require('../utils/slug');
const router = express.Router();
function validate(req, res, next) { const r = validationResult(req); if (!r.isEmpty()) return res.status(400).json({ message: r.array()[0].msg }); next(); }
const checks = [
  body('title').trim().notEmpty().withMessage('Program title is required.').isLength({ max: 120 }),
  body('titleUrdu').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('category').trim().notEmpty().withMessage('Category is required.').isLength({ max: 60 }),
  body('categoryUrdu').optional({ checkFalsy: true }).trim().isLength({ max: 60 }),
  body('description').trim().notEmpty().withMessage('Description is required.').isLength({ max: 1200 }),
  body('descriptionUrdu').optional({ checkFalsy: true }).trim().isLength({ max: 1200 }),
  body('duration').optional().trim().isLength({ max: 80 }),
  body('durationUrdu').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('mode').optional().trim().isLength({ max: 80 }),
  body('modeUrdu').optional({ checkFalsy: true }).trim().isLength({ max: 80 })
];
router.get('/', async (req, res, next) => { try { const items = await Program.find({ active: true }).sort({ featured: -1, createdAt: -1 }).lean(); res.json({ programs: items }); } catch (e) { next(e); } });
router.get('/:slug', async (req, res, next) => { try { const item = await Program.findOne({ slug: req.params.slug, active: true }).lean(); if (!item) return res.status(404).json({ message: 'Program not found.' }); res.json({ program: item }); } catch (e) { next(e); } });
router.post('/', requireAdmin, checks, validate, async (req, res, next) => { try { const slug = slugify(req.body.title); const item = await Program.create({ ...req.body, slug, featured: Boolean(req.body.featured) }); res.status(201).json({ program: item }); } catch (e) { next(e); } });
router.delete('/:id', requireAdmin, async (req, res, next) => { try { const item = await Program.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ message: 'Program not found.' }); res.json({ message: 'Program deleted.' }); } catch (e) { next(e); } });
module.exports = router;
