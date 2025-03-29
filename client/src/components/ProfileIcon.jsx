import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

const ProfileIcon = () => {
  const [, setLocation] = useLocation();
  
  // Get user data
  const { data: user } = useQuery({ 
    queryKey: ['/api/auth/me'],
  });
  
  const handleProfileClick = () => {
    setLocation('/profile');
  };
  
  return (
    <div className="flex items-center space-x-3" onClick={handleProfileClick}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
          <img 
            src={user?.photoUrl || 'https://ui-avatars.com/api/?name=Alpha+Wolf&background=FF6B2C&color=fff'} 
            alt="User Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-wolf-success flex items-center justify-center text-xs border border-wolf-primary">
          {user?.level || 1}
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold">{user?.username || 'Wolf User'}</h2>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-primary font-medium">Level {user?.level || 1}</span>
          <span className="text-xs text-muted-foreground">• Lone Wolf</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileIcon;
