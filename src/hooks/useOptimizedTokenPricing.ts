import { useState, useEffect, useCallback, useRef } from 'react';
import { getMultipleTokenPrices, getCachedTokenUSDPrice } from '../lib/tokenPricing';
import { useVisibilityAwarePolling } from './useVisibilityAwarePolling';

export interface OptimizedTokenPrice {
  priceUsd: number;
  source: string;
  timestamp: number;
  isLoading: boolean;
  error?: string;
}

interface TokenPriceCache {
  [tokenAddress: string]: OptimizedTokenPrice;
}

interface RateLimitState {
  lastRequestTime: number;
  requestCount: number;
  isBlocked: boolean;
}

const RATE_LIMIT_CONFIG = {
  MAX_REQUESTS_PER_MINUTE: 30, // DexScreener rate limit
  MIN_INTERVAL_BETWEEN_REQUESTS: 2000, // 2 seconds between requests
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache
  BATCH_SIZE: 5, // Process tokens in batches
};

export const useOptimizedTokenPricing = (tokenAddresses: string[]) => {
  const [prices, setPrices] = useState<TokenPriceCache>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  
  const cacheRef = useRef<TokenPriceCache>({});
  const rateLimitRef = useRef<RateLimitState>({
    lastRequestTime: 0,
    requestCount: 0,
    isBlocked: false,
  });
  const lastFetchRef = useRef<number>(0);

  // Check if we can make a request based on rate limiting
  const canMakeRequest = useCallback((): boolean => {
    const now = Date.now();
    const { lastRequestTime, requestCount, isBlocked } = rateLimitRef.current;

    // Reset counter if a minute has passed
    if (now - lastRequestTime > 60000) {
      rateLimitRef.current.requestCount = 0;
      rateLimitRef.current.lastRequestTime = now;
    }

    // Check if we're blocked
    if (isBlocked) {
      if (now - lastRequestTime > 60000) {
        rateLimitRef.current.isBlocked = false;
        rateLimitRef.current.requestCount = 0;
      } else {
        return false;
      }
    }

    // Check rate limits
    if (requestCount >= RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE) {
      rateLimitRef.current.isBlocked = true;
      return false;
    }

    // Check minimum interval
    if (now - lastRequestTime < RATE_LIMIT_CONFIG.MIN_INTERVAL_BETWEEN_REQUESTS) {
      return false;
    }

    return true;
  }, []);

  // Fetch prices for tokens in batches
  const fetchPricesInBatches = useCallback(async (addresses: string[]) => {
    if (!canMakeRequest()) {
      console.log('Rate limit reached, skipping price fetch');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      // Process tokens in batches
      const batches = [];
      for (let i = 0; i < addresses.length; i += RATE_LIMIT_CONFIG.BATCH_SIZE) {
        batches.push(addresses.slice(i, i + RATE_LIMIT_CONFIG.BATCH_SIZE));
      }

      const newPrices: TokenPriceCache = { ...cacheRef.current };

      for (const batch of batches) {
        // Check rate limit before each batch
        if (!canMakeRequest()) {
          console.log('Rate limit reached during batch processing, pausing...');
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          continue;
        }

        // Update rate limit state
        rateLimitRef.current.lastRequestTime = Date.now();
        rateLimitRef.current.requestCount += 1;

        // Fetch prices for this batch
        const batchPrices = await getMultipleTokenPrices(batch as any[]);
        
        // Update cache with new prices
        Object.entries(batchPrices).forEach(([address, priceData]) => {
          if (priceData.source !== 'error') {
            newPrices[address] = {
              priceUsd: priceData.priceUsd,
              source: priceData.source,
              timestamp: Date.now(),
              isLoading: false,
            };
          } else {
            // Keep existing price if available, otherwise mark as error
            if (newPrices[address]) {
              newPrices[address].error = priceData.error;
              newPrices[address].isLoading = false;
            } else {
              newPrices[address] = {
                priceUsd: 0,
                source: 'error',
                timestamp: Date.now(),
                isLoading: false,
                error: priceData.error,
              };
            }
          }
        });

        // Small delay between batches to be respectful
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Update state and cache
      cacheRef.current = newPrices;
      setPrices(newPrices);
      lastFetchRef.current = Date.now();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch token prices';
      setError(errorMessage);
      console.error('Error fetching token prices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [canMakeRequest]);

  // Check cache validity and fetch if needed
  const fetchPricesIfNeeded = useCallback(async () => {
    const now = Date.now();
    const addressesToFetch: string[] = [];

    // Check which tokens need fresh prices
    tokenAddresses.forEach(address => {
      const cached = cacheRef.current[address];
      if (!cached || 
          now - cached.timestamp > RATE_LIMIT_CONFIG.CACHE_DURATION ||
          cached.source === 'error') {
        addressesToFetch.push(address);
      }
    });

    if (addressesToFetch.length > 0) {
      await fetchPricesInBatches(addressesToFetch);
    }
  }, [tokenAddresses, fetchPricesInBatches]);

  // Use visibility-aware polling
  const { isVisible, isPolling } = useVisibilityAwarePolling(fetchPricesIfNeeded, {
    interval: 300000, // 5 minutes - longer interval to reduce rate limiting
    enabled: true,
    immediate: false,
  });

  // Initial fetch
  useEffect(() => {
    if (tokenAddresses.length > 0) {
      fetchPricesIfNeeded();
    }
  }, [tokenAddresses, fetchPricesIfNeeded]);

  // Get price for a specific token
  const getTokenPrice = useCallback((address: string): OptimizedTokenPrice => {
    const cached = cacheRef.current[address];
    if (cached) {
      return {
        ...cached,
        isLoading: false,
      };
    }

    return {
      priceUsd: 0,
      source: 'unknown',
      timestamp: 0,
      isLoading: true,
    };
  }, []);

  // Get all prices
  const getAllPrices = useCallback((): TokenPriceCache => {
    return cacheRef.current;
  }, []);

  // Manual refresh function
  const refreshPrices = useCallback(async () => {
    await fetchPricesInBatches(tokenAddresses);
  }, [tokenAddresses, fetchPricesInBatches]);

  return {
    prices: cacheRef.current,
    isLoading,
    error,
    isVisible,
    isPolling,
    getTokenPrice,
    getAllPrices,
    refreshPrices,
    lastFetch: lastFetchRef.current,
    rateLimitInfo: rateLimitRef.current,
  };
};



