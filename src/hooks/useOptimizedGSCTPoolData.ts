import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useAccount, usePublicClient, useBlockNumber } from 'wagmi';
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
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../lib/contracts';

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
  const lastRefetchRef = useRef(0);
  const publicClient = usePublicClient();

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
        error: userInfo.error?.message || pendingRewards.error?.message || lpBalance.error?.message,
      };
    });
  }, [
    userInfoQueries,
    pendingRewardsQueries,
    aprQueries,
    lpBalanceQueries,
    poolUSDData,
  ]);

  // Create refetch function with debouncing
  const refetchAll = useCallback(() => {
    const now = Date.now();
    if (now - lastRefetchRef.current < 1000) return; // Debounce refetches
    lastRefetchRef.current = now;
    
    console.log('🔄 [GSCT Pool Hook] Refetching all data due to blockchain event');
    
    // Force refetch of all queries
    userInfoQueries.forEach(query => query.refetch?.());
    pendingRewardsQueries.forEach(query => query.refetch?.());
    lpBalanceQueries.forEach(query => query.refetch?.());
  }, [userInfoQueries, pendingRewardsQueries, lpBalanceQueries]);

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

  // Add blockchain event listeners for automatic data refreshing
  useEffect(() => {
    if (!CONTRACT_ADDRESSES.GSCTRewardPool || !publicClient) {
      console.log('⚠️ [GSCT Pool Hook] Missing contract address or public client for event listeners');
      return;
    }

    console.log('👂 [GSCT Pool Hook] Setting up blockchain event listeners for:', CONTRACT_ADDRESSES.GSCTRewardPool);

    const unwatch = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESSES.GSCTRewardPool as `0x${string}`,
      abi: CONTRACT_ABIS.GSCTRewardPool,
      eventName: 'Deposit',
      onLogs: (logs) => {
        console.log('📈 [GSCT Pool Hook] Deposit event detected:', logs);
        refetchAll();
      },
    });

    const unwatch2 = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESSES.GSCTRewardPool as `0x${string}`,
      abi: CONTRACT_ABIS.GSCTRewardPool,
      eventName: 'Withdraw',
      onLogs: (logs) => {
        console.log('📉 [GSCT Pool Hook] Withdraw event detected:', logs);
        refetchAll();
      },
    });

    const unwatch3 = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESSES.GSCTRewardPool as `0x${string}`,
      abi: CONTRACT_ABIS.GSCTRewardPool,
      eventName: 'RewardPaid',
      onLogs: (logs) => {
        console.log('💰 [GSCT Pool Hook] RewardPaid event detected:', logs);
        refetchAll();
      },
    });

    return () => {
      console.log('🧹 [GSCT Pool Hook] Cleaning up event listeners');
      unwatch?.();
      unwatch2?.();
      unwatch3?.();
    };
  }, [publicClient, refetchAll]);

  // Watch for new blocks and refetch data (throttled to every 5 seconds)
  const { data: blockNumber } = useBlockNumber({ watch: true });
  
  // Refetch on new blocks (throttled to every 5 seconds)
  useMemo(() => {
    if (blockNumber && document.visibilityState === 'visible') {
      const now = Date.now();
      if (now - lastRefetchRef.current > 5000) {
        lastRefetchRef.current = now;
        console.log('🔄 [GSCT Pool Hook] Refetching due to new block:', blockNumber);
        refetchAll();
      }
    }
  }, [blockNumber, refetchAll]);

  return {
    pools: optimizedPoolData,
    isLoading: poolUSDData.some(pool => pool.isLoading),
    error: undefined, // Handle errors individually per pool
    isVisible,
    isPolling,
    totalTVL: poolUSDData.reduce((sum, pool) => sum + (pool.totalPoolTVL || 0), 0),
    refetchAll,
  };
};
