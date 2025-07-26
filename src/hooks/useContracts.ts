import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, formatEther, parseEther, formatToken, parseToken } from '../lib/contracts';
import { useState, useEffect } from 'react';
import { useDexScreenerPrice } from './useDexScreenerPrice';

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
    },
  });
};

export const useGenesisPoolInfo = (poolAddress: string, pid: number) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'poolInfo',
    args: [BigInt(pid)],
    query: { enabled: !!poolAddress },
  });
};

// GSCT Reward Pool hooks (different from SCT Genesis Pool)
export const useGSCTPoolUserInfo = (poolAddress: string, pid: number, userAddress?: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'userInfo',
    args: [BigInt(pid), userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress && !!poolAddress,
    },
  });
};

export const useGSCTPoolPendingShare = (poolAddress: string, pid: number, userAddress?: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'pendingShare',
    args: [BigInt(pid), userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress && !!poolAddress,
    },
  });
};

export const useGSCTPoolInfo = (poolAddress: string, pid: number) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'poolInfo',
    args: [BigInt(pid)],
    query: {
      enabled: !!poolAddress,
    },
  });
};

export const useGSCTPoolLength = (poolAddress: string) => {
  return useReadContract({
    address: poolAddress as `0x${string}`,
    abi: CONTRACT_ABIS.RewardPool,
    functionName: 'poolLength',
    query: {
      enabled: !!poolAddress,
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