import express from 'express';
import { db } from '../db.js';
import { coinSettings, transactions, users } from '@shared/schema.ts';
import { authenticateTelegram } from '../middlewares/auth.js';
import { eq, and, sql } from 'drizzle-orm';

const router = express.Router();

/**
 * Get the coin settings (publicly accessible)
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await db.select().from(coinSettings).limit(1);
    
    if (settings.length > 0) {
      return res.json({ success: true, data: settings[0] });
    } else {
      // Return default values if no settings are found
      return res.json({
        success: true,
        data: {
          imageUrl: '/assets/coin-default.svg',
          coinValue: 5
        }
      });
    }
  } catch (error) {
    console.error('Error retrieving coin settings:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Tap the coin to earn rewards
 * Requires authentication
 */
router.post('/tap', authenticateTelegram, async (req, res) => {
  try {
    const { telegramId } = req.telegramUser;
    
    if (!telegramId) {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
    
    // Get user by Telegram ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId));
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if user has reached daily tap limit
    const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const MAX_DAILY_TAPS = 100;
    
    if (user.dailyTapCount >= MAX_DAILY_TAPS && user.lastTapDate === currentDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have reached your daily tapping limit of 100 taps' 
      });
    }
    
    // Get coin settings for reward amount
    const [settings] = await db.select().from(coinSettings).limit(1);
    const coinValue = settings?.coinValue || 5;
    
    // Reset counter if it's a new day
    let newDailyTapCount = user.dailyTapCount;
    if (user.lastTapDate !== currentDate) {
      newDailyTapCount = 0;
    }
    
    // Update user's coin balance and tap count
    const [updatedUser] = await db
      .update(users)
      .set({
        coins: user.coins + coinValue,
        dailyTapCount: newDailyTapCount + 1,
        lastTapDate: currentDate
      })
      .where(eq(users.id, user.id))
      .returning();
    
    // Create transaction record
    await db.insert(transactions).values({
      userId: user.id,
      amount: coinValue,
      type: 'tap_reward',
      description: 'Reward from tapping the coin',
      status: 'completed'
    });
    
    return res.json({
      success: true,
      data: {
        coinValue,
        newBalance: updatedUser.coins,
        tapCount: updatedUser.dailyTapCount,
        dailyLimit: MAX_DAILY_TAPS
      }
    });
  } catch (error) {
    console.error('Error processing coin tap:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;