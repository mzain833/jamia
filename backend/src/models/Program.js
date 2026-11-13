const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  titleUrdu: { type: String, trim: true, maxlength: 120, default: '' },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  categoryUrdu: { type: String, trim: true, maxlength: 60, default: '' },
  description: { type: String, required: true, trim: true, maxlength: 1200 },
  descriptionUrdu: { type: String, trim: true, maxlength: 1200, default: '' },
  duration: { type: String, trim: true, maxlength: 80, default: 'Contact the office' },
  durationUrdu: { type: String, trim: true, maxlength: 80, default: '' },
  mode: { type: String, trim: true, maxlength: 80, default: 'On campus' },
  modeUrdu: { type: String, trim: true, maxlength: 80, default: '' },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
