import React from 'react';
import BadgeItem from './BadgeItem';
import { cn } from '@/lib/utils';

const BadgeGrid = ({ 
  badges = [], 
  onBadgeClick,
  onFeatureBadge,
  onClaimReward,
  className
}) => {
  if (!badges || badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500">No badges available yet.</p>
        <p className="text-sm text-gray-400 mt-1">Complete achievements to earn badges!</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", className)}>
      {badges.map((badge) => (
        <BadgeItem
          key={badge.badgeId || badge.id}
          badge={{
            id: badge.badgeId || badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            iconColor: badge.iconColor,
            requirement: badge.requirement,
            rarity: badge.rarity,
            xpReward: badge.xpReward,
            coinReward: badge.coinReward
          }}
          progress={badge.progress || 0}
          earned={badge.earned || false}
          rewardClaimed={badge.rewardClaimed || false}
          featured={badge.featured || false}
          onClick={() => onBadgeClick && onBadgeClick(badge)}
          onFeature={onFeatureBadge}
          onClaim={onClaimReward}
        />
      ))}
    </div>
  );
};

export default BadgeGrid;