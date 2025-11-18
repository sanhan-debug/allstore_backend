import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './Routes/productRoutes.js';
import authRoutes from './Routes/authRoutes.js';
import { upload, uploadImage } from './Controllers/uploadController.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-də __dirname əldə et
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env faylını yüklə
dotenv.config();

// Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend files (vite və ya react build)
app.use(express.static(path.join(__dirname, 'view', 'dist')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.post('/api/upload', upload.single('image'), uploadImage);

// ✅ Fallback route – yalnız frontend üçün
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    // API route tapılmadısa 404 cavab ver
    return res.status(404).json({ message: 'API endpoint not found' });
  }

  // Frontend SPA route-lar üçün index.html
  res.sendFile(path.resolve(__dirname, 'view', 'dist', 'index.html'));
});

// Server port
const PORT = process.env.PORT || 5000;

// MongoDB-yə qoşul və serveri işə sal
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB-yə uğurla qoşuldu');

    app.listen(PORT, () => {
      console.log(`Server ${PORT} portunda işləyir`);
    });
  })
  .catch((err) => {
    console.error('MongoDB qoşulma xətası:', err);
    process.exit(1);
  });

export default app;
