import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import BackButton from '@/components/BackButton';
import { showAlert } from '@/lib/telegram';

const EarnPage = () => {
  const [, setLocation] = useLocation();
  
  // Get user data
  const { data: user } = useQuery({ 
    queryKey: ['/api/auth/me'],
  });
  
  // Get tasks data
  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
  });
  
  // Get social media platforms
  const { data: socialMedia } = useQuery({
    queryKey: ['/api/social-media'],
  });
  
  // Get referral stats
  const { data: referralStats } = useQuery({
    queryKey: ['/api/referrals/stats'],
  });
  
  // Claim social media reward mutation
  const claimSocialReward = useMutation({
    mutationFn: async (socialMediaId) => {
      return apiRequest('POST', '/api/social-media/claim', { socialMediaId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social-media'] });
      showAlert('Social media reward claimed successfully!');
    },
    onError: (error) => {
      showAlert(`Failed to claim reward: ${error.message}`);
    }
  });
  
  // Mutation to claim task reward
  const claimReward = useMutation({
    mutationFn: async (taskId) => {
      return apiRequest('POST', '/api/tasks/claim', { taskId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      showAlert('Reward claimed successfully!');
    },
    onError: (error) => {
      showAlert(`Failed to claim reward: ${error.message}`);
    }
  });
  
  // Copy referral code to clipboard
  const handleCopyClick = () => {
    if (navigator.clipboard && user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      showAlert('Referral code copied to clipboard!');
    }
  };
  
  // Share referral link
  const handleShareClick = () => {
    if (user?.referralCode) {
      const shareUrl = `https://alphawolf.click?ref=${user.referralCode}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Join AlphaWolf Pack',
          text: 'Join my pack on AlphaWolf and get bonus rewards!',
          url: shareUrl
        }).catch(() => {
          // Fallback
          showAlert(`Share this link with friends: ${shareUrl}`);
        });
      } else {
        showAlert(`Share this link with friends: ${shareUrl}`);
      }
    }
  };
  
  // Hard-coded social media links (in a real app, these would come from the backend)
  const socialMediaLinks = socialMedia || [
    {
      id: 1,
      platform: 'Instagram',
      name: '@alphawolf_official',
      url: 'https://instagram.com/alphawolf_official',
      icon: 'bxl-instagram',
      iconColor: 'text-pink-500',
      reward: 100,
      isFollowed: false,
      rewardClaimed: false
    },
    {
      id: 2,
      platform: 'YouTube',
      name: 'AlphaWolf Gaming',
      url: 'https://youtube.com/alphawolfgaming',
      icon: 'bxl-youtube',
      iconColor: 'text-red-500',
      reward: 100,
      isFollowed: false,
      rewardClaimed: false
    },
    {
      id: 3,
      platform: 'Telegram',
      name: 'AlphaWolf Community',
      url: 'https://t.me/alphawolfcommunity',
      icon: 'bxl-telegram',
      iconColor: 'text-blue-500',
      reward: 100,
      isFollowed: false,
      rewardClaimed: false
    },
    {
      id: 4,
      platform: 'Twitter',
      name: '@alphawolf_app',
      url: 'https://twitter.com/alphawolf_app',
      icon: 'bxl-twitter',
      iconColor: 'text-blue-400',
      reward: 100,
      isFollowed: false,
      rewardClaimed: false
    }
  ];
  
  // Handle social media follow
  const handleSocialMediaFollow = (socialMedia) => {
    // Open the link in a new window
    window.open(socialMedia.url, '_blank');
    
    // Mark as followed (in a real app, this would need verification)
    setTimeout(() => {
      showAlert(`Have you followed us on ${socialMedia.platform}? Claim your reward!`);
    }, 3000);
  };
  
  const dailyTasks = tasks?.filter(task => task.type === 'daily') || [];
  
  const handleNavigation = (path) => {
    setLocation(path);
  };
  
  return (
    <div id="earn-page" className="flex-1 flex flex-col">
      {/* Header with Back Button */}
      <header className="bg-card py-4 px-4 shadow-md">
        <div className="flex items-center justify-between">
          <BackButton title="Earn Rewards" />
          
          <div className="flex items-center space-x-1">
            <i className='bx bx-coin text-primary'></i>
            <span className="font-medium">{user?.coins || 0}</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-auto">
        {/* Tasks Section */}
        <section className="mb-6">
          <div className="bg-card rounded-xl shadow-md p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-rajdhani font-bold text-lg">Daily Tasks</h2>
              <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Resets in 8h</span>
            </div>
            
            {/* Task List */}
            {dailyTasks.map((task) => (
              <div key={task.id} className="border-b border-background py-3 last:border-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full bg-opacity-20 ${task.iconColor} flex items-center justify-center`}>
                      <i className={`bx ${task.icon} ${task.iconColor} text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${task.isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(100, (task.progress / task.target) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {task.isCompleted ? 'Completed' : `${task.progress}/${task.target}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  {task.isCompleted && !task.claimedReward ? (
                    <button 
                      className="bg-background px-3 py-1 rounded-lg text-primary text-sm font-medium"
                      onClick={() => claimReward.mutate(task.id)}
                      disabled={claimReward.isPending}
                    >
                      +{task.reward} <i className='bx bx-coin text-primary ml-1'></i>
                    </button>
                  ) : task.isCompleted && task.claimedReward ? (
                    <button className="bg-green-500 bg-opacity-20 px-3 py-1 rounded-lg text-green-500 text-sm font-medium">
                      Claimed
                    </button>
                  ) : (
                    <button className="bg-background px-3 py-1 rounded-lg text-primary text-sm font-medium opacity-50">
                      +{task.reward} <i className='bx bx-coin text-primary ml-1'></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Social Media Section */}
        <section className="mb-6">
          <div className="bg-card rounded-xl shadow-md p-4">
            <h2 className="font-rajdhani font-bold text-lg mb-4">Social Media Rewards</h2>
            <p className="text-muted-foreground text-sm mb-4">Follow us on social media and earn 100 coins for each!</p>
            
            {socialMediaLinks.map((social) => (
              <div key={social.id} className="border-b border-background py-3 last:border-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full bg-opacity-20 ${social.iconColor.replace('text-', 'bg-')} flex items-center justify-center`}>
                      <i className={`bx ${social.icon} ${social.iconColor} text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium">{social.platform}</h3>
                      <span className="text-xs text-muted-foreground">{social.name}</span>
                    </div>
                  </div>
                  
                  {social.rewardClaimed ? (
                    <button className="bg-green-500 bg-opacity-20 px-3 py-1 rounded-lg text-green-500 text-sm font-medium">
                      Claimed
                    </button>
                  ) : social.isFollowed ? (
                    <button 
                      className="bg-background px-3 py-1 rounded-lg text-primary text-sm font-medium"
                      onClick={() => claimSocialReward.mutate(social.id)}
                      disabled={claimSocialReward.isPending}
                    >
                      +{social.reward} <i className='bx bx-coin text-primary ml-1'></i>
                    </button>
                  ) : (
                    <button 
                      className="bg-background px-3 py-1 rounded-lg text-primary text-sm font-medium"
                      onClick={() => handleSocialMediaFollow(social)}
                    >
                      Follow
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Referrals Section */}
        <section className="mb-6">
          <div className="bg-card rounded-xl shadow-md p-4">
            <h2 className="font-rajdhani font-bold text-lg mb-4">Invite Friends</h2>
            <p className="text-muted-foreground text-sm mb-4">Earn rewards when your friends join and play games!</p>
            
            <div className="bg-background rounded-lg p-3 mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{user?.referralCode || 'WOLF42'}</span>
              <button 
                className="text-primary text-sm font-medium"
                onClick={handleCopyClick}
              >
                <i className='bx bx-copy'></i> Copy
              </button>
            </div>
            
            <button 
              className="w-full py-3 bg-primary rounded-lg font-medium text-white flex items-center justify-center"
              onClick={handleShareClick}
            >
              <i className='bx bx-share-alt mr-2'></i> Share Referral Link
            </button>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-center">
                <span className="block text-2xl font-bold text-primary">{referralStats?.referralsCount || 0}</span>
                <span className="text-xs text-muted-foreground">Friends Invited</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-primary">{referralStats?.totalEarnings || 0}</span>
                <span className="text-xs text-muted-foreground">Coins Earned</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Daily Challenge Banner */}
        <section>
          <div className="bg-card rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-rajdhani font-bold mb-1">Daily Challenges</h3>
                <p className="text-muted-foreground text-sm mb-2">Complete daily tasks for bonus rewards</p>
                <button 
                  className="bg-background text-primary font-medium px-4 py-2 rounded-lg text-sm"
                  onClick={() => handleNavigation('/games')}
                >
                  View Challenges
                </button>
              </div>
              <div className="w-16 h-16 flex items-center justify-center">
                <i className='bx bx-calendar-check text-primary text-4xl'></i>
              </div>
            </div>
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
            className="nav-item active flex flex-col items-center"
            onClick={() => handleNavigation('/earn')}
          >
            <i className='bx bx-dollar-circle text-primary text-xl'></i>
            <span className="text-[10px] text-primary">Earn</span>
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

export default EarnPage;
