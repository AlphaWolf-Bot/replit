import express from 'express';
import { db } from '../db.js';
import { 
  badges, 
  userBadges, 
  users, 
  transactions,
  insertBadgeSchema,
  insertUserBadgeSchema
} from '@shared/schema.ts';
import { authenticateTelegram, authenticateAdmin } from '../middlewares/auth.js';
import { eq, and, or, sql, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

/**
 * Get all badges
 * Public endpoint - no auth required
 */
router.get('/', async (req, res) => {
  try {
    const allBadges = await db
      .select()
      .from(badges)
      .where(eq(badges.isActive, true))
      .orderBy(badges.category, badges.rarity);

    return res.json({ success: true, data: allBadges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch badges' });
  }
});

/**
 * Get badge details by ID
 * Public endpoint - no auth required
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [badge] = await db
      .select()
      .from(badges)
      .where(eq(badges.id, parseInt(id)));
    
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }
    
    return res.json({ success: true, data: badge });
  } catch (error) {
    console.error('Error fetching badge:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch badge' });
  }
});

/**
 * Get all badges for current user
 * Requires authentication
 */
router.get('/user/my-badges', authenticateTelegram, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    
    if (!telegramUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get user badges with progress
    const userBadgesWithProgress = await db
      .select({
        id: userBadges.id,
        badgeId: userBadges.badgeId,
        progress: userBadges.progress,
        earned: userBadges.earned,
        earnedAt: userBadges.earnedAt,
        rewardClaimed: userBadges.rewardClaimed,
        featured: userBadges.featured,
        
        // Badge details
        name: badges.name,
        description: badges.description,
        category: badges.category,
        icon: badges.icon,
        iconColor: badges.iconColor,
        requirement: badges.requirement,
        rarity: badges.rarity,
        xpReward: badges.xpReward,
        coinReward: badges.coinReward
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(
        and(
          eq(userBadges.userId, user.id),
          eq(badges.isActive, true)
        )
      )
      .orderBy(userBadges.earned, userBadges.progress);
    
    // Get available badges not yet assigned to user
    const [assignedBadgeIds] = await db
      .select({
        badgeIds: sql`array_agg(${userBadges.badgeId})`
      })
      .from(userBadges)
      .where(eq(userBadges.userId, user.id));
    
    let availableBadges = [];
    
    if (!assignedBadgeIds || !assignedBadgeIds.badgeIds || assignedBadgeIds.badgeIds.length === 0) {
      // No badges assigned yet, get all available badges
      availableBadges = await db
        .select()
        .from(badges)
        .where(eq(badges.isActive, true));
    } else {
      // Get badges that are not yet assigned to the user
      availableBadges = await db
        .select()
        .from(badges)
        .where(
          and(
            eq(badges.isActive, true),
            sql`${badges.id} NOT IN (${assignedBadgeIds.badgeIds.join(',')})`
          )
        );
    }
    
    // Map available badges to proper format
    const availableBadgesMapped = availableBadges.map(badge => ({
      badgeId: badge.id,
      progress: 0,
      earned: false,
      rewardClaimed: false,
      featured: false,
      
      name: badge.name,
      description: badge.description,
      category: badge.category,
      icon: badge.icon,
      iconColor: badge.iconColor,
      requirement: badge.requirement,
      rarity: badge.rarity,
      xpReward: badge.xpReward,
      coinReward: badge.coinReward
    }));
    
    // Combine user's badges with available badges
    const allBadges = [...userBadgesWithProgress, ...availableBadgesMapped];
    
    // Group badges by category
    const groupedBadges = allBadges.reduce((acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {});
    
    return res.json({ 
      success: true, 
      data: {
        badges: allBadges,
        groupedBadges,
        earnedCount: userBadgesWithProgress.filter(b => b.earned).length,
        featuredBadges: userBadgesWithProgress.filter(b => b.featured)
      }
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user badges' });
  }
});

/**
 * Update user badge progress
 * Requires authentication
 */
router.post('/progress', authenticateTelegram, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { badgeId, progress, action } = req.body;
    
    if (!telegramUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    if (!badgeId || (progress === undefined && !action)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get badge
    const [badge] = await db
      .select()
      .from(badges)
      .where(eq(badges.id, badgeId));
    
    if (!badge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }
    
    // Check if user already has this badge
    let [userBadge] = await db
      .select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, user.id),
          eq(userBadges.badgeId, badgeId)
        )
      );
    
    if (!userBadge) {
      // If the badge doesn't exist for the user, create it
      [userBadge] = await db
        .insert(userBadges)
        .values({
          userId: user.id,
          badgeId: badgeId,
          progress: 0,
          earned: false
        })
        .returning();
    }
    
    // Update progress
    let newProgress = userBadge.progress;
    
    if (action === 'increment') {
      // Increment progress
      newProgress = userBadge.progress + 1;
    } else if (action === 'set' && progress !== undefined) {
      // Set progress to specific value
      newProgress = progress;
    } else if (progress !== undefined) {
      // Use provided progress value
      newProgress = progress;
    }
    
    // Check if the badge is already earned
    if (userBadge.earned) {
      return res.json({ 
        success: true, 
        data: {
          message: 'Badge already earned',
          userBadge
        }
      });
    }
    
    // Check if the badge should be earned now
    const badgeEarned = newProgress >= badge.requirement;
    
    // Update the user badge
    const [updatedUserBadge] = await db
      .update(userBadges)
      .set({
        progress: newProgress,
        earned: badgeEarned,
        earnedAt: badgeEarned ? new Date() : null
      })
      .where(eq(userBadges.id, userBadge.id))
      .returning();
    
    // If badge was just earned, handle rewards
    if (badgeEarned && !userBadge.earned) {
      // Add XP to user
      if (badge.xpReward > 0) {
        await db
          .update(users)
          .set({
            xp: user.xp + badge.xpReward
          })
          .where(eq(users.id, user.id));
      }
      
      // Add coins to user
      if (badge.coinReward > 0) {
        await db
          .update(users)
          .set({
            coins: user.coins + badge.coinReward
          })
          .where(eq(users.id, user.id));
        
        // Create transaction record
        await db
          .insert(transactions)
          .values({
            userId: user.id,
            amount: badge.coinReward,
            type: 'badge_reward',
            description: `Reward for earning the '${badge.name}' badge`,
            status: 'completed'
          });
      }
    }
    
    return res.json({ 
      success: true, 
      data: {
        userBadge: updatedUserBadge,
        badgeEarned,
        badge
      }
    });
  } catch (error) {
    console.error('Error updating badge progress:', error);
    return res.status(500).json({ success: false, message: 'Failed to update badge progress' });
  }
});

/**
 * Set a badge as featured (or unset)
 * Requires authentication
 */
router.post('/feature', authenticateTelegram, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { badgeId, featured } = req.body;
    
    if (!telegramUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    if (!badgeId || featured === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if user has this badge and has earned it
    const [userBadge] = await db
      .select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, user.id),
          eq(userBadges.badgeId, badgeId),
          eq(userBadges.earned, true)
        )
      );
    
    if (!userBadge) {
      return res.status(404).json({ success: false, message: 'Badge not found or not earned' });
    }
    
    // Get current featured badges
    const featuredBadges = await db
      .select()
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, user.id),
          eq(userBadges.featured, true)
        )
      );
    
    // Max 3 featured badges
    if (featured && featuredBadges.length >= 3 && !userBadge.featured) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum of 3 featured badges allowed',
        data: {
          featuredBadges
        }
      });
    }
    
    // Update the badge featured status
    const [updatedUserBadge] = await db
      .update(userBadges)
      .set({
        featured
      })
      .where(eq(userBadges.id, userBadge.id))
      .returning();
    
    return res.json({ 
      success: true, 
      data: {
        userBadge: updatedUserBadge
      }
    });
  } catch (error) {
    console.error('Error updating featured badge:', error);
    return res.status(500).json({ success: false, message: 'Failed to update featured badge' });
  }
});

/**
 * Claim badge reward
 * Requires authentication
 */
router.post('/claim-reward', authenticateTelegram, async (req, res) => {
  try {
    const telegramUser = req.telegramUser;
    const { badgeId } = req.body;
    
    if (!telegramUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    if (!badgeId) {
      return res.status(400).json({ success: false, message: 'Badge ID is required' });
    }
    
    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramUser.id.toString()));
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if user has this badge and has earned it
    const [userBadge] = await db
      .select()
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(
        and(
          eq(userBadges.userId, user.id),
          eq(userBadges.badgeId, badgeId),
          eq(userBadges.earned, true),
          eq(userBadges.rewardClaimed, false)
        )
      );
    
    if (!userBadge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Badge not found, not earned, or reward already claimed' 
      });
    }
    
    // Get the badge details
    const [badge] = await db
      .select()
      .from(badges)
      .where(eq(badges.id, badgeId));
    
    // Update user XP
    if (badge.xpReward > 0) {
      await db
        .update(users)
        .set({
          xp: user.xp + badge.xpReward
        })
        .where(eq(users.id, user.id));
    }
    
    // Update user coins
    if (badge.coinReward > 0) {
      await db
        .update(users)
        .set({
          coins: user.coins + badge.coinReward
        })
        .where(eq(users.id, user.id));
      
      // Create transaction record
      await db
        .insert(transactions)
        .values({
          userId: user.id,
          amount: badge.coinReward,
          type: 'badge_reward',
          description: `Reward for the '${badge.name}' badge`,
          status: 'completed'
        });
    }
    
    // Mark reward as claimed
    const [updatedUserBadge] = await db
      .update(userBadges)
      .set({
        rewardClaimed: true
      })
      .where(eq(userBadges.id, userBadge.id))
      .returning();
    
    return res.json({ 
      success: true, 
      data: {
        userBadge: updatedUserBadge,
        xpReward: badge.xpReward,
        coinReward: badge.coinReward
      }
    });
  } catch (error) {
    console.error('Error claiming badge reward:', error);
    return res.status(500).json({ success: false, message: 'Failed to claim badge reward' });
  }
});

// ADMIN ROUTES

/**
 * Admin: Get all badges (including inactive)
 * Requires admin authentication
 */
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const allBadges = await db
      .select()
      .from(badges)
      .orderBy(badges.category, badges.rarity);

    return res.json({ success: true, data: allBadges });
  } catch (error) {
    console.error('Error fetching all badges:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch badges' });
  }
});

/**
 * Admin: Create a new badge
 * Requires admin authentication
 */
router.post('/admin/create', authenticateAdmin, async (req, res) => {
  try {
    const badgeData = req.body;
    
    try {
      // Validate with zod schema
      const validatedData = insertBadgeSchema.parse(badgeData);
      
      // Insert badge
      const [newBadge] = await db
        .insert(badges)
        .values(validatedData)
        .returning();
      
      return res.status(201).json({ success: true, data: newBadge });
    } catch (validationError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid badge data', 
        errors: validationError.errors 
      });
    }
  } catch (error) {
    console.error('Error creating badge:', error);
    return res.status(500).json({ success: false, message: 'Failed to create badge' });
  }
});

/**
 * Admin: Update an existing badge
 * Requires admin authentication
 */
router.put('/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const badgeData = req.body;
    
    // Check if badge exists
    const [existingBadge] = await db
      .select()
      .from(badges)
      .where(eq(badges.id, parseInt(id)));
    
    if (!existingBadge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }
    
    try {
      // Validate with zod schema
      const validatedData = insertBadgeSchema.parse(badgeData);
      
      // Update badge
      const [updatedBadge] = await db
        .update(badges)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(badges.id, parseInt(id)))
        .returning();
      
      return res.json({ success: true, data: updatedBadge });
    } catch (validationError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid badge data', 
        errors: validationError.errors 
      });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
    return res.status(500).json({ success: false, message: 'Failed to update badge' });
  }
});

/**
 * Admin: Delete or deactivate a badge
 * Requires admin authentication
 */
router.delete('/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { deactivateOnly } = req.query;
    
    // Check if badge exists
    const [existingBadge] = await db
      .select()
      .from(badges)
      .where(eq(badges.id, parseInt(id)));
    
    if (!existingBadge) {
      return res.status(404).json({ success: false, message: 'Badge not found' });
    }
    
    if (deactivateOnly === 'true') {
      // Deactivate the badge instead of deleting
      const [deactivatedBadge] = await db
        .update(badges)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(badges.id, parseInt(id)))
        .returning();
      
      return res.json({ 
        success: true, 
        message: 'Badge deactivated successfully',
        data: deactivatedBadge
      });
    } else {
      // Delete the badge
      await db
        .delete(badges)
        .where(eq(badges.id, parseInt(id)));
      
      return res.json({ 
        success: true, 
        message: 'Badge deleted successfully' 
      });
    }
  } catch (error) {
    console.error('Error deleting badge:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete badge' });
  }
});

/**
 * Admin: Get badge statistics
 * Requires admin authentication
 */
router.get('/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    // Get total badges
    const [badgeCount] = await db
      .select({ count: sql`count(*)` })
      .from(badges);
    
    // Get badges by category
    const badgesByCategory = await db
      .select({
        category: badges.category,
        count: sql`count(*)`
      })
      .from(badges)
      .groupBy(badges.category);
    
    // Get badges by rarity
    const badgesByRarity = await db
      .select({
        rarity: badges.rarity,
        count: sql`count(*)`
      })
      .from(badges)
      .groupBy(badges.rarity);
    
    // Get total user badges
    const [userBadgeCount] = await db
      .select({ count: sql`count(*)` })
      .from(userBadges);
    
    // Get earned user badges
    const [earnedBadgeCount] = await db
      .select({ count: sql`count(*)` })
      .from(userBadges)
      .where(eq(userBadges.earned, true));
    
    // Get featured user badges
    const [featuredBadgeCount] = await db
      .select({ count: sql`count(*)` })
      .from(userBadges)
      .where(eq(userBadges.featured, true));
    
    // Get most popular badges
    const mostPopularBadges = await db
      .select({
        badgeId: userBadges.badgeId,
        name: badges.name,
        category: badges.category,
        rarity: badges.rarity,
        earnedCount: sql`count(*)`
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.earned, true))
      .groupBy(userBadges.badgeId, badges.name, badges.category, badges.rarity)
      .orderBy(sql`count(*)`, 'desc')
      .limit(5);
    
    return res.json({
      success: true,
      data: {
        totalBadges: parseInt(badgeCount.count),
        badgesByCategory,
        badgesByRarity,
        totalUserBadges: parseInt(userBadgeCount.count),
        earnedBadges: parseInt(earnedBadgeCount.count),
        featuredBadges: parseInt(featuredBadgeCount.count),
        mostPopularBadges
      }
    });
  } catch (error) {
    console.error('Error getting badge statistics:', error);
    return res.status(500).json({ success: false, message: 'Failed to get badge statistics' });
  }
});

export default router;