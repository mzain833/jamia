const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

const credentials = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};
const configuredCount = Object.values(credentials).filter(Boolean).length;

if (configuredCount > 0 && configuredCount < Object.keys(credentials).length) {
  const missing = Object.entries(credentials)
    .filter(([, value]) => !value)
    .map(([key]) => `CLOUDINARY_${key.toUpperCase()}`);
  throw new Error(`Cloudinary configuration is incomplete. Set: ${missing.join(', ')}.`);
}

const isCloudinaryConfigured = configuredCount === Object.keys(credentials).length;

if (isCloudinaryConfigured) {
  cloudinary.config({ ...credentials, secure: true });
}

async function uploadImage(filePath) {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Set all CLOUDINARY_* environment variables.');
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'jamia-tur-raza-ghousia-mehria',
    public_id: crypto.randomUUID(),
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'webp']
  });

  return {
    publicId: result.public_id,
    url: cloudinary.url(result.public_id, {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto'
    })
  };
}

async function deleteImage(publicId) {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Set all CLOUDINARY_* environment variables.');
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: 'image'
  });

  if (!['ok', 'not found'].includes(result.result)) {
    throw new Error(`Cloudinary could not delete image ${publicId}.`);
  }
}

module.exports = { deleteImage, isCloudinaryConfigured, uploadImage };
