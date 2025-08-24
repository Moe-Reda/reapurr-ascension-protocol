import React, { useState, useEffect } from 'react';
import { useOraclePrice, useOracleTWAP } from '../hooks/useContracts';
import { getDexScreenerPrice } from '../lib/tokenPricing';
import { CONTRACT_ADDRESSES } from '../lib/contracts';
import { formatEther } from '../lib/contracts';

const PriceTicker = () => {
  const [hypePrice, setHypePrice] = useState<number>(0);
  const [isLoadingHype, setIsLoadingHype] = useState(true);

  // Get SCT price from Oracle (relative to HyPE)
  const sctOraclePrice = useOraclePrice(CONTRACT_ADDRESSES.SCT);
  const sctTWAP = useOracleTWAP(CONTRACT_ADDRESSES.SCT);

  // Fetch HyPE price using the updated DexScreener function
  useEffect(() => {
    const fetchHypePrice = async () => {
      try {
        setIsLoadingHype(true);
        const price = await getDexScreenerPrice(CONTRACT_ADDRESSES.HYPE);
        setHypePrice(price);
      } catch (error) {
        console.error('Failed to fetch HYPE price:', error);
        setHypePrice(0);
      } finally {
        setIsLoadingHype(false);
      }
    };

    fetchHypePrice();
    
    // Refresh price every 30 seconds
    const interval = setInterval(fetchHypePrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate SCT price in USD: SCT/HyPE × HyPE/USD
  const calculateSCTPriceUSD = () => {
    if (sctOraclePrice.data && hypePrice > 0) {
      const sctPriceInHype = Number(formatEther(sctOraclePrice.data as bigint));
      return sctPriceInHype * hypePrice;
    }
    return 0;
  };

  // Format prices
  const sctPriceUSD = calculateSCTPriceUSD();
  const sctPriceFormatted = sctPriceUSD > 0 ? `$${sctPriceUSD.toFixed(6)}` : '$0.00';
  const hypePriceFormatted = hypePrice > 0 ? `$${hypePrice.toFixed(6)}` : '$0.00';

  // Loading state
  const isLoading = sctOraclePrice.isLoading || sctTWAP.isLoading || isLoadingHype;

  return (
    <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
      {isLoading ? (
        <div className="flex items-center gap-4">
          <div className="animate-pulse bg-white/20 h-4 w-16 rounded"></div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="animate-pulse bg-white/20 h-4 w-16 rounded"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <img 
              src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=24&h=24&fit=crop&crop=center" 
              alt="SCT"
              className="w-5 h-5 rounded-full"
            />
            <span className="font-data text-sm text-white">{sctPriceFormatted}</span>
          </div>
          
          <div className="w-px h-4 bg-white/20 mx-3"></div>
          
          <div className="flex items-center gap-2">
            <img 
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=24&h=24&fit=crop&crop=center" 
              alt="HyPE"
              className="w-5 h-5 rounded-full"
            />
            <span className="font-data text-sm text-white">{hypePriceFormatted}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default PriceTicker;
