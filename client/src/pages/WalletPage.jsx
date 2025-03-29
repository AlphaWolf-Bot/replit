import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import BackButton from '@/components/BackButton';
import { showAlert } from '@/lib/telegram';

const WalletPage = () => {
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentInfo, setPaymentInfo] = useState('');
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  
  // Get user data
  const { data: user } = useQuery({ 
    queryKey: ['/api/auth/me'],
  });
  
  // Get transaction history
  const { data: transactions } = useQuery({
    queryKey: ['/api/wallet/transactions'],
  });
  
  // Create withdraw request mutation
  const withdraw = useMutation({
    mutationFn: async (data) => {
      return apiRequest('POST', '/api/wallet/withdraw', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      setPaymentInfo('');
      setShowWithdrawForm(false);
      showAlert('Withdrawal request submitted successfully! It will be processed within 24-48 hours.');
    },
    onError: (error) => {
      showAlert(`Withdrawal failed: ${error.message}`);
    }
  });
  
  const handleWithdrawSubmit = () => {
    if (!paymentInfo) {
      showAlert('Please enter your payment information');
      return;
    }
    
    if ((user?.coins || 0) < 1000) {
      showAlert('You need at least 1000 coins to withdraw');
      return;
    }
    
    withdraw.mutate({
      amount: 1000, // Fixed amount of 1000 coins = 10 INR
      paymentMethod,
      paymentInfo
    });
  };
  
  const handleNavigation = (path) => {
    setLocation(path);
  };
  
  // Format transactions with appropriate icons and colors
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'tap_reward':
        return { icon: 'bx-coin', color: 'text-yellow-500' };
      case 'withdraw':
        return { icon: 'bx-minus-circle', color: 'text-red-500' };
      case 'task_reward':
        return { icon: 'bx-check-circle', color: 'text-primary' };
      case 'referral_bonus':
        return { icon: 'bx-gift', color: 'text-accent' };
      case 'social_reward':
        return { icon: 'bx-share-alt', color: 'text-blue-500' };
      case 'game_reward':
        return { icon: 'bx-joystick', color: 'text-green-500' };
      default:
        return { icon: 'bx-coin', color: 'text-primary' };
    }
  };
  
  // Get transaction status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="text-xs bg-yellow-500 bg-opacity-20 text-yellow-500 px-2 py-1 rounded-full">Pending</span>;
      case 'completed':
        return <span className="text-xs bg-green-500 bg-opacity-20 text-green-500 px-2 py-1 rounded-full">Completed</span>;
      case 'rejected':
        return <span className="text-xs bg-red-500 bg-opacity-20 text-red-500 px-2 py-1 rounded-full">Rejected</span>;
      default:
        return null;
    }
  };
  
  // Format INR amount
  const getINRAmount = (coins) => {
    return (coins / 100).toFixed(2); // 1000 coins = 10 INR
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
            <div className="flex items-center mb-2">
              <i className='bx bx-coin text-white text-2xl mr-2'></i>
              <span className="text-3xl font-bold text-white">{user?.coins || 0}</span>
            </div>
            <div className="mb-4">
              <span className="text-sm text-white opacity-80">≈ ₹{getINRAmount(user?.coins || 0)} INR</span>
            </div>
            
            <button 
              onClick={() => setShowWithdrawForm(true)}
              disabled={(user?.coins || 0) < 1000 || withdraw.isPending}
              className={`w-full bg-white ${(user?.coins || 0) < 1000 ? 'bg-opacity-10 cursor-not-allowed' : 'bg-opacity-20 hover:bg-opacity-30'} text-white font-medium rounded-lg py-2 text-sm flex items-center justify-center transition-all`}
            >
              {withdraw.isPending ? (
                <>
                  <i className='bx bx-loader-alt animate-spin mr-1'></i> Processing...
                </>
              ) : (
                <>
                  <i className='bx bx-money-withdraw mr-1'></i> Withdraw (Min. 1000 Coins = ₹10)
                </>
              )}
            </button>
            
            {(user?.coins || 0) < 1000 && (
              <div className="text-xs text-white text-center mt-2">
                You need {1000 - (user?.coins || 0)} more coins to withdraw
              </div>
            )}
          </div>
        </section>
        
        {/* Withdraw Form */}
        {showWithdrawForm && (
          <section className="mb-6">
            <div className="bg-card rounded-xl shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-rajdhani font-bold text-lg">Withdraw Funds</h2>
                <button 
                  onClick={() => setShowWithdrawForm(false)}
                  className="text-muted-foreground"
                >
                  <i className='bx bx-x text-xl'></i>
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Amount</h3>
                <div className="bg-background p-3 rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <i className='bx bx-coin text-primary mr-2'></i>
                    <span className="font-medium">1000 Coins</span>
                  </div>
                  <span className="text-muted-foreground">= ₹10 INR</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Payment Method</h3>
                <div className="flex gap-2">
                  <button 
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${paymentMethod === 'upi' ? 'bg-primary text-white' : 'bg-background text-muted-foreground'}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    UPI
                  </button>
                  <button 
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${paymentMethod === 'paytm' ? 'bg-primary text-white' : 'bg-background text-muted-foreground'}`}
                    onClick={() => setPaymentMethod('paytm')}
                  >
                    Paytm
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">
                  {paymentMethod === 'upi' ? 'UPI ID' : 'Paytm Number'}
                </h3>
                <input 
                  type="text" 
                  className="w-full bg-background rounded-lg p-3 border-none focus:ring-1 focus:ring-primary"
                  placeholder={paymentMethod === 'upi' ? 'Enter your UPI ID' : 'Enter your Paytm number'}
                  value={paymentInfo}
                  onChange={(e) => setPaymentInfo(e.target.value)}
                />
              </div>
              
              <button 
                className="w-full py-3 bg-primary rounded-lg font-medium text-white"
                onClick={handleWithdrawSubmit}
                disabled={withdraw.isPending}
              >
                {withdraw.isPending ? (
                  <>
                    <i className='bx bx-loader-alt animate-spin mr-1'></i> Processing...
                  </>
                ) : (
                  'Confirm Withdrawal'
                )}
              </button>
            </div>
          </section>
        )}
        
        {/* Transactions History */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-rajdhani font-bold text-lg">Transaction History</h2>
          </div>
          
          <div className="bg-card rounded-xl shadow-md p-4">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => {
                const { icon, color } = getTransactionIcon(tx.type);
                const isPositive = tx.amount > 0 && tx.type !== 'withdraw';
                
                return (
                  <div key={tx.id} className="border-b border-background py-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-opacity-20 ${color.replace('text-', 'bg-')} flex items-center justify-center`}>
                          <i className={`bx ${icon} ${color} text-xl`}></i>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{tx.description}</h3>
                            {tx.type === 'withdraw' && tx.status && getStatusBadge(tx.status)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : '-'}{Math.abs(tx.amount)}
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
