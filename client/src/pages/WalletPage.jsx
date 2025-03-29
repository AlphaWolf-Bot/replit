import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import BackButton from '@/components/BackButton';

const WalletPage = () => {
  const [, setLocation] = useLocation();
  
  // Get user data
  const { data: user } = useQuery({ 
    queryKey: ['/api/auth/me'],
  });
  
  // Get transaction history
  const { data: transactions } = useQuery({
    queryKey: ['/api/wallet/transactions'],
  });
  
  const handleNavigation = (path) => {
    setLocation(path);
  };
  
  // Format transactions with appropriate icons and colors
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return { icon: 'bx-plus-circle', color: 'text-green-500' };
      case 'withdraw':
        return { icon: 'bx-minus-circle', color: 'text-red-500' };
      case 'task_reward':
        return { icon: 'bx-check-circle', color: 'text-primary' };
      case 'referral_bonus':
        return { icon: 'bx-gift', color: 'text-accent' };
      default:
        return { icon: 'bx-coin', color: 'text-primary' };
    }
  };
  
  return (
    <div id="wallet-page" className="flex-1 flex flex-col">
      {/* Header with Back Button */}
      <header className="bg-card py-4 px-4 shadow-md">
        <div className="flex items-center justify-between">
          <BackButton title="Wallet" />
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-auto">
        {/* Balance Card */}
        <section className="mb-6">
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-md p-6">
            <h2 className="text-sm font-medium text-white opacity-80 mb-1">Total Balance</h2>
            <div className="flex items-center mb-4">
              <i className='bx bx-coin text-white text-2xl mr-2'></i>
              <span className="text-3xl font-bold text-white">{user?.coins || 0}</span>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 bg-white bg-opacity-20 text-white font-medium rounded-lg py-2 text-sm flex items-center justify-center">
                <i className='bx bx-plus-circle mr-1'></i> Deposit
              </button>
              <button className="flex-1 bg-white bg-opacity-20 text-white font-medium rounded-lg py-2 text-sm flex items-center justify-center">
                <i className='bx bx-minus-circle mr-1'></i> Withdraw
              </button>
            </div>
          </div>
        </section>
        
        {/* Transactions History */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-rajdhani font-bold text-lg">Transaction History</h2>
          </div>
          
          <div className="bg-card rounded-xl shadow-md p-4">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => {
                const { icon, color } = getTransactionIcon(tx.type);
                const isPositive = tx.amount > 0;
                
                return (
                  <div key={tx.id} className="border-b border-background py-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-opacity-20 ${color.replace('text-', 'bg-')} flex items-center justify-center`}>
                          <i className={`bx ${icon} ${color} text-xl`}></i>
                        </div>
                        <div>
                          <h3 className="font-medium">{tx.description}</h3>
                          <span className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{tx.amount}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center">
                <div className="flex justify-center mb-2">
                  <i className='bx bx-receipt text-muted-foreground text-3xl'></i>
                </div>
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            )}
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
            className="nav-item active flex flex-col items-center"
            onClick={() => handleNavigation('/wallet')}
          >
            <i className='bx bx-wallet text-primary text-xl'></i>
            <span className="text-[10px] text-primary">Wallet</span>
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

export default WalletPage;
