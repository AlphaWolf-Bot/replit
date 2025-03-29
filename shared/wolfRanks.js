// Import wolf levels
import wolfLevels from './wolfLevels.js';

/**
 * Gets the wolf rank for a given user level
 * @param {number} level - User level (1-100)
 * @returns {object} Wolf rank object with rank name and other details
 */
export function getWolfRank(level) {
  // Ensure level is within bounds
  const boundedLevel = Math.max(1, Math.min(100, level));
  
  // Find the appropriate level object
  const wolfRank = wolfLevels.find(w => w.level === boundedLevel);
  
  // Return the wolf rank (with fallback)
  return wolfRank || wolfLevels[0];
}

/**
 * Calculate XP needed for the next level
 * @param {number} currentLevel - User's current level (1-99)
 * @returns {number} XP required for the next level
 */
export function getNextLevelXP(currentLevel) {
  // Ensure level is within bounds
  const boundedLevel = Math.max(1, Math.min(99, currentLevel));
  
  // Find the next level's XP requirement
  const currentLevelObj = wolfLevels.find(w => w.level === boundedLevel);
  const nextLevelObj = wolfLevels.find(w => w.level === boundedLevel + 1);
  
  // Return the difference
  return nextLevelObj.xpRequired - currentLevelObj.xpRequired;
}

/**
 * Calculate progress percentage toward the next level
 * @param {number} currentLevel - User's current level
 * @param {number} currentXP - User's current XP
 * @returns {number} Progress percentage (0-100)
 */
export function getLevelProgress(currentLevel, currentXP) {
  // Ensure level is within bounds
  const boundedLevel = Math.max(1, Math.min(99, currentLevel));
  
  // Find the current and next level XP requirements
  const currentLevelObj = wolfLevels.find(w => w.level === boundedLevel);
  const nextLevelObj = wolfLevels.find(w => w.level === boundedLevel + 1);
  
  // Calculate progress
  const levelStartXP = currentLevelObj.xpRequired;
  const levelEndXP = nextLevelObj.xpRequired;
  const levelXPRange = levelEndXP - levelStartXP;
  const userLevelXP = currentXP - levelStartXP;
  
  // Calculate percentage (ensure it's between 0-100)
  const percentage = Math.min(100, Math.max(0, (userLevelXP / levelXPRange) * 100));
  
  return Math.floor(percentage);
}

/**
 * Get all wolf ranks
 * @returns {Array} Array of all wolf rank objects
 */
export function getAllWolfRanks() {
  return wolfLevels;
}