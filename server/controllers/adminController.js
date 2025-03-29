import { db } from '../db.js';
import { coinSettings, socialMedia, tasks, users, userTasks, transactions } from '@shared/schema.ts';
import { eq, desc, and, sql, asc } from 'drizzle-orm';

/**
 * Update coin image settings
 */
export const updateCoinSettings = async (req, res) => {
  try {
    const { imageUrl, coinValue } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }
    
    // Check if coin settings already exist
    const existingSettings = await db.select().from(coinSettings).limit(1);
    
    if (existingSettings.length > 0) {
      // Update existing record
      const updated = await db
        .update(coinSettings)
        .set({
          imageUrl,
          coinValue: coinValue || 5,
          updatedAt: new Date()
        })
        .where(eq(coinSettings.id, existingSettings[0].id))
        .returning();
      
      return res.json({ success: true, data: updated[0] });
    } else {
      // Create new record
      const inserted = await db
        .insert(coinSettings)
        .values({
          imageUrl,
          coinValue: coinValue || 5
        })
        .returning();
      
      return res.json({ success: true, data: inserted[0] });
    }
  } catch (error) {
    console.error('Error updating coin settings:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get current coin settings
 */
export const getCoinSettings = async (req, res) => {
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
};

/**
 * Update social media link
 */
export const updateSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, name, url, icon, iconColor, reward, isActive } = req.body;
    
    if (!platform || !name || !url || !icon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Platform, name, URL, and icon are required' 
      });
    }
    
    // Check if social media exists
    const existingSocialMedia = await db
      .select()
      .from(socialMedia)
      .where(eq(socialMedia.id, parseInt(id)))
      .limit(1);
    
    if (existingSocialMedia.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Social media link not found' 
      });
    }
    
    // Update social media
    const updated = await db
      .update(socialMedia)
      .set({
        platform,
        name,
        url,
        icon,
        iconColor: iconColor || 'text-primary',
        reward: reward || 100,
        isActive: isActive !== undefined ? isActive : true
      })
      .where(eq(socialMedia.id, parseInt(id)))
      .returning();
    
    return res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating social media:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Create new social media link
 */
export const createSocialMedia = async (req, res) => {
  try {
    const { platform, name, url, icon, iconColor, reward, isActive } = req.body;
    
    if (!platform || !name || !url || !icon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Platform, name, URL, and icon are required' 
      });
    }
    
    // Create new social media link
    const inserted = await db
      .insert(socialMedia)
      .values({
        platform,
        name,
        url,
        icon,
        iconColor: iconColor || 'text-primary',
        reward: reward || 100,
        isActive: isActive !== undefined ? isActive : true
      })
      .returning();
    
    return res.json({ success: true, data: inserted[0] });
  } catch (error) {
    console.error('Error creating social media:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all social media links
 */
export const getAllSocialMedia = async (req, res) => {
  try {
    const allSocialMedia = await db
      .select()
      .from(socialMedia)
      .orderBy(socialMedia.platform);
    
    return res.json({ success: true, data: allSocialMedia });
  } catch (error) {
    console.error('Error retrieving social media links:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all tasks
 */
export const getAllTasks = async (req, res) => {
  try {
    const allTasks = await db
      .select()
      .from(tasks)
      .orderBy(tasks.id);
    
    return res.json({ success: true, data: allTasks });
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Create a new task
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, type, icon, iconColor, target, reward, socialLink, isActive } = req.body;
    
    if (!title || !description || !type || !icon || !target || !reward) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, description, type, icon, target, and reward are required' 
      });
    }
    
    // Create new task
    const inserted = await db
      .insert(tasks)
      .values({
        title,
        description,
        type,
        icon,
        iconColor: iconColor || 'text-primary',
        target,
        reward,
        socialLink: socialLink || null,
        isActive: isActive !== undefined ? isActive : true
      })
      .returning();
    
    return res.json({ success: true, data: inserted[0] });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update a task
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, icon, iconColor, target, reward, socialLink, isActive } = req.body;
    
    if (!title || !description || !type || !icon || !target || !reward) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, description, type, icon, target, and reward are required' 
      });
    }
    
    // Check if task exists
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(id)))
      .limit(1);
    
    if (existingTask.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    
    // Update task
    const updated = await db
      .update(tasks)
      .set({
        title,
        description,
        type,
        icon,
        iconColor: iconColor || 'text-primary',
        target,
        reward,
        socialLink: socialLink || null,
        isActive: isActive !== undefined ? isActive : true
      })
      .where(eq(tasks.id, parseInt(id)))
      .returning();
    
    return res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if task exists
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, parseInt(id)))
      .limit(1);
    
    if (existingTask.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    
    // Instead of deleting, we'll deactivate the task
    const updated = await db
      .update(tasks)
      .set({
        isActive: false
      })
      .where(eq(tasks.id, parseInt(id)))
      .returning();
    
    return res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get user stats for dashboard
 */
export const getUserStats = async (req, res) => {
  try {
    // Get total user count
    const userCount = await db
      .select({ count: sql`count(*)` })
      .from(users);
    
    // Get new users in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newUsersCount = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(sql`created_at > ${oneWeekAgo.toISOString()}`);
    
    // Get total coins in circulation
    const totalCoins = await db
      .select({ sum: sql`sum(coins)` })
      .from(users);
    
    // Get transaction stats
    const transactionsStats = await db
      .select({ 
        count: sql`count(*)`,
        totalAmount: sql`sum(amount)`
      })
      .from(transactions);
    
    return res.json({ 
      success: true, 
      data: {
        totalUsers: userCount[0].count || 0,
        newUsers: newUsersCount[0].count || 0,
        totalCoins: totalCoins[0].sum || 0,
        transactions: {
          count: transactionsStats[0].count || 0,
          totalAmount: transactionsStats[0].totalAmount || 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get recent users
 */
export const getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);
    
    return res.json({ success: true, data: recentUsers });
  } catch (error) {
    console.error('Error getting recent users:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get recent transactions
 */
export const getRecentTransactions = async (req, res) => {
  try {
    const recentTransactions = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        createdAt: transactions.createdAt,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .orderBy(desc(transactions.createdAt))
      .limit(10);
    
    return res.json({ success: true, data: recentTransactions });
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};