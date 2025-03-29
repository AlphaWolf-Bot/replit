import express from 'express';
import { generateReferralCode } from '../utils/security.js';
import { db } from '../db.ts';
import { users, insertUserSchema } from '../../shared/schema.ts';
import { eq } from 'drizzle-orm';
import { getWolfRank } from '../../shared/wolfRanks.js';

const router = express.Router();
// Keep track of the route being processed to avoid double-processing
const processedRoutes = new Set();

// Auth middleware is applied at the route level
router.post('/login', async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing user data' });
    }
    
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (existingUser) {
      // Return existing user with standardized success response
      return res.status(200).json({
        success: true,
        data: existingUser
      });
    }
    
    // Create new user
    const referralCode = generateReferralCode();
    
    // Prepare user data
    const userData = {
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username || `user${telegramUser.id}`,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name || '',
      photoUrl: telegramUser.photo_url || '',
      referralCode,
      level: 1,
      xp: 0,
      coins: 100, // Welcome bonus
    };
    
    // Check referral code if provided
    const referrerCode = req.body.referralCode;
    if (referrerCode) {
      const [referrer] = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, referrerCode));
      
      if (referrer) {
        userData.referrerId = referrer.id;
      }
    }
    
    // Validate with zod schema
    const validatedData = insertUserSchema.parse(userData);
    
    // Insert user
    const [newUser] = await db
      .insert(users)
      .values(validatedData)
      .returning();
    
    res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
});

router.get('/me', async (req, res) => {
  try {
    // Removing double-processing prevention as it's causing issues
    console.log('Handling /me request');
    
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing user data' });
    }
    
    // Find existing user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    // If user exists, return it with standardized success response
    if (user) {
      return res.status(200).json({ 
        success: true,
        data: user 
      });
    }
    
    // If in development and using test user, create the user
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment && telegramUser.id === '12345678') {
      console.log('Development mode: Creating test user');
      
      // Generate referral code for new user
      const referralCode = generateReferralCode();
      
      // Get wolf rank for level 1
      const wolfRankObj = getWolfRank(1);
      
      // Prepare user data
      const userData = {
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username || `user${telegramUser.id}`,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || '',
        photoUrl: telegramUser.photo_url || '',
        referralCode,
        level: 1,
        xp: 0,
        coins: 1000, // Test bonus
        wolfRank: wolfRankObj.wolfRank || 'Wolf Pup',
        dailyTapCount: 0
      };
      
      try {
        // Validate with zod schema and ensure all required fields are present
        const validatedData = insertUserSchema.parse(userData);
        
        // Insert user
        const [newUser] = await db
          .insert(users)
          .values(validatedData)
          .returning();
        
        console.log('Test user created successfully:', newUser.id);
        return res.status(200).json({ 
          success: true,
          data: newUser 
        });
      } catch (validationError) {
        console.error('Test user validation error:', validationError);
        
        // If there's a validation error, try with only required fields
        const minimalUserData = {
          telegramId: telegramUser.id.toString(),
          username: telegramUser.username || `user${telegramUser.id}`,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || '',
          photoUrl: telegramUser.photo_url || '',
          referralCode,
          coins: 1000,
          level: 1,
          xp: 0,
          wolfRank: wolfRankObj.wolfRank || 'Wolf Pup'
        };
        
        // Insert user with minimal fields
        const [newUser] = await db
          .insert(users)
          .values(minimalUserData)
          .returning();
        
        console.log('Test user created with minimal fields:', newUser.id);
        return res.status(200).json({ 
          success: true,
          data: newUser 
        });
      }
    }
    
    // User not found and not in development mode with test user
    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
