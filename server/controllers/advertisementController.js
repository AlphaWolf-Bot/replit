import { db } from "../db.js";
import * as schema from "../../shared/schema.js";
import { eq } from "drizzle-orm";

/**
 * Get advertisement by placement
 */
export const getAdByPlacement = async (req, res) => {
  try {
    const { placement } = req.query;
    
    if (!placement) {
      return res.status(400).json({ message: "Placement parameter is required" });
    }
    
    // Get the highest priority active ad for the requested placement
    const [ad] = await db
      .select()
      .from(schema.advertisements)
      .where(eq(schema.advertisements.placement, placement))
      .where(eq(schema.advertisements.isActive, true))
      .orderBy(schema.advertisements.priority)
      .limit(1);
    
    if (!ad) {
      return res.status(404).json({ message: "No active advertisement found for this placement" });
    }
    
    res.status(200).json(ad);
  } catch (error) {
    console.error("Error fetching advertisement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all advertisements
 * Admin only
 */
export const getAllAds = async (req, res) => {
  try {
    const ads = await db
      .select()
      .from(schema.advertisements)
      .orderBy(schema.advertisements.placement);
    
    res.status(200).json(ads);
  } catch (error) {
    console.error("Error fetching all advertisements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create new advertisement
 * Admin only
 */
export const createAd = async (req, res) => {
  try {
    const {
      name,
      placement,
      type,
      imageUrl,
      linkUrl,
      altText,
      htmlContent,
      scriptContent,
      isActive,
      priority
    } = req.body;
    
    if (!name || !placement || !type) {
      return res.status(400).json({ message: "Name, placement and type are required fields" });
    }
    
    // Validate by type
    if (type === 'image' && !imageUrl) {
      return res.status(400).json({ message: "Image URL is required for image ads" });
    } else if (type === 'html' && !htmlContent) {
      return res.status(400).json({ message: "HTML content is required for HTML ads" });
    } else if (type === 'script' && !scriptContent) {
      return res.status(400).json({ message: "Script content is required for script ads" });
    }
    
    const [newAd] = await db
      .insert(schema.advertisements)
      .values({
        name,
        placement,
        type,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        altText: altText || null,
        htmlContent: htmlContent || null,
        scriptContent: scriptContent || null,
        isActive: isActive !== undefined ? isActive : true,
        priority: priority !== undefined ? priority : 0
      })
      .returning();
    
    res.status(201).json(newAd);
  } catch (error) {
    console.error("Error creating advertisement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update advertisement
 * Admin only
 */
export const updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      placement,
      type,
      imageUrl,
      linkUrl,
      altText,
      htmlContent,
      scriptContent,
      isActive,
      priority
    } = req.body;
    
    if (!id) {
      return res.status(400).json({ message: "Advertisement ID is required" });
    }
    
    // Check if ad exists
    const [existingAd] = await db
      .select()
      .from(schema.advertisements)
      .where(eq(schema.advertisements.id, parseInt(id)));
    
    if (!existingAd) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    
    // Validate by type
    if (type === 'image' && !imageUrl) {
      return res.status(400).json({ message: "Image URL is required for image ads" });
    } else if (type === 'html' && !htmlContent) {
      return res.status(400).json({ message: "HTML content is required for HTML ads" });
    } else if (type === 'script' && !scriptContent) {
      return res.status(400).json({ message: "Script content is required for script ads" });
    }
    
    const [updatedAd] = await db
      .update(schema.advertisements)
      .set({
        name: name || existingAd.name,
        placement: placement || existingAd.placement,
        type: type || existingAd.type,
        imageUrl: imageUrl !== undefined ? imageUrl : existingAd.imageUrl,
        linkUrl: linkUrl !== undefined ? linkUrl : existingAd.linkUrl,
        altText: altText !== undefined ? altText : existingAd.altText,
        htmlContent: htmlContent !== undefined ? htmlContent : existingAd.htmlContent,
        scriptContent: scriptContent !== undefined ? scriptContent : existingAd.scriptContent,
        isActive: isActive !== undefined ? isActive : existingAd.isActive,
        priority: priority !== undefined ? priority : existingAd.priority
      })
      .where(eq(schema.advertisements.id, parseInt(id)))
      .returning();
    
    res.status(200).json(updatedAd);
  } catch (error) {
    console.error("Error updating advertisement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete advertisement
 * Admin only
 */
export const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Advertisement ID is required" });
    }
    
    // Check if ad exists
    const [existingAd] = await db
      .select()
      .from(schema.advertisements)
      .where(eq(schema.advertisements.id, parseInt(id)));
    
    if (!existingAd) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    
    await db
      .delete(schema.advertisements)
      .where(eq(schema.advertisements.id, parseInt(id)));
    
    res.status(200).json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Toggle advertisement active status
 * Admin only
 */
export const toggleAdStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Advertisement ID is required" });
    }
    
    // Check if ad exists and get current status
    const [existingAd] = await db
      .select()
      .from(schema.advertisements)
      .where(eq(schema.advertisements.id, parseInt(id)));
    
    if (!existingAd) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    
    // Toggle the active status
    const [updatedAd] = await db
      .update(schema.advertisements)
      .set({
        isActive: !existingAd.isActive
      })
      .where(eq(schema.advertisements.id, parseInt(id)))
      .returning();
    
    res.status(200).json(updatedAd);
  } catch (error) {
    console.error("Error toggling advertisement status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};