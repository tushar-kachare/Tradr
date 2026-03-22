const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// For post media (images/videos)
const postMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tradr/posts",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4", "webm", "pdf"],
    resource_type: "auto",
  },
});

// For avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tradr/avatars",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
});

const uploadPostMedia = multer({
  storage: postMediaStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { cloudinary, uploadPostMedia, uploadAvatar };
