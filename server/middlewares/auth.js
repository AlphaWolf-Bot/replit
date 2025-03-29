import { verifyTelegramData } from '../utils/security.js';

export const authenticateAdmin = (req, res, next) => {
  // For development purposes, we'll use a simple API key check
  // In production, this should be replaced with proper authentication
  const apiKey = req.headers['x-admin-api-key'];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid admin credentials'
    });
  }
  
  next();
};

export const authenticateTelegram = (req, res, next) => {
  try {
    const initData = req.headers['x-telegram-init-data'];
    
    if (!initData) {
      return res.status(401).json({ message: 'Unauthorized: Missing Telegram init data' });
    }

    const telegramUser = verifyTelegramData(initData);
    
    if (!telegramUser) {
      return res.status(401).json({ message: 'Unauthorized: Invalid Telegram data' });
    }

    req.telegramUser = telegramUser;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Unauthorized: Authentication failed' });
  }
};
