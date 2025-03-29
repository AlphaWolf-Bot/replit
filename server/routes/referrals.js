import express from 'express';
import { db } from '../db.ts';
import { users, transactions, insertTransactionSchema } from '../../shared/schema.ts';
import { eq } from 'drizzle-orm';

const router = express.Router();
const REFERRAL_BONUS = 50; // Coins awarded for a successful referral

// Get user's referral code
router.get('/code', async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }
    
    const [user] = await db
      .select({ id: users.id, referralCode: users.referralCode })
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ referralCode: user.referralCode });
  } catch (error) {
    console.error('Get referral code error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get referral statistics
router.get('/stats', async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }
    
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get referrals count
    const referrals = await db
      .select()
      .from(users)
      .where(eq(users.referrerId, user.id));
    
    // Get referral earnings
    const earnings = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, user.id))
      .where(eq(transactions.type, 'referral_bonus'));
    
    const totalEarnings = earnings.reduce((sum, tx) => sum + tx.amount, 0);
    
    res.status(200).json({
      referralsCount: referrals.length,
      totalEarnings: totalEarnings,
      referrals: referrals.map(ref => ({
        id: ref.id,
        username: ref.username,
        firstName: ref.firstName,
        lastName: ref.lastName,
        level: ref.level,
        photoUrl: ref.photoUrl,
        joinedAt: ref.createdAt
      }))
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Apply referral code
router.post('/apply', async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }
    
    const { referralCode } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is required' });
    }
    
    // Get current user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already has a referrer
    if (user.referrerId) {
      return res.status(400).json({ message: 'User already has a referrer' });
    }
    
    // Find referrer by code
    const [referrer] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
    
    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }
    
    // Prevent self-referral
    if (referrer.id === user.id) {
      return res.status(400).json({ message: 'Cannot refer yourself' });
    }
    
    // Update user with referrer
    await db
      .update(users)
      .set({ referrerId: referrer.id })
      .where(eq(users.id, user.id));
    
    // Create transaction for referrer bonus
    const transactionData = {
      userId: referrer.id,
      amount: REFERRAL_BONUS,
      type: 'referral_bonus',
      description: `Referral bonus for inviting ${user.username}`
    };
    
    const validatedData = insertTransactionSchema.parse(transactionData);
    
    await db.insert(transactions).values(validatedData);
    
    // Update referrer's coins
    await db
      .update(users)
      .set({ coins: referrer.coins + REFERRAL_BONUS })
      .where(eq(users.id, referrer.id));
    
    res.status(200).json({ message: 'Referral code applied successfully' });
  } catch (error) {
    console.error('Apply referral error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
