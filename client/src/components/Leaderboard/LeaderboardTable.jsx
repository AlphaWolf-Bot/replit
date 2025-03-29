import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const LeaderboardTable = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewData, setHasNewData] = useState(false);
  const [socket, setSocket] = useState(null);

  // Fetch initial leaderboard data
  const { data } = useQuery({
    queryKey: ['/api/leaderboard'],
    staleTime: 30000, // 30 seconds
  });

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'leaderboard') {
          setLeaderboard(data.data);
          setHasNewData(true);
          
          // Reset the animation flag after a delay
          setTimeout(() => {
            setHasNewData(false);
          }, 2000);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  // Initialize leaderboard data from API
  useEffect(() => {
    if (data) {
      setLeaderboard(data);
      setIsLoading(false);
    }
  }, [data]);

  // Determine medal color based on rank
  const getMedalColor = (rank) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500'; // Gold
      case 2:
        return 'text-gray-400'; // Silver
      case 3:
        return 'text-amber-700'; // Bronze
      default:
        return 'text-muted-foreground';
    }
  };

  // Get medal icon based on rank
  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return 'bx-crown';
      case 2:
        return 'bx-medal';
      case 3:
        return 'bx-medal';
      default:
        return '';
    }
  };

  // Format large numbers with k, m, etc.
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'm';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="bg-card shadow-lg rounded-xl overflow-hidden">
      <div className="p-4 bg-primary/10 border-b border-primary/20">
        <h2 className="text-xl font-bold">Global Leaderboard</h2>
        <p className="text-sm text-muted-foreground">Top wolves ranked by coins</p>
      </div>
      
      {isLoading ? (
        <div className="p-8 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden">
          {leaderboard.map((user, index) => (
            <AnimatePresence key={user.id}>
              <motion.div 
                className={`flex items-center p-4 ${hasNewData ? 'bg-primary/5' : ''}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(var(--primary), 0.05)' }}
              >
                <div className="flex items-center flex-1">
                  <div className="flex items-center justify-center w-8">
                    {index < 3 ? (
                      <i className={`bx ${getMedalIcon(index + 1)} text-xl ${getMedalColor(index + 1)}`}></i>
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                    {user.photoUrl ? (
                      <img 
                        src={user.photoUrl} 
                        alt={user.username} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary text-sm font-bold">
                          {user.username?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{user.username || 'Anonymous Wolf'}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="mr-2">Level {user.level}</span>
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]">
                        {user.wolfRank}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-sm font-semibold">
                  <i className="bx bx-coin text-primary mr-1"></i>
                  <span>{formatNumber(user.coins)}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;