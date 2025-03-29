import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import ProfileIcon from '@/components/ProfileIcon';
import SettingsIcon from '@/components/SettingsIcon';

const MainPage = () => {
  const [, setLocation] = useLocation();
  
  // Get user data
  const { data: user } = useQuery({ 
    queryKey: ['/api/auth/me'],
  });
  
  // Get tasks data
  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
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
              onClick={() => handleNavigation('/friends')}
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
