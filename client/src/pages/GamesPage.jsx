import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import BackButton from '@/components/BackButton';
import { showAlert } from '@/lib/telegram';

// Wolf Dice Game Component
const WolfDiceGame = ({ onClose, onWin }) => {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [reward, setReward] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [rollsLeft, setRollsLeft] = useState(3);
  
  const rollDice = () => {
    if (rollsLeft <= 0 || gameOver) return;
    
    setRolling(true);
    setRollsLeft(rollsLeft - 1);
    
    // Animate dice roll
    const rollInterval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
    }, 100);
    
    // Stop animation after 1 second
    setTimeout(() => {
      clearInterval(rollInterval);
      const newDice1 = Math.floor(Math.random() * 6) + 1;
      const newDice2 = Math.floor(Math.random() * 6) + 1;
      setDice1(newDice1);
      setDice2(newDice2);
      setRolling(false);
      
      // Calculate reward
      const total = newDice1 + newDice2;
      let newReward = 0;
      
      if (newDice1 === newDice2) { // Doubles
        newReward = newDice1 * 10;
      } else if (total > 7) {
        newReward = 5;
      } else if (total === 7) {
        newReward = 10;
      } else {
        newReward = 0;
      }
      
      setReward(reward + newReward);
      
      // Check if game is over
      if (rollsLeft - 1 <= 0) {
        setGameOver(true);
        if (reward + newReward > 0) {
          setTimeout(() => {
            onWin(reward + newReward);
          }, 1000);
        }
      }
    }, 1000);
  };
  
  const getDiceIcon = (value) => {
    switch(value) {
      case 1: return 'bx-dice-1';
      case 2: return 'bx-dice-2';
      case 3: return 'bx-dice-3';
      case 4: return 'bx-dice-4';
      case 5: return 'bx-dice-5';
      case 6: return 'bx-dice-6';
      default: return 'bx-dice-1';
    }
  };
  
  return (
    <div className="wolf-dice-game bg-card rounded-xl shadow-md p-6 relative">
      <button 
        className="absolute top-3 right-3 text-muted-foreground"
        onClick={onClose}
      >
        <i className='bx bx-x text-xl'></i>
      </button>
      
      <h2 className="font-rajdhani font-bold text-xl text-center mb-4">Wolf Dice</h2>
      
      <div className="dice-container flex justify-center space-x-4 mb-6">
        <div className={`dice-box w-20 h-20 rounded-lg bg-background flex items-center justify-center ${rolling ? 'animate-spin-slow' : ''}`}>
          <i className={`bx ${getDiceIcon(dice1)} text-primary text-5xl`}></i>
        </div>
        <div className={`dice-box w-20 h-20 rounded-lg bg-background flex items-center justify-center ${rolling ? 'animate-spin-slow' : ''}`}>
          <i className={`bx ${getDiceIcon(dice2)} text-primary text-5xl`}></i>
        </div>
      </div>
      
      <div className="dice-info text-center mb-4">
        <div className="mb-2">
          <span className="text-sm text-muted-foreground">Rolls Left: </span>
          <span className="font-medium">{rollsLeft}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Current Reward: </span>
          <span className="font-medium text-primary">{reward} coins</span>
        </div>
      </div>
      
      <div className="dice-rules text-xs text-muted-foreground mb-4 bg-background p-3 rounded-lg">
        <p className="mb-1">• Doubles = Die value × 10 coins</p>
        <p className="mb-1">• Sum of 7 = 10 coins</p>
        <p className="mb-1">• Sum greater than 7 = 5 coins</p>
      </div>
      
      <button 
        className={`w-full py-3 ${gameOver ? 'bg-background text-muted-foreground' : 'bg-primary text-white'} rounded-lg font-medium`}
        onClick={rollDice}
        disabled={rolling || gameOver || rollsLeft <= 0}
      >
        {rolling ? 'Rolling...' : gameOver ? 'Game Over' : 'Roll Dice'}
      </button>
    </div>
  );
};

// Wolf Race Game Component
const WolfRaceGame = ({ onClose, onWin }) => {
  const [position, setPosition] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [obstacles, setObstacles] = useState([25, 50, 75]);
  const [gameOver, setGameOver] = useState(false);
  const [reward, setReward] = useState(0);
  const trackLength = 100;
  
  const startRace = () => {
    if (isRunning || gameOver) return;
    
    setIsRunning(true);
    const raceInterval = setInterval(() => {
      setPosition(prev => {
        const step = Math.floor(Math.random() * 5) + 1;
        const newPosition = prev + step;
        
        // Check if wolf hit an obstacle
        if (obstacles.includes(newPosition)) {
          clearInterval(raceInterval);
          setIsRunning(false);
          setGameOver(true);
          const earned = Math.floor(newPosition / 2);
          setReward(earned);
          setTimeout(() => {
            onWin(earned);
          }, 1000);
          return newPosition;
        }
        
        // Check if wolf reached the finish line
        if (newPosition >= trackLength) {
          clearInterval(raceInterval);
          setIsRunning(false);
          setGameOver(true);
          setReward(50);
          setTimeout(() => {
            onWin(50);
          }, 1000);
          return trackLength;
        }
        
        return newPosition;
      });
    }, 300);
  };
  
  return (
    <div className="wolf-race-game bg-card rounded-xl shadow-md p-6 relative">
      <button 
        className="absolute top-3 right-3 text-muted-foreground"
        onClick={onClose}
      >
        <i className='bx bx-x text-xl'></i>
      </button>
      
      <h2 className="font-rajdhani font-bold text-xl text-center mb-4">Wolf Race</h2>
      
      <div className="race-track bg-background h-10 rounded-lg mb-4 relative overflow-hidden">
        {/* Obstacles */}
        {obstacles.map((pos, index) => (
          <div 
            key={index} 
            className="absolute top-0 h-full w-1 bg-red-500"
            style={{ left: `${pos}%` }}
          ></div>
        ))}
        
        {/* Wolf */}
        <div 
          className="absolute top-0 left-0 h-full flex items-center transition-all duration-300"
          style={{ left: `${position}%` }}
        >
          <i className='bx bx-run text-primary text-2xl'></i>
        </div>
        
        {/* Finish line */}
        <div className="absolute top-0 right-0 h-full border-r-2 border-dashed border-green-500"></div>
      </div>
      
      <div className="race-info text-center mb-4">
        <div className="mb-2">
          <span className="text-sm text-muted-foreground">Progress: </span>
          <span className="font-medium">{position}%</span>
        </div>
        {gameOver && (
          <div>
            <span className="text-sm text-muted-foreground">Reward: </span>
            <span className="font-medium text-primary">{reward} coins</span>
          </div>
        )}
      </div>
      
      <div className="race-rules text-xs text-muted-foreground mb-4 bg-background p-3 rounded-lg">
        <p className="mb-1">• Reach the finish line to win 50 coins</p>
        <p className="mb-1">• Hitting an obstacle ends the race</p>
        <p className="mb-1">• Earn coins based on distance (1 coin per 2%)</p>
      </div>
      
      <button 
        className={`w-full py-3 ${gameOver || isRunning ? 'bg-background text-muted-foreground' : 'bg-primary text-white'} rounded-lg font-medium`}
        onClick={startRace}
        disabled={isRunning || gameOver}
      >
        {isRunning ? 'Racing...' : gameOver ? 'Game Over' : 'Start Race'}
      </button>
    </div>
  );
};

const GamesPage = () => {
  const [, setLocation] = useLocation();
  const [activeGame, setActiveGame] = useState(null);
  const [showAd, setShowAd] = useState(false);
  
  // Get user data
  const { data: user } = useQuery({ 
    queryKey: ['/api/auth/me'],
  });
  
  // Get games
  const { data: games } = useQuery({
    queryKey: ['/api/games'],
  });
  
  // Game reward mutation
  const claimGameReward = useMutation({
    mutationFn: async (data) => {
      return apiRequest('POST', '/api/games/reward', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      showAlert('Game reward claimed successfully!');
    },
    onError: (error) => {
      showAlert(`Failed to claim reward: ${error.message}`);
    }
  });
  
  // Default games list
  const defaultGames = games || [
    {
      id: 1,
      title: 'Wolf Race',
      description: 'Race against obstacles to the finish line',
      type: 'casual',
      icon: 'bx-run',
      iconColor: 'bg-primary',
      minReward: 0,
      maxReward: 50,
      xpReward: 10,
      comingSoon: false
    },
    {
      id: 2,
      title: 'Wolf Dice',
      description: 'Roll the dice and win rewards',
      type: 'casual',
      icon: 'bx-dice-5',
      iconColor: 'bg-green-500',
      minReward: 0,
      maxReward: 60,
      xpReward: 5,
      comingSoon: false
    },
    {
      id: 3,
      title: 'Pack Hunt',
      description: 'Team up with others to hunt bigger rewards',
      type: 'multiplayer',
      icon: 'bx-target-lock',
      iconColor: 'bg-accent',
      minReward: 20,
      maxReward: 100,
      xpReward: 20,
      comingSoon: false
    },
    {
      id: 4,
      title: 'Night Hunt',
      description: 'Hunt in the darkness for hidden treasures',
      type: 'casual',
      icon: 'bx-moon',
      iconColor: 'bg-blue-500',
      minReward: 0,
      maxReward: 80,
      xpReward: 15,
      comingSoon: true
    }
  ];
  
  const handleGameClick = (game) => {
    if (game.comingSoon) {
      showAlert('This game will be available soon!');
      return;
    }
    
    // Show random ad before starting game (30% chance)
    if (Math.random() < 0.3) {
      setShowAd(true);
      setTimeout(() => {
        setShowAd(false);
        setActiveGame(game);
      }, 3000);
    } else {
      setActiveGame(game);
    }
  };
  
  const handleGameWin = (reward) => {
    claimGameReward.mutate({
      gameId: activeGame.id,
      reward,
    });
  };
  
  const handleNavigation = (path) => {
    setLocation(path);
  };
  
  // Game statistics (would come from API in a real app)
  const gameStats = {
    gamesPlayed: 24,
    gamesWon: 14,
    coinsWon: 780,
    winRate: '58%'
  };
  
  return (
    <div id="games-page" className="flex-1 flex flex-col">
      {/* Header with Back Button */}
      <header className="bg-card py-4 px-4 shadow-md">
        <div className="flex items-center justify-between">
          <BackButton title="Games" />
          
          <div className="flex items-center space-x-1">
            <i className='bx bx-coin text-primary'></i>
            <span className="font-medium">{user?.coins || 0}</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-auto">
        {/* Game Ad Popup */}
        {showAd && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl p-6 w-full max-w-sm relative">
              <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                Ad closes in a few seconds
              </div>
              
              <div className="text-center mb-4">
                <div className="bg-background inline-block p-4 rounded-full mb-2">
                  <i className='bx bx-store text-primary text-4xl'></i>
                </div>
                <h3 className="font-bold text-lg mb-1">Wolf Shop</h3>
                <p className="text-sm text-muted-foreground mb-2">Get exclusive wolf skins and items!</p>
              </div>
              
              <div className="bg-primary bg-opacity-10 p-3 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Premium Wolf Skin</span>
                  <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">50% OFF</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Limited time offer. Available soon!
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="animate-pulse">
                  <i className='bx bx-dots-horizontal-rounded text-muted-foreground text-2xl'></i>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Active Game */}
        {activeGame && (
          <div className="mb-6">
            {activeGame.title === 'Wolf Dice' && (
              <WolfDiceGame 
                onClose={() => setActiveGame(null)} 
                onWin={handleGameWin}
              />
            )}
            
            {activeGame.title === 'Wolf Race' && (
              <WolfRaceGame 
                onClose={() => setActiveGame(null)} 
                onWin={handleGameWin}
              />
            )}
            
            {activeGame.title === 'Pack Hunt' && (
              <div className="bg-card rounded-xl shadow-md p-6 relative">
                <button 
                  className="absolute top-3 right-3 text-muted-foreground"
                  onClick={() => setActiveGame(null)}
                >
                  <i className='bx bx-x text-xl'></i>
                </button>
                
                <h2 className="font-rajdhani font-bold text-xl text-center mb-4">Pack Hunt</h2>
                <div className="text-center mb-4">
                  <div className="bg-background inline-block p-4 rounded-full mb-2">
                    <i className='bx bx-group text-accent text-4xl'></i>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Looking for other players to join your pack...
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <div className="animate-pulse">
                    <i className='bx bx-dots-horizontal-rounded text-muted-foreground text-2xl'></i>
                  </div>
                </div>
                
                <button 
                  className="w-full py-3 bg-background text-primary font-medium rounded-lg text-sm mt-4"
                  onClick={() => setActiveGame(null)}
                >
                  Cancel Matchmaking
                </button>
              </div>
            )}
          </div>
        )}
        
        {!activeGame && (
          <>
            {/* Games Section */}
            <section className="mb-6">
              <div className="grid grid-cols-1 gap-4">
                {defaultGames.map((game) => (
                  <div 
                    key={game.id}
                    className="wolf-card bg-card rounded-xl shadow-md overflow-hidden"
                    onClick={() => handleGameClick(game)}
                  >
                    <div className="flex items-center p-4">
                      <div className={`w-16 h-16 rounded-full ${game.iconColor} bg-opacity-20 flex items-center justify-center mr-4`}>
                        <i className={`bx ${game.icon} ${game.iconColor.replace('bg-', 'text-')} text-3xl`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-rajdhani font-bold text-lg">{game.title}</h3>
                          {game.comingSoon ? (
                            <span className="text-xs bg-background text-muted-foreground px-2 py-1 rounded-full">Coming Soon</span>
                          ) : (
                            <span className="text-xs bg-green-500 bg-opacity-20 text-green-500 px-2 py-1 rounded-full">
                              {game.maxReward} <i className='bx bx-coin text-xs'></i>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{game.description}</p>
                        <button className={`mt-2 text-sm ${game.iconColor.replace('bg-', 'text-')} font-medium flex items-center`}>
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
                    <span className="block text-2xl font-bold text-primary mb-1">{gameStats.gamesPlayed}</span>
                    <span className="text-xs text-muted-foreground">Games Played</span>
                  </div>
                  
                  <div className="bg-background rounded-lg p-3 text-center">
                    <span className="block text-2xl font-bold text-primary mb-1">{gameStats.gamesWon}</span>
                    <span className="text-xs text-muted-foreground">Games Won</span>
                  </div>
                  
                  <div className="bg-background rounded-lg p-3 text-center">
                    <span className="block text-2xl font-bold text-primary mb-1">{gameStats.coinsWon}</span>
                    <span className="text-xs text-muted-foreground">Coins Won</span>
                  </div>
                  
                  <div className="bg-background rounded-lg p-3 text-center">
                    <span className="block text-2xl font-bold text-primary mb-1">{gameStats.winRate}</span>
                    <span className="text-xs text-muted-foreground">Win Rate</span>
                  </div>
                </div>
                
                <button className="w-full py-2 bg-background text-primary font-medium rounded-lg text-sm">
                  View Detailed Stats
                </button>
              </div>
            </section>
          </>
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
