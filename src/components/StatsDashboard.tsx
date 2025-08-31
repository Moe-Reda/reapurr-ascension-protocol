
import React from 'react';
import { useProtocolStats, usePoolStats, useFarmStats } from '../hooks/useSubgraph';
import { useAwakeningCountdown, useEmissionsData } from '../hooks/useContracts';
import { useRealUSDTVL } from '../hooks/useRealUSDTVL';
import { CONTRACT_ADDRESSES } from '../lib/contracts';
import { formatEther } from 'ethers/lib/utils';

const StatsDashboard = () => {
  const { stats: protocolStats, loading: protocolLoading } = useProtocolStats();
  const { stats: poolStats, loading: poolLoading } = usePoolStats();
  const { stats: farmStats, loading: farmLoading } = useFarmStats();
  const { totalTVLUSD, pools: poolsData, isLoading: tvlLoading, error: tvlError } = useRealUSDTVL(CONTRACT_ADDRESSES.SCTGenesisRewardPool);
  const { timeLeft, isActive, isLoading: countdownLoading, error: countdownError, poolStartTime, poolEndTime } = useAwakeningCountdown();
  const { dailyEmissions, totalEmissions, emissionRate, isLoading: emissionsLoading, error: emissionsError } = useEmissionsData();

  // Count active pools (pools with TVL > 0)
  const activePools = poolsData.filter(pool => pool.tvlUSD > 0).length;

  const loading = protocolLoading || poolLoading || farmLoading || tvlLoading || countdownLoading || emissionsLoading;

  // Helper function to format TVL for display
  const formatTVL = (tvl: number): string => {
    return tvl.toLocaleString(undefined, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  // Format dates for display
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if we have any data available
  const hasAnyData = totalTVLUSD > 0 || dailyEmissions > 0 || timeLeft || activePools > 0;

  // Only show full loading state if we have no data at all
  if (loading && !hasAnyData) {
    return (
      <div className="glass p-8 mb-16">
        <div className="flex justify-center">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl">
            <div className="text-center">
              <div className="text-3xl font-data text-green-400 mb-2">
                Loading...
              </div>
              <div className="font-nav opacity-60">Total Value Locked</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-data text-green-400 mb-2">
                Loading...
              </div>
              <div className="font-nav opacity-60">Daily Emissions</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-fx text-green-400 mb-2">
                Loading...
              </div>
              <div className="font-nav opacity-60">Time Left</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-data text-green-400 mb-2">
                Loading...
              </div>
              <div className="font-nav opacity-60">Active Pools</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-8 mb-16">
      <div className="flex justify-center">
        <div className="grid md:grid-cols-4 gap-8 max-w-4xl">
          <div className="text-center">
            <div className="text-3xl font-data text-green-400 mb-2">
              ${formatTVL(totalTVLUSD)}
            </div>
            <div className="font-nav opacity-60">Total Value Locked</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-data text-green-400 mb-2">
              {emissionsError ? '--' : dailyEmissions.toFixed(0)} SCT
            </div>
            <div className="font-nav opacity-60">Daily Emissions</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-fx text-green-400 mb-2">
              {countdownError ? '--:--:--:--' : timeLeft}
            </div>
            <div className="font-nav opacity-60">Time Left</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-data text-green-400 mb-2">
              {activePools}
            </div>
            <div className="font-nav opacity-60">Active Pools</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
