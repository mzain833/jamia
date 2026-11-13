const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  altText: { type: String, trim: true, maxlength: 240, default: '' },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  originalName: { type: String, trim: true, maxlength: 200, default: '' },
  filename: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  mimeType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp'] },
  bytes: { type: Number, required: true, min: 1 },
  category: { type: String, enum: ['gallery', 'course', 'event', 'homepage'], required: true },
  published: { type: Boolean, default: false },
  target: { type: String, enum: ['none', 'gallery', 'course', 'event', 'homepage'], default: 'none' },
  targetSlug: { type: String, trim: true, maxlength: 120, default: '' },
  storage: { type: String, enum: ['local', 'cloudinary'], default: 'local' }
}, { timestamps: true });

mediaAssetSchema.index({ published: 1, target: 1, targetSlug: 1, updatedAt: -1 });
module.exports = mongoose.model('MediaAsset', mediaAssetSchema);
