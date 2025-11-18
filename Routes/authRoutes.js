import express from 'express';
import { 
  register, 
  login, 
  createAdmin, 
  getAllUsers,
  deleteUser 
} from '../Controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Admin routes
router.post('/create-admin', createAdmin); // Bu route-u test etdikdən sonra silə və ya gizlədə bilərsiniz
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);

export default router; 