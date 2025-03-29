import express from 'express';
import { db } from '../db.js';
import { coinSettings, transactions, users } from '@shared/schema.ts';
import { authenticateTelegram } from '../middlewares/auth.js';
import { eq, and, sql, desc } from 'drizzle-orm';

// Import WebSocket for broadcasting
import { WebSocket } from 'ws';

const router = express.Router();

// Function to fetch leaderboard data
async function getLeaderboardData(limit = 10) {
  return await db
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
}

// Variable to store WebSocket Server instance
let wss = null;

// Export a function to set the WebSocket Server from routes.ts
export function setWebSocketServer(wsServer) {
  wss = wsServer;
}

// Function to broadcast leaderboard to all connected clients
async function broadcastLeaderboard() {
  if (!wss) return;
  
  const leaderboard = await getLeaderboardData();
  const data = JSON.stringify({
    type: 'leaderboard_update',
    data: leaderboard,
    timestamp: new Date().toISOString()
  });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

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
    // Get user data from telegram auth
    const telegramUser = req.telegramUser;
    
    if (!telegramUser || !telegramUser.id) {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
    
    const telegramId = telegramUser.id.toString();
    
    // Get user by Telegram ID
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId));
    
    if (!user) {
      // In development mode, auto-create the user if not found
      const isDevelopment = process.env.NODE_ENV !== 'production';
      if (isDevelopment && telegramId === '12345678') {
        console.log('Development mode: Auto-creating test user for tapping');
        
        // Generate referral code for new user
        const referralCode = Math.random().toString(36).substring(2, 10);
        
        // Prepare minimal user data
        const userData = {
          telegramId,
          username: telegramUser.username || `user${telegramId}`,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || '',
          photoUrl: telegramUser.photo_url || '',
          referralCode,
          coins: 0,
          dailyTapCount: 0,
          lastTapDate: null,
          level: 1,
          xp: 0,
          wolfRank: 'Wolf Pup'
        };
        
        // Insert user with minimal fields
        const [newUser] = await db
          .insert(users)
          .values(userData)
          .returning();
        
        console.log('Test user auto-created for tapping:', newUser.id);
        
        // Continue with the newly created user
        return processTap(newUser, res);
      }
      
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    return processTap(user, res);
    
  } catch (error) {
    console.error('Error processing coin tap:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Import wolf ranks utility
import { getWolfRank, getNextLevelXP } from '../../shared/wolfRanks.js';

// Helper function to process the tap
async function processTap(user, res) {
  // Check if user has reached daily tap limit
  const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const MAX_DAILY_TAPS = 100;
  
  if (user.dailyTapCount >= MAX_DAILY_TAPS && user.lastTapDate === currentDate) {
    return res.status(400).json({ 
      success: false, 
      message: 'You have reached your daily tapping limit of 100 taps' 
    });
  }
  
  console.log("Processing tap for user:", user.id, "Current coins:", user.coins, "Current XP:", user.xp);
  
  // Get coin settings for reward amount
  const [settings] = await db.select().from(coinSettings).limit(1);
  const coinValue = settings?.coinValue || 5;
  
  // Reset counter if it's a new day
  let newDailyTapCount = user.dailyTapCount || 0;
  if (user.lastTapDate !== currentDate) {
    newDailyTapCount = 0;
  }
  
  // Calculate XP gain - each tap gives a small amount of XP
  const xpGain = 5; // 5 XP per tap
  const currentXP = user.xp || 0;
  const newXP = currentXP + xpGain;
  
  // Get current level and check if we need to level up
  const currentLevel = user.level || 1;
  let newLevel = currentLevel;
  let leveledUp = false;
  let nextLevelXP = getNextLevelXP(currentLevel);
  
  // Check if user has reached next level
  if (newXP >= nextLevelXP) {
    newLevel = currentLevel + 1;
    leveledUp = true;
    
    // Get new wolf rank based on level
    const wolfRankObj = getWolfRank(newLevel);
    const newWolfRank = wolfRankObj.wolfRank;
    
    // Update user with new level and wolf rank
    const [updatedUser] = await db
      .update(users)
      .set({
        coins: (user.coins || 0) + coinValue,
        dailyTapCount: newDailyTapCount + 1,
        lastTapDate: currentDate,
        level: newLevel,
        xp: newXP,
        wolfRank: newWolfRank
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
    
    // Broadcast updated leaderboard to all clients
    broadcastLeaderboard().catch(err => {
      console.error('Error broadcasting leaderboard update:', err);
    });
    
    return res.json({
      success: true,
      data: {
        coinValue,
        newBalance: updatedUser.coins,
        tapCount: updatedUser.dailyTapCount,
        dailyLimit: MAX_DAILY_TAPS,
        levelUp: {
          leveledUp: true,
          oldLevel: currentLevel,
          newLevel: newLevel,
          oldWolfRank: user.wolfRank,
          newWolfRank: newWolfRank
        },
        xp: {
          gained: xpGain,
          current: newXP,
          nextLevel: getNextLevelXP(newLevel)
        }
      }
    });
  } else {
    // No level up, just update XP and coins
    const [updatedUser] = await db
      .update(users)
      .set({
        coins: (user.coins || 0) + coinValue,
        dailyTapCount: newDailyTapCount + 1,
        lastTapDate: currentDate,
        xp: newXP
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
    
    // Broadcast updated leaderboard to all clients
    broadcastLeaderboard().catch(err => {
      console.error('Error broadcasting leaderboard update:', err);
    });
    
    return res.json({
      success: true,
      data: {
        coinValue,
        newBalance: updatedUser.coins,
        tapCount: updatedUser.dailyTapCount,
        dailyLimit: MAX_DAILY_TAPS,
        levelUp: {
          leveledUp: false
        },
        xp: {
          gained: xpGain,
          current: newXP,
          nextLevel: nextLevelXP
        }
      }
    });
  }
}

export default router;