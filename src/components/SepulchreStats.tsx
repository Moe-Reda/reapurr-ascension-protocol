import React from 'react';
import { useProtocolStats, useMasonryEpoch, useMasonryNextEpochPoint, useMasonryTotalSupply, useTreasurySCTPrice } from '../hooks/useContracts';
import { formatEther } from '../lib/contracts';

const SepulchreStats = () => {
  // Get real protocol stats
  const protocolStats = useProtocolStats();
  const epoch = useMasonryEpoch();
  const nextEpochPoint = useMasonryNextEpochPoint();
  const totalStaked = useMasonryTotalSupply();
  const sctPrice = useTreasurySCTPrice();

  // Calculate time until next epoch
  const getTimeUntilNextEpoch = () => {
    if (!nextEpochPoint.data) return '--:--:--';
    
    const now = Math.floor(Date.now() / 1000);
    const nextEpoch = Number(nextEpochPoint.data);
    const timeLeft = nextEpoch - now;
    
    if (timeLeft <= 0) return '00:00:00';
    
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate APR (simplified calculation)
  const calculateAPR = () => {
    if (!sctPrice.data || !totalStaked.data) return '0.00';
    
    const price = Number(formatEther(sctPrice.data as bigint));
    const staked = Number(formatEther(totalStaked.data as bigint));
    
    if (staked === 0) return '0.00';
    
    // Simplified APR calculation (you may need to adjust based on your protocol)
    const dailyReward = 1000; // Example daily reward
    const dailyAPR = (dailyReward * price) / (staked * price) * 100;
    const annualAPR = dailyAPR * 365;
    
    return annualAPR.toFixed(2);
  };

  // Loading state
  const isLoading = protocolStats.isLoading || epoch.isLoading || nextEpochPoint.isLoading || totalStaked.isLoading || sctPrice.isLoading;

  if (isLoading) {
    return (
      <div className="glass p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-black/30 border border-white/10 rounded-lg p-4">
              <div className="animate-pulse">
                <div className="bg-white/20 h-4 w-20 rounded mb-2"></div>
                <div className="bg-white/20 h-8 w-16 rounded mb-1"></div>
                <div className="bg-white/20 h-3 w-24 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = {
    currentEpoch: epoch.data ? Number(epoch.data).toString() : '0',
    nextEpochTime: getTimeUntilNextEpoch(),
    totalStaked: totalStaked.data ? formatEther(totalStaked.data as bigint) : '0',
    totalStakedUSD: totalStaked.data && sctPrice.data ? 
      `$${(Number(formatEther(totalStaked.data as bigint)) * Number(formatEther(sctPrice.data as bigint))).toFixed(2)}` : '$0.00',
    lastSeigniorage: '0', // This would need to be fetched from Treasury events
    lastSeigniorageUSD: '0.00',
    lastTwap: sctPrice.data ? `$${formatEther(sctPrice.data as bigint)}` : '$0.00',
    twapPeg: '0% of peg', // Calculate peg percentage
    currentPrice: sctPrice.data ? `$${formatEther(sctPrice.data as bigint)}` : '$0.00',
    pricePeg: '0% of peg', // Calculate peg percentage
    currentAPR: `${calculateAPR()}%`,
    dailyAPR: `${(Number(calculateAPR()) / 365).toFixed(2)}%`
  };

  return (
    <div className="glass p-8 mb-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Epoch */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span className="font-nav text-sm opacity-80">Current Epoch</span>
          </div>
          <div className="font-data text-2xl text-yellow-400">{stats.currentEpoch}</div>
          <div className="font-nav text-xs opacity-60">Regular period</div>
        </div>

        {/* Next Epoch In */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span className="font-nav text-sm opacity-80">Next Epoch In</span>
          </div>
          <div className="font-fx text-2xl text-yellow-400">{stats.nextEpochTime}</div>
          <div className="font-nav text-xs opacity-60">07:00</div>
        </div>

        {/* Total gSCT Staked */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span className="font-nav text-sm opacity-80">Total Staked</span>
          </div>
          <div className="font-data text-2xl text-yellow-400">{stats.totalStaked}</div>
          <div className="font-nav text-xs opacity-60">{stats.totalStakedUSD}</div>
        </div>

        {/* Last Seigniorage */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span className="font-nav text-sm opacity-80">Last Seigniorage</span>
          </div>
          <div className="font-data text-2xl text-yellow-400">{stats.lastSeigniorage} SCT</div>
          <div className="font-nav text-xs opacity-60">{stats.lastSeigniorageUSD} USD</div>
        </div>

        {/* Last SCT TWAP */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span className="font-nav text-sm opacity-80">Last SCT TWAP</span>
          </div>
          <div className="font-data text-2xl text-yellow-400">{stats.lastTwap}</div>
          <div className="font-nav text-xs opacity-60">{stats.twapPeg}</div>
        </div>

        {/* Current SCT Price */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span className="font-nav text-sm opacity-80">Current SCT Price</span>
          </div>
          <div className="font-data text-2xl text-yellow-400">{stats.currentPrice}</div>
          <div className="font-nav text-xs opacity-60">{stats.pricePeg}</div>
        </div>

        {/* Current APR */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-green-400"></div>
            <span className="font-nav text-sm opacity-80">Current APR</span>
          </div>
          <div className="font-data text-2xl text-green-400">{stats.currentAPR}</div>
          <div className="font-nav text-xs opacity-60">Estimated annual return</div>
        </div>

        {/* Current Daily APR */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-green-400"></div>
            <span className="font-nav text-sm opacity-80">Current Daily APR</span>
          </div>
          <div className="font-data text-2xl text-green-400">{stats.dailyAPR}</div>
          <div className="font-nav text-xs opacity-60">Estimated daily return</div>
        </div>
      </div>
    </div>
  );
};

export default SepulchreStats;
