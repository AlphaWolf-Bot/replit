import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const UserRankCard = ({ className = '' }) => {
  // Fetch current user data
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Fetch user's leaderboard position
  const { data: rankData, isLoading: isRankLoading } = useQuery({
    queryKey: ['/api/leaderboard/rank'],
  });

  const isLoading = isUserLoading || isRankLoading;
  const rank = rankData?.rank || '–';
  const totalUsers = rankData?.totalUsers || 0;
  
  // Calculate percentage in top players
  const rankPercentage = totalUsers > 0 ? 
    Math.max(0, Math.min(100, 100 - ((rank / totalUsers) * 100))) : 0;
  
  // Format rank with appropriate suffix (1st, 2nd, 3rd, etc.)
  const formatRank = (rank) => {
    if (rank === '–') return rank;
    
    if (rank % 100 >= 11 && rank % 100 <= 13) {
      return `${rank}th`;
    }
    
    switch (rank % 10) {
      case 1: return `${rank}st`;
      case 2: return `${rank}nd`;
      case 3: return `${rank}rd`;
      default: return `${rank}th`;
    }
  };

  return (
    <div className={`bg-card shadow-lg rounded-xl overflow-hidden ${className}`}>
      <div className="bg-primary/10 p-4 border-b border-primary/20">
        <h2 className="text-lg font-bold">Your Ranking</h2>
      </div>
      
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-primary">
              {user?.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt={user.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xl font-bold">
                    {user?.username?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-lg">{user?.username || 'Anonymous Wolf'}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Level {user?.level || 1}</span>
                <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                <span className="text-sm text-muted-foreground">{user?.wolfRank || 'Wolf Pup'}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-background rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Global Rank</div>
              <div className="text-2xl font-bold text-primary flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {formatRank(rank)}
                </motion.div>
                {rank <= 3 && (
                  <motion.div 
                    className="ml-2"
                    initial={{ rotate: -10, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                  >
                    <i className={`bx bx-${rank === 1 ? 'crown' : 'medal'} text-yellow-500`}></i>
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="bg-background rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Total Coins</div>
              <div className="text-2xl font-bold text-primary flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {user?.coins?.toLocaleString() || 0}
                </motion.div>
                <i className="bx bx-coin text-primary text-lg ml-1"></i>
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-muted-foreground">Top {rankPercentage.toFixed(1)}%</span>
              <span className="text-xs text-primary">{formatRank(rank)} of {totalUsers}</span>
            </div>
            <Progress value={rankPercentage} className="h-2" />
          </div>
          
          <div className="flex justify-center mt-4">
            <motion.button
              className="text-xs text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="bx bx-crown mr-1"></i>
              Climb the Ranks
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRankCard;