import express from 'express';
import { authenticateAdmin } from '../middlewares/auth.js';
import {
  updateCoinSettings,
  getCoinSettings,
  updateSocialMedia,
  createSocialMedia,
  getAllSocialMedia,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getUserStats,
  getRecentUsers,
  getRecentTransactions
} from '../controllers/adminController.js';

const router = express.Router();

// Require admin authentication for all admin routes
router.use(authenticateAdmin);

// Dashboard overview routes
router.get('/dashboard/stats', getUserStats);
router.get('/dashboard/recent-users', getRecentUsers);
router.get('/dashboard/recent-transactions', getRecentTransactions);

// Coin settings routes
router.post('/coin-settings', updateCoinSettings);
router.get('/coin-settings', getCoinSettings);

// Social media routes
router.post('/social-media', createSocialMedia);
router.put('/social-media/:id', updateSocialMedia);
router.get('/social-media', getAllSocialMedia);

// Task management routes
router.get('/tasks', getAllTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;