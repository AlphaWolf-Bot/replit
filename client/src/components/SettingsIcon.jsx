import React from 'react';
import { useLocation } from 'wouter';

const SettingsIcon = () => {
  const [, setLocation] = useLocation();
  
  const handleSettingsClick = () => {
    setLocation('/settings');
  };
  
  const handleNotificationsClick = (e) => {
    e.stopPropagation();
    // Handle notifications
    alert('Notifications feature coming soon!');
  };
  
  return (
    <div className="flex items-center space-x-3">
      <div 
        className="bg-wolf-primary rounded-full p-2 shadow-inner"
        onClick={handleNotificationsClick}
      >
        <i className='bx bx-bell text-muted-foreground text-xl'></i>
      </div>
      <div 
        className="bg-wolf-primary rounded-full p-2 shadow-inner"
        onClick={handleSettingsClick}
      >
        <i className='bx bx-cog text-muted-foreground text-xl'></i>
      </div>
    </div>
  );
};

export default SettingsIcon;
