const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const MediaAsset = require('../models/MediaAsset');
const Program = require('../models/Program');
const { requireAdmin } = require('../middleware/auth');
const { deleteImage, isCloudinaryConfigured, uploadImage } = require('../utils/cloudinary');

const router = express.Router();
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const uploadRoot = path.resolve(process.env.MEDIA_UPLOAD_DIR || path.resolve(__dirname, '../../uploads/media'));
fs.mkdirSync(uploadRoot, { recursive: true });
const mimeToExtension = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const acceptedCategories = new Set(['gallery', 'course', 'event', 'homepage']);
const acceptedTargets = new Set(['gallery', 'course', 'event', 'homepage']);

const uploader = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadRoot),
    filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${mimeToExtension[file.mimetype] || '.upload'}`)
  }),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 6, parts: 8, fieldNameSize: 80, fieldSize: 2048 },
  fileFilter: (_req, file, callback) => {
    if (!Object.prototype.hasOwnProperty.call(mimeToExtension, file.mimetype)) return callback(new Error('Choose a JPG, PNG, or WEBP image. Other file types are not allowed.'));
    callback(null, true);
  }
});

function receiveSingleImage(req, res, next) {
  uploader.single('file')(req, res, error => {
    if (!error) return next();
    const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
      ? 'Image is too large. The maximum upload size is 5 MB.'
      : (error.message || 'Image upload failed.');
    return res.status(400).json({ message });
  });
}

async function removeFile(filePath) {
  if (!filePath) return;
  try { await fs.promises.unlink(filePath); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}

async function detectMime(filePath) {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await handle.read(buffer, 0, 16, 0);
    const head = buffer.subarray(0, bytesRead);
    if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
    if (head.length >= 8 && head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
    if (head.length >= 12 && head.toString('ascii', 0, 4) === 'RIFF' && head.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
    return null;
  } finally { await handle.close(); }
}

function safeAsset(asset) {
  return {
    _id: asset._id,
    title: asset.title,
    altText: asset.altText,
    description: asset.description,
    originalName: asset.originalName,
    url: asset.url,
    mimeType: asset.mimeType,
    bytes: asset.bytes,
    category: asset.category,
    published: asset.published,
    target: asset.target,
    targetSlug: asset.targetSlug,
    storage: asset.storage,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt
  };
}

// Public pages receive only explicitly published image records.
router.get('/public', async (req, res, next) => {
  try {
    const filter = { published: true };
    if (acceptedTargets.has(String(req.query.target || ''))) filter.target = String(req.query.target);
    if (filter.target === 'course' && typeof req.query.slug === 'string') filter.targetSlug = req.query.slug.slice(0, 120);
    const assets = await MediaAsset.find(filter).sort({ updatedAt: -1 }).limit(100).lean();
    res.set('Cache-Control', 'no-store');
    res.json({ assets: assets.map(safeAsset) });
  } catch (error) { next(error); }
});

// All media management endpoints require the authenticated administrator.
router.use('/admin', requireAdmin);

// Authenticated upload endpoints have their own limiter to protect storage and disk IO.
const mediaUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many image uploads. Please try again later.' }
});

router.get('/admin', async (_req, res, next) => {
  try {
    const assets = await MediaAsset.find({}).sort({ updatedAt: -1 }).limit(300).lean();
    res.set('Cache-Control', 'no-store');
    res.json({ assets: assets.map(safeAsset), storage: isCloudinaryConfigured ? 'cloudinary' : 'local', maxUploadMb: 5 });
  } catch (error) { next(error); }
});

router.post('/admin/upload', mediaUploadLimiter, receiveSingleImage, async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: 'Choose an image to upload.' });
  let uploadedImage = null;
  try {
    const mimeType = await detectMime(req.file.path);
    if (!mimeType || mimeType !== req.file.mimetype || mimeToExtension[mimeType] !== path.extname(req.file.filename)) {
      await removeFile(req.file.path);
      return res.status(400).json({ message: 'The uploaded file does not match a supported image format.' });
    }
    const category = String(req.body.category || 'gallery');
    const title = String(req.body.title || '').trim().slice(0, 160);
    if (!acceptedCategories.has(category) || !title) {
      await removeFile(req.file.path);
      return res.status(400).json({ message: 'Choose a valid category and enter an image title.' });
    }
    const originalName = path.basename(String(req.file.originalname || 'image')).replace(/[\r\n\0]/g, '').slice(0, 200);
    if (isCloudinaryConfigured) uploadedImage = await uploadImage(req.file.path);
    const asset = await MediaAsset.create({
      title,
      altText: String(req.body.altText || title).trim().slice(0, 240),
      description: String(req.body.description || '').trim().slice(0, 1000),
      originalName,
      filename: uploadedImage ? uploadedImage.publicId : req.file.filename,
      url: uploadedImage ? uploadedImage.url : `/uploads/media/${req.file.filename}`,
      mimeType,
      bytes: req.file.size,
      category,
      published: false,
      target: 'none',
      targetSlug: '',
      storage: uploadedImage ? 'cloudinary' : 'local'
    });
    res.status(201).json({ message: 'Image uploaded to the media library.', asset: safeAsset(asset) });
  } catch (error) {
    if (uploadedImage) {
      try {
        await deleteImage(uploadedImage.publicId);
      } catch (cleanupError) {
        console.error('Cloudinary upload rollback failed:', cleanupError);
      }
    }
    next(error);
  } finally {
    try {
      await removeFile(req.file.path);
    } catch (cleanupError) {
      console.error('Temporary image cleanup failed:', cleanupError);
    }
  }
});

router.patch('/admin/:id/apply', async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(String(req.params.id))) return res.status(404).json({ message: 'Media item not found.' });
    const target = String(req.body.target || '');
    const targetSlug = String(req.body.targetSlug || '').trim().slice(0, 120);
    if (!acceptedTargets.has(target)) return res.status(400).json({ message: 'Choose a valid page destination.' });
    if (target === 'course') {
      if (!targetSlug) return res.status(400).json({ message: 'Choose a course for this image.' });
      const program = await Program.findOne({ slug: targetSlug, active: true }).select('_id').lean();
      if (!program) return res.status(400).json({ message: 'The selected course is not available.' });
    }
    const asset = await MediaAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Media item not found.' });
    asset.target = target;
    asset.targetSlug = target === 'course' ? targetSlug : '';
    asset.published = true;
    await asset.save();
    res.json({ message: 'Image published to the selected page.', asset: safeAsset(asset) });
  } catch (error) { next(error); }
});

router.post('/admin/:id/replace', mediaUploadLimiter, receiveSingleImage, async (req, res, next) => {
  if (!/^[a-f\d]{24}$/i.test(String(req.params.id))) {
    if (req.file) await removeFile(req.file.path).catch(() => {});
    return res.status(400).json({ message: 'Invalid media item ID.' });
  }
  if (!req.file) return res.status(400).json({ message: 'Choose a replacement image.' });

  let uploadedImage = null;
  try {
    const asset = await MediaAsset.findById(req.params.id);
    if (!asset) {
      await removeFile(req.file.path).catch(() => {});
      return res.status(404).json({ message: 'Media item not found.' });
    }

    const mimeType = await detectMime(req.file.path);
    if (!mimeType || mimeType !== req.file.mimetype || mimeToExtension[mimeType] !== path.extname(req.file.filename)) {
      await removeFile(req.file.path).catch(() => {});
      return res.status(400).json({ message: 'The replacement file does not match a supported image format.' });
    }

    if (isCloudinaryConfigured) uploadedImage = await uploadImage(req.file.path);
    const previousStorage = asset.storage;
    const previousFilename = asset.filename;
    asset.filename = uploadedImage ? uploadedImage.publicId : req.file.filename;
    asset.originalName = path.basename(String(req.file.originalname || 'image')).replace(/[\r\n\0]/g, '').slice(0, 200);
    asset.url = uploadedImage ? uploadedImage.url : `/uploads/media/${req.file.filename}`;
    asset.mimeType = mimeType;
    asset.bytes = req.file.size;
    asset.storage = uploadedImage ? 'cloudinary' : 'local';
    await asset.save();
    if (previousStorage === 'cloudinary') {
      try {
        await deleteImage(previousFilename);
      } catch (cleanupError) {
        console.error('Previous Cloudinary image cleanup failed:', cleanupError);
      }
    } else {
      try {
        await removeFile(path.join(uploadRoot, path.basename(previousFilename)));
      } catch (cleanupError) {
        console.error('Previous local image cleanup failed:', cleanupError);
      }
    }
    res.json({ message: 'Image replaced successfully. Its existing page assignment was preserved.', asset: safeAsset(asset) });
  } catch (error) {
    if (uploadedImage) {
      try {
        await deleteImage(uploadedImage.publicId);
      } catch (cleanupError) {
        console.error('Cloudinary replacement rollback failed:', cleanupError);
      }
    }
    next(error);
  } finally {
    try {
      await removeFile(req.file.path);
    } catch (cleanupError) {
      console.error('Temporary replacement image cleanup failed:', cleanupError);
    }
  }
});

router.patch('/admin/:id', async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(String(req.params.id))) return res.status(404).json({ message: 'Media item not found.' });
    const title = String(req.body.title || '').trim();
    const category = String(req.body.category || '');
    if (!title || title.length > 160) return res.status(400).json({ message: 'Image title is required and must be at most 160 characters.' });
    if (!acceptedCategories.has(category)) return res.status(400).json({ message: 'Choose a valid media category.' });
    const asset = await MediaAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Media item not found.' });
    asset.title = title;
    asset.altText = String(req.body.altText || '').trim().slice(0, 240);
    asset.description = String(req.body.description || '').trim().slice(0, 1000);
    asset.category = category;
    await asset.save();
    res.json({ message: 'Media details updated.', asset: safeAsset(asset) });
  } catch (error) { next(error); }
});

router.delete('/admin/:id', async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(String(req.params.id))) return res.status(404).json({ message: 'Media item not found.' });
    const asset = await MediaAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Media item not found.' });
    await MediaAsset.deleteOne({ _id: asset._id });
    if (asset.storage === 'cloudinary') {
      await deleteImage(asset.filename);
    } else {
      await removeFile(path.join(uploadRoot, path.basename(asset.filename)));
    }
    res.json({ message: 'Image and its publishing reference were removed.' });
  } catch (error) { next(error); }
});

module.exports = router;
