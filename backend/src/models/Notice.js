const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  titleUrdu: { type: String, trim: true, maxlength: 160, default: '' },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  excerpt: { type: String, required: true, trim: true, maxlength: 1400 },
  excerptUrdu: { type: String, trim: true, maxlength: 1400, default: '' },
  category: { type: String, trim: true, maxlength: 60, default: 'Announcement' },
  categoryUrdu: { type: String, trim: true, maxlength: 60, default: '' },
  publishedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
