import express from 'express';
import { db } from '../db.ts';
import { transactions, users, insertTransactionSchema } from '../../shared/schema.ts';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get user's balance
router.get('/balance', async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }
    
    const [user] = await db
      .select({ id: users.id, coins: users.coins })
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ balance: user.coins });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get transaction history
router.get('/transactions', async (req, res) => {
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
    
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, user.id))
      .orderBy(transactions.createdAt);
    
    res.status(200).json(userTransactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a transaction
router.post('/transaction', async (req, res) => {
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
    
    // Prepare transaction data
    const transactionData = {
      userId: user.id,
      amount: req.body.amount,
      type: req.body.type,
      description: req.body.description
    };
    
    // Validate transaction data
    const validatedData = insertTransactionSchema.parse(transactionData);
    
    // Begin transaction
    // In a real implementation, this would be a proper database transaction
    const [newTransaction] = await db
      .insert(transactions)
      .values(validatedData)
      .returning();
    
    // Update user balance
    await db
      .update(users)
      .set({ coins: user.coins + req.body.amount })
      .where(eq(users.id, user.id));
    
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
