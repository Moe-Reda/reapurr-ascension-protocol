import { useState, useEffect } from 'react';
import { useGenesisPoolsAllTVL } from './useContracts';
import { getCachedTokenUSDPrice, getMultipleTokenPrices } from '../lib/tokenPricing';
import { CONTRACT_ADDRESSES } from '../lib/contracts';

export interface PoolUSDData {
  pid: number;
  tokenAddress: string;
  asset: string;
  tvlWei: bigint;
  tvlUSD: number;
  priceUSD: number;
  priceSource: string;
  isLoading: boolean;
  error?: string;
}

export interface TotalUSDData {
  totalTVLUSD: number;
  pools: PoolUSDData[];
  isLoading: boolean;
  error?: string;
}

// Genesis pool configuration
const GENESIS_POOLS = [
  {
    pid: 0,
    asset: 'SCT/HYPE',
    tokenAddress: CONTRACT_ADDRESSES.SCTHYPE || '0x0000000000000000000000000000000000000000',
  },
  {
    pid: 1,
    asset: 'PURR',
    tokenAddress: CONTRACT_ADDRESSES.PURR || '0x0000000000000000000000000000000000000000',
  },
  {
    pid: 2,
    asset: 'USDC',
    tokenAddress: CONTRACT_ADDRESSES.USDC || '0x0000000000000000000000000000000000000000',
  },
  {
    pid: 3,
    asset: 'HYPE',
    tokenAddress: CONTRACT_ADDRESSES.HYPE || '0x0000000000000000000000000000000000000000',
  },
];

export const useRealUSDTVL = (poolAddress: string): TotalUSDData => {
  const [poolsData, setPoolsData] = useState<PoolUSDData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  // Get TVL data from contract
  const allPoolsTVL = useGenesisPoolsAllTVL(poolAddress);

  useEffect(() => {
    const calculateUSDValues = async () => {
      if (!allPoolsTVL.data || allPoolsTVL.isLoading) {
        return;
      }

      setIsLoading(true);
      setError(undefined);

      try {
        // Create pool data with TVL values
        const poolsWithTVL = GENESIS_POOLS.map((pool, index) => ({
          ...pool,
          tvlWei: allPoolsTVL.data[index] || BigInt(0),
        }));

        console.log('Pools With TVL', poolsWithTVL);

        // Get USD prices for all tokens
        const tokenAddresses = poolsWithTVL.map(pool => pool.tokenAddress);
        const prices = await getMultipleTokenPrices(tokenAddresses as any[]);

        console.log('Prices', prices);

        // Calculate USD values for each pool
        const calculatedPools: PoolUSDData[] = poolsWithTVL.map((pool, index) => {
          const priceData = prices[pool.tokenAddress];
          const tvlWei = pool.tvlWei;
          
          if (priceData.source === 'error') {
            return {
              pid: pool.pid,
              tokenAddress: pool.tokenAddress,
              asset: pool.asset,
              tvlWei,
              tvlUSD: 0,
              priceUSD: 0,
              priceSource: 'error',
              isLoading: false,
              error: priceData.error,
            };
          }

          const priceUSD = priceData.priceUsd;
          const tvlNumber = Number(tvlWei) / 1e18;
          const tvlUSD = tvlNumber * priceUSD;

          return {
            pid: pool.pid,
            tokenAddress: pool.tokenAddress,
            asset: pool.asset,
            tvlWei,
            tvlUSD,
            priceUSD,
            priceSource: priceData.source,
            isLoading: false,
          };
        });

        setPoolsData(calculatedPools);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to calculate USD values';
        setError(errorMessage);
        console.error('Error calculating USD TVL:', err);
      } finally {
        setIsLoading(false);
      }
    };

    calculateUSDValues();
  }, [allPoolsTVL.data, allPoolsTVL.isLoading]);

  // Calculate total USD TVL
  const totalTVLUSD = poolsData.reduce((sum, pool) => sum + pool.tvlUSD, 0);

  return {
    totalTVLUSD,
    pools: poolsData,
    isLoading: isLoading || allPoolsTVL.isLoading,
    error: error || allPoolsTVL.error?.message,
  };
};

// Individual pool hook for specific pool data
export const usePoolUSDData = (poolAddress: string, pid: number): PoolUSDData | null => {
  const { pools } = useRealUSDTVL(poolAddress);
  return pools.find(pool => pool.pid === pid) || null;
};
