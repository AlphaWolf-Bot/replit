import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Medal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BadgeGrid from '@/components/badge/BadgeGrid';
import { apiRequest } from '@/lib/queryClient';

const BadgesPage = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Fetch user badges data
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/badges/user/my-badges'],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Feature badge mutation
  const featureBadgeMutation = useMutation({
    mutationFn: async ({ badgeId, featured }) => {
      return apiRequest('/api/badges/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId, featured })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/badges/user/my-badges'] });
      toast({
        title: 'Badge updated',
        description: 'Your featured badges have been updated.',
      });
    },
    onError: (error) => {
      console.error('Error featuring badge:', error);
      toast({
        title: 'Action failed',
        description: error?.message || 'Failed to update badge. Try again later.',
        variant: 'destructive',
      });
    }
  });
  
  // Claim badge reward mutation
  const claimBadgeRewardMutation = useMutation({
    mutationFn: async (badgeId) => {
      return apiRequest('/api/badges/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId })
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/badges/user/my-badges'] });
      // Also invalidate wallet data since coins may have changed
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      // Also invalidate user data since XP may have changed
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: 'Reward claimed!',
        description: `You received ${data.data.xpReward || 0} XP and ${data.data.coinReward || 0} coins.`,
      });
    },
    onError: (error) => {
      console.error('Error claiming reward:', error);
      toast({
        title: 'Action failed',
        description: error?.message || 'Failed to claim reward. Try again later.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle featuring a badge
  const handleFeatureBadge = (badgeId, featured) => {
    if (featured && data?.data?.featuredBadges?.length >= 3) {
      toast({
        title: 'Maximum featured badges',
        description: 'You can only feature up to 3 badges. Unfeature one first.',
        variant: 'destructive',
      });
      return;
    }
    
    featureBadgeMutation.mutate({ badgeId, featured });
  };
  
  // Handle claiming a badge reward
  const handleClaimReward = (badgeId) => {
    claimBadgeRewardMutation.mutate(badgeId);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Loading your badges...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading badges</AlertTitle>
        <AlertDescription>
          {error?.message || 'There was a problem loading your badges. Try again later.'}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Extract data
  const { badges = [], groupedBadges = {}, earnedCount = 0, featuredBadges = [] } = data?.data || {};
  
  // Progress stats
  const totalBadges = badges.length;
  const progressPercent = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0;
  
  // Get badges for selected category
  const filteredBadges = selectedCategory === 'all' 
    ? badges
    : selectedCategory === 'earned'
      ? badges.filter(b => b.earned)
      : selectedCategory === 'featured'
        ? featuredBadges
        : groupedBadges[selectedCategory] || [];
  
  // Get all category options
  const categories = ['all', 'earned', 'featured', ...Object.keys(groupedBadges)];
  
  const handleNavigation = (path) => {
    setLocation(path);
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center">
          <Medal className="mr-2 text-yellow-500" />
          Achievement Badges
        </h1>
        
        <div className="w-full max-w-sm mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{earnedCount} / {totalBadges} badges earned</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4 mt-2">
          {featuredBadges.map(badge => (
            <Badge 
              key={badge.badgeId} 
              variant="outline" 
              className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
            >
              {badge.name}
            </Badge>
          ))}
          {featuredBadges.length === 0 && (
            <Badge variant="outline" className="text-gray-400">
              No featured badges yet
            </Badge>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <TabsList className="flex overflow-x-auto pb-2 mb-4">
          {categories.map(category => (
            <TabsTrigger
              key={category}
              value={category}
              className="capitalize"
            >
              {category}
              {category === 'earned' && earnedCount > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {earnedCount}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={selectedCategory} className="mt-0">
          <BadgeGrid
            badges={filteredBadges}
            onFeatureBadge={handleFeatureBadge}
            onClaimReward={handleClaimReward}
          />
        </TabsContent>
      </Tabs>
      
      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card px-2 py-3 shadow-lg z-50">
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
            onClick={() => handleNavigation('/games')}
          >
            <i className='bx bx-joystick text-xl'></i>
            <span className="text-[10px]">Games</span>
          </div>
          
          <div 
            className="nav-item active flex flex-col items-center"
            onClick={() => handleNavigation('/badges')}
          >
            <i className='bx bx-medal text-primary text-xl'></i>
            <span className="text-[10px] text-primary">Badges</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default BadgesPage;