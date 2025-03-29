import { db } from '../db.js';
import { coinSettings, socialMedia } from '@shared/schema.ts';
import { eq } from 'drizzle-orm';

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