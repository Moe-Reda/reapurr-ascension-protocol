import { useQuery } from '@tanstack/react-query'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES, ERC20_ABI, STAKING_ABI, TREASURY_ABI } from '@/lib/contracts'
import { formatUnits } from 'ethers/lib/utils'

// Price fetching hook (you'll need to implement price oracle or DEX integration)
export const useTokenPrice = (tokenAddress: string) => {
  return useQuery({
    queryKey: ['tokenPrice', tokenAddress],
    queryFn: async () => {
      // Implement price fetching logic here
      // This could be from a DEX, price oracle, or API
      return 1.0 // Placeholder
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// User balance hook
export const useUserBalance = (tokenAddress: string) => {
  const { address } = useAccount()
  
  const { data: balance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
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
    address: CONTRACT_ADDRESSES.STAKING as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'stakeInfo',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })

  const { data: totalStaked } = useReadContract({
    address: CONTRACT_ADDRESSES.STAKING as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'totalStaked',
  })

  const { data: rewardRate } = useReadContract({
    address: CONTRACT_ADDRESSES.STAKING as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'rewardRate',
  })

  return {
    stakedAmount: stakeInfo && stakeInfo[0] ? formatUnits(stakeInfo[0] as bigint, 18) : '0',
    pendingRewards: stakeInfo && stakeInfo[1] ? formatUnits(stakeInfo[1] as bigint, 18) : '0',
    lastClaimTime: stakeInfo && stakeInfo[2] ? Number(stakeInfo[2]) : 0,
    totalStaked: totalStaked ? formatUnits(totalStaked as bigint, 18) : '0',
    rewardRate: rewardRate ? formatUnits(rewardRate as bigint, 18) : '0',
  }
}

// Treasury data hook
export const useTreasuryData = () => {
  const { data: totalReserves } = useReadContract({
    address: CONTRACT_ADDRESSES.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'totalReserves',
  })

  const { data: totalDebt } = useReadContract({
    address: CONTRACT_ADDRESSES.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'totalDebt',
  })

  const { data: backingRatio } = useReadContract({
    address: CONTRACT_ADDRESSES.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'backingRatio',
  })

  const { data: bondingDiscount } = useReadContract({
    address: CONTRACT_ADDRESSES.TREASURY as `0x${string}`,
    abi: TREASURY_ABI,
    functionName: 'bondingDiscount',
  })

  return {
    totalReserves: totalReserves ? formatUnits(totalReserves as bigint, 6) : '0', // Assuming USDC decimals
    totalDebt: totalDebt ? formatUnits(totalDebt as bigint, 18) : '0',
    backingRatio: backingRatio ? formatUnits(backingRatio as bigint, 18) : '0',
    bondingDiscount: bondingDiscount ? formatUnits(bondingDiscount as bigint, 18) : '0',
  }
}

// Protocol overview hook
export const useProtocolOverview = () => {
  const { data: sctPrice } = useTokenPrice(CONTRACT_ADDRESSES.SCT)
  const { data: gsctPrice } = useTokenPrice(CONTRACT_ADDRESSES.gSCT)
  const { totalReserves, totalDebt, backingRatio } = useTreasuryData()
  const { totalStaked } = useStakingData()

  return {
    sctPrice,
    gsctPrice,
    totalReserves,
    totalDebt,
    backingRatio,
    totalStaked,
    marketCap: sctPrice && totalDebt ? parseFloat(sctPrice.toString()) * parseFloat(totalDebt) : 0,
    treasuryValue: totalReserves ? parseFloat(totalReserves) : 0,
  }
} 