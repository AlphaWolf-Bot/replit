import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ProfileIcon from '@/components/ProfileIcon';
import SettingsIcon from '@/components/SettingsIcon';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const MainPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tapAnimation, setTapAnimation] = useState(false);
  const [coinImageUrl, setCoinImageUrl] = useState('/coin-default.svg');
  const [coinValue, setCoinValue] = useState(5);
  
  // Get user data
  const { data: user } = useQuery({ 
    queryKey: ['/api/auth/me'],
  });
  
  // Get tasks data
  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
  });
  
  // Get coin settings from the API
  const { data: coinSettings } = useQuery({
    queryKey: ['/api/coin/settings'],
    onSuccess: (data) => {
      if (data?.data) {
        setCoinImageUrl(data.data.imageUrl);
        setCoinValue(data.data.coinValue);
      }
    }
  });
  
  // Mutation for tapping the coin
  const tapCoinMutation = useMutation({
    mutationFn: () => apiRequest('/api/coin/tap', { method: 'POST' }),
    onSuccess: (data) => {
      if (data?.success && data?.data) {
        // Show toast notification
        toast({
          title: 'Coins Added!',
          description: `You earned ${data.data.coinValue} coins.`,
        });
        
        // Trigger the tap animation
        setTapAnimation(true);
        setTimeout(() => setTapAnimation(false), 500);
        
        // Refresh user data
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      } else {
        // Handle unexpected response format
        toast({
          title: 'Something went wrong',
          description: 'Could not process your reward. Try again later.',
          variant: 'destructive'
        });
      }
    },
    onError: (error) => {
      // Check if we hit the daily limit
      if (error?.message?.includes('daily tapping limit')) {
        toast({
          title: 'Daily Limit Reached',
          description: 'You have reached your daily tapping limit of 100 taps. Come back tomorrow!',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to tap the coin. Try again later.',
          variant: 'destructive'
        });
      }
    }
  });
  
  const dailyTasks = tasks?.filter(task => task.type === 'daily') || [];
  
  const completedTasks = dailyTasks.filter(task => task.isCompleted).length;
  const totalTasks = dailyTasks.length;
  
  // Calculate XP progress
  const currentXP = user?.xp || 0;
  const nextLevelXP = ((user?.level || 1) * 200) || 200;
  const xpProgress = Math.min(100, Math.floor((currentXP / nextLevelXP) * 100));
  
  const quickActions = [
    {
      title: 'Daily Bonus',
      description: 'Claim your free coins',
      icon: 'bx-coin',
      color: 'bg-primary',
      path: '/earn'
    },
    {
      title: 'Quick Game',
      description: 'Play and win rewards',
      icon: 'bx-game',
      color: 'bg-accent',
      path: '/games'
    },
    {
      title: 'Referral Rewards',
      description: 'Invite friends & earn',
      icon: 'bx-gift',
      color: 'bg-green-500',
      path: '/friends'
    },
    {
      title: 'Wolf Shop',
      description: 'Spend your coins',
      icon: 'bx-store',
      color: 'bg-blue-500',
      path: '/wallet'
    }
  ];
  
  const topPlayers = [
    {
      id: 1,
      rank: 1,
      username: 'AlphaLeader',
      level: 42,
      coins: 12450,
      photoUrl: 'https://ui-avatars.com/api/?name=Alpha+Leader&background=FF6B2C&color=fff'
    },
    {
      id: 2,
      rank: 2,
      username: 'WolfMaster',
      level: 36,
      coins: 9876,
      photoUrl: 'https://ui-avatars.com/api/?name=Wolf+Master&background=734BFF&color=fff'
    },
    {
      id: 3,
      rank: 3,
      username: 'PackRunner',
      level: 31,
      coins: 8721,
      photoUrl: 'https://ui-avatars.com/api/?name=Pack+Runner&background=10B981&color=fff'
    }
  ];
  
  const handleNavigation = (path) => {
    setLocation(path);
  };
  
  return (
    <div id="main-page" className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-card py-4 px-4 shadow-md">
        <div className="flex items-center justify-between">
          <ProfileIcon />
          <SettingsIcon />
        </div>
      </header>
      
      {/* Progress Bar Section */}
      <div className="bg-card px-6 pt-2 pb-6 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">
            Level {user?.level || 1} • {currentXP}/{nextLevelXP} XP
          </span>
          <span className="text-xs text-primary font-medium">{xpProgress}%</span>
        </div>
        <div className="wolf-progress-bar bg-background">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent rounded-lg"
            style={{ width: `${xpProgress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Content Area */}
      <main className="flex-1 p-4 overflow-auto">
        {/* Tap-to-Earn Wolf Coin (Centered without background) */}
        <section className="mb-6 mt-10 flex flex-col items-center">
          <div className="text-center mb-5">
            <h3 className="text-lg font-bold mb-1">Tap to Earn Coins</h3>
            <div className="flex items-center justify-center">
              <span className="text-xs text-muted-foreground mr-2">
                Today's taps: <span className="font-medium text-primary">{user?.dailyTapCount || 0}/100</span>
              </span>
              <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ width: `${(user?.dailyTapCount || 0) / 100 * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Center Wolf Coin */}
          <button 
            className={`tap-coin relative w-36 h-36 mb-4 transform transition-all duration-200 
                      ${tapAnimation ? 'scale-95' : 'hover:scale-105'} 
                      focus:outline-none`}
            onClick={() => {
              const currentCount = user?.dailyTapCount || 0;
              if (currentCount < 100 && !tapCoinMutation.isPending) {
                tapCoinMutation.mutate();
              }
            }}
            disabled={user?.dailyTapCount >= 100 || tapCoinMutation.isPending}
          >
            <div className="absolute inset-0 rounded-full animate-pulse-slow opacity-20"></div>
            <div className="wolf-coin absolute inset-0 flex items-center justify-center">
              {coinSettings?.data?.imageUrl ? (
                <img 
                  src={coinSettings.data.imageUrl} 
                  alt="Wolf Coin" 
                  className="w-full h-full object-contain" 
                />
              ) : (
                <svg width="140" height="140" viewBox="0 0 100 100" className="drop-shadow-lg">
                  <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                  <circle cx="50" cy="50" r="40" fill="#FFDF00" />
                  {/* Wolf silhouette */}
                  <path d="M35,30 C30,32 28,40 30,45 C31,47 28,50 30,52 C32,54 34,55 35,55 C36,55 38,54 40,52 C42,50 44,48 45,45 C46,42 47,40 50,40 C53,40 54,42 55,45 C56,48 58,50 60,52 C62,54 64,55 65,55 C66,55 68,54 70,52 C72,50 69,47 70,45 C72,40 70,32 65,30 C60,28 55,32 50,35 C45,32 40,28 35,30 Z" fill="#8B4513" />
                  <circle cx="40" cy="42" r="3" fill="#000" />
                  <circle cx="60" cy="42" r="3" fill="#000" />
                  <path d="M45,48 C46,50 48,52 50,52 C52,52 54,50 55,48" stroke="#000" strokeWidth="1.5" fill="none" />
                </svg>
              )}
            </div>
            
            {tapCoinMutation.isPending && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin-slow"></div>
              </div>
            )}
            
            {tapAnimation && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lg font-bold text-primary animate-bounce-soft">
                +{coinValue} <i className="bx bx-coin-stack"></i>
              </div>
            )}
          </button>
          
          <p className="text-sm text-center text-muted-foreground px-8">
            Tap the Wolf Coin to earn <span className="text-primary font-medium">{coinValue}</span> coins per tap! 
            <br />Limited to 100 taps per day.
          </p>
        </section>
        
        {/* Daily Tasks */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-rajdhani font-bold">Daily Tasks</h2>
            <span className="text-xs text-primary">{completedTasks}/{totalTasks} Completed</span>
          </div>
          
          {dailyTasks.slice(0, 2).map((task, index) => (
            <div key={task?.id || index} className="bg-card rounded-xl shadow-md p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full bg-opacity-20 ${task?.iconColor || 'bg-primary'} flex items-center justify-center`}>
                    <i className={`bx ${task?.icon || 'bx-check'} ${task?.iconColor || 'text-primary'} text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-medium">{task?.title || 'Complete task'}</h3>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(100, (task?.progress / task?.target) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {task?.progress || 0}/{task?.target || 1}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground text-sm">
                  <i className='bx bx-coin text-primary mr-1'></i> {task?.reward || 0}
                </div>
              </div>
            </div>
          ))}
        </section>
        
        {/* Quick Actions */}
        <section className="mb-6">
          <h2 className="text-lg font-rajdhani font-bold mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <div 
                key={index}
                className="wolf-card bg-card rounded-xl shadow-md p-4 flex flex-col items-center justify-center"
                onClick={() => handleNavigation(action.path)}
              >
                <div className={`w-12 h-12 rounded-full bg-opacity-20 ${action.color} flex items-center justify-center mb-2`}>
                  <i className={`bx ${action.icon} ${action.color.replace('bg-', 'text-')} text-2xl`}></i>
                </div>
                <h3 className="font-medium text-center">{action.title}</h3>
                <p className="text-xs text-muted-foreground text-center">{action.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Wolf Rank and Level */}
        <section className="mb-6">
          <div className="bg-card rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-rajdhani font-bold">Wolf Rank</h2>
              <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Level {user?.level || 1}</span>
            </div>
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                <i className='bx bx-crown text-primary text-2xl'></i>
              </div>
              <div>
                <h3 className="font-bold text-lg">{user?.wolfRank || 'Wolf Pup'}</h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Next rank at Level {Math.ceil((user?.level || 1) / 10) * 10}</span>
                </div>
              </div>
            </div>
            <div className="wolf-progress-bar bg-background h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Level {user?.level || 1}</span>
              <span>Level {(user?.level || 1) + 1}</span>
            </div>
          </div>
        </section>
        
        {/* Leaderboard Section */}
        <section>
          <h2 className="text-lg font-rajdhani font-bold mb-4">Top Wolves</h2>
          
          <div className="bg-card rounded-xl shadow-md p-4">
            {topPlayers.map((player, index) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between py-2 ${
                  index < topPlayers.length - 1 ? 'border-b border-background' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full ${
                    index === 0 ? 'bg-primary' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-yellow-600'
                  } bg-opacity-20 flex items-center justify-center text-xs font-medium`}>
                    {player.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src={player.photoUrl} alt={player.username} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{player.username}</h3>
                    <span className="text-xs text-primary">Level {player.level}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm font-medium">
                  <i className='bx bx-coin text-primary mr-1'></i>
                  <span>{player.coins.toLocaleString()}</span>
                </div>
              </div>
            ))}
            
            <button 
              className="mt-4 text-primary text-sm font-medium w-full text-center"
              onClick={() => handleNavigation('/leaderboard')}
            >
              View Full Leaderboard
            </button>
          </div>
        </section>
      </main>
      
      {/* Navigation Bar */}
      <nav className="bg-card px-2 py-3 shadow-lg">
        <div className="grid grid-cols-5 gap-1">
          <div 
            className="nav-item active flex flex-col items-center"
            onClick={() => handleNavigation('/')}
          >
            <i className='bx bx-home text-primary text-xl'></i>
            <span className="text-[10px] text-primary">Home</span>
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

export default MainPage;
