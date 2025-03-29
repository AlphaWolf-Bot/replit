import express from 'express';
import { authenticateAdmin } from '../middlewares/auth.js';
import {
  updateCoinSettings,
  getCoinSettings,
  updateSocialMedia,
  createSocialMedia,
  getAllSocialMedia
} from '../controllers/adminController.js';

const router = express.Router();

// Require admin authentication for all admin routes
router.use(authenticateAdmin);

// Coin settings routes
router.post('/coin-settings', updateCoinSettings);
router.get('/coin-settings', getCoinSettings);

// Social media routes
router.post('/social-media', createSocialMedia);
router.put('/social-media/:id', updateSocialMedia);
router.get('/social-media', getAllSocialMedia);

export default router;