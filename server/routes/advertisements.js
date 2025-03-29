import express from 'express';
import { 
  getAdByPlacement,
  getAllAds,
  createAd,
  updateAd,
  deleteAd,
  toggleAdStatus
} from '../controllers/advertisementController.js';
import { authenticateAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAdByPlacement);

// Admin routes - require admin authentication
router.get('/all', authenticateAdmin, getAllAds);
router.post('/', authenticateAdmin, createAd);
router.put('/:id', authenticateAdmin, updateAd);
router.delete('/:id', authenticateAdmin, deleteAd);
router.put('/:id/toggle', authenticateAdmin, toggleAdStatus);

export default router;