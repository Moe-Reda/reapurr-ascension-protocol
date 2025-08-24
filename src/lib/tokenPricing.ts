/**
 * Token Pricing Module
 * 
 * This module handles token price fetching from various sources:
 * - DexScreener API for most tokens
 * - Oracle for SCT token
 * - LP token reserves calculation for liquidity pool tokens
 * 
 * LP Token Calculation Logic:
 * - GSCT-HYPE LP: Calculate GSCT price through LP reserves (HYPE per GSCT * HYPE USD price)
 * - SCT-HYPE LP: Use oracle for SCT price, DexScreener for HYPE price
 * - Other LP tokens: Calculate normally from reserves using underlying token prices
 * 
 * Key Features:
 * - Proper decimal handling for all token calculations
 * - Comprehensive validation and error handling
 * - Debugging utilities for LP token troubleshooting
 * - Retry logic for RPC rate limiting
 */

import { createPublicClient, http, parseAbi, type Address, type PublicClient } from 'viem';
import { CONTRACT_ADDRESSES, NETWORKS, getPriceFetchAddress } from './contracts';

// Types for token pricing
export interface TokenPrice {
  priceUsd: number;
  source: 'dexscreener' | 'oracle' | 'lp-reserves' | 'gsct-lp' | 'error';
  timestamp: number;
  error?: string;
}

export interface LPTokenInfo {
  token0: Address;
  token1: Address;
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
  decimals: number;
}

// ABI for LP token operations
const LP_ABI = parseAbi([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112, uint112, uint32)',
  'function totalSupply() view returns (uint256)',
  'function decimals() view returns (uint8)',
]);

// ABI for ERC20 operations
const ERC20_ABI = parseAbi([
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]);

// ABI for Oracle operations
const ORACLE_ABI = parseAbi([
  'function consult(address token, uint256 amountIn) view returns (uint256 amountOut)',
]);

// Create public client for HyperEVM
const createHyperEVMClient = (): PublicClient => {
  // Use NETWORKS configuration from contracts file, with fallback
  const rpcUrl = NETWORKS[998].rpcUrl || 'https://rpc.hyperliquid-testnet.xyz/evm';
  const blockExplorer = NETWORKS[998].blockExplorer || 'https://testnet.purrsec.com';
  
  return createPublicClient({
    chain: {
      id: 998,
      name: 'HyperEVM Testnet',
      network: 'hyperevm-testnet',
      nativeCurrency: {
        decimals: 18,
        name: 'HyPE',
        symbol: 'HyPE',
      },
      rpcUrls: {
        public: { http: [rpcUrl] },
        default: { http: [rpcUrl] },
      },
      blockExplorers: {
        default: { name: 'Purrsec', url: blockExplorer },
      },
    },
    transport: http(),
  }) as any;
};

// DexScreener API call with mainnet address mapping
type DexPair = {
    chainId?: string;
    priceUsd?: string;
    liquidity?: { usd?: number };
    baseToken?: { address?: string; symbol?: string };
    quoteToken?: { address?: string; symbol?: string };
    dexId?: string;
  };
  
  const DEXSCREENER_URL = "https://api.dexscreener.com/latest/dex/tokens";
  const CHAIN_ID = "hyperevm";         // adjust if Dexscreener uses a different string
  const STABLES = new Set(["USDC", "USDT"]);
  const MIN_LIQ_USD = 5_000;
  
  function pickBestPair(pairs: DexPair[]): DexPair | undefined {
    // 1) Filter usable pairs
    const usable = pairs.filter(
      p =>
        (p.chainId === CHAIN_ID || p.chainId === "hyperliquid") &&
        p.priceUsd &&
        Number.isFinite(Number(p.priceUsd))
    );
  
    if (!usable.length) return undefined;
  
    // 2) Prioritize Hyperswap and Hyperliquid pairs
    const hyperswapPairs = usable.filter(p => p.dexId?.toLowerCase() === 'hyperswap');
    const hyperliquidPairs = usable.filter(p => 
      p.dexId?.toLowerCase() === 'hyperliquid' || p.chainId === 'hyperliquid'
    );
    const otherPairs = usable.filter(p => 
      p.dexId?.toLowerCase() !== 'hyperswap' && 
      p.dexId?.toLowerCase() !== 'hyperliquid' && 
      p.chainId !== 'hyperliquid'
    );
    
    // 3) Prefer stable-quoted within each group
    const stableQuotedHyperswap = hyperswapPairs.filter(p => STABLES.has(p.quoteToken?.symbol ?? ""));
    const stableQuotedHyperliquid = hyperliquidPairs.filter(p => STABLES.has(p.quoteToken?.symbol ?? ""));
    const stableQuotedOther = otherPairs.filter(p => STABLES.has(p.quoteToken?.symbol ?? ""));
    
    // 4) Pick highest liquidity, prioritizing Hyperswap > Hyperliquid > Others
    let pool = stableQuotedHyperswap.length ? stableQuotedHyperswap : hyperswapPairs;
    if (!pool.length) {
      pool = stableQuotedHyperliquid.length ? stableQuotedHyperliquid : hyperliquidPairs;
    }
    if (!pool.length) {
      pool = stableQuotedOther.length ? stableQuotedOther : otherPairs;
    }
    
    pool.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
    return pool[0];
  }
  
  export async function getDexScreenerPrice(tokenAddress: string): Promise<number> {
    // USDC is always $1.00 - no need to query
    if (tokenAddress.toLowerCase() === CONTRACT_ADDRESSES.USDC?.toLowerCase()) {
      return 1.00;
    }
    
    // If on testnet, map to mainnet address that Dexscreener knows about
    const priceFetchAddress = getPriceFetchAddress(tokenAddress);
  
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 7_000); // 7s timeout
  
    try {
      const res = await fetch(`${DEXSCREENER_URL}/${priceFetchAddress}`, {
        signal: controller.signal,
        headers: { "accept": "application/json" }
      });
  
      if (res.status === 429) {
        throw new Error("Dexscreener rate-limited (429)");
      }
      if (!res.ok) {
        throw new Error(`Dexscreener HTTP ${res.status}`);
      }
  
      const json = await res.json();
      const pairs: DexPair[] = Array.isArray(json?.pairs) ? json.pairs : [];
      const best = pickBestPair(pairs);
      if (!best) {
        throw new Error("No suitable pairs with priceUsd found on DexScreener");
      }

      const usd = Number(best.priceUsd);
      if (!Number.isFinite(usd)) throw new Error("Invalid priceUsd");
      return usd;
    } catch (err) {
      throw new Error(
        `Dexscreener price fetch failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      clearTimeout(t);
    }
  }
  

// Utility function to retry RPC calls with exponential backoff
async function retryRPCCall<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if it's a rate limit error
      const isRateLimited = lastError.message.toLowerCase().includes('rate limit') || 
                           lastError.message.toLowerCase().includes('rate limited');
      
      if (attempt === maxRetries || !isRateLimited) {
        throw lastError;
      }
      
      // Wait with exponential backoff for rate limited requests
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Get LP token reserves and info with retry logic
async function getLPTokenInfo(lpAddress: Address, client: PublicClient): Promise<LPTokenInfo> {
  try {
    const [token0, token1, reserves, totalSupply, decimals] = await Promise.all([
      retryRPCCall(() => client.readContract({
        address: lpAddress,
        abi: LP_ABI,
        functionName: 'token0',
      })),
      retryRPCCall(() => client.readContract({
        address: lpAddress,
        abi: LP_ABI,
        functionName: 'token1',
      })),
      retryRPCCall(() => client.readContract({
        address: lpAddress,
        abi: LP_ABI,
        functionName: 'getReserves',
      })),
      retryRPCCall(() => client.readContract({
        address: lpAddress,
        abi: LP_ABI,
        functionName: 'totalSupply',
      })),
      retryRPCCall(() => client.readContract({
        address: lpAddress,
        abi: LP_ABI,
        functionName: 'decimals',
      })),
    ]);

    const [reserve0, reserve1] = reserves;
    
    return {
      token0,
      token1,
      reserve0,
      reserve1,
      totalSupply,
      decimals,
    };
  } catch (error) {
    throw new Error(`Failed to get LP token info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Calculate LP token price from reserves
async function calculateLPPrice(
  lpAddress: Address,
  client: PublicClient,
  getTokenPrice: (address: Address) => Promise<number>
): Promise<number> {
  try {
    const lpInfo = await getLPTokenInfo(lpAddress, client);
    
    console.log('LP Info:', {
      token0: lpInfo.token0,
      token1: lpInfo.token1,
      reserve0: lpInfo.reserve0.toString(),
      reserve1: lpInfo.reserve1.toString(),
      totalSupply: lpInfo.totalSupply.toString(),
      lpDecimals: lpInfo.decimals
    });
    
    // Validate LP token data
    if (lpInfo.totalSupply === BigInt(0)) {
      throw new Error('LP token has zero total supply');
    }
    
    if (lpInfo.reserve0 === BigInt(0) || lpInfo.reserve1 === BigInt(0)) {
      throw new Error('LP token has zero reserves');
    }
    
    // Get token decimals for proper reserve calculation
    const [token0Decimals, token1Decimals] = await Promise.all([
      retryRPCCall(() => client.readContract({
        address: lpInfo.token0,
        abi: ERC20_ABI,
        functionName: 'decimals',
      })),
      retryRPCCall(() => client.readContract({
        address: lpInfo.token1,
        abi: ERC20_ABI,
        functionName: 'decimals',
      })),
    ]);
    
    console.log('Token decimals:', { token0Decimals, token1Decimals });
    
    // Validate token decimals
    if (token0Decimals < 0 || token0Decimals > 255 || token1Decimals < 0 || token1Decimals > 255) {
      throw new Error(`Invalid token decimals: token0=${token0Decimals}, token1=${token1Decimals}`);
    }
    
    // Get prices of underlying tokens
    const [price0, price1] = await Promise.all([
      getTokenPrice(lpInfo.token0),
      getTokenPrice(lpInfo.token1),
    ]);
    
    console.log('Token prices:', { price0, price1 });
    
    // Validate token prices
    if (!Number.isFinite(price0) || price0 <= 0 || !Number.isFinite(price1) || price1 <= 0) {
      throw new Error(`Invalid token prices: price0=${price0}, price1=${price1}`);
    }
    
    // Calculate total value of reserves using actual token decimals
    const reserve0Value = (Number(lpInfo.reserve0) / Math.pow(10, token0Decimals)) * price0;
    const reserve1Value = (Number(lpInfo.reserve1) / Math.pow(10, token1Decimals)) * price1;
    const totalReserveValue = reserve0Value + reserve1Value;
    
    console.log('Reserve values:', { reserve0Value, reserve1Value, totalReserveValue });
    
    // Validate reserve values
    if (!Number.isFinite(reserve0Value) || !Number.isFinite(reserve1Value) || !Number.isFinite(totalReserveValue)) {
      throw new Error(`Invalid reserve values calculated: reserve0Value=${reserve0Value}, reserve1Value=${reserve1Value}, totalReserveValue=${totalReserveValue}`);
    }
    
    if (totalReserveValue <= 0) {
      throw new Error(`Total reserve value must be positive: ${totalReserveValue}`);
    }
    
    // Calculate LP token price
    const lpTokenSupply = Number(lpInfo.totalSupply) / Math.pow(10, lpInfo.decimals);
    const lpTokenPrice = totalReserveValue / lpTokenSupply;
    
    console.log('LP calculation:', { lpTokenSupply, lpTokenPrice });
    
    // Validate the result
    if (!Number.isFinite(lpTokenPrice) || lpTokenPrice <= 0) {
      throw new Error(`Invalid LP token price calculated: ${lpTokenPrice}`);
    }
    
    return lpTokenPrice;
  } catch (error) {
    console.error('LP price calculation error:', error);
    throw new Error(`Failed to calculate LP price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get SCT price from oracle
async function getSCTPriceFromOracle(client: PublicClient): Promise<number> {
  try {
    if (!CONTRACT_ADDRESSES.Oracle || !CONTRACT_ADDRESSES.SCT || !CONTRACT_ADDRESSES.HYPE) {
      throw new Error('Oracle or token addresses not configured');
    }
    
    // Get SCT/HYPE price from oracle (amount of HYPE for 1 SCT)
    const sctHypePrice = await client.readContract({
      address: CONTRACT_ADDRESSES.Oracle as Address,
      abi: ORACLE_ABI,
      functionName: 'consult',
      args: [CONTRACT_ADDRESSES.SCT as Address, BigInt(1e18)], // 1 SCT
    });
    
    // Convert to number (assuming 18 decimals)
    const sctHypeRatio = Number(sctHypePrice) / 1e18;
    
    // Get HYPE/USD price from DexScreener
    const hypeUsdPrice = await getDexScreenerPrice(CONTRACT_ADDRESSES.HYPE);
    
    // Calculate SCT/USD price
    const sctUsdPrice = sctHypeRatio * hypeUsdPrice;
    
    return sctUsdPrice;
  } catch (error) {
    throw new Error(`Failed to get SCT price from oracle: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Check if token is an LP token
function isLPToken(symbol: string, address: Address): boolean {
  const lpPatterns = ['LP'];
  const isLPSymbol = lpPatterns.some(pattern => symbol.toUpperCase().includes(pattern));
  
  // Also check if this is a known LP token address
  const knownLPAddresses = [
    CONTRACT_ADDRESSES.SCTHYPE, // SCT-HYPE LP
    CONTRACT_ADDRESSES.GSCTHYPE, // GSCT-HYPE LP
  ].filter(Boolean);
  
  return isLPSymbol || knownLPAddresses.includes(address);
}

// Check if token is a protocol token
function isProtocolToken(address: Address): boolean {
  const protocolTokens = [
    CONTRACT_ADDRESSES.SCT,
    CONTRACT_ADDRESSES.BSCT,
    CONTRACT_ADDRESSES.GSCT,
    CONTRACT_ADDRESSES.HYPE,
  ].filter(Boolean);
  
  return protocolTokens.includes(address);
}

// Calculate GSCT price through GSCT/HYPE LP reserves
async function calculateGSCTPriceFromLP(client: PublicClient): Promise<number> {
  try {
    if (!CONTRACT_ADDRESSES.GSCTHYPE) {
      throw new Error('GSCT-HYPE LP address not configured');
    }
    
    // Get LP token info
    const lpInfo = await getLPTokenInfo(CONTRACT_ADDRESSES.GSCTHYPE as Address, client);
    
    // Determine which token is GSCT and which is HYPE
    let gsctReserve: bigint;
    let hypeReserve: bigint;
    let gsctDecimals: number;
    let hypeDecimals: number;
    
    // Check which token is GSCT by comparing addresses
    if (lpInfo.token0.toLowerCase() === CONTRACT_ADDRESSES.GSCT?.toLowerCase()) {
      gsctReserve = lpInfo.reserve0;
      hypeReserve = lpInfo.reserve1;
      gsctDecimals = await retryRPCCall(() => client.readContract({
        address: lpInfo.token0,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }));
      hypeDecimals = await retryRPCCall(() => client.readContract({
        address: lpInfo.token1,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }));
    } else if (lpInfo.token1.toLowerCase() === CONTRACT_ADDRESSES.GSCT?.toLowerCase()) {
      gsctReserve = lpInfo.reserve1;
      hypeReserve = lpInfo.reserve0;
      gsctDecimals = await retryRPCCall(() => client.readContract({
        address: lpInfo.token1,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }));
      hypeDecimals = await retryRPCCall(() => client.readContract({
        address: lpInfo.token0,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }));
    } else {
      throw new Error('GSCT token not found in GSCT-HYPE LP');
    }
    
    // Normalize reserves to human-readable amounts
    const gsctAmount = Number(gsctReserve) / Math.pow(10, gsctDecimals);
    const hypeAmount = Number(hypeReserve) / Math.pow(10, hypeDecimals);
    
    // Calculate HYPE per GSCT rate
    const hypePerGSCT = hypeAmount / gsctAmount;
    
    // Get HYPE USD price from DexScreener
    const hypeUsdPrice = await getDexScreenerPrice(CONTRACT_ADDRESSES.HYPE as Address);
    
    // Calculate GSCT USD price: HYPE per GSCT * HYPE USD price
    const gsctUsdPrice = hypePerGSCT * hypeUsdPrice;
    
    console.log('GSCT price calculation:', {
      gsctAmount,
      hypeAmount,
      hypePerGSCT,
      hypeUsdPrice,
      gsctUsdPrice
    });
    
    return gsctUsdPrice;
  } catch (error) {
    throw new Error(`Failed to calculate GSCT price from LP: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Main token pricing function
export async function getTokenUSDPrice(tokenAddress: Address): Promise<TokenPrice> {
  const timestamp = Date.now();
  const client = createHyperEVMClient();
  
  try {
    // Get token symbol to determine type
    const symbol = await client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'symbol',
    });
    // Handle GSCT - calculate price through GSCT/HYPE LP reserves
    if (symbol === 'GSCT') {
      try {
        const price = await calculateGSCTPriceFromLP(client);
        return {
          priceUsd: price,
          source: 'gsct-lp',
          timestamp,
        };
      } catch (error) {
        return {
          priceUsd: 0,
          source: 'error',
          timestamp,
          error: `Failed to get GSCT price from LP: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }
    
    // Handle HYPE - always use DexScreener to avoid circular dependencies
    if (symbol === 'HYPE') {
      try {
        const price = await getDexScreenerPrice(tokenAddress);
        return {
          priceUsd: price,
          source: 'dexscreener',
          timestamp,
        };
      } catch (error) {
        return {
          priceUsd: 0,
          source: 'error',
          timestamp,
          error: `Failed to get HYPE price: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }
    
    // Handle SCT (TOMB equivalent) - price from oracle then multiply by HYPE/USD
    if (symbol === 'SCT') {
      try {
        const price = await getSCTPriceFromOracle(client);
        return {
          priceUsd: price,
          source: 'oracle',
          timestamp,
        };
      } catch (error) {
        console.log('Oracle failed for SCT, error:', error);
        // For SCT, we should not fallback to DexScreener as it's a protocol token
        // that should use the oracle. Return error instead.
        return {
          priceUsd: 0,
          source: 'error',
          timestamp,
          error: `Oracle failed for SCT: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }
    
    // Handle LP tokens - compute price from reserves
    if (isLPToken(symbol, tokenAddress)) {
      try {
        const price = await calculateLPPrice(tokenAddress, client, async (address) => {
          // For SCT, use oracle instead of DexScreener
          if (address === CONTRACT_ADDRESSES.SCT) {
            try {
              const sctPrice = await getSCTPriceFromOracle(client);
              return sctPrice
            } catch (oracleError) {
              console.log('Oracle failed for SCT in LP calculation:', oracleError);
              throw new Error('SCT oracle failed, cannot calculate LP price');
            }
          }
          // For GSCT, use LP calculation instead of DexScreener
          if (address === CONTRACT_ADDRESSES.GSCT) {
            try {
              return await calculateGSCTPriceFromLP(client);
            } catch (lpError) {
              console.log('GSCT LP calculation failed:', lpError);
              throw new Error('GSCT LP calculation failed, cannot calculate LP price');
            }
          }
          console.log('GetToken: Address', address);
          return await getDexScreenerPrice(address);
        });
        
        return {
          priceUsd: price,
          source: 'lp-reserves',
          timestamp,
        };
      } catch (error) {
        console.log('LP price calculation failed:', error);
        
        // For LP tokens, don't fallback to DexScreener as it won't give accurate LP token prices
        return {
          priceUsd: 0,
          source: 'error',
          timestamp,
          error: `LP price calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }
    
    // Handle non-protocol, non-LP tokens - get price from DexScreener
    if (!isProtocolToken(tokenAddress)) {
      const price = await getDexScreenerPrice(tokenAddress);
      return {
        priceUsd: price,
        source: 'dexscreener',
        timestamp,
      };
    }
    
    // Default fallback for protocol tokens - use DexScreener
    const price = await getDexScreenerPrice(tokenAddress);
    return {
      priceUsd: price,
      source: 'dexscreener',
      timestamp,
    };
    
  } catch (error) {
    return {
      priceUsd: 0,
      source: 'error',
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Utility function to get multiple token prices
export async function getMultipleTokenPrices(tokenAddresses: Address[]): Promise<Record<string, TokenPrice>> {
  const results: Record<string, TokenPrice> = {};
  
  // Process tokens in parallel for better performance
  const promises = tokenAddresses.map(async (address) => {
    const price = await getTokenUSDPrice(address);
    return { address, price };
  });
  
  const resolved = await Promise.allSettled(promises);
  
  resolved.forEach((result, index) => {
    const address = tokenAddresses[index];
    if (result.status === 'fulfilled') {
      results[address] = result.value.price;
    } else {
      results[address] = {
        priceUsd: 0,
        source: 'error',
        timestamp: Date.now(),
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error occurred',
      };
    }
  });
  
  
  return results;
}

// Utility function to validate and debug LP token data
export async function debugLPToken(lpAddress: Address): Promise<{
  lpInfo: LPTokenInfo;
  token0Decimals: number;
  token1Decimals: number;
  token0Symbol: string;
  token1Symbol: string;
  reserve0Human: number;
  reserve1Human: number;
  totalSupplyHuman: number;
}> {
  const client = createHyperEVMClient();
  
  try {
    const lpInfo = await getLPTokenInfo(lpAddress, client);
    
    const [token0Decimals, token1Decimals, token0Symbol, token1Symbol] = await Promise.all([
      retryRPCCall(() => client.readContract({
        address: lpInfo.token0,
        abi: ERC20_ABI,
        functionName: 'decimals',
      })),
      retryRPCCall(() => client.readContract({
        address: lpInfo.token1,
        abi: ERC20_ABI,
        functionName: 'decimals',
      })),
      retryRPCCall(() => client.readContract({
        address: lpInfo.token0,
        abi: ERC20_ABI,
        functionName: 'symbol',
      })),
      retryRPCCall(() => client.readContract({
        address: lpInfo.token1,
        abi: ERC20_ABI,
        functionName: 'symbol',
      })),
    ]);
    
    return {
      lpInfo,
      token0Decimals,
      token1Decimals,
      token0Symbol,
      token1Symbol,
      reserve0Human: Number(lpInfo.reserve0) / Math.pow(10, token0Decimals),
      reserve1Human: Number(lpInfo.reserve1) / Math.pow(10, token1Decimals),
      totalSupplyHuman: Number(lpInfo.totalSupply) / Math.pow(10, lpInfo.decimals),
    };
  } catch (error) {
    throw new Error(`Failed to debug LP token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Cache for token prices to avoid repeated API calls
const priceCache = new Map<string, { price: TokenPrice; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cached version of getTokenUSDPrice
export async function getCachedTokenUSDPrice(tokenAddress: Address): Promise<TokenPrice> {
  const now = Date.now();
  const cacheKey = tokenAddress.toLowerCase();
  
  // Check cache first
  const cached = priceCache.get(cacheKey);
  if (cached && now < cached.expiry) {
    return cached.price;
  }
  
  // Get fresh price
  const price = await getTokenUSDPrice(tokenAddress);
  
  // Cache the result
  priceCache.set(cacheKey, {
    price,
    expiry: now + CACHE_DURATION,
  });
  
  return price;
}

// Clear price cache
export function clearPriceCache(): void {
  priceCache.clear();
}

// Get cache statistics
export function getCacheStats(): { size: number; hitRate: number } {
  const now = Date.now();
  let validEntries = 0;
  let totalEntries = 0;
  
  priceCache.forEach((entry) => {
    totalEntries++;
    if (now < entry.expiry) {
      validEntries++;
    }
  });
  
  return {
    size: validEntries,
    hitRate: totalEntries > 0 ? validEntries / totalEntries : 0,
  };
}
