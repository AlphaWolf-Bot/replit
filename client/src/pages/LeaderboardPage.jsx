import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import LeaderboardTable from '@/components/Leaderboard/LeaderboardTable';
import UserRankCard from '@/components/Leaderboard/UserRankCard';
import { tgWebApp, showBackButton, hideBackButton } from '@/lib/telegram';

// Confetti animation effects for top positions
const ConfettiEffect = () => {
  const colors = ['#FFC700', '#FF0000', '#2E3191', '#41D3BD', '#FB8B24'];
  const pieces = Array.from({ length: 50 }, (_, i) => i);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => {
        const x = Math.random() * 100;
        const y = -20 - Math.random() * 80;
        const size = 5 + Math.random() * 15;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = 3 + Math.random() * 5;
        const rotation = Math.random() * 360;

        return (
          <motion.div
            key={piece}
            style={{
              position: 'absolute',
              left: `${x}vw`,
              top: `${y}vh`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              borderRadius: '2px',
              transformOrigin: 'center center',
              rotate: rotation,
            }}
            animate={{
              y: ['0vh', '120vh'],
              rotate: [rotation, rotation + 360],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: duration,
              ease: 'linear',
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        );
      })}
    </div>
  );
};

const LeaderboardPage = () => {
  // Handle Telegram back button
  useEffect(() => {
    // Show back button on mount
    showBackButton(() => {
      window.history.back();
    });
    
    // Hide back button on unmount
    return () => {
      hideBackButton();
    };
  }, []);
  
  return (
    <motion.div 
      className="container py-6 mx-auto px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ConfettiEffect />
      
      <motion.h1 
        className="text-3xl font-bold mb-6 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Alpha Wolf Leaderboard
      </motion.h1>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <UserRankCard className="mb-6" />
      </motion.div>
      
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <LeaderboardTable />
      </motion.div>
    </motion.div>
  );
};

export default LeaderboardPage;