import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { getTelegramUser, getInitData } from '@/lib/telegram';
import { useQuery } from '@tanstack/react-query';
import WolfLoader from './WolfLoader';
import { apiRequest } from '@/lib/queryClient';

const TelegramWebApp = ({ children }) => {
  const [, setLocation] = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get user from Telegram WebApp
  const telegramUser = getTelegramUser();
  
  // Login user on the backend
  const { isLoading, error } = useQuery({
    queryKey: ['/api/auth/login'],
    queryFn: async () => {
      try {
        const initData = getInitData();
        if (!initData) {
          throw new Error('Missing Telegram init data');
        }
        
        const response = await apiRequest('POST', '/api/auth/login', {});
        return response.json();
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    retry: 1,
    enabled: !!telegramUser,
    onSuccess: () => {
      setIsInitialized(true);
    }
  });
  
  // Get user data after login
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: isInitialized,
  });
  
  useEffect(() => {
    // Set up event listeners for navigation
    const handleNavigation = (path) => {
      setLocation(path);
    };
    
    // Expose a global function for components to navigate
    window.navigateTo = handleNavigation;
    
    return () => {
      // Clean up
      window.navigateTo = undefined;
    };
  }, [setLocation]);
  
  if (isLoading) {
    return <WolfLoader />;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-wolf-secondary p-4 text-center">
        <div className="bg-wolf-primary rounded-xl p-6 shadow-lg max-w-md">
          <h1 className="text-xl font-bold mb-4 text-white">Authentication Error</h1>
          <p className="text-wolf-gray mb-6">
            There was a problem connecting to the AlphaWolf Telegram app. Please try opening the app from Telegram again.
          </p>
          <div className="text-sm text-wolf-gray">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-wolf-secondary">
      {children}
    </div>
  );
};

export default TelegramWebApp;
