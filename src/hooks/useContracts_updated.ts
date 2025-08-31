import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, formatEther, parseEther, formatToken, parseToken } from '../lib/contracts';
import { useState, useEffect } from 'react';
import { useDexScreenerPrice } from './useDexScreenerPrice';

// Utility function for calculating APR with proper precision handling
const calculateAPR = (
  rewardPerSecondWei: bigint,
  poolAllocPoint: number,
  totalAllocPoints: number,
  tvl: number,
  poolId: number,
  poolType: 'SCT' | 'GSCT'
): number => {
  if (tvl <= 0 || poolAllocPoint === 0 || totalAllocPoints === 0) {
    return 0;
  }

  try {
    // Calculate pool's share of rewards
    const poolRewardShare = poolAllocPoint / totalAllocPoints;
    
    // Calculate rewards per second for this pool (in wei)
    const poolRewardPerSecondWei = rewardPerSecondWei * BigInt(Math.floor(poolRewardShare * 1e6)) / BigInt(1e6);
    
    // Calculate daily rewards for this pool (in wei)
    const secondsPerDay = 24 * 60 * 60; // 86400 seconds
    const dailyRewardsWei = poolRewardPerSecondWei * BigInt(secondsPerDay);
    
    // Calculate annual rewards (in wei)
    const annualRewardsWei = dailyRewardsWei * BigInt(365);
    
    // Convert annual rewards to human-readable format
    const annualRewardsHuman = Number(annualRewardsWei) / 1e18;
    
    // Calculate APR: (Annual Rewards / TVL) * 100
    const aprValue = (annualRewardsHuman / tvl) * 100;
    
    // Debug logging
    console.log(`${poolType} Pool ${poolId} APR calculation:`, {
      poolAllocPoint,
      totalAllocPoints,
      poolRewardShare,
      rewardPerSecondWei: rewardPerSecondWei.toString(),
      poolRewardPerSecondWei: poolRewardPerSecondWei.toString(),
      dailyRewardsWei: dailyRewardsWei.toString(),
      annualRewardsWei: annualRewardsWei.toString(),
      annualRewardsHuman,
      tvl,
      aprValue
    });
    
    // Ensure APR is a reasonable value (not infinite or negative)
    if (isFinite(aprValue) && aprValue >= 0) {
      return aprValue;
    } else {
      console.warn(`Invalid ${poolType} APR value for pool ${poolId}:`, aprValue);
      return 0;
    }
  } catch (error) {
    console.error(`Error calculating ${poolType} APR:`, error);
    return 0;
  }
};

// Hook for getting awakening countdown
export const useAwakeningCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<string>('--:--:--:--');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState(!document.hidden);

  // Check if contract address is available
  const contractAddress = CONTRACT_ADDRESSES.SCTGenesisRewardPool;
  if (!contractAddress) {
    return {
      timeLeft: '--:--:--:--',
      isActive: false,
      isLoading: false,
      error: 'Contract address not configured',
      poolEndTime: null,
      poolStartTime: null,
    };
  }

  // Read pool end time from contract
  const { data: poolEndTime, isLoading: endTimeLoading, error: endTimeError } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'poolEndTime',
  });

  // Read pool start time from contract
  const { data: poolStartTime, isLoading: startTimeLoading, error: startTimeError } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'poolStartTime',
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!poolEndTime || !poolStartTime) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(poolEndTime);
      const startTime = Number(poolStartTime);

      // Check if pool is active
      const poolActive = now >= startTime && now < endTime;
      setIsActive(poolActive);

      if (now >= endTime) {
        setTimeLeft('00:00:00:00');
        return;
      }

      const timeRemaining = endTime - now;
      
      // Calculate days, hours, minutes, seconds
      const days = Math.floor(timeRemaining / (24 * 60 * 60));
      const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
      const seconds = timeRemaining % 60;

      // Format as DD:HH:MM:SS
      const formattedTime = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      setTimeLeft(formattedTime);
    };

    // Update immediately
    updateCountdown();

    // Only set up interval if page is visible
    let interval: NodeJS.Timeout;
    if (isVisible) {
      interval = setInterval(updateCountdown, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [poolEndTime, poolStartTime, isVisible]);

  return {
    timeLeft,
    isActive,
    isLoading: endTimeLoading || startTimeLoading,
    error: endTimeError || startTimeError,
    poolEndTime: poolEndTime ? Number(poolEndTime) : null,
    poolStartTime: poolStartTime ? Number(poolStartTime) : null,
  };
};

// Hook for getting accurate emissions data
export const useEmissionsData = () => {
  const [dailyEmissions, setDailyEmissions] = useState<number>(0);
  const [totalEmissions, setTotalEmissions] = useState<number>(0);
  const [emissionRate, setEmissionRate] = useState<number>(0);

  // Check if contract address is available
  const contractAddress = CONTRACT_ADDRESSES.SCTGenesisRewardPool;
  if (!contractAddress) {
    return {
      dailyEmissions: 0,
      totalEmissions: 0,
      emissionRate: 0,
      isLoading: false,
      error: 'Contract address not configured',
    };
  }

  // Read SCT per second from contract
  const { data: sctPerSecond, isLoading: sctPerSecondLoading, error: sctPerSecondError } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'SCTPerSecond',
  });

  // Read running time from contract
  const { data: runningTime, isLoading: runningTimeLoading, error: runningTimeError } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'runningTime',
  });

  useEffect(() => {
    if (!sctPerSecond) return;

    try {
      // Calculate emission rate in SCT per second
      const sctPerSecondNum = Number(sctPerSecond);
      const emissionRateCalc = sctPerSecondNum / 1e18;
      setEmissionRate(emissionRateCalc);

      // Calculate daily emissions: SCT per second * seconds per day
      const secondsPerDay = 24 * 60 * 60; // 86400 seconds
      const dailyEmissionsCalc = emissionRateCalc * secondsPerDay;
      setDailyEmissions(dailyEmissionsCalc);

      // Calculate total emissions if running time is available
      if (runningTime) {
        const runningTimeNum = Number(runningTime);
        const totalEmissionsCalc = emissionRateCalc * runningTimeNum;
        setTotalEmissions(totalEmissionsCalc);
      }
    } catch (error) {
      console.error('Error calculating emissions:', error);
      setDailyEmissions(0);
      setTotalEmissions(0);
      setEmissionRate(0);
    }
  }, [sctPerSecond, runningTime]);

  return {
    dailyEmissions,
    totalEmissions,
    emissionRate,
    isLoading: sctPerSecondLoading || runningTimeLoading,
    error: sctPerSecondError || runningTimeError,
    sctPerSecond: sctPerSecond ? Number(sctPerSecond) : null,
    runningTime: runningTime ? Number(runningTime) : null,
  };
};

// Token balance hook
export const useTokenBalance = (tokenAddress: string, userAddress?: string) => {
  return useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: CONTRACT_ABIS.ERC20,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress && !!tokenAddress,
    },
  });
};

// Token allowance hook
export const useTokenAllowance = (tokenAddress: string, ownerAddress?: string, spenderAddress?: string) => {
  return useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: CONTRACT_ABIS.ERC20,
    functionName: 'allowance',
    args: [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`],
    query: {
      enabled: !!ownerAddress && !!spenderAddress && !!tokenAddress,
    },
  });
};

// Oracle price hooks
export const useOraclePrice = (tokenAddress: string, amount: bigint = BigInt(1e18)) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.Oracle as `0x${string}`,
    abi: CONTRACT_ABIS.Oracle,
    functionName: 'consult',
    args: [tokenAddress as `0x${string}`, amount],
    query: {
      enabled: !!tokenAddress,
    },
  });
};

export const useOracleTWAP = (tokenAddress: string, amount: bigint = BigInt(1e18)) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.Oracle as `0x${string}`,
    abi: CONTRACT_ABIS.Oracle,
    functionName: 'twap',
    args: [tokenAddress as `0x${string}`, amount],
    query: {
      enabled: !!tokenAddress,
    },
  });
};

// Masonry hooks
export const useMasonryEpoch = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'epoch',
  });
};

export const useMasonryNextEpochPoint = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'nextEpochPoint',
  });
};

export const useMasonryTotalSupply = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'totalSupply',
  });
};

export const useMasonryBalance = (userAddress?: string) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
    },
  });
};

export const useMasonryEarned = (userAddress?: string) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'earned',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
    },
  });
};

export const useMasonryCanClaimReward = (userAddress?: string) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'canClaimReward',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
    },
  });
};

export const useMasonryCanWithdraw = (userAddress?: string) => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'canWithdraw',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
    },
  });
};

export const useMasonryRewardLockupEpochs = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'rewardLockupEpochs',
  });
};

export const useMasonryWithdrawLockupEpochs = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'withdrawLockupEpochs',
  });
};

// Treasury hooks
export const useTreasuryEpoch = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TreasuryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.TreasuryV2,
    functionName: 'epoch',
  });
};

export const useTreasuryNextEpochPoint = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TreasuryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.TreasuryV2,
    functionName: 'nextEpochPoint',
  });
};

export const useTreasurySCTPrice = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TreasuryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.TreasuryV2,
    functionName: 'getSCTPrice',
  });
};

export const useTreasuryBSCTPrice = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TreasuryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.TreasuryV2,
    functionName: 'getBSCTPrice',
  });
};

export const useTreasuryBondDiscountRate = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TreasuryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.TreasuryV2,
    functionName: 'getBondDiscountRate',
  });
};

export const useTreasuryBondPremiumRate = () => {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TreasuryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.TreasuryV2,
    functionName: 'getBondPremiumRate',
  });
};

// Reward pool hooks
export const useGenesisPoolUserInfo = (poolAddress: string, pid: number, userAddress?: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'userInfo',
    args: [BigInt(pid), userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress && !!poolAddress,
      refetchInterval: 15_000,          // 15s polling
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,                      // always stale -> ok to refetch
    },
  });
};

export const useGenesisPoolPendingSCT = (poolAddress: string, pid: number, userAddress?: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'pendingSCT',
    args: [BigInt(pid), userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress && !!poolAddress,
      refetchInterval: 15_000,          // 15s polling
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,                      // always stale -> ok to refetch
    },
  });
};

export const useGenesisPoolInfo = (poolAddress: string, pid: number) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'poolInfo',
    args: [BigInt(pid)],
    query: { 
      enabled: !!poolAddress,
      refetchInterval: 15_000,          // 15s polling
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,                      // always stale -> ok to refetch
    },
  });
};

// Hook to get total allocation points for APR calculation
export const useGenesisPoolTotalAllocPoint = (poolAddress: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'totalAllocPoint',
    query: { 
      enabled: !!poolAddress,
      refetchInterval: 15_000,          // 15s polling
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,                      // always stale -> ok to refetch
    },
  });
};

// Hook to calculate APR for a specific pool
export const useGenesisPoolAPR = (poolAddress: string, pid: number, tvl: number) => {
  const { data: sctPerSecond, isLoading: sctPerSecondLoading } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'SCTPerSecond',
    query: { 
      enabled: !!poolAddress,
      refetchInterval: 15_000,          // 15s polling
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,                      // always stale -> ok to refetch
    },
  });

  const { data: poolInfo, isLoading: poolInfoLoading } = useGenesisPoolInfo(poolAddress, pid);
  const { data: totalAllocPoint, isLoading: totalAllocPointLoading } = useGenesisPoolTotalAllocPoint(poolAddress);

  const [apr, setApr] = useState<number>(0);

  useEffect(() => {
    if (!sctPerSecond || !poolInfo || !totalAllocPoint || tvl <= 0) {
      setApr(0);
      return;
    }

    // poolInfo structure: [token, depFee, allocPoint, lastRewardTime, accSCTPerShare, isStarted, poolSCTPerSec]
    const poolAllocPoint = Number(poolInfo[2]); // allocPoint is at index 2
    const totalAllocPoints = Number(totalAllocPoint);
    const sctPerSecondWei = BigInt(sctPerSecond);

    const aprValue = calculateAPR(
      sctPerSecondWei,
      poolAllocPoint,
      totalAllocPoints,
      tvl,
      pid,
      'SCT'
    );

    setApr(aprValue);
  }, [sctPerSecond, poolInfo, totalAllocPoint, tvl, pid]);

  return {
    apr,
    isLoading: sctPerSecondLoading || poolInfoLoading || totalAllocPointLoading,
  };
};

// GSCT Reward Pool hooks (different from SCT Genesis Pool) - UPDATED WITH POLLING
export const useGSCTPoolUserInfo = (poolAddress: string, pid: number, userAddress?: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.GSCTRewardPool,
    functionName: 'userInfo',
    args: [BigInt(pid), userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress && !!poolAddress,
      refetchInterval: 15_000,          // 15s polling
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,                      // always stale -> ok to refetch
    },
  });
};

export const useGSCTPoolPendingShare = (poolAddress: string, pid: number, userAddress?: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.GSCTRewardPool,
    functionName: 'pendingShare',
    args: [BigInt(pid), userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress && !!poolAddress,
      refetchInterval: 15_000,          // 15s polling
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,                      // always stale -> ok to refetch
    },
  });
};

export const useGSCTPoolInfo = (poolAddress: string, pid: number) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.GSCTRewardPool,
    functionName: 'poolInfo',
    args: [BigInt(pid)],
    query: {
      enabled: !!poolAddress,
      refetchInterval: 15_000,          // 15s polling
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,                      // always stale -> ok to refetch
    },
  });
};

export const useGSCTPoolLength = (poolAddress: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.GSCTRewardPool,
    functionName: 'poolLength',
    query: {
      enabled: !!poolAddress,
    },
  });
};

// Hook to get total allocation points for GSCT APR calculation
export const useGSCTPoolTotalAllocPoint = (poolAddress: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.GSCTRewardPool,
    functionName: 'totalAllocPoint',
    query: { enabled: !!poolAddress },
  });
};

// Hook to calculate APR for a specific GSCT pool
export const useGSCTPoolAPR = (poolAddress: string, pid: number, tvl: number) => {
  const { data: sharePerSecond, isLoading: sharePerSecondLoading } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.GSCTRewardPool,
    functionName: 'sharePerSecond', // GSCT pools use sharePerSecond for share emissions
    query: { enabled: !!poolAddress },
  });

  const { data: poolInfo, isLoading: poolInfoLoading } = useGSCTPoolInfo(poolAddress, pid);
  const { data: totalAllocPoint, isLoading: totalAllocPointLoading } = useGSCTPoolTotalAllocPoint(poolAddress);

  const [apr, setApr] = useState<number>(0);

  useEffect(() => {
    if (!sharePerSecond || !poolInfo || !totalAllocPoint || tvl <= 0) {
      setApr(0);
      return;
    }

    // poolInfo structure: [token, withFee, allocPoint, lastRewardTime, accGSCTPerShare, isStarted]
    const poolAllocPoint = Number(poolInfo[2]); // allocPoint is at index 2
    const totalAllocPoints = Number(totalAllocPoint);
    const sharePerSecondWei = BigInt(sharePerSecond);

    const aprValue = calculateAPR(
      sharePerSecondWei,
      poolAllocPoint,
      totalAllocPoints,
      tvl,
      pid,
      'GSCT'
    );

    setApr(aprValue);
  }, [sharePerSecond, poolInfo, totalAllocPoint, tvl, pid]);

  return {
    apr,
    isLoading: sharePerSecondLoading || poolInfoLoading || totalAllocPointLoading,
  };
};

// Hook to get TVL for a specific pool using the contract's poolTVL function
export const useGenesisPoolTVL = (poolAddress: string, pid: number) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'poolTVL',
    args: [BigInt(pid)],
    query: { enabled: !!poolAddress },
  });
};

// Hook to get TVL for all pools using the contract's allPoolsTVL function
export const useGenesisPoolsAllTVL = (poolAddress: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'allPoolsTVL',
    query: { 
      enabled: !!poolAddress,
      refetchInterval: 15_000,          // 15s polling
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,                      // always stale -> ok to refetch
    },
  });
};

// Hook to get TVL for a specific GSCT pool using the contract's poolTVL function
export const useGSCTPoolTVL = (poolAddress: string, pid: number) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.GSCTRewardPool,
    functionName: 'poolTVL',
    args: [BigInt(pid)],
    query: { enabled: !!poolAddress },
  });
};

// Hook to get TVL for all GSCT pools using the contract's allPoolsTVL function - UPDATED WITH POLLING
export const useGSCTPoolsAllTVL = (poolAddress: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.GSCTRewardPool,
    functionName: 'allPoolsTVL',
    query: { 
      enabled: !!poolAddress,
      refetchInterval: 15_000,          // 15s polling
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0,                      // always stale -> ok to refetch
    },
  });
};

// Combined hooks for common use cases
export const useUserTokenBalances = (userAddress?: string) => {
  const sctBalance = useTokenBalance(CONTRACT_ADDRESSES.SCT, userAddress);
  const bsctBalance = useTokenBalance(CONTRACT_ADDRESSES.BSCT, userAddress);
  const gsctBalance = useTokenBalance(CONTRACT_ADDRESSES.GSCT, userAddress);

  return {
    sct: sctBalance.data ? formatEther(sctBalance.data as bigint) : '0',
    bsct: bsctBalance.data ? formatEther(bsctBalance.data as bigint) : '0',
    gsct: gsctBalance.data ? formatEther(gsctBalance.data as bigint) : '0',
    isLoading: sctBalance.isLoading || bsctBalance.isLoading || gsctBalance.isLoading,
    error: sctBalance.error || bsctBalance.error || gsctBalance.error,
  };
};

export const useMasonryUserData = (userAddress?: string) => {
  const balance = useMasonryBalance(userAddress);
  const earned = useMasonryEarned(userAddress);
  const canClaim = useMasonryCanClaimReward(userAddress);
  const canWithdraw = useMasonryCanWithdraw(userAddress);

  return {
    staked: balance.data ? formatEther(balance.data as bigint) : '0',
    earned: earned.data ? formatEther(earned.data as bigint) : '0',
    canClaim: canClaim.data || false,
    canWithdraw: canWithdraw.data || false,
    isLoading: balance.isLoading || earned.isLoading || canClaim.isLoading || canWithdraw.isLoading,
    error: balance.error || earned.error || canClaim.error || canWithdraw.error,
  };
};

export const useProtocolStats = () => {
  const epoch = useMasonryEpoch();
  const nextEpochPoint = useMasonryNextEpochPoint();
  const totalStaked = useMasonryTotalSupply();
  const sctPrice = useTreasurySCTPrice();
  const bsctPrice = useTreasuryBSCTPrice();

  return {
    epoch: epoch.data ? Number(epoch.data) : 0,
    nextEpochPoint: nextEpochPoint.data ? Number(nextEpochPoint.data) : 0,
    totalStaked: totalStaked.data ? formatEther(totalStaked.data as bigint) : '0',
    sctPrice: sctPrice.data ? formatEther(sctPrice.data as bigint) : '0',
    bsctPrice: bsctPrice.data ? formatEther(bsctPrice.data as bigint) : '0',
    isLoading: epoch.isLoading || nextEpochPoint.isLoading || totalStaked.isLoading || sctPrice.isLoading || bsctPrice.isLoading,
    error: epoch.error || nextEpochPoint.error || totalStaked.error || sctPrice.error || bsctPrice.error,
  };
};
