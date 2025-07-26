import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, parseEther } from './contracts';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract action class for write operations
export class ContractActions {
  private provider: ethers.providers.Web3Provider;
  private signer: ethers.Signer | null = null;

  constructor() {
    // Initialize provider from window.ethereum
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
    } else {
      throw new Error('No Ethereum provider found');
    }
  }

  // Connect wallet and get signer
  async connectWallet(): Promise<string> {
    try {
      await this.provider.send('eth_requestAccounts', []);
      this.signer = this.provider.getSigner();
      const address = await this.signer.getAddress();
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  // Get current signer address
  async getAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  // Token approval
  async approveToken(tokenAddress: string, spenderAddress: string, amount: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(tokenAddress, CONTRACT_ABIS.ERC20, this.signer);
    const parsedAmount = parseEther(amount);
    
    return await contract.approve(spenderAddress, parsedAmount);
  }

  // Masonry actions
  async stakeGSCT(amount: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.MasonryV2, CONTRACT_ABIS.MasonryV2, this.signer);
    const parsedAmount = parseEther(amount);
    
    return await contract.stake(parsedAmount);
  }

  async withdrawGSCT(amount: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.MasonryV2, CONTRACT_ABIS.MasonryV2, this.signer);
    const parsedAmount = parseEther(amount);
    
    return await contract.withdraw(parsedAmount);
  }

  async claimReward(): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.MasonryV2, CONTRACT_ABIS.MasonryV2, this.signer);
    return await contract.claimReward();
  }

  async exitMasonry(): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.MasonryV2, CONTRACT_ABIS.MasonryV2, this.signer);
    return await contract.exit();
  }

  // Treasury actions
  async buyBonds(amount: string, maxPrice: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.TreasuryV2, CONTRACT_ABIS.TreasuryV2, this.signer);
    const parsedAmount = parseEther(amount);
    const parsedMaxPrice = ethers.BigNumber.from(maxPrice);

    console.log('parsedAmount', parsedAmount.toString());
    console.log('parsedMaxPrice', parsedMaxPrice.toString());
    
    return await contract.buyBonds(parsedAmount, parsedMaxPrice);
  }

  async redeemBonds(amount: string, maxPrice: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.TreasuryV2, CONTRACT_ABIS.TreasuryV2, this.signer);
    const parsedAmount = parseEther(amount);
    const parsedMaxPrice = ethers.BigNumber.from(maxPrice);
    
    return await contract.redeemBonds(parsedAmount, parsedMaxPrice);
  }

  async allocateSeigniorage(): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.TreasuryV2, CONTRACT_ABIS.TreasuryV2, this.signer);
    return await contract.allocateSeigniorage();
  }

  // Reward pool actions
  async stakeInPool(poolAddress: string, pid: number, amount: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(poolAddress, CONTRACT_ABIS.RewardPool, this.signer);
    const parsedAmount = parseEther(amount);
    
    return await contract.deposit(pid, parsedAmount);
  }

  async withdrawFromPool(poolAddress: string, pid: number, amount: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(poolAddress, CONTRACT_ABIS.RewardPool, this.signer);
    const parsedAmount = parseEther(amount);
    
    return await contract.withdraw(pid, parsedAmount);
  }

  async getRewardFromPool(poolAddress: string, pid: number): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(poolAddress, CONTRACT_ABIS.RewardPool, this.signer);
    return await contract.withdraw(pid, 0); // Withdraw 0 to claim rewards
  }

  // GSCT Reward Pool specific actions
  async stakeInGSCTPool(poolAddress: string, pid: number, amount: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(poolAddress, CONTRACT_ABIS.RewardPool, this.signer);
    const parsedAmount = parseEther(amount);
    
    return await contract.deposit(pid, parsedAmount);
  }

  async withdrawFromGSCTPool(poolAddress: string, pid: number, amount: string): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(poolAddress, CONTRACT_ABIS.RewardPool, this.signer);
    const parsedAmount = parseEther(amount);
    
    return await contract.withdraw(pid, parsedAmount);
  }

  async claimGSCTRewards(poolAddress: string, pid: number): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(poolAddress, CONTRACT_ABIS.RewardPool, this.signer);
    return await contract.withdraw(pid, 0); // Withdraw 0 to claim rewards
  }

  async exitPool(poolAddress: string, pid: number): Promise<ethers.ContractTransaction> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(poolAddress, CONTRACT_ABIS.RewardPool, this.signer);
    return await contract.emergencyWithdraw(pid);
  }

  // Utility methods
  async waitForTransaction(tx: ethers.ContractTransaction): Promise<ethers.ContractReceipt> {
    return await tx.wait();
  }

  async getTransactionStatus(txHash: string): Promise<ethers.ContractReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return null;
    }
  }

  // Gas estimation
  async estimateGas(contractAddress: string, abi: string[], functionName: string, args: any[]): Promise<ethers.BigNumber> {
    if (!this.signer) throw new Error('Wallet not connected');
    
    const contract = new ethers.Contract(contractAddress, abi, this.signer);
    return await contract[functionName].estimateGas(...args);
  }
}

// Singleton instance
let contractActions: ContractActions | null = null;

export const getContractActions = (): ContractActions => {
  if (!contractActions) {
    contractActions = new ContractActions();
  }
  return contractActions;
};

// Hook for using contract actions
export const useContractActions = () => {
  return getContractActions();
};

// Standalone functions for easier import
export const stakeInPool = async (poolAddress: string, pid: number, amount: string): Promise<ethers.ContractTransaction> => {
  const actions = getContractActions();
  return await actions.stakeInPool(poolAddress, pid, amount);
};

export const unstakeFromPool = async (poolAddress: string, pid: number, amount: string): Promise<ethers.ContractTransaction> => {
  const actions = getContractActions();
  return await actions.withdrawFromPool(poolAddress, pid, amount);
};

export const claimRewards = async (poolAddress: string, pid: number): Promise<ethers.ContractTransaction> => {
  const actions = getContractActions();
  return await actions.getRewardFromPool(poolAddress, pid);
};

// GSCT Reward Pool specific functions
export const stakeInGSCTPool = async (poolAddress: string, pid: number, amount: string): Promise<ethers.ContractTransaction> => {
  const actions = getContractActions();
  return await actions.stakeInGSCTPool(poolAddress, pid, amount);
};

export const withdrawFromGSCTPool = async (poolAddress: string, pid: number, amount: string): Promise<ethers.ContractTransaction> => {
  const actions = getContractActions();
  return await actions.withdrawFromGSCTPool(poolAddress, pid, amount);
};

export const claimGSCTRewards = async (poolAddress: string, pid: number): Promise<ethers.ContractTransaction> => {
  const actions = getContractActions();
  return await actions.claimGSCTRewards(poolAddress, pid);
};

export const buyBonds = async (amount: string, maxPrice: string): Promise<ethers.ContractTransaction> => {
  const actions = getContractActions();
  return await actions.buyBonds(amount, maxPrice);
};

export const redeemBonds = async (amount: string, maxPrice: string): Promise<ethers.ContractTransaction> => {
  const actions = getContractActions();
  return await actions.redeemBonds(amount, maxPrice);
}; 