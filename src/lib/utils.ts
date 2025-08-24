import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format TVL value for consistent display across components
 * @param tvlUSD - TVL value in USD
 * @param isLoading - Whether the data is still loading
 * @returns Formatted TVL string
 */
export const formatTVL = (tvlUSD: number, isLoading: boolean = false): string => {
  if (isLoading) return '...';
  if (tvlUSD === 0) return '$0';
  
  return `$${tvlUSD.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format TVL from wei to human readable USD
 * @param tvlWei - TVL value in wei
 * @param priceUSD - Token price in USD
 * @returns Formatted TVL string
 */
export const formatTVLFromWei = (tvlWei: bigint | undefined, priceUSD: number): string => {
  if (!tvlWei || priceUSD === 0) return '$0';
  
  const tvlNumber = Number(tvlWei) / 1e18;
  const tvlUSD = tvlNumber * priceUSD;
  
  return formatTVL(tvlUSD);
};
