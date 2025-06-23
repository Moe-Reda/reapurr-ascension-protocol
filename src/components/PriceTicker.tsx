
import React from 'react';

const PriceTicker = () => {
  // Mock price data - in a real app, this would come from an API
  const prices = {
    sct: '1.034',
    gsct: '0.896'
  };

  return (
    <div className="flex items-center gap-6 font-data text-sm">
      <div className="flex items-center gap-2">
        <span className="text-green-400">SCT</span>
        <span className="text-white/80">${prices.sct}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-green-400">gSCT</span>
        <span className="text-white/80">${prices.gsct}</span>
      </div>
    </div>
  );
};

export default PriceTicker;
