import React from 'react';
import { showConfirm } from '@/lib/telegram';

const LandingPage = () => {
  const handlePlayClick = () => {
    showConfirm('This will open the AlphaWolf Telegram Bot. Continue?', (isConfirmed) => {
      if (isConfirmed) {
        // Open Telegram bot
        window.open('https://t.me/alphawolf_bot', '_blank');
      }
    });
  };
  
  return (
    <div id="landing-page" className="min-h-screen flex flex-col justify-center items-center p-4 relative">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-accent opacity-5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-primary opacity-5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="z-10 max-w-md mx-auto w-full">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-primary opacity-20 rounded-full animate-pulse-slow"></div>
            <img 
              src="https://ui-avatars.com/api/?name=Alpha+Wolf&background=FF6B2C&color=fff&size=150&bold=true" 
              alt="Alpha Wolf Logo" 
              className="w-full h-full object-cover rounded-full border-2 border-primary" 
            />
          </div>
          <h1 className="text-4xl font-bold font-rajdhani text-white mb-2">ALPHAWOLF</h1>
          <div className="w-24 h-1 bg-primary rounded-full mb-6"></div>
          <p className="text-muted-foreground text-center mb-8 max-w-sm">Join the pack and rise through the ranks in the ultimate Telegram gaming experience. Earn rewards, challenge friends, and become the Alpha.</p>
        </div>
        
        <div className="bg-card rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="font-rajdhani font-bold text-xl mb-4">What is AlphaWolf?</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <i className='bx bx-check-circle text-primary text-xl mr-2'></i>
              <span className="text-sm">Compete in challenges to earn rewards</span>
            </li>
            <li className="flex items-start">
              <i className='bx bx-check-circle text-primary text-xl mr-2'></i>
              <span className="text-sm">Rise through 100 levels of wolf hierarchy</span>
            </li>
            <li className="flex items-start">
              <i className='bx bx-check-circle text-primary text-xl mr-2'></i>
              <span className="text-sm">Invite friends and build your pack</span>
            </li>
            <li className="flex items-start">
              <i className='bx bx-check-circle text-primary text-xl mr-2'></i>
              <span className="text-sm">Earn crypto rewards and exclusive badges</span>
            </li>
          </ul>
        </div>
        
        <button 
          onClick={handlePlayClick}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent rounded-xl font-bold text-white shadow-lg hover:shadow-xl animate-glow transition-all flex items-center justify-center space-x-2"
        >
          <i className='bx bxl-telegram text-2xl'></i>
          <span>PLAY NOW</span>
        </button>
        
        <p className="text-muted-foreground text-center text-sm mt-4">Connect with Telegram to start playing</p>
      </div>
    </div>
  );
};

export default LandingPage;
