import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Award, Lock, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

// Map of rarity to color scheme
const rarityColors = {
  common: "bg-gray-100 border-gray-200 text-gray-700",
  uncommon: "bg-green-50 border-green-200 text-green-700",
  rare: "bg-blue-50 border-blue-200 text-blue-700",
  epic: "bg-purple-50 border-purple-200 text-purple-700",
  legendary: "bg-amber-50 border-amber-200 text-amber-700",
  mythic: "bg-gradient-to-br from-pink-50 to-indigo-50 border-pink-200 text-pink-700"
};

// Badge icon component that shows the appropriate icon based on badge type and colors
const BadgeIcon = ({ icon, iconColor, earned }) => {
  // Default component is Award if none specified
  const IconComponent = icon === 'star' ? Star : 
                        icon === 'check' ? CheckCircle : 
                        icon === 'gift' ? Gift : 
                        Award;
  
  return (
    <div className={cn(
      "w-16 h-16 rounded-full flex items-center justify-center mb-2", 
      earned ? "bg-gradient-to-br from-yellow-50 to-amber-100" : "bg-gray-100",
      earned ? "text-amber-500" : "text-gray-400"
    )}>
      <IconComponent 
        size={32} 
        className={earned ? iconColor || "text-amber-500" : "text-gray-400"} 
        strokeWidth={earned ? 2 : 1.5}
      />
    </div>
  );
};

const BadgeItem = ({ 
  badge,
  earned = false,
  progress = 0,
  rewardClaimed = false,
  featured = false,
  onClick,
  onFeature,
  onClaim
}) => {
  // Calculate progress percentage
  const progressPercent = progress ? Math.min(Math.round((progress / badge.requirement) * 100), 100) : 0;
  
  // Determine if it's claimable (earned but reward not claimed)
  const isClaimable = earned && !rewardClaimed && (badge.xpReward > 0 || badge.coinReward > 0);
  
  // Determine badge color scheme based on rarity
  const colorClass = rarityColors[badge.rarity?.toLowerCase()] || rarityColors.common;
  
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 border cursor-pointer hover:shadow-md",
        earned ? colorClass : "bg-gray-50 border-gray-200 text-gray-500",
        featured && "ring-2 ring-yellow-400 shadow-lg"
      )}
      onClick={() => onClick && onClick(badge)}
    >
      {/* Locked overlay for unearned badges */}
      {!earned && progress < 5 && (
        <div className="absolute inset-0 bg-gray-200/40 backdrop-blur-[1px] flex items-center justify-center z-10">
          <Lock className="text-gray-500/70" size={24} />
        </div>
      )}
      
      {/* Featured indicator */}
      {featured && (
        <div className="absolute top-2 right-2 text-yellow-500">
          <Star size={16} fill="currentColor" />
        </div>
      )}
      
      <CardHeader className="p-3 pb-1 flex flex-col items-center text-center">
        <BadgeIcon icon={badge.icon} iconColor={badge.iconColor} earned={earned} />
        <h3 className="font-semibold text-sm">{badge.name}</h3>
        <Badge variant="outline" className="mt-1 text-[10px]">
          {badge.rarity || 'Common'}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-3 pt-1 text-center">
        <p className="text-xs opacity-80 h-8 overflow-hidden">
          {badge.description}
        </p>
        
        <div className="mt-2">
          <div className="flex justify-between items-center text-xs mb-1">
            <span>{progress || 0}</span>
            <span>{badge.requirement}</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      </CardContent>
      
      {earned && (
        <CardFooter className="p-3 pt-0 flex flex-col gap-1">
          {isClaimable ? (
            <Button 
              size="sm" 
              variant="outline"
              className="w-full text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                onClaim && onClaim(badge.id);
              }}
            >
              <Gift className="h-3 w-3 mr-1" />
              Claim {badge.coinReward > 0 ? `${badge.coinReward} Coins` : `${badge.xpReward} XP`}
            </Button>
          ) : (
            rewardClaimed ? (
              <div className="text-xs text-center text-green-600 pb-1">
                <span className="flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Reward Claimed
                </span>
              </div>
            ) : null
          )}
          
          <Button 
            size="sm"
            variant={featured ? "secondary" : "ghost"}
            className="w-full text-xs h-7"
            onClick={(e) => {
              e.stopPropagation();
              onFeature && onFeature(badge.id, !featured);
            }}
          >
            <Star className={cn("h-3 w-3 mr-1", featured && "fill-current")} />
            {featured ? "Unfeature" : "Feature"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default BadgeItem;