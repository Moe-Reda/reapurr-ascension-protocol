import { useMemo, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { 
  useGSCTPoolUserInfo, 
  useGSCTPoolPendingShare, 
  useGSCTPoolInfo, 
  useTokenBalance,
  useGSCTPoolAPR 
} from './useContracts';
import { useGSCTPoolByPid } from './useSubgraph';
import { useRealGSCTUSDTVL } from './useRealGSCTUSDTVL';
import { useVisibilityAwarePolling } from './useVisibilityAwarePolling';
import { CONTRACT_ADDRESSES } from '../lib/contracts';

export interface OptimizedGSCTPoolData {
  id: string;
  pair: string;
  poolAddress: string;
  lpTokenAddress: string;
  pid: number;
  tokenImage: string;
  userLp: number;
  earned: number;
  stakedLP: number; // Amount of LP tokens staked by user
  totalPoolTVL: number; // Total USD value of ALL assets locked in the LP pool
  lpTokenBalance: number;
  apr: number;
  isLoading: boolean;
  error?: string;
}

// GSCT pool configuration
const GSCT_POOLS = [
  {
    id: 'sct-hype',
    pair: 'SCT/HYPE',
    poolAddress: CONTRACT_ADDRESSES.GSCTRewardPool,
    lpTokenAddress: '0x95086e54952C1EaE95d0381c1bE801728ed64d83', // SCT-HYPE LP from contract
    pid: 0, // Pool ID 0 for SCT-HYPE
    tokenImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=64&h=64&fit=crop&crop=center',
  },
  {
    id: 'gsct-hype',
    pair: 'gSCT/HYPE',
    poolAddress: CONTRACT_ADDRESSES.GSCTRewardPool,
    lpTokenAddress: '0x162991e2926089D493beB9458Bd1f94db2F5efB1', // GSCT-HYPE LP from contract
    pid: 1, // Pool ID 1 for GSCT-HYPE
    tokenImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=64&h=64&fit=crop&crop=center',
  },
];

export const useOptimizedGSCTPoolData = () => {
  const { address: userAddress } = useAccount();

  // Get real USD TVL data for all GSCT pools
  const { pools: poolUSDData } = useRealGSCTUSDTVL(CONTRACT_ADDRESSES.GSCTRewardPool);

  // Batch fetch user info for all pools
  const userInfoQueries = GSCT_POOLS.map(pool => 
    useGSCTPoolUserInfo(pool.poolAddress, pool.pid, userAddress)
  );

  // Batch fetch pending rewards for all pools
  const pendingRewardsQueries = GSCT_POOLS.map(pool => 
    useGSCTPoolPendingShare(pool.poolAddress, pool.pid, userAddress)
  );

  // Batch fetch APR data for all pools
  const aprQueries = GSCT_POOLS.map((pool, index) => 
    useGSCTPoolAPR(
      pool.poolAddress, 
      pool.pid, 
      poolUSDData[index]?.totalPoolTVL || 0
    )
  );

  // Batch fetch LP token balances for all pools
  const lpBalanceQueries = GSCT_POOLS.map(pool => 
    useTokenBalance(pool.lpTokenAddress, userAddress)
  );

  // Memoized pool data calculation to prevent unnecessary re-renders
  const optimizedPoolData = useMemo((): OptimizedGSCTPoolData[] => {
    if (!CONTRACT_ADDRESSES.GSCTRewardPool) {
      return [];
    }

    return GSCT_POOLS.map((pool, index) => {
      const userInfo = userInfoQueries[index];
      const pendingRewards = pendingRewardsQueries[index];
      const aprData = aprQueries[index];
      const poolUSD = poolUSDData[index];
      const lpBalance = lpBalanceQueries[index];

      const isLoading = 
        userInfo.isLoading || 
        pendingRewards.isLoading || 
        aprData.isLoading || 
        lpBalance.isLoading ||
        !poolUSD ||
        poolUSD.isLoading;

      const userLp = userInfo.data && userInfo.data[0] 
        ? Number(userInfo.data[0]) / 1e18 
        : 0;

      const earned = pendingRewards.data 
        ? Number(pendingRewards.data) / 1e18 
        : 0;

      const apr = aprData.apr || 0;
      const usdTVL = poolUSD?.totalPoolTVL || 0;
      const lpTokenBalance = lpBalance.data ? Number(lpBalance.data) / 1e18 : 0;

      return {
        ...pool,
        userLp,
        earned,
        stakedLP: userLp, // Amount of LP tokens staked by user
        totalPoolTVL: usdTVL, // Total USD value of ALL assets locked in the LP pool
        lpTokenBalance,
        apr,
        isLoading,
        error: userInfo.error || pendingRewards.error || aprData.error || lpBalance.error,
      };
    });
  }, [
    userInfoQueries,
    pendingRewardsQueries,
    aprQueries,
    lpBalanceQueries,
    poolUSDData,
  ]);

  // Use visibility-aware polling to refresh data
  const refreshData = useCallback(() => {
    // This will trigger refetches when the tab becomes visible
    // The actual refetching is handled by the individual hooks
  }, []);

  const { isVisible, isPolling } = useVisibilityAwarePolling(refreshData, {
    interval: 5000, // 5 seconds for faster updates
    enabled: true,
    immediate: false, // Don't execute immediately to avoid double fetching
  });

  return {
    pools: optimizedPoolData,
    isLoading: poolUSDData.some(pool => pool.isLoading),
    error: undefined, // Handle errors individually per pool
    isVisible,
    isPolling,
    totalTVL: poolUSDData.reduce((sum, pool) => sum + (pool.totalPoolTVL || 0), 0),
  };
};
