import crypto from 'crypto';

// Telegram Bot Token hash for validating data
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TOKEN_HASH = crypto.createHash('sha256')
  .update(BOT_TOKEN)
  .digest();

/**
 * Validates Telegram WebApp initData
 * @param {string} initDataStr - URL encoded init data from Telegram WebApp
 * @returns {object|null} User data if valid, null otherwise
 */
export const verifyTelegramData = (initDataStr) => {
  try {
    const urlParams = new URLSearchParams(initDataStr);
    const hash = urlParams.get('hash');
    
    if (!hash) return null;
    
    // Remove hash from data before checking signature
    urlParams.delete('hash');
    
    // Sort params alphabetically for consistent order
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Calculate data hash
    const hmac = crypto.createHmac('sha256', TOKEN_HASH);
    hmac.update(dataCheckString);
    const calculatedHash = hmac.digest('hex');
    
    // Validate the hash
    if (calculatedHash !== hash) {
      return null;
    }
    
    // Extract user from passed data
    const user = JSON.parse(urlParams.get('user') || '{}');
    return user;
  } catch (error) {
    console.error('Error verifying Telegram data:', error);
    return null;
  }
};

/**
 * Generates a unique referral code
 * @returns {string} A unique referral code
 */
export const generateReferralCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 6;
  let result = 'WOLF';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};
