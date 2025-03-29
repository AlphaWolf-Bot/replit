import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import BackButton from '@/components/BackButton';
import { showAlert } from '@/lib/telegram';

const FriendsPage = () => {
  const [, setLocation] = useLocation();
  const [referralCode, setReferralCode] = useState('');
  
  // Get referral stats
  const { data: referralStats } = useQuery({
    queryKey: ['/api/referrals/stats'],
  });
  
  // Apply referral code mutation
  const applyReferral = useMutation({
    mutationFn: async (code) => {
      return apiRequest('POST', '/api/referrals/apply', { referralCode: code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/stats'] });
      showAlert('Referral code applied successfully!');
      setReferralCode('');
    },
    onError: (error) => {
      showAlert(`Failed to apply referral code: ${error.message}`);
    }
  });
  
  const handleApplyReferral = (e) => {
    e.preventDefault();
    if (referralCode.trim()) {
      applyReferral.mutate(referralCode);
    } else {
      showAlert('Please enter a referral code');
    }
  };
  
  const handleNavigation = (path) => {
    setLocation(path);
  };
  
  // Copy my referral code to clipboard
  const handleCopyMyCode = () => {
    if (navigator.clipboard && referralStats?.myReferralCode) {
      navigator.clipboard.writeText(referralStats.myReferralCode);
      showAlert('Your referral code copied to clipboard!');
    }
  };
  
  return (
    <div id="friends-page" className="flex-1 flex flex-col">
      {/* Header with Back Button */}
      <header className="bg-card py-4 px-4 shadow-md">
        <div className="flex items-center justify-between">
          <BackButton title="Friends & Referrals" />
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-auto">
        {/* Referral Stats */}
        <section className="mb-6">
          <div className="bg-card rounded-xl shadow-md p-4">
            <h2 className="font-rajdhani font-bold text-lg mb-4">Your Pack Stats</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-background rounded-lg p-3 text-center">
                <span className="block text-2xl font-bold text-primary mb-1">{referralStats?.referralsCount || 0}</span>
                <span className="text-xs text-muted-foreground">Pack Members</span>
              </div>
              
              <div className="bg-background rounded-lg p-3 text-center">
                <span className="block text-2xl font-bold text-primary mb-1">{referralStats?.totalEarnings || 0}</span>
                <span className="text-xs text-muted-foreground">Pack Earnings</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-background rounded-lg p-3 mb-4">
              <span className="text-sm">Your Referral Code:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-primary">{referralStats?.myReferralCode || 'WOLF42'}</span>
                <button 
                  className="text-primary"
                  onClick={handleCopyMyCode}
                >
                  <i className='bx bx-copy'></i>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleApplyReferral} className="mb-4">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Enter friend's referral code"
                  className="flex-1 bg-background text-foreground border-0 rounded-l-lg p-2 focus:ring-1 focus:ring-primary"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-primary text-white font-medium px-4 py-2 rounded-r-lg"
                  disabled={applyReferral.isPending}
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </section>
        
        {/* Friend Leaderboard */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-rajdhani font-bold text-lg">Pack Leaderboard</h2>
          </div>
          
          <div className="bg-card rounded-xl shadow-md p-4">
            {referralStats?.referrals && referralStats.referrals.length > 0 ? (
              referralStats.referrals.map((friend, index) => (
                <div 
                  key={friend.id}
                  className={`flex items-center justify-between py-3 ${
                    index < referralStats.referrals.length - 1 ? 'border-b border-background' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img 
                        src={friend.photoUrl || `https://ui-avatars.com/api/?name=${friend.firstName}&background=FF6B2C&color=fff`} 
                        alt={friend.username} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{friend.username}</h3>
                      <span className="text-xs text-primary">Level {friend.level}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined {new Date(friend.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center">
                <div className="flex justify-center mb-2">
                  <i className='bx bx-group text-muted-foreground text-3xl'></i>
                </div>
                <p className="text-muted-foreground mb-2">No pack members yet</p>
                <button 
                  className="text-primary text-sm font-medium"
                  onClick={() => handleNavigation('/earn')}
                >
                  Invite Friends
                </button>
              </div>
            )}
          </div>
        </section>
        
        {/* Global Leaderboard */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-rajdhani font-bold text-lg">Global Wolves</h2>
          </div>
          
          <div className="bg-card rounded-xl shadow-md p-4">
            {/* This would be populated from a global leaderboard API */}
            <div className="flex items-center justify-between py-3 border-b border-background">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-xs font-medium">1</span>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=Alpha+Leader&background=FF6B2C&color=fff" alt="Alpha Leader" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">AlphaLeader</h3>
                  <span className="text-xs text-primary">Level 42</span>
                </div>
              </div>
              <div className="flex items-center text-sm font-medium">
                <i className='bx bx-coin text-primary mr-1'></i>
                <span>12,450</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-background">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-gray-400 bg-opacity-20 flex items-center justify-center text-xs font-medium">2</span>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=Wolf+Master&background=734BFF&color=fff" alt="Wolf Master" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">WolfMaster</h3>
                  <span className="text-xs text-primary">Level 36</span>
                </div>
              </div>
              <div className="flex items-center text-sm font-medium">
                <i className='bx bx-coin text-primary mr-1'></i>
                <span>9,876</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-yellow-600 bg-opacity-20 flex items-center justify-center text-xs font-medium">3</span>
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=Pack+Runner&background=10B981&color=fff" alt="Pack Runner" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">PackRunner</h3>
                  <span className="text-xs text-primary">Level 31</span>
                </div>
              </div>
              <div className="flex items-center text-sm font-medium">
                <i className='bx bx-coin text-primary mr-1'></i>
                <span>8,721</span>
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
            className="nav-item active flex flex-col items-center"
            onClick={() => handleNavigation('/friends')}
          >
            <i className='bx bx-group text-primary text-xl'></i>
            <span className="text-[10px] text-primary">Friends</span>
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

export default FriendsPage;
