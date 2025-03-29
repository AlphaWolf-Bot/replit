import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import BackButton from '@/components/BackButton';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { showAlert, showConfirm } from '@/lib/telegram';

const SettingsPage = () => {
  const [, setLocation] = useLocation();
  
  // Get user data
  const { data: user } = useQuery({ 
    queryKey: ['/api/auth/me'],
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    darkMode: true,
    privacyMode: false,
    language: 'english'
  });
  
  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleLanguageChange = (e) => {
    setSettings(prev => ({
      ...prev,
      language: e.target.value
    }));
  };
  
  const handleNavigation = (path) => {
    setLocation(path);
  };
  
  const handleLogout = () => {
    showConfirm('Are you sure you want to log out?', (isConfirmed) => {
      if (isConfirmed) {
        // In a real app, this would clear session/cookies
        setLocation('/');
        showAlert('You have been logged out');
      }
    });
  };
  
  const handleDeleteAccount = () => {
    showConfirm('Are you sure you want to delete your account? This action cannot be undone.', (isConfirmed) => {
      if (isConfirmed) {
        showConfirm('All your data will be permanently deleted. Proceed?', (confirmed) => {
          if (confirmed) {
            // In a real app, this would call an API to delete the account
            setLocation('/');
            showAlert('Your account has been deleted');
          }
        });
      }
    });
  };
  
  const openTelegramSupport = () => {
    window.open('https://t.me/alphawolf_support', '_blank');
  };
  
  return (
    <div id="settings-page" className="flex-1 flex flex-col">
      {/* Header with Back Button */}
      <header className="bg-card py-4 px-4 shadow-md">
        <div className="flex items-center justify-between">
          <BackButton title="Settings" />
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-auto">
        {/* Profile Section */}
        <section className="mb-6">
          <div className="bg-card rounded-xl shadow-md p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img 
                  src={user?.photoUrl || 'https://ui-avatars.com/api/?name=Alpha+Wolf&background=FF6B2C&color=fff&size=150'} 
                  alt="User Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-medium">{user?.username || 'Wolf User'}</h2>
                <p className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</p>
              </div>
            </div>
            <button 
              onClick={() => handleNavigation('/profile')}
              className="w-full py-2 bg-background text-primary font-medium rounded-lg text-sm"
            >
              View Profile
            </button>
          </div>
        </section>
        
        {/* App Settings */}
        <section className="mb-6">
          <h2 className="font-rajdhani font-bold text-lg mb-4">App Settings</h2>
          
          <div className="bg-card rounded-xl shadow-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Notifications</h3>
                <p className="text-xs text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch 
                checked={settings.notifications} 
                onCheckedChange={() => handleToggle('notifications')}
                className="bg-background data-[state=checked]:bg-primary"
              />
            </div>
            
            <Separator className="bg-background" />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Sound Effects</h3>
                <p className="text-xs text-muted-foreground">Play sounds during games</p>
              </div>
              <Switch 
                checked={settings.sounds} 
                onCheckedChange={() => handleToggle('sounds')}
                className="bg-background data-[state=checked]:bg-primary"
              />
            </div>
            
            <Separator className="bg-background" />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Dark Mode</h3>
                <p className="text-xs text-muted-foreground">Use dark theme</p>
              </div>
              <Switch 
                checked={settings.darkMode} 
                onCheckedChange={() => handleToggle('darkMode')}
                className="bg-background data-[state=checked]:bg-primary"
              />
            </div>
            
            <Separator className="bg-background" />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Privacy Mode</h3>
                <p className="text-xs text-muted-foreground">Hide balance from leaderboards</p>
              </div>
              <Switch 
                checked={settings.privacyMode} 
                onCheckedChange={() => handleToggle('privacyMode')}
                className="bg-background data-[state=checked]:bg-primary"
              />
            </div>
            
            <Separator className="bg-background" />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Language</h3>
                <p className="text-xs text-muted-foreground">Choose your preferred language</p>
              </div>
              <select 
                value={settings.language}
                onChange={handleLanguageChange}
                className="bg-background text-foreground text-sm rounded-md p-1 border-0 focus:ring-1 focus:ring-primary"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="russian">Russian</option>
                <option value="chinese">Chinese</option>
              </select>
            </div>
          </div>
        </section>
        
        {/* Support & Info */}
        <section className="mb-6">
          <h2 className="font-rajdhani font-bold text-lg mb-4">Support & Info</h2>
          
          <div className="bg-card rounded-xl shadow-md p-4 space-y-4">
            <button 
              onClick={openTelegramSupport}
              className="w-full flex items-center justify-between py-2 px-1"
            >
              <div className="flex items-center">
                <i className='bx bx-support text-primary text-xl mr-3'></i>
                <span className="text-sm font-medium">Contact Support</span>
              </div>
              <i className='bx bx-chevron-right text-muted-foreground'></i>
            </button>
            
            <Separator className="bg-background" />
            
            <button 
              className="w-full flex items-center justify-between py-2 px-1"
              onClick={() => showAlert('Version 1.0.0')}
            >
              <div className="flex items-center">
                <i className='bx bx-info-circle text-primary text-xl mr-3'></i>
                <span className="text-sm font-medium">About AlphaWolf</span>
              </div>
              <span className="text-xs text-muted-foreground">v1.0.0</span>
            </button>
            
            <Separator className="bg-background" />
            
            <button 
              className="w-full flex items-center justify-between py-2 px-1"
              onClick={() => window.open('https://alphawolf.click/terms', '_blank')}
            >
              <div className="flex items-center">
                <i className='bx bx-file text-primary text-xl mr-3'></i>
                <span className="text-sm font-medium">Terms of Service</span>
              </div>
              <i className='bx bx-chevron-right text-muted-foreground'></i>
            </button>
            
            <Separator className="bg-background" />
            
            <button 
              className="w-full flex items-center justify-between py-2 px-1"
              onClick={() => window.open('https://alphawolf.click/privacy', '_blank')}
            >
              <div className="flex items-center">
                <i className='bx bx-lock-alt text-primary text-xl mr-3'></i>
                <span className="text-sm font-medium">Privacy Policy</span>
              </div>
              <i className='bx bx-chevron-right text-muted-foreground'></i>
            </button>
          </div>
        </section>
        
        {/* Account Actions */}
        <section className="mb-6">
          <h2 className="font-rajdhani font-bold text-lg mb-4">Account</h2>
          
          <div className="bg-card rounded-xl shadow-md p-4 space-y-4">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center py-2 px-1 text-yellow-500"
            >
              <i className='bx bx-log-out text-xl mr-3'></i>
              <span className="text-sm font-medium">Log Out</span>
            </button>
            
            <Separator className="bg-background" />
            
            <button 
              onClick={handleDeleteAccount}
              className="w-full flex items-center py-2 px-1 text-destructive"
            >
              <i className='bx bx-trash text-xl mr-3'></i>
              <span className="text-sm font-medium">Delete Account</span>
            </button>
          </div>
        </section>
      </main>
      
      {/* Navigation Bar */}
      <nav className="bg-card px-2 py-3 shadow-lg">
        <div className="grid grid-cols-5 gap-1">
          <div 
            className="nav-item flex flex-col items-center text-muted-foreground"
            onClick={() => handleNavigation('/')}
          >
            <i className='bx bx-home text-xl'></i>
            <span className="text-[10px]">Home</span>
          </div>
          
          <div 
            className="nav-item flex flex-col items-center text-muted-foreground"
            onClick={() => handleNavigation('/earn')}
          >
            <i className='bx bx-dollar-circle text-xl'></i>
            <span className="text-[10px]">Earn</span>
          </div>
          
          <div 
            className="nav-item flex flex-col items-center text-muted-foreground"
            onClick={() => handleNavigation('/wallet')}
          >
            <i className='bx bx-wallet text-xl'></i>
            <span className="text-[10px]">Wallet</span>
          </div>
          
          <div 
            className="nav-item flex flex-col items-center text-muted-foreground"
            onClick={() => handleNavigation('/friends')}
          >
            <i className='bx bx-group text-xl'></i>
            <span className="text-[10px]">Friends</span>
          </div>
          
          <div 
            className="nav-item flex flex-col items-center text-muted-foreground"
            onClick={() => handleNavigation('/games')}
          >
            <i className='bx bx-joystick text-xl'></i>
            <span className="text-[10px]">Games</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SettingsPage;
