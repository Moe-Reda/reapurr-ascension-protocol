
import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Lazarus = () => {
  const header = useScrollAnimation();
  const farms = useScrollAnimation();
  
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const lpFarms = [
    {
      id: 'sct-hype',
      pair: 'SCT/HYPE',
      apr: '234.7',
      tvl: '3,456,789',
      userLp: '145.50',
      multiplier: '2.5x',
      earned: '12.45',
    },
    {
      id: 'gsct-hype',
      pair: 'gSCT/HYPE',
      apr: '189.3',
      tvl: '2,789,012',
      userLp: '89.25',
      multiplier: '2.0x',
      earned: '8.32',
    },
  ];

  const handleFarmAction = () => {
    console.log(`Managing farm ${selectedFarm} with amount ${amount}`);
    setSelectedFarm(null);
    setAmount('');
  };

  const handleClaim = (farmPair: string, earned: string) => {
    console.log(`Claiming ${earned} gSCT from ${farmPair} farm`);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 page-enter">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div
          ref={header.ref}
          className={`text-center mb-16 scroll-fade ${header.isVisible ? 'visible' : ''}`}
        >
          <h1 className="text-5xl md:text-6xl font-light tracking-tighter mb-6">
            <span className="text-green-400">Lazarus</span> Farms
          </h1>
          <p className="text-xl font-light opacity-70 max-w-2xl mx-auto">
            Provide liquidity and earn rewards as we restore life to the ecosystem. 
            Your LP tokens become the lifeblood of the resurrection.
          </p>
        </div>

        {/* LP Farms - Square Cards Grid */}
        <div
          ref={farms.ref}
          className={`scroll-fade ${farms.isVisible ? 'visible' : ''}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {lpFarms.map((farm) => (
              <div key={farm.id} className="pool-card">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-light text-green-400">{farm.pair}</h3>
                    <span className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm">
                      {farm.multiplier}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-60">APR</span>
                      <span className="text-lg font-light text-green-400">{farm.apr}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">TVL</span>
                      <span className="font-light">${farm.tvl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Your LP</span>
                      <span className="font-light">{farm.userLp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Earned</span>
                      <span className="font-light text-green-400">{farm.earned} gSCT</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => setSelectedFarm(farm.pair)}
                    className="neo-button text-center w-full"
                  >
                    Manage
                  </button>
                  <button 
                    onClick={() => handleClaim(farm.pair, farm.earned)}
                    className="neo-button text-center w-full opacity-80"
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Farm Management Modal */}
      {selectedFarm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass p-8 max-w-md w-full">
            <h3 className="text-2xl font-light mb-6 text-center">
              Manage {selectedFarm} Farm
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm opacity-70 mb-2">LP Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-light"
                  placeholder="Enter LP amount"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFarm(null)}
                className="flex-1 neo-button opacity-60 text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleFarmAction}
                className="flex-1 neo-button text-center"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lazarus;
