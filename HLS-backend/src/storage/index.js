const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const BUCKET = process.env.NEON_STORAGE_BUCKET || 'hotel-images';
const ENDPOINT = (process.env.AWS_ENDPOINT_URL_S3 || '').replace(/\/+$/, '');

const REQUIRED_ENV = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_ENDPOINT_URL_S3',
  'AWS_REGION',
];

let client;

const assertConfigured = () => {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Neon Object Storage is not configured (missing ${missing.join(', ')}). Run \`neon env pull\` locally.`
    );
  }
};

const s3 = () => {
  if (!client) {
    client = new S3Client({ forcePathStyle: true });
  }
  return client;
};

const objectUrl = (key) => `${ENDPOINT}/${BUCKET}/${key}`;

const putObject = async (key, body, contentType) => {
  assertConfigured();
  await s3().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
  return objectUrl(key);
};

const putImage = async (buffer, originalName, contentType) => {
  const ext = (path.extname(originalName || '') || '').toLowerCase();
  const key = `hotels/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  return putObject(key, buffer, contentType);
};

const deleteImage = async (url) => {
  const prefix = `${ENDPOINT}/${BUCKET}/`;
  if (!url || !url.startsWith(prefix)) {
    return false;
  }
  assertConfigured();
  try {
    await s3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: url.slice(prefix.length) }));
    return true;
  } catch (err) {
    console.error('Failed to delete object:', err.message);
    return false;
  }
};

module.exports = {
  BUCKET,
  objectUrl,
  putObject,
  putImage,
  deleteImage,
};
