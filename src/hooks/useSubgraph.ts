import { useQuery } from '@apollo/client';
import { useAccount } from 'wagmi';
import { 
  GET_PROTOCOL_STATS, 
  GET_STAKING_STATS, 
  GET_POOL_STATS, 
  GET_FARM_STATS, 
  GET_USER_ACTIVITY,
  GET_RECENT_ACTIVITY,
  GET_DAILY_EMISSIONS,
  GET_MASONRY_EPOCHS
} from '../lib/subgraphQueries';
import { formatEther } from 'ethers/lib/utils';

// Utility function to format BigInt values
const formatBigInt = (value: string | number): number => {
  try {
    return parseFloat(formatEther(value.toString()));
  } catch {
    return 0;
  }
};

// Hook for protocol statistics
export const useProtocolStats = () => {
  const { data, loading, error } = useQuery(GET_PROTOCOL_STATS, {
    pollInterval: 30000, // Poll every 30 seconds
    errorPolicy: 'all', // Don't fail on partial errors
  });

  if (loading || !data) {
    return {
      loading,
      error,
      stats: {
        totalBondsPurchased: 0,
        totalBondsRedeemed: 0,
        totalSeigniorage: 0,
        totalStaked: 0,
        totalRewardsClaimed: 0,
        lastSeigniorage: 0,
        recentBondPurchases: [],
        recentBondRedemptions: [],
        recentSeigniorage: [],
      }
    };
  }

  const { protocolStats_collection, boughtBonds_collection, redeemedBonds_collection, treasuryFundeds, masonryFundeds } = data;

  // Get the first (and should be only) protocol stats entity
  const protocolStats = protocolStats_collection?.[0];

  // Use aggregate stats if available, otherwise calculate from events
  const totalBondsPurchased = protocolStats?.totalBondsPurchased 
    ? formatBigInt(protocolStats.totalBondsPurchased)
    : boughtBonds_collection?.reduce((sum: number, bond: any) => 
        sum + formatBigInt(bond.SCTAmount), 0) || 0;
  
  const totalBondsRedeemed = protocolStats?.totalBondsRedeemed
    ? formatBigInt(protocolStats.totalBondsRedeemed)
    : redeemedBonds_collection?.reduce((sum: number, bond: any) => 
        sum + formatBigInt(bond.SCTAmount), 0) || 0;
  
  const totalSeigniorage = protocolStats?.totalSeigniorage
    ? formatBigInt(protocolStats.totalSeigniorage)
    : [...(treasuryFundeds || []), ...(masonryFundeds || [])]
        .reduce((sum: number, event: any) => sum + formatBigInt(event.seigniorage), 0);

  const totalStaked = protocolStats?.totalStaked
    ? formatBigInt(protocolStats.totalStaked)
    : 0;

  const totalRewardsClaimed = protocolStats?.totalRewardsClaimed
    ? formatBigInt(protocolStats.totalRewardsClaimed)
    : 0;

  const lastSeigniorage = protocolStats?.lastSeigniorage
    ? formatBigInt(protocolStats.lastSeigniorage)
    : 0;

  // Get recent activity (last 24 hours)
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 86400;

  const recentBondPurchases = boughtBonds_collection?.filter((bond: any) => 
    parseInt(bond.blockTimestamp) > oneDayAgo) || [];
  
  const recentBondRedemptions = redeemedBonds_collection?.filter((bond: any) => 
    parseInt(bond.blockTimestamp) > oneDayAgo) || [];
  
  const recentSeigniorage = [...(treasuryFundeds || []), ...(masonryFundeds || [])]
    .filter((event: any) => parseInt(event.blockTimestamp) > oneDayAgo);

  return {
    loading,
    error,
    stats: {
      totalBondsPurchased,
      totalBondsRedeemed,
      totalSeigniorage,
      totalStaked,
      totalRewardsClaimed,
      lastSeigniorage,
      recentBondPurchases,
      recentBondRedemptions,
      recentSeigniorage,
    }
  };
};

// Hook for staking statistics
export const useStakingStats = () => {
  const { data, loading, error } = useQuery(GET_STAKING_STATS, {
    pollInterval: 30000,
    errorPolicy: 'all', // Don't fail on partial errors
  });

  if (loading || !data) {
    return {
      loading,
      error,
      stats: {
        totalStaked: 0,
        totalUnstaked: 0,
        totalRewards: 0,
        recentStakes: [],
        recentUnstakes: [],
        recentRewards: [],
      }
    };
  }

  const { masonryStats_collection, stakes, unstakes, claims } = data;

  // Get the first (and should be only) masonry stats entity
  const masonryStats = masonryStats_collection?.[0];

  // Use aggregate stats if available, otherwise calculate from events
  const totalStaked = masonryStats?.totalStaked
    ? formatBigInt(masonryStats.totalStaked)
    : stakes?.reduce((sum: number, stake: any) => 
        sum + formatBigInt(stake.amount), 0) || 0;
  
  const totalUnstaked = unstakes?.reduce((sum: number, unstake: any) => 
    sum + formatBigInt(unstake.amount), 0) || 0;
  
  const totalRewards = claims?.reduce((sum: number, claim: any) => 
    sum + formatBigInt(claim.amount), 0) || 0;

  // Get recent activity
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 86400;

  const recentStakes = stakes?.filter((stake: any) => 
    parseInt(stake.timestamp) > oneDayAgo) || [];
  
  const recentUnstakes = unstakes?.filter((unstake: any) => 
    parseInt(unstake.timestamp) > oneDayAgo) || [];
  
  const recentRewards = claims?.filter((claim: any) => 
    parseInt(claim.timestamp) > oneDayAgo) || [];

  return {
    loading,
    error,
    stats: {
      totalStaked,
      totalUnstaked,
      totalRewards,
      recentStakes,
      recentUnstakes,
      recentRewards,
    }
  };
};

// Hook for pool statistics
export const usePoolStats = () => {
  const { data, loading, error } = useQuery(GET_POOL_STATS, {
    pollInterval: 30000,
    errorPolicy: 'all', // Don't fail on partial errors
  });

  if (loading || !data) {
    return {
      loading,
      error,
      stats: {
        poolStats: [],
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalRewards: 0,
        poolActivity: {},
        recentActivity: [],
      }
    };
  }

  const { poolStats_collection, poolDeposits, poolWithdraws, poolRewards } = data;

  // Calculate totals
  const totalDeposits = poolDeposits?.reduce((sum: number, deposit: any) => 
    sum + formatBigInt(deposit.amount), 0) || 0;
  
  const totalWithdrawals = poolWithdraws?.reduce((sum: number, withdrawal: any) => 
    sum + formatBigInt(withdrawal.amount), 0) || 0;
  
  const totalRewards = poolRewards?.reduce((sum: number, reward: any) => 
    sum + formatBigInt(reward.amount), 0) || 0;

  // Group by pool ID
  const poolActivity: Record<string, any> = {};
  
  poolDeposits?.forEach((deposit: any) => {
    const pid = deposit.pid.toString();
    if (!poolActivity[pid]) poolActivity[pid] = { deposits: 0, withdrawals: 0, rewards: 0 };
    poolActivity[pid].deposits += formatBigInt(deposit.amount);
  });

  poolWithdraws?.forEach((withdrawal: any) => {
    const pid = withdrawal.pid.toString();
    if (!poolActivity[pid]) poolActivity[pid] = { deposits: 0, withdrawals: 0, rewards: 0 };
    poolActivity[pid].withdrawals += formatBigInt(withdrawal.amount);
  });

  poolRewards?.forEach((reward: any) => {
    const pid = reward.pid?.toString() || 'unknown';
    if (!poolActivity[pid]) poolActivity[pid] = { deposits: 0, withdrawals: 0, rewards: 0 };
    poolActivity[pid].rewards += formatBigInt(reward.amount);
  });

  // Get recent activity
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 86400;

  const recentActivity = [
    ...(poolDeposits?.filter((deposit: any) => parseInt(deposit.timestamp) > oneDayAgo) || []),
    ...(poolWithdraws?.filter((withdrawal: any) => parseInt(withdrawal.timestamp) > oneDayAgo) || []),
    ...(poolRewards?.filter((reward: any) => parseInt(reward.timestamp) > oneDayAgo) || [])
  ].sort((a: any, b: any) => parseInt(b.timestamp) - parseInt(a.timestamp));

  return {
    loading,
    error,
    stats: {
      poolStats: poolStats_collection || [],
      totalDeposits,
      totalWithdrawals,
      totalRewards,
      poolActivity,
      recentActivity,
    }
  };
};

// Hook for farm statistics
export const useFarmStats = () => {
  const { data, loading, error } = useQuery(GET_FARM_STATS, {
    pollInterval: 30000,
    errorPolicy: 'all', // Don't fail on partial errors
  });

  if (loading || !data) {
    return {
      loading,
      error,
      stats: {
        farmStats: [],
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalRewards: 0,
        farmActivity: {},
        recentActivity: [],
      }
    };
  }

  const { farmStats_collection, farmDeposits, farmWithdraws, farmRewards } = data;

  // Calculate totals
  const totalDeposits = farmDeposits?.reduce((sum: number, deposit: any) => 
    sum + formatBigInt(deposit.amount), 0) || 0;
  
  const totalWithdrawals = farmWithdraws?.reduce((sum: number, withdrawal: any) => 
    sum + formatBigInt(withdrawal.amount), 0) || 0;
  
  const totalRewards = farmRewards?.reduce((sum: number, reward: any) => 
    sum + formatBigInt(reward.amount), 0) || 0;

  // Group by farm ID
  const farmActivity: Record<string, any> = {};
  
  farmDeposits?.forEach((deposit: any) => {
    const pid = deposit.pid.toString();
    if (!farmActivity[pid]) farmActivity[pid] = { deposits: 0, withdrawals: 0, rewards: 0 };
    farmActivity[pid].deposits += formatBigInt(deposit.amount);
  });

  farmWithdraws?.forEach((withdrawal: any) => {
    const pid = withdrawal.pid.toString();
    if (!farmActivity[pid]) farmActivity[pid] = { deposits: 0, withdrawals: 0, rewards: 0 };
    farmActivity[pid].withdrawals += formatBigInt(withdrawal.amount);
  });

  farmRewards?.forEach((reward: any) => {
    const pid = reward.pid?.toString() || 'unknown';
    if (!farmActivity[pid]) farmActivity[pid] = { deposits: 0, withdrawals: 0, rewards: 0 };
    farmActivity[pid].rewards += formatBigInt(reward.amount);
  });

  // Get recent activity
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 86400;

  const recentActivity = [
    ...(farmDeposits?.filter((deposit: any) => parseInt(deposit.timestamp) > oneDayAgo) || []),
    ...(farmWithdraws?.filter((withdrawal: any) => parseInt(withdrawal.timestamp) > oneDayAgo) || []),
    ...(farmRewards?.filter((reward: any) => parseInt(reward.timestamp) > oneDayAgo) || [])
  ].sort((a: any, b: any) => parseInt(b.timestamp) - parseInt(a.timestamp));

  return {
    loading,
    error,
    stats: {
      farmStats: farmStats_collection || [],
      totalDeposits,
      totalWithdrawals,
      totalRewards,
      farmActivity,
      recentActivity,
    }
  };
};

// Hook for user activity
export const useUserActivity = () => {
  const { address } = useAccount();
  const { data, loading, error } = useQuery(GET_USER_ACTIVITY, {
    variables: { userAddress: address?.toLowerCase() || '' },
    skip: !address,
    pollInterval: 30000,
    errorPolicy: 'all', // Don't fail on partial errors
  });

  if (error) {
    console.error('Error fetching user activity:', error);
  }

  if (loading || !data || !address) {
    return {
      loading,
      error,
      userActivity: {
        bondPurchases: [],
        bondRedemptions: [],
        stakes: [],
        unstakes: [],
        claims: [],
        poolDeposits: [],
        poolWithdraws: [],
        farmDeposits: [],
        farmWithdraws: [],
      }
    };
  }

  const { 
    boughtBonds_collection, 
    redeemedBonds_collection, 
    stakes, 
    unstakes, 
    claims,
    poolDeposits,
    poolWithdraws,
    farmDeposits,
    farmWithdraws
  } = data;

  return {
    loading,
    error,
    userActivity: {
      bondPurchases: boughtBonds_collection || [],
      bondRedemptions: redeemedBonds_collection || [],
      stakes: stakes || [],
      unstakes: unstakes || [],
      claims: claims || [],
      poolDeposits: poolDeposits || [],
      poolWithdraws: poolWithdraws || [],
      farmDeposits: farmDeposits || [],
      farmWithdraws: farmWithdraws || [],
    }
  };
};

// Hook for recent activity across all protocols
export const useRecentActivity = () => {
  const { data, loading, error } = useQuery(GET_RECENT_ACTIVITY, {
    pollInterval: 15000, // Poll every 15 seconds for recent activity
    errorPolicy: 'all', // Don't fail on partial errors
  });

  if (loading || !data) {
    return {
      loading,
      error,
      recentActivity: [],
    };
  }

  const { boughtBonds_collection, redeemedBonds_collection, stakes, unstakes, poolDeposits, farmDeposits } = data;

  // Combine all recent activity and sort by timestamp
  const allActivity = [
    ...(boughtBonds_collection?.map((bond: any) => ({ ...bond, type: 'bond_purchase', timestamp: bond.blockTimestamp })) || []),
    ...(redeemedBonds_collection?.map((bond: any) => ({ ...bond, type: 'bond_redemption', timestamp: bond.blockTimestamp })) || []),
    ...(stakes?.map((stake: any) => ({ ...stake, type: 'stake', timestamp: stake.timestamp })) || []),
    ...(unstakes?.map((unstake: any) => ({ ...unstake, type: 'unstake', timestamp: unstake.timestamp })) || []),
    ...(poolDeposits?.map((deposit: any) => ({ ...deposit, type: 'pool_deposit', timestamp: deposit.timestamp })) || []),
    ...(farmDeposits?.map((deposit: any) => ({ ...deposit, type: 'farm_deposit', timestamp: deposit.timestamp })) || []),
  ].sort((a: any, b: any) => parseInt(b.timestamp) - parseInt(a.timestamp));

  return {
    loading,
    error,
    recentActivity: allActivity.slice(0, 20), // Return last 20 activities
  };
};

// Hook for daily emissions
export const useDailyEmissions = (days: number = 30) => {
  const { data, loading, error } = useQuery(GET_DAILY_EMISSIONS, {
    variables: { days },
    pollInterval: 300000, // Poll every 5 minutes
    errorPolicy: 'all', // Don't fail on partial errors
  });

  if (loading || !data) {
    return {
      loading,
      error,
      dailyEmissions: [],
    };
  }

  const { dailyEmissions } = data;

  return {
    loading,
    error,
    dailyEmissions: dailyEmissions?.map((emission: any) => ({
      ...emission,
      amount: formatBigInt(emission.amount),
      dayStart: parseInt(emission.dayStart),
    })) || [],
  };
};

// Hook for masonry epochs
export const useMasonryEpochs = (limit: number = 50) => {
  const { data, loading, error } = useQuery(GET_MASONRY_EPOCHS, {
    variables: { limit },
    pollInterval: 300000, // Poll every 5 minutes
    errorPolicy: 'all', // Don't fail on partial errors
  });

  if (loading || !data) {
    return {
      loading,
      error,
      masonryEpochs: [],
    };
  }

  const { masonryEpoches } = data;

  return {
    loading,
    error,
    masonryEpochs: masonryEpoches?.map((epoch: any) => ({
      ...epoch,
      seigniorage: formatBigInt(epoch.seigniorage),
      totalStaked: formatBigInt(epoch.totalStaked),
      timestamp: parseInt(epoch.timestamp),
    })) || [],
  };
};

// Simplified TVL Hooks for the new subgraph
import { 
  GET_SCT_POOL_TVLS, 
  GET_GSCT_POOL_TVLS, 
  GET_MASONRY_TVL, 
  GET_ALL_TVLS,
  GET_SCT_POOL_BY_PID,
  GET_GSCT_POOL_BY_PID
} from '../lib/subgraphQueries';

// Hook for SCT Pool TVLs
export const useSCTPoolTVLs = () => {
  const { data, loading, error } = useQuery(GET_SCT_POOL_TVLS, {
    pollInterval: 30000, // Poll every 30 seconds
    errorPolicy: 'all',
  });

  if (loading || !data) {
    return {
      loading,
      error,
      sctpoolTVLs: [],
    };
  }

  const { sctpoolTVLs } = data;

  return {
    loading,
    error,
    sctpoolTVLs: sctpoolTVLs?.map((pool: any) => ({
      ...pool,
      tvl: formatBigInt(pool.tvl),
      lastUpdated: parseInt(pool.lastUpdated),
    })) || [],
  };
};

// Hook for GSCT Pool TVLs
export const useGSCTPoolTVLs = () => {
  const { data, loading, error } = useQuery(GET_GSCT_POOL_TVLS, {
    pollInterval: 30000, // Poll every 30 seconds
    errorPolicy: 'all',
  });

  if (loading || !data) {
    return {
      loading,
      error,
      gsctpoolTVLs: [],
    };
  }

  const { gsctpoolTVLs } = data;

  return {
    loading,
    error,
    gsctpoolTVLs: gsctpoolTVLs?.map((pool: any) => ({
      ...pool,
      tvl: formatBigInt(pool.tvl),
      lastUpdated: parseInt(pool.lastUpdated),
    })) || [],
  };
};

// Hook for Masonry TVL
export const useMasonryTVL = () => {
  const { data, loading, error } = useQuery(GET_MASONRY_TVL, {
    pollInterval: 30000, // Poll every 30 seconds
    errorPolicy: 'all',
  });

  if (loading || !data) {
    return {
      loading,
      error,
      masonryTVL: null,
    };
  }

  const { masonryTVL } = data;

  return {
    loading,
    error,
    masonryTVL: masonryTVL ? {
      ...masonryTVL,
      tvl: formatBigInt(masonryTVL.tvl),
      lastUpdated: parseInt(masonryTVL.lastUpdated),
    } : null,
  };
};

// Hook for all TVLs
export const useAllTVLs = () => {
  const { data, loading, error } = useQuery(GET_ALL_TVLS, {
    pollInterval: 30000, // Poll every 30 seconds
    errorPolicy: 'all',
  });

  if (loading || !data) {
    return {
      loading,
      error,
      sctpoolTVLs: [],
      gsctpoolTVLs: [],
      masonryTVL: null,
    };
  }

  const { sctpoolTVLs, gsctpoolTVLs, masonryTVL } = data;

  return {
    loading,
    error,
    sctpoolTVLs: sctpoolTVLs?.map((pool: any) => ({
      ...pool,
      tvl: formatBigInt(pool.tvl),
      lastUpdated: parseInt(pool.lastUpdated),
    })) || [],
    gsctpoolTVLs: gsctpoolTVLs?.map((pool: any) => ({
      ...pool,
      tvl: formatBigInt(pool.tvl),
      lastUpdated: parseInt(pool.lastUpdated),
    })) || [],
    masonryTVL: masonryTVL ? {
      ...masonryTVL,
      tvl: formatBigInt(masonryTVL.tvl),
      lastUpdated: parseInt(masonryTVL.lastUpdated),
    } : null,
  };
};

// Hook for specific SCT Pool by PID
export const useSCTPoolByPid = (pid: number) => {
  const { data, loading, error } = useQuery(GET_SCT_POOL_BY_PID, {
    variables: { pid },
    pollInterval: 30000,
    errorPolicy: 'all',
  });

  if (loading || !data) {
    return {
      loading,
      error,
      pool: null,
    };
  }

  const { sctpoolTVLs } = data;

  const pool = sctpoolTVLs?.[0];

  return {
    loading,
    error,
    pool: pool ? {
      ...pool,
      tvl: formatBigInt(pool.tvl),
      lastUpdated: parseInt(pool.lastUpdated),
    } : null,
  };
};

// Hook for specific GSCT Pool by PID
export const useGSCTPoolByPid = (pid: number) => {
  const { data, loading, error } = useQuery(GET_GSCT_POOL_BY_PID, {
    variables: { pid },
    pollInterval: 30000,
    errorPolicy: 'all',
  });

  if (loading || !data) {
    return {
      loading,
      error,
      pool: null,
    };
  }

  const { gsctpoolTVLs } = data;
  const pool = gsctpoolTVLs?.[0];

  return {
    loading,
    error,
    pool: pool ? {
      ...pool,
      tvl: formatBigInt(pool.tvl),
      lastUpdated: parseInt(pool.lastUpdated),
    } : null,
  };
}; 