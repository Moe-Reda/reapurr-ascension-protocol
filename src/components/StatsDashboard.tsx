
import React from 'react';

const StatsDashboard = () => {
  const stats = {
    tvl: '15,847,293',
    dailyEmissions: '4,567',
    timeLeft: '14:23:45:22'
  };

  return (
    <div className="glass p-8 mb-16">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-3xl font-data text-green-400 mb-2">
            ${stats.tvl}
          </div>
          <div className="font-nav opacity-60">Total Value Locked</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-data text-green-400 mb-2">
            {stats.dailyEmissions} SCT
          </div>
          <div className="font-nav opacity-60">Daily Emissions</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-fx text-green-400 mb-2">
            {stats.timeLeft}
          </div>
          <div className="font-nav opacity-60">Time Left</div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
