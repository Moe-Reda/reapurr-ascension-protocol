import { useQuery } from '@tanstack/react-query'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts'
import { formatUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'

// Price fetching hook (you'll need to implement price oracle or DEX integration)
export const useTokenPrice = (tokenAddress: string) => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return useQuery({
    queryKey: ['tokenPrice', tokenAddress],
    queryFn: async () => {
      // Implement price fetching logic here
      // This could be from a DEX, price oracle, or API
      return 1.0 // Placeholder
    },
    refetchInterval: isVisible ? 30000 : false, // Only refetch when visible
    refetchIntervalInBackground: false, // Don't refetch in background
  })
}

// User balance hook
export const useUserBalance = (tokenAddress: string) => {
  const { address } = useAccount()
  
  const { data: balance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: CONTRACT_ABIS.ERC20,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: CONTRACT_ABIS.ERC20,
    functionName: 'decimals',
    query: {
      enabled: !!address,
    },
  })

  return {
    balance: balance && decimals ? formatUnits(balance as bigint, Number(decimals)) : '0',
    rawBalance: balance,
    decimals,
  }
}

// Staking data hook
export const useStakingData = () => {
  const { address } = useAccount()
  
  const { data: stakeInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  const { data: totalStaked } = useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'totalSupply',
  })

  const { data: earned } = useReadContract({
    address: CONTRACT_ADDRESSES.MasonryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.MasonryV2,
    functionName: 'earned',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  return {
    stakedAmount: stakeInfo ? formatUnits(stakeInfo as bigint, 18) : '0',
    pendingRewards: earned ? formatUnits(earned as bigint, 18) : '0',
    lastClaimTime: 0, // Not available in MasonryV2
    totalStaked: totalStaked ? formatUnits(totalStaked as bigint, 18) : '0',
    rewardRate: 0, // Not available in MasonryV2
  }
}

// Treasury data hook
export const useTreasuryData = () => {
  const { data: sctPrice } = useReadContract({
    address: CONTRACT_ADDRESSES.TreasuryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.TreasuryV2,
    functionName: 'getSCTPrice',
  })

  const { data: bsctPrice } = useReadContract({
    address: CONTRACT_ADDRESSES.TreasuryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.TreasuryV2,
    functionName: 'getBSCTPrice',
  })

  const { data: bondDiscountRate } = useReadContract({
    address: CONTRACT_ADDRESSES.TreasuryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.TreasuryV2,
    functionName: 'getBondDiscountRate',
  })

  const { data: bondPremiumRate } = useReadContract({
    address: CONTRACT_ADDRESSES.TreasuryV2 as `0x${string}`,
    abi: CONTRACT_ABIS.TreasuryV2,
    functionName: 'getBondPremiumRate',
  })

  return {
    sctPrice: sctPrice ? formatUnits(sctPrice as bigint, 18) : '0',
    bsctPrice: bsctPrice ? formatUnits(bsctPrice as bigint, 18) : '0',
    bondDiscountRate: bondDiscountRate ? formatUnits(bondDiscountRate as bigint, 18) : '0',
    bondPremiumRate: bondPremiumRate ? formatUnits(bondPremiumRate as bigint, 18) : '0',
  }
}

// Protocol overview hook
export const useProtocolOverview = () => {
  const { data: sctPrice } = useTokenPrice(CONTRACT_ADDRESSES.SCT)
  const { data: gsctPrice } = useTokenPrice(CONTRACT_ADDRESSES.GSCT)
  const { sctPrice: treasurySctPrice, bsctPrice } = useTreasuryData()
  const { totalStaked } = useStakingData()

  return {
    sctPrice,
    gsctPrice,
    treasurySctPrice,
    bsctPrice,
    totalStaked,
    marketCap: sctPrice && treasurySctPrice ? parseFloat(sctPrice.toString()) * parseFloat(treasurySctPrice) : 0,
    treasuryValue: treasurySctPrice ? parseFloat(treasurySctPrice) : 0,
  }
} 