import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useAccount, useBlockNumber, usePublicClient } from 'wagmi';
import { useGenesisPoolsAllTVL, useGenesisPoolUserInfo, useGenesisPoolPendingSCT, useGenesisPoolAPR } from './useContracts';
import { usePoolUSDData, useRealUSDTVL } from './useRealUSDTVL';
import { useVisibilityAwarePolling } from './useVisibilityAwarePolling';
import { CONTRACT_ADDRESSES } from '../lib/contracts';
import { CONTRACT_ABIS } from '../lib/contracts';

export interface OptimizedPoolData {
  id: string;
  asset: string;
  poolAddress: string;
  tokenAddress: string;
  pid: number;
  tokenImage: string;
  userStake: number;
  earned: number;
  totalStaked: bigint | undefined;
  usdTVL: number;
  tokenBalance: number;
  apr: number;
  isLoading: boolean;
  error?: string;
}

// Genesis pool configuration
const GENESIS_POOLS = [
  {
    id: 'sct-hype',
    asset: 'SCT/HYPE',
    poolAddress: CONTRACT_ADDRESSES.SCTGenesisRewardPool,
    tokenAddress: CONTRACT_ADDRESSES.SCTHYPE || '0x0000000000000000000000000000000000000000',
    pid: 0,
    tokenImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=64&h=64&fit=crop&crop=center',
  },
  {
    id: 'purr',
    asset: 'PURR',
    poolAddress: CONTRACT_ADDRESSES.SCTGenesisRewardPool,
    tokenAddress: CONTRACT_ADDRESSES.PURR || '0x0000000000000000000000000000000000000000',
    pid: 1,
    tokenImage: 'https://placekitten.com/64/64',
  },
  {
    id: 'usdc',
    asset: 'USDC',
    poolAddress: CONTRACT_ADDRESSES.SCTGenesisRewardPool,
    tokenAddress: CONTRACT_ADDRESSES.USDC || '0x0000000000000000000000000000000000000000',
    pid: 2,
    tokenImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=64&h=64&fit=crop&crop=center',
  },
  {
    id: 'hype',
    asset: 'HYPE',
    poolAddress: CONTRACT_ADDRESSES.SCTGenesisRewardPool,
    tokenAddress: CONTRACT_ADDRESSES.HYPE || '0x0000000000000000000000000000000000000000',
    pid: 3,
    tokenImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=64&h=64&fit=crop&crop=center',
  },
];

export const useOptimizedPoolData = () => {
  const { address: userAddress } = useAccount();
  const lastRefetchRef = useRef(0);

  // Batch fetch all pool TVL data in one call
  const allPoolsTVL = useGenesisPoolsAllTVL(CONTRACT_ADDRESSES.SCTGenesisRewardPool);
  
  // Get real USD TVL data for all pools
  const { pools: poolUSDData } = useRealUSDTVL(CONTRACT_ADDRESSES.SCTGenesisRewardPool);

  // Batch fetch user info for all pools
  const userInfoQueries = GENESIS_POOLS.map(pool => 
    useGenesisPoolUserInfo(pool.poolAddress, pool.pid, userAddress)
  );

  // Batch fetch pending rewards for all pools
  const pendingRewardsQueries = GENESIS_POOLS.map(pool => 
    useGenesisPoolPendingSCT(pool.poolAddress, pool.pid, userAddress)
  );

  // Batch fetch APR data for all pools
  const aprQueries = GENESIS_POOLS.map((pool, index) => 
    useGenesisPoolAPR(
      pool.poolAddress, 
      pool.pid, 
      poolUSDData[index]?.tvlUSD || 0
    )
  );

  // Memoized pool data calculation to prevent unnecessary re-renders
  const optimizedPoolData = useMemo((): OptimizedPoolData[] => {
    if (!CONTRACT_ADDRESSES.SCTGenesisRewardPool) {
      return [];
    }

    return GENESIS_POOLS.map((pool, index) => {
      const userInfo = userInfoQueries[index];
      const pendingRewards = pendingRewardsQueries[index];
      const aprData = aprQueries[index];
      const poolUSD = poolUSDData[index];
      const poolTVL = allPoolsTVL.data?.[index];

      const isLoading = 
        userInfo.isLoading || 
        pendingRewards.isLoading || 
        aprData.isLoading || 
        allPoolsTVL.isLoading ||
        !poolUSD ||
        poolUSD.isLoading;

      const userStake = userInfo.data && userInfo.data[0] 
        ? Number(userInfo.data[0]) / 1e18 
        : 0;

      const earned = pendingRewards.data 
        ? Number(pendingRewards.data) / 1e18 
        : 0;

      const apr = aprData.apr || 0;
      const usdTVL = poolUSD?.tvlUSD || 0;

      return {
        ...pool,
        userStake,
        earned,
        totalStaked: poolTVL,
        usdTVL,
        tokenBalance: 0, // Will be fetched separately if needed
        apr,
        isLoading,
        error: userInfo.error?.message || pendingRewards.error?.message || allPoolsTVL.error?.message,
      };
    });
  }, [
    userInfoQueries,
    pendingRewardsQueries,
    aprQueries,
    poolUSDData,
    allPoolsTVL.data,
    allPoolsTVL.isLoading,
    allPoolsTVL.error,
  ]);

  // Gather refetchers (wagmi exposes `refetch` on each)
  const refetchAll = useCallback(() => {
    allPoolsTVL.refetch?.();
    userInfoQueries.forEach(q => q.refetch?.());
    pendingRewardsQueries.forEach(q => q.refetch?.());
    // Note: APR queries don't have refetch, but their underlying contract hooks do
    // The APR will update automatically when the underlying data changes
  }, [allPoolsTVL, userInfoQueries, pendingRewardsQueries]);

  // Use visibility-aware polling to refresh data
  const refreshData = useCallback(() => {
    refetchAll();
  }, [refetchAll]);

  const { isVisible, isPolling } = useVisibilityAwarePolling(refreshData, {
    interval: 30000, // 30 seconds
    enabled: true,
    immediate: false, // Don't execute immediately to avoid double fetching
  });

  // Watch for new blocks and refetch data (throttled to every 5 seconds)
  const { data: blockNumber } = useBlockNumber({ watch: true });
  
  // Refetch on new blocks (throttled to every 5 seconds)
  useMemo(() => {
    if (blockNumber && document.visibilityState === 'visible') {
      const now = Date.now();
      if (now - lastRefetchRef.current > 5000) {
        lastRefetchRef.current = now;
        refetchAll();
      }
    }
  }, [blockNumber, refetchAll]);

  // Listen to contract events for immediate updates
  const publicClient = usePublicClient();
  
  useEffect(() => {
    if (!CONTRACT_ADDRESSES.SCTGenesisRewardPool || !publicClient) return;

    const unwatch = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESSES.SCTGenesisRewardPool as `0x${string}`,
      abi: CONTRACT_ABIS.RewardPool,
      eventName: 'Deposit',
      onLogs: () => {
        // Refetch all data when relevant events occur
        refetchAll();
      },
    });

    // Watch multiple events separately
    const unwatch2 = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESSES.SCTGenesisRewardPool as `0x${string}`,
      abi: CONTRACT_ABIS.RewardPool,
      eventName: 'Withdraw',
      onLogs: () => refetchAll(),
    });

    const unwatch3 = publicClient.watchContractEvent({
      address: CONTRACT_ADDRESSES.SCTGenesisRewardPool as `0x${string}`,
      abi: CONTRACT_ABIS.RewardPool,
      eventName: 'RewardPaid',
      onLogs: () => refetchAll(),
    });

    return () => {
      unwatch?.();
      unwatch2?.();
      unwatch3?.();
    };
  }, [publicClient, refetchAll]);

  return {
    pools: optimizedPoolData,
    isLoading: allPoolsTVL.isLoading || poolUSDData.some(pool => pool.isLoading),
    error: allPoolsTVL.error,
    isVisible,
    isPolling,
    totalTVL: poolUSDData.reduce((sum, pool) => sum + (pool.tvlUSD || 0), 0),
  };
};



