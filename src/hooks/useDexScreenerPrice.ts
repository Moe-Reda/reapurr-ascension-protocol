import { useState, useCallback } from 'react';
import { useVisibilityAwarePolling } from './useVisibilityAwarePolling';

// DexScreener API types
interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
  };
  priceChange: {
    h24: number;
    h6: number;
    h1: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  pairCreatedAt: number;
}

interface DexScreenerResponse {
  pairs: DexScreenerPair[];
}

// DexScreener API hook
export const useDexScreenerPrice = (tokenAddress: string) => {
  const [data, setData] = useState<DexScreenerPair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') return;

    setIsLoading(true);
    setError(null);
    try {
      const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }
      const result: DexScreenerResponse = await response.json();
      if (result.pairs && result.pairs.length > 0) {
        // Find the best pair (highest liquidity)
        const bestPair = result.pairs.reduce((best, current) => {
          return (current.liquidity.usd > best.liquidity.usd) ? current : best;
        });
        setData(bestPair);
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch price'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress]);

  const { isVisible, isPolling } = useVisibilityAwarePolling(fetchPrice, {
    interval: 30000, // 30 seconds
    enabled: !!tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000',
    immediate: true,
  });

  return {
    data,
    isLoading,
    error,
    priceUsd: data?.priceUsd ? parseFloat(data.priceUsd) : 0,
    priceChange24h: data?.priceChange?.h24 || 0,
    volume24h: data?.volume?.h24 || 0,
    liquidity: data?.liquidity?.usd || 0,
    isVisible,
    isPolling,
  };
}; 