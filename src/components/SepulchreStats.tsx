
import React from 'react';

const SepulchreStats = () => {
  const stats = {
    currentEpoch: '254',
    nextEpochTime: '3h 8m 1s',
    totalStaked: '1737.2293',
    totalStakedUSD: '$18727.33',
    lastSeigniorage: '216.62',
    lastSeigniorageUSD: '73.44',
    lastTwap: '$0.3398',
    twapPeg: '21.37% of peg',
    currentPrice: '$0.3390',
    pricePeg: '21.35% of peg',
    currentAPR: '572.51%',
    dailyAPR: '1.57%'
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
