import express from 'express';
import { generateReferralCode } from '../utils/security.js';
import { db } from '../db.ts';
import { users, insertUserSchema } from '../../shared/schema.ts';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Auth middleware is applied at the route level
router.post('/login', async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }
    
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (existingUser) {
      // Return existing user
      return res.status(200).json(existingUser);
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
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
