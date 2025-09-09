
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../Config/cloudinary');



const mediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const baseName = file.originalname.split('.').slice(0, -1).join('.');
    const timestamp = Date.now();

    const isVideo = ext === 'mp4';

    return {
      folder: 'media ( Images, Video )',
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp4'],
      resource_type: isVideo ? 'video' : 'image',
      public_id: `${isVideo ? 'VID' : 'IMG'}-${timestamp}_${baseName}`,
       transformation: !isVideo ? [
        { width: 1080, height: 1080, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ] : undefined,
            eager: isVideo ? [
          { width: 720, height: 720, crop: "limit", quality: "auto" }
        ] : undefined
  };
  }
});

const mediaUpload = multer({ storage: mediaStorage });


const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const baseName = file.originalname.split('.').slice(0, -1).join('.');
    const timestamp = Date.now();

    return {
      folder: 'media ( Images, Video )',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      resource_type: 'image',
      public_id: `${'IMG'}-${timestamp}_${baseName}`,
       transformation: [
        { width: 480, height: 480, crop: "limit" },
        { quality: "auto"},
        { fetch_format: "auto"}
      ]
    };
  }
});

const imageUpload = multer({ storage: imageStorage });

module.exports = {mediaUpload, imageUpload};