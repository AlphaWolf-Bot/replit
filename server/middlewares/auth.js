import { verifyTelegramData } from '../utils/security.js';

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
