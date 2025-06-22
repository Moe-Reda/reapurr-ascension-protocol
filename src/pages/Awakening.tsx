
import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Awakening = () => {
  const header = useScrollAnimation();
  const pools = useScrollAnimation();
  
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStakeModal, setIsStakeModal] = useState(true);

  const genesisPools = [
    {
      id: 'sct-hype',
      asset: 'SCT/HYPE',
      tvl: '2,456,789',
      apr: '147.5',
      userStake: '1,250.00',
    },
    {
      id: 'hype',
      asset: 'HYPE',
      tvl: '1,234,567',
      apr: '89.2',
      userStake: '0.75',
    },
    {
      id: 'feusd',
      asset: 'feUSD',
      tvl: '5,678,901',
      apr: '65.8',
      userStake: '2,500.00',
    },
    {
      id: 'lhype',
      asset: 'LHYPE',
      tvl: '3,789,012',
      apr: '112.3',
      userStake: '850.00',
    },
    {
      id: 'buddy',
      asset: 'BUDDY',
      tvl: '1,567,890',
      apr: '95.7',
      userStake: '420.50',
    },
    {
      id: 'purr',
      asset: 'PURR',
      tvl: '2,890,123',
      apr: '128.9',
      userStake: '675.25',
    },
    {
      id: 'ubtc',
      asset: 'UBTC',
      tvl: '4,321,567',
      apr: '78.4',
      userStake: '1.85',
    },
  ];

  const handleStakeAction = () => {
    console.log(`${isStakeModal ? 'Staking' : 'Unstaking'} ${stakeAmount} ${selectedPool}`);
    setSelectedPool(null);
    setStakeAmount('');
  };

  const handleClaim = (asset: string) => {
    console.log(`Claiming rewards for ${asset}`);
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
            The <span className="text-green-400">Awakening</span>
          </h1>
          <p className="text-xl font-light opacity-70 max-w-2xl mx-auto">
            Genesis pools where the resurrection begins. Stake your assets 
            and witness the birth of a new era in tomb finance.
          </p>
        </div>

        {/* Genesis Pools */}
        <div
          ref={pools.ref}
          className={`scroll-fade ${pools.isVisible ? 'visible' : ''}`}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genesisPools.map((pool) => (
              <div key={pool.id} className="glass p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-light text-green-400">{pool.asset}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-light">{pool.apr}%</div>
                    <div className="text-sm opacity-60">APR</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="opacity-70">TVL</span>
                    <span>${pool.tvl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Your Stake</span>
                    <span>{pool.userStake} {pool.asset}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPool(pool.asset);
                      setIsStakeModal(true);
                    }}
                    className="flex-1 neo-button text-center text-sm"
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPool(pool.asset);
                      setIsStakeModal(false);
                    }}
                    className="flex-1 neo-button text-center opacity-80 text-sm"
                  >
                    Unstake
                  </button>
                  <button
                    onClick={() => handleClaim(pool.asset)}
                    className="flex-1 neo-button text-center text-sm"
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stake/Unstake Modal */}
      {selectedPool && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass p-8 max-w-md w-full">
            <h3 className="text-2xl font-light mb-6 text-center">
              {isStakeModal ? 'Stake' : 'Unstake'} {selectedPool}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm opacity-70 mb-2">Amount</label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-light"
                  placeholder={`Enter ${selectedPool} amount`}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPool(null)}
                className="flex-1 neo-button opacity-60 text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleStakeAction}
                className="flex-1 neo-button text-center"
              >
                {isStakeModal ? 'Stake' : 'Unstake'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Awakening;
