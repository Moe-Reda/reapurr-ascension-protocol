import React from 'react';
import { useUserActivity } from '../hooks/useSubgraph';
import { formatEther } from 'ethers/lib/utils';

const UserActivity = () => {
  const { userActivity, loading, error } = useUserActivity();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bond_purchase':
        return '🟢';
      case 'bond_redemption':
        return '🔴';
      case 'stake':
        return '📈';
      case 'unstake':
        return '📉';
      case 'reward':
        return '💰';
      default:
        return '⚡';
    }
  };

  const getActivityText = (activity: any, type: string) => {
    const amount = formatEther(activity.amount || activity.SCTAmount || activity.reward || '0');

    switch (type) {
      case 'bond_purchase':
        return `Bought ${parseFloat(amount).toFixed(2)} SCT bonds`;
      case 'bond_redemption':
        return `Redeemed ${parseFloat(amount).toFixed(2)} SCT bonds`;
      case 'stake':
        return `Staked ${parseFloat(amount).toFixed(2)} gSCT`;
      case 'unstake':
        return `Unstaked ${parseFloat(amount).toFixed(2)} gSCT`;
      case 'reward':
        return `Claimed ${parseFloat(amount).toFixed(2)} SCT rewards`;
      default:
        return `Performed an action`;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="glass p-6 mb-8">
        <h3 className="text-xl font-nav mb-4 text-green-400">Your Activity</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 bg-white/20 rounded"></div>
              <div className="flex-1">
                <div className="bg-white/20 h-4 w-32 rounded mb-1"></div>
                <div className="bg-white/20 h-3 w-16 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-6 mb-8">
        <h3 className="text-xl font-nav mb-4 text-green-400">Your Activity</h3>
        <div className="text-red-400 text-sm">
          Error loading your activity. Please try again later.
        </div>
      </div>
    );
  }

  // Combine all user activities and sort by timestamp
  const allActivities = [
    ...userActivity.bondPurchases.map((activity: any) => ({ ...activity, type: 'bond_purchase' })),
    ...userActivity.bondRedemptions.map((activity: any) => ({ ...activity, type: 'bond_redemption' })),
    ...userActivity.stakes.map((activity: any) => ({ ...activity, type: 'stake' })),
    ...userActivity.unstakes.map((activity: any) => ({ ...activity, type: 'unstake' })),
    ...userActivity.rewards.map((activity: any) => ({ ...activity, type: 'reward' })),
  ].sort((a: any, b: any) => parseInt(b.blockTimestamp) - parseInt(a.blockTimestamp));

  return (
    <div className="glass p-6 mb-8">
      <h3 className="text-xl font-nav mb-4 text-green-400">Your Activity</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {allActivities.length === 0 ? (
          <div className="text-center text-white/60 py-8">
            No activity found. Start interacting with the protocol!
          </div>
        ) : (
          allActivities.slice(0, 10).map((activity: any) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <div className="font-nav text-sm text-white">
                  {getActivityText(activity, activity.type)}
                </div>
                <div className="text-xs text-white/60">
                  {formatTime(activity.blockTimestamp)}
                </div>
              </div>
              <a
                href={`https://explorer.hyperliquid-testnet.xyz/tx/${activity.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                View
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserActivity; 