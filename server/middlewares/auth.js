import { verifyTelegramData } from '../utils/security.js';

export const authenticateAdmin = (req, res, next) => {
  // For development purposes, we'll use a simple API key check
  // In production, this should be replaced with proper authentication
  const apiKey = req.headers['x-admin-api-key'];
  
  // For testing, allow access if using the dev environment
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    console.log('Development mode: Admin authentication bypassed');
    return next();
  }
  
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
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // For development testing, use a test user if no initData
    if (isDevelopment && !initData) {
      console.log('Development mode: Using test Telegram user');
      
      // Mock a test user for development
      req.telegramUser = {
        id: '12345678',
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        photo_url: 'https://ui-avatars.com/api/?name=Test+User&background=FF6B2C&color=fff'
      };
      
      return next();
    }
    
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
