import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary konfiqurasiyası
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
});

// Memory Storage - diskə yazmır, yalnız memory-də saxlayır
const storage = multer.memoryStorage();

// Fayl filtri
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Yalnız şəkil faylları yükləyə bilərsiniz!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Çoxlu şəkil yükləmə üçün (maksimum 3)
export const uploadMultiple = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Maksimum 3 fayl
  }
});

// Şəkil yükləmə controller - Memory Storage istifadə edir
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Fayl tapılmadı'
      });
    }

    // Memory-dən Cloudinary-ə yüklə
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'allstore-market',
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({
              success: false,
              message: 'Şəkil yükləmə zamanı xəta baş verdi',
              details: error.message
            });
          }

          res.json({
            success: true,
            imageUrl: result.secure_url
          });
        }
      );

      // Buffer-dan stream yarad
      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);
      
      bufferStream.pipe(uploadStream);
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Şəkil yükləmə zamanı xəta baş verdi',
      details: error.message
    });
  }
};

// Çoxlu şəkil yükləmə controller
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Fayllar tapılmadı'
      });
    }

    if (req.files.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Maksimum 3 şəkil yüklənə bilər'
      });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'allstore-market',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );

        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        
        bufferStream.pipe(uploadStream);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    res.json({
      success: true,
      imageUrls: imageUrls
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Şəkillər yükləmə zamanı xəta baş verdi',
      details: error.message
    });
  }
}; 