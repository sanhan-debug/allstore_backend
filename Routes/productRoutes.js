import express from 'express';
import { 
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getInStockProducts
} from '../Controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
// Düzgün sıralama:
router.get('/', getAllProducts);
router.get('/instock', getInStockProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct); // Ən sonda


// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router; 