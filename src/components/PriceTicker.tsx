
import React from 'react';

const PriceTicker = () => {
  // Mock price data - in a real app, this would come from an API
  const prices = {
    sct: '0.34',
    gsct: '10.78'
  };

  return (
    <div className="flex items-center bg-black/40 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <img 
          src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=24&h=24&fit=crop&crop=center" 
          alt="SCT"
          className="w-5 h-5 rounded-full"
        />
        <span className="font-data text-sm text-white">${prices.sct}</span>
      </div>
      
      <div className="w-px h-4 bg-white/20 mx-3"></div>
      
      <div className="flex items-center gap-2">
        <img 
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=24&h=24&fit=crop&crop=center" 
          alt="gSCT"
          className="w-5 h-5 rounded-full"
        />
        <span className="font-data text-sm text-white">${prices.gsct}</span>
      </div>
    </div>
  );
};

export default PriceTicker;
