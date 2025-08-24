import { useState, useEffect } from 'react';
import { useGSCTPoolsAllTVL } from './useContracts';
import { getMultipleTokenPrices } from '../lib/tokenPricing';
import { CONTRACT_ADDRESSES } from '../lib/contracts';

export interface GSCTPoolUSDData {
  pid: number;
  pair: string;
  stakedLPWei: bigint; // Amount of LP tokens staked in the contract
  totalPoolTVL: number; // Total USD value of ALL assets locked in the LP pool
  priceSource: string;
  isLoading: boolean;
  error?: string;
}

export interface GSCTTotalUSDData {
  totalTVLUSD: number;
  pools: GSCTPoolUSDData[];
  isLoading: boolean;
  error?: string;
}

// GSCT pool configuration
const GSCT_POOLS = [
  {
    pid: 0,
    pair: 'SCT/HYPE',
  },
  {
    pid: 1,
    pair: 'gSCT/HYPE',
  },
];

export const useRealGSCTUSDTVL = (poolAddress: string): GSCTTotalUSDData => {
  const [poolsData, setPoolsData] = useState<GSCTPoolUSDData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  // Get TVL data from contract for all GSCT pools using the contract's allPoolsTVL function
  const allPoolsTVL = useGSCTPoolsAllTVL(poolAddress);

  useEffect(() => {
    const calculateUSDValues = async () => {
      if (!allPoolsTVL.data || allPoolsTVL.isLoading) {
        return;
      }

      setIsLoading(true);
      setError(undefined);

      try {
        // Get the underlying token prices for TVL calculation
        const tokenAddresses = [
          CONTRACT_ADDRESSES.SCT, // SCT token
          CONTRACT_ADDRESSES.GSCT, // GSCT token  
          CONTRACT_ADDRESSES.HYPE, // HYPE token
        ].filter(Boolean) as string[];
        
        const prices = await getMultipleTokenPrices(tokenAddresses as any[]);
        
        console.log('Underlying token prices for TVL calculation:', prices);

        // Calculate TVL for each pool using the contract's TVL data
        const calculatedPools: GSCTPoolUSDData[] = [];
        
        // Pool 0: SCT/HYPE
        try {
          const pool0TVL = calculateTVLFromContractData(
            GSCT_POOLS[0].pair,
            allPoolsTVL.data[0] || BigInt(0),
            prices
          );
          calculatedPools.push({
            pid: 0,
            pair: GSCT_POOLS[0].pair,
            stakedLPWei: allPoolsTVL.data[0] || BigInt(0),
            totalPoolTVL: pool0TVL,
            priceSource: 'contract-tvl',
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to calculate Pool 0 TVL:', error);
          calculatedPools.push({
            pid: 0,
            pair: GSCT_POOLS[0].pair,
            stakedLPWei: allPoolsTVL.data[0] || BigInt(0),
            totalPoolTVL: 0,
            priceSource: 'error',
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        // Pool 1: GSCT/HYPE
        try {
          const pool1TVL = calculateTVLFromContractData(
            GSCT_POOLS[1].pair,
            allPoolsTVL.data[1] || BigInt(0),
            prices
          );
          calculatedPools.push({
            pid: 1,
            pair: GSCT_POOLS[1].pair,
            stakedLPWei: allPoolsTVL.data[1] || BigInt(0),
            totalPoolTVL: pool1TVL,
            priceSource: 'contract-tvl',
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to calculate Pool 1 TVL:', error);
          calculatedPools.push({
            pid: 1,
            pair: GSCT_POOLS[1].pair,
            stakedLPWei: allPoolsTVL.data[1] || BigInt(0),
            totalPoolTVL: 0,
            priceSource: 'contract-tvl',
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        console.log('GSCT Pools TVL calculation:', calculatedPools);
        setPoolsData(calculatedPools);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to calculate USD values';
        setError(errorMessage);
        console.error('Error calculating GSCT USD TVL:', err);
      } finally {
        setIsLoading(false);
      }
    };

    calculateUSDValues();
  }, [allPoolsTVL.data, allPoolsTVL.isLoading]);

  // Calculate total USD TVL
  const totalTVLUSD = poolsData.reduce((sum, pool) => sum + pool.totalPoolTVL, 0);

  return {
    totalTVLUSD,
    pools: poolsData,
    isLoading: isLoading || allPoolsTVL.isLoading,
    error: error || allPoolsTVL.error?.message,
  };
};

// Calculate TVL from contract data using token prices
// This is similar to how Awakening calculates TVL
function calculateTVLFromContractData(pair: string, stakedLP: bigint, prices: Record<string, any>): number {
  const stakedLPHuman = Number(stakedLP) / 1e18;
  
  console.log('Calculating TVL for pair:', pair, 'staked LP:', stakedLPHuman);
  
  if (pair === 'SCT/HYPE') {
    // SCT/HYPE LP - calculate based on token prices
    const sctPrice = prices[CONTRACT_ADDRESSES.SCT]?.priceUsd || 0;
    const hypePrice = prices[CONTRACT_ADDRESSES.HYPE]?.priceUsd || 0;
    
    if (sctPrice > 0 && hypePrice > 0) {
      // For SCT/HYPE, assume roughly equal value in both tokens
      // This is a simplified approach - in production you'd want actual LP reserves
      const estimatedValuePerLP = (sctPrice + hypePrice) / 2;
      const tvl = stakedLPHuman * estimatedValuePerLP;
      
      console.log('SCT/HYPE TVL calculation:', {
        sctPrice,
        hypePrice,
        estimatedValuePerLP,
        stakedLPHuman,
        tvl
      });
      
      return tvl;
    }
  } else if (pair === 'gSCT/HYPE') {
    // GSCT/HYPE LP - calculate based on token prices
    const gsctPrice = prices[CONTRACT_ADDRESSES.GSCT]?.priceUsd || 0;
    const hypePrice = prices[CONTRACT_ADDRESSES.HYPE]?.priceUsd || 0;
    
    if (gsctPrice > 0 && hypePrice > 0) {
      // For GSCT/HYPE, assume 70/30 split (GSCT/HYPE)
      const estimatedValuePerLP = (gsctPrice * 0.7) + (hypePrice * 0.3);
      const tvl = stakedLPHuman * estimatedValuePerLP;
      
      console.log('GSCT/HYPE TVL calculation:', {
        gsctPrice,
        hypePrice,
        estimatedValuePerLP,
        stakedLPHuman,
        tvl
      });
      
      return tvl;
    }
  }
  
  // Fallback: use a conservative estimate
  console.log('Using fallback TVL calculation for:', pair);
  return stakedLPHuman * 10; // Assume $10 per LP token as fallback
}

// Individual pool hook for specific pool data
export const useGSCTPoolUSDData = (poolAddress: string, pid: number): GSCTPoolUSDData | null => {
  const { pools } = useRealGSCTUSDTVL(poolAddress);
  return pools.find(pool => pool.pid === pid) || null;
};
