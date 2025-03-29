import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import BackButton from '@/components/BackButton';
import { Progress } from '@/components/ui/progress';
import { showAlert } from '@/lib/telegram';

const ProfilePage = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get user data
  const { data: user } = useQuery({ 
    queryKey: ['/api/auth/me'],
  });
  
  // Get tasks completion data
  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
  });
  
  // Get referral stats
  const { data: referralStats } = useQuery({
    queryKey: ['/api/referrals/stats'],
  });
  
  // Calculate XP progress
  const currentXP = user?.xp || 0;
  const nextLevelXP = ((user?.level || 1) * 200) || 200;
  const xpProgress = Math.min(100, Math.floor((currentXP / nextLevelXP) * 100));
  
  // Calculate badges and achievements
  const userRank = user?.level >= 50 ? 'Alpha Wolf' :
                   user?.level >= 30 ? 'Pack Leader' :
                   user?.level >= 15 ? 'Hunter' :
                   user?.level >= 5 ? 'Scout' : 'Lone Wolf';

  const handleNavigation = (path) => {
    setLocation(path);
  };
  
  const copyReferralCode = () => {
    if (navigator.clipboard && user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      showAlert('Referral code copied to clipboard!');
    }
  };
  
  const completedTaskCount = tasks?.filter(task => task.isCompleted).length || 0;
  const totalTaskCount = tasks?.length || 0;
  const taskCompletionPercentage = totalTaskCount > 0 
    ? Math.floor((completedTaskCount / totalTaskCount) * 100) 
    : 0;
  
  return (
    <div id="profile-page" className="flex-1 flex flex-col">
      {/* Header with Back Button */}
      <header className="bg-card py-4 px-4 shadow-md">
        <div className="flex items-center justify-between">
          <BackButton title="Profile" />
          <div className="flex items-center gap-2">
            <button 
              className="bg-wolf-primary rounded-full p-2 shadow-inner"
              onClick={() => handleNavigation('/settings')}
            >
              <i className='bx bx-cog text-muted-foreground text-xl'></i>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-auto">
        {/* Profile Header */}
        <section className="mb-6">
          <div className="bg-card rounded-xl shadow-md p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                <img 
                  src={user?.photoUrl || 'https://ui-avatars.com/api/?name=Alpha+Wolf&background=FF6B2C&color=fff&size=150'} 
                  alt="User Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-wolf-success flex items-center justify-center text-white font-medium text-sm border-2 border-card">
                {user?.level || 1}
              </div>
            </div>
            
            <h1 className="text-xl font-bold mb-1">{user?.username || 'Wolf User'}</h1>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-primary font-medium">{userRank}</span>
              <span className="text-sm text-muted-foreground">• Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
            </div>
            
            <div className="w-full mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">
                  Level {user?.level || 1} • {currentXP}/{nextLevelXP} XP
                </span>
                <span className="text-xs text-primary font-medium">{xpProgress}%</span>
              </div>
              <Progress value={xpProgress} className="h-2.5 bg-background" indicatorClassName="bg-gradient-to-r from-primary to-accent" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="bg-background rounded-lg p-3 text-center">
                <span className="block text-xl font-bold text-primary">{user?.coins || 0}</span>
                <span className="text-xs text-muted-foreground">Coins</span>
              </div>
              
              <div className="bg-background rounded-lg p-3 text-center">
                <span className="block text-xl font-bold text-primary">{referralStats?.referralsCount || 0}</span>
                <span className="text-xs text-muted-foreground">Referrals</span>
              </div>
              
              <div className="bg-background rounded-lg p-3 text-center">
                <span className="block text-xl font-bold text-primary">{taskCompletionPercentage}%</span>
                <span className="text-xs text-muted-foreground">Tasks</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Tabs Navigation */}
        <div className="flex border-b border-border mb-6">
          <button 
            className={`pb-2 px-4 text-sm font-medium ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`pb-2 px-4 text-sm font-medium ${activeTab === 'badges' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('badges')}
          >
            Badges
          </button>
          <button 
            className={`pb-2 px-4 text-sm font-medium ${activeTab === 'stats' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Referral Code */}
            <section className="mb-6">
              <div className="bg-card rounded-xl shadow-md p-4">
                <h2 className="font-rajdhani font-bold text-lg mb-4">Referral Code</h2>
                <div className="bg-background rounded-lg p-3 mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">{user?.referralCode || 'WOLF42'}</span>
                  <button 
                    className="text-primary text-sm font-medium"
                    onClick={copyReferralCode}
                  >
                    <i className='bx bx-copy'></i> Copy
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share your referral code with friends and earn 50 coins for each friend who joins!
                </p>
              </div>
            </section>
            
            {/* Recent Activity */}
            <section className="mb-6">
              <div className="bg-card rounded-xl shadow-md p-4">
                <h2 className="font-rajdhani font-bold text-lg mb-4">Recent Activity</h2>
                
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-opacity-20 bg-green-500 flex items-center justify-center mr-3">
                        <i className='bx bx-check text-green-500'></i>
                      </div>
                      <div>
                        <p className="text-sm">Completed daily tasks</p>
                        <span className="text-xs text-muted-foreground">Yesterday</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-opacity-20 bg-accent flex items-center justify-center mr-3">
                        <i className='bx bx-up-arrow text-accent'></i>
                      </div>
                      <div>
                        <p className="text-sm">Reached level {user.level}</p>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-opacity-20 bg-primary flex items-center justify-center mr-3">
                        <i className='bx bx-coin text-primary'></i>
                      </div>
                      <div>
                        <p className="text-sm">Earned 100 coins from games</p>
                        <span className="text-xs text-muted-foreground">3 days ago</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
        
        {activeTab === 'badges' && (
          <section className="mb-6">
            <div className="bg-card rounded-xl shadow-md p-4">
              <h2 className="font-rajdhani font-bold text-lg mb-4">Earned Badges</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3">
                  <div className="w-16 h-16 rounded-full bg-opacity-20 bg-primary flex items-center justify-center mb-2">
                    <i className='bx bx-trophy text-primary text-3xl'></i>
                  </div>
                  <span className="text-sm font-medium text-center">First Win</span>
                </div>
                
                <div className="flex flex-col items-center p-3">
                  <div className="w-16 h-16 rounded-full bg-opacity-20 bg-accent flex items-center justify-center mb-2">
                    <i className='bx bx-calendar-check text-accent text-3xl'></i>
                  </div>
                  <span className="text-sm font-medium text-center">Daily Streak</span>
                </div>
                
                <div className="flex flex-col items-center p-3">
                  <div className="w-16 h-16 rounded-full bg-opacity-20 bg-green-500 flex items-center justify-center mb-2">
                    <i className='bx bx-user-plus text-green-500 text-3xl'></i>
                  </div>
                  <span className="text-sm font-medium text-center">Recruiter</span>
                </div>
                
                <div className="flex flex-col items-center p-3 opacity-40">
                  <div className="w-16 h-16 rounded-full bg-opacity-20 bg-blue-500 flex items-center justify-center mb-2">
                    <i className='bx bx-rocket text-blue-500 text-3xl'></i>
                  </div>
                  <span className="text-sm font-medium text-center">High Roller</span>
                </div>
                
                <div className="flex flex-col items-center p-3 opacity-40">
                  <div className="w-16 h-16 rounded-full bg-opacity-20 bg-yellow-500 flex items-center justify-center mb-2">
                    <i className='bx bx-crown text-yellow-500 text-3xl'></i>
                  </div>
                  <span className="text-sm font-medium text-center">Alpha Wolf</span>
                </div>
                
                <div className="flex flex-col items-center p-3 opacity-40">
                  <div className="w-16 h-16 rounded-full bg-opacity-20 bg-purple-500 flex items-center justify-center mb-2">
                    <i className='bx bx-diamond text-purple-500 text-3xl'></i>
                  </div>
                  <span className="text-sm font-medium text-center">Premium</span>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {activeTab === 'stats' && (
          <section className="mb-6">
            <div className="bg-card rounded-xl shadow-md p-4">
              <h2 className="font-rajdhani font-bold text-lg mb-4">Game Statistics</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Games Played</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <Progress value={24} max={100} className="h-2 bg-background" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Games Won</span>
                    <span className="text-sm font-medium">14</span>
                  </div>
                  <Progress value={58} max={100} className="h-2 bg-background" indicatorClassName="bg-green-500" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Win Rate</span>
                    <span className="text-sm font-medium">58%</span>
                  </div>
                  <Progress value={58} max={100} className="h-2 bg-background" indicatorClassName="bg-accent" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Tasks Completed</span>
                    <span className="text-sm font-medium">{completedTaskCount}/{totalTaskCount}</span>
                  </div>
                  <Progress 
                    value={taskCompletionPercentage} 
                    max={100} 
                    className="h-2 bg-background" 
                    indicatorClassName="bg-primary" 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Level Progress</span>
                    <span className="text-sm font-medium">{xpProgress}%</span>
                  </div>
                  <Progress 
                    value={xpProgress} 
                    max={100} 
                    className="h-2 bg-background" 
                    indicatorClassName="bg-gradient-to-r from-primary to-accent" 
                  />
                </div>
              </div>
            </div>
          </section>
        )}
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

export default ProfilePage;
