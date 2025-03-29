import express from 'express';
import { db } from '../db.ts';
import { users } from '../../shared/schema.ts';
import { desc } from 'drizzle-orm';

const router = express.Router();

/**
 * Get the top users by coins for the leaderboard
 * This is publicly accessible without authentication
 */
router.get('/', async (req, res) => {
  try {
    // Get limit from query param, default to 10
    const limit = parseInt(req.query.limit) || 10;
    
    // Fetch top users by coins
    const leaderboard = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        photoUrl: users.photoUrl,
        level: users.level,
        wolfRank: users.wolfRank,
        coins: users.coins
      })
      .from(users)
      .orderBy(desc(users.coins))
      .limit(limit);
    
    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Get the current user's rank (position) on the leaderboard
 * Requires authentication
 */
router.get('/rank', async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized: Missing user data' 
      });
    }
    
    // First, get the user's record to find their coins
    const [user] = await db
      .select()
      .from(users)
      .where({ telegramId: telegramUser.id.toString() });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Count how many users have more coins
    const usersWithMoreCoins = await db
      .select({ count: db.fn.count() })
      .from(users)
      .where({ coins: { gt: user.coins } });
    
    // Calculate rank (1-indexed, so add 1)
    const rank = parseInt(usersWithMoreCoins.count) + 1;
    
    // Get count of total users
    const totalUsers = await db
      .select({ count: db.fn.count() })
      .from(users);
    
    res.status(200).json({
      success: true,
      data: {
        rank,
        totalUsers: parseInt(totalUsers.count),
        userCoins: user.coins
      }
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;