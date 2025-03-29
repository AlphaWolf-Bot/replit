import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { getTelegramUser, getInitData } from '@/lib/telegram';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import WolfLoader from './WolfLoader';
import { apiRequest } from '@/lib/queryClient';

const TelegramWebApp = ({ children }) => {
  const [, setLocation] = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();
  
  // Get user from Telegram WebApp
  const telegramUser = getTelegramUser();
  const initData = getInitData();
  
  // Set up global headers for API requests
  useEffect(() => {
    // Add the Telegram init data to the fetch function's headers
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
      // Clone the options to avoid modifying the original options object
      const newOptions = { ...options };
      
      // Create headers if they don't exist
      newOptions.headers = newOptions.headers || {};
      
      // Add Telegram init data to headers
      if (initData) {
        newOptions.headers = {
          ...newOptions.headers,
          'X-Telegram-Init-Data': initData
        };
      }
      
      // Call the original fetch function with the modified options
      return originalFetch.call(this, url, newOptions);
    };
    
    // Cleanup function to restore the original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [initData]);
  
  // Login user on the backend
  const { isLoading, error } = useQuery({
    queryKey: ['/api/auth/login'],
    queryFn: async () => {
      try {
        if (!initData && !telegramUser) {
          throw new Error('Missing Telegram init data');
        }
        
        // Create user or get existing user
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Telegram-Init-Data': initData || ''
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`${response.status}: ${text}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    retry: 1,
    enabled: !!telegramUser || process.env.NODE_ENV !== 'production',
    onSuccess: () => {
      setIsInitialized(true);
      // Invalidate the user data query to refetch it
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    }
  });
  
  // Get user data after login
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: isInitialized || process.env.NODE_ENV !== 'production',
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
  
  // For development mode, bypass loading screen
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className="flex flex-col min-h-screen">
        {children}
      </div>
    );
  }
  
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
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
};

export default TelegramWebApp;
