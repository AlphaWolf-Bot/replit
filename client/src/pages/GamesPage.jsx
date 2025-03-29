import React from 'react';
import { useLocation } from 'wouter';
import BackButton from '@/components/BackButton';
import { showAlert } from '@/lib/telegram';

const GamesPage = () => {
  const [, setLocation] = useLocation();
  
  const games = [
    {
      id: 1,
      title: 'Wolf Race',
      description: 'Race against other wolves to win prizes',
      iconClass: 'bx-run',
      color: 'bg-primary',
      comingSoon: false
    },
    {
      id: 2,
      title: 'Pack Hunt',
      description: 'Team up to hunt bigger rewards',
      iconClass: 'bx-target-lock',
      color: 'bg-accent',
      comingSoon: false
    },
    {
      id: 3,
      title: 'Wolf Dice',
      description: 'Roll the dice and test your luck',
      iconClass: 'bx-dice-5',
      color: 'bg-green-500',
      comingSoon: false
    },
    {
      id: 4,
      title: 'Night Hunt',
      description: 'Hunt in the darkness for hidden treasures',
      iconClass: 'bx-moon',
      color: 'bg-blue-500',
      comingSoon: true
    }
  ];
  
  const handleGameClick = (game) => {
    if (game.comingSoon) {
      showAlert('This game is coming soon!');
    } else {
      showAlert(`Launching ${game.title}...`);
      // In a real implementation, this would launch the game
    }
  };
  
  const handleNavigation = (path) => {
    setLocation(path);
  };
  
  return (
    <div id="games-page" className="flex-1 flex flex-col">
      {/* Header with Back Button */}
      <header className="bg-card py-4 px-4 shadow-md">
        <div className="flex items-center justify-between">
          <BackButton title="Games" />
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-auto">
        {/* Games Section */}
        <section className="mb-6">
          <div className="grid grid-cols-1 gap-4">
            {games.map((game) => (
              <div 
                key={game.id}
                className="wolf-card bg-card rounded-xl shadow-md overflow-hidden"
                onClick={() => handleGameClick(game)}
              >
                <div className="flex items-center p-4">
                  <div className={`w-16 h-16 rounded-full ${game.color} bg-opacity-20 flex items-center justify-center mr-4`}>
                    <i className={`bx ${game.iconClass} ${game.color.replace('bg-', 'text-')} text-3xl`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-rajdhani font-bold text-lg">{game.title}</h3>
                      {game.comingSoon && (
                        <span className="text-xs bg-background text-muted-foreground px-2 py-1 rounded-full">Coming Soon</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{game.description}</p>
                    <button className={`mt-2 text-sm ${game.color.replace('bg-', 'text-')} font-medium flex items-center`}>
                      Play Now <i className='bx bx-right-arrow-alt ml-1'></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Daily Tournament */}
        <section className="mb-6">
          <h2 className="font-rajdhani font-bold text-lg mb-4">Today's Tournament</h2>
          
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-rajdhani font-bold text-white mb-1">ALPHA SHOWDOWN</h3>
                <p className="text-white text-sm mb-2">Win big in today's tournament</p>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">Prize: 1000 Coins</span>
                  <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">48 Players</span>
                </div>
                <button className="bg-white text-primary font-medium px-4 py-2 rounded-lg text-sm">
                  Join Tournament
                </button>
              </div>
              <div className="w-20 h-20 flex items-center justify-center">
                <i className='bx bx-trophy text-white text-5xl'></i>
              </div>
            </div>
          </div>
        </section>
        
        {/* Game Stats */}
        <section>
          <h2 className="font-rajdhani font-bold text-lg mb-4">Your Game Stats</h2>
          
          <div className="bg-card rounded-xl shadow-md p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-background rounded-lg p-3 text-center">
                <span className="block text-2xl font-bold text-primary mb-1">24</span>
                <span className="text-xs text-muted-foreground">Games Played</span>
              </div>
              
              <div className="bg-background rounded-lg p-3 text-center">
                <span className="block text-2xl font-bold text-primary mb-1">14</span>
                <span className="text-xs text-muted-foreground">Games Won</span>
              </div>
              
              <div className="bg-background rounded-lg p-3 text-center">
                <span className="block text-2xl font-bold text-primary mb-1">780</span>
                <span className="text-xs text-muted-foreground">Coins Won</span>
              </div>
              
              <div className="bg-background rounded-lg p-3 text-center">
                <span className="block text-2xl font-bold text-primary mb-1">58%</span>
                <span className="text-xs text-muted-foreground">Win Rate</span>
              </div>
            </div>
            
            <button className="w-full py-2 bg-background text-primary font-medium rounded-lg text-sm">
              View Detailed Stats
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
            className="nav-item active flex flex-col items-center"
            onClick={() => handleNavigation('/games')}
          >
            <i className='bx bx-joystick text-primary text-xl'></i>
            <span className="text-[10px] text-primary">Games</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default GamesPage;
