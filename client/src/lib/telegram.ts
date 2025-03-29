// Type definitions for Telegram WebApp
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

interface MainButton {
  text: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setText(text: string): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
}

interface BackButton {
  isVisible: boolean;
  show(): void;
  hide(): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
}

interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
}

interface WebApp {
  initData: string;
  initDataUnsafe: TelegramInitData;
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: MainButton;
  BackButton: BackButton;
  isClosingConfirmationEnabled: boolean;
  ready(): void;
  expand(): void;
  close(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  onEvent(eventType: string, eventHandler: () => void): void;
  offEvent(eventType: string, eventHandler: () => void): void;
  sendData(data: string): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: {
      id: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }[];
  }, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (isConfirmed: boolean) => void): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  setHeaderVisible(isVisible: boolean): void;
}

// Helper for TypeScript to access window.Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
    navigateTo?: (path: string) => void;
  }
}

// Get global Telegram WebApp instance
export const tgWebApp: WebApp | null = 
  typeof window !== 'undefined' && window.Telegram?.WebApp 
    ? window.Telegram.WebApp 
    : null;

// Check if we're running inside Telegram WebApp
export const isTelegramWebApp = (): boolean => {
  return Boolean(typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp);
};

// Helper to get user data
export const getTelegramUser = (): TelegramUser | null => {
  if (isTelegramWebApp()) {
    return window.Telegram!.WebApp.initDataUnsafe?.user || null;
  }
  return null;
};

// Get init data for backend validation
export const getInitData = (): string => {
  if (isTelegramWebApp()) {
    return window.Telegram!.WebApp.initData;
  }
  return '';
};

// Open Telegram Bot
export const openTelegramBot = (botUsername: string = "AlphaWolfBot"): void => {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.openTelegramLink(`https://t.me/${botUsername}`);
  } else {
    window.open(`https://t.me/${botUsername}`, "_blank");
  }
};

// Send data back to the Telegram Bot
export const sendDataToTelegramBot = (data: any): void => {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.sendData(JSON.stringify(data));
  }
};

// Close the Telegram WebApp
export const closeTelegramWebApp = (): void => {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.close();
  }
};

// Show Telegram WebApp alert
export const showAlert = (message: string, callback?: () => void): void => {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.showAlert(message, callback);
  } else {
    alert(message);
    if (callback) callback();
  }
};

// Show Telegram WebApp confirm dialog
export const showConfirm = (message: string, callback?: (isConfirmed: boolean) => void): void => {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.showConfirm(message, callback);
  } else {
    const result = confirm(message);
    if (callback) callback(result);
  }
};

// Show Main Button
export const showMainButton = (text: string, onClick?: () => void): void => {
  if (isTelegramWebApp()) {
    const mainButton = window.Telegram!.WebApp.MainButton;
    mainButton.setText(text);
    if (onClick) {
      mainButton.onClick(onClick);
    }
    mainButton.show();
  }
};

// Hide Main Button
export const hideMainButton = (): void => {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.MainButton.hide();
  }
};

// Show native loading animation on main button
export const showLoading = (buttonText: string = 'Please wait...'): void => {
  if (isTelegramWebApp()) {
    const mainButton = window.Telegram!.WebApp.MainButton;
    mainButton.setText(buttonText);
    mainButton.showProgress();
    mainButton.show();
  }
};

// Hide native loading animation
export const hideLoading = (): void => {
  if (isTelegramWebApp()) {
    const mainButton = window.Telegram!.WebApp.MainButton;
    mainButton.hideProgress();
    mainButton.hide();
  }
};

// Show back button
export const showBackButton = (callback: () => void): void => {
  if (isTelegramWebApp()) {
    const backButton = window.Telegram!.WebApp.BackButton;
    if (callback) {
      backButton.onClick(callback);
    }
    backButton.show();
  }
};

// Hide back button
export const hideBackButton = (): void => {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.BackButton.hide();
  }
};

// Get theme params
export const getThemeParams = () => {
  if (isTelegramWebApp()) {
    return window.Telegram!.WebApp.themeParams;
  }
  return null;
};

// Apply Telegram theme to app
export const applyTelegramTheme = (): void => {
  if (isTelegramWebApp()) {
    const theme = window.Telegram!.WebApp.themeParams;
    
    if (theme) {
      document.documentElement.style.setProperty('--tg-bg-color', theme.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-text-color', theme.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-hint-color', theme.hint_color || '#999999');
      document.documentElement.style.setProperty('--tg-link-color', theme.link_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-button-color', theme.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-button-text-color', theme.button_text_color || '#ffffff');
    }
  }
};

// Initialize Telegram WebApp
export const initTelegramWebApp = (onReady?: () => void): void => {
  if (isTelegramWebApp()) {
    // Signal to Telegram WebApp that we are ready
    window.Telegram!.WebApp.ready();
    
    // Apply Telegram theme
    applyTelegramTheme();
    
    // Set color scheme based on Telegram WebApp
    const colorScheme = window.Telegram!.WebApp.colorScheme;
    document.documentElement.setAttribute('data-theme', colorScheme === 'dark' ? 'dark' : 'light');
    
    // Call onReady callback if provided
    if (onReady) onReady();
  }
};