import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { CONTRACT_ADDRESSES, STAKING_ABI, BONDING_ABI, ERC20_ABI } from '@/lib/contracts'
import { parseUnits } from 'ethers/lib/utils'
import { toast } from 'sonner'

// Staking transactions
export const useStake = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const stake = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.STAKING as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [parseUnits(amount, 18)],
      })
    } catch (err) {
      toast.error('Failed to stake tokens')
      console.error('Stake error:', err)
    }
  }

  return {
    stake,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export const useUnstake = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const unstake = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.STAKING as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'unstake',
        args: [parseUnits(amount, 18)],
      })
    } catch (err) {
      toast.error('Failed to unstake tokens')
      console.error('Unstake error:', err)
    }
  }

  return {
    unstake,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export const useClaimRewards = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const claimRewards = async () => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.STAKING as `0x${string}`,
        abi: STAKING_ABI,
        functionName: 'claimRewards',
      })
    } catch (err) {
      toast.error('Failed to claim rewards')
      console.error('Claim error:', err)
    }
  }

  return {
    claimRewards,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

// Bonding transactions
export const useBond = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const bond = async (amount: string, maxPrice: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.BONDING as `0x${string}`,
        abi: BONDING_ABI,
        functionName: 'deposit',
        args: [parseUnits(amount, 6), parseUnits(maxPrice, 18)], // Assuming USDC for amount
      })
    } catch (err) {
      toast.error('Failed to create bond')
      console.error('Bond error:', err)
    }
  }

  return {
    bond,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export const useRedeemBond = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const redeemBond = async (bondId: number) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.BONDING as `0x${string}`,
        abi: BONDING_ABI,
        functionName: 'redeem',
        args: [BigInt(bondId)],
      })
    } catch (err) {
      toast.error('Failed to redeem bond')
      console.error('Redeem error:', err)
    }
  }

  return {
    redeemBond,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

// Token approval
export const useApprove = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const approve = async (tokenAddress: string, spenderAddress: string, amount: string) => {
    try {
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress as `0x${string}`, parseUnits(amount, 18)],
      })
    } catch (err) {
      toast.error('Failed to approve tokens')
      console.error('Approve error:', err)
    }
  }

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
} 