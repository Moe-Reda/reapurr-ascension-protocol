
import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Purgatory = () => {
  const header = useScrollAnimation();
  const bonds = useScrollAnimation();
  
  const [selectedBond, setSelectedBond] = useState<string | null>(null);
  const [bondAmount, setBondAmount] = useState('');

  const availableBonds = [
    {
      id: 'eth-bond',
      asset: 'ETH',
      price: '0.854',
      roi: '+14.6%',
      vesting: '5 days',
      available: '125.50',
    },
    {
      id: 'usdc-bond',
      asset: 'USDC',
      price: '0.892',
      roi: '+10.8%',
      vesting: '5 days',
      available: '45,600.00',
    },
    {
      id: 'reap-bond',
      asset: 'REAP',
      price: '0.763',
      roi: '+23.7%',
      vesting: '7 days',
      available: '8,940.25',
    },
  ];

  const handleBondPurchase = () => {
    console.log(`Purchasing ${bondAmount} ${selectedBond} bonds`);
    setSelectedBond(null);
    setBondAmount('');
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
            <span className="text-green-400">Purgatory</span>
          </h1>
          <p className="text-xl font-light opacity-70 max-w-2xl mx-auto">
            A place of transformation where assets are committed to the fire, 
            emerging reborn as protocol bonds with enhanced value.
          </p>
        </div>

        {/* Bond Interface */}
        <div
          ref={bonds.ref}
          className={`scroll-fade ${bonds.isVisible ? 'visible' : ''}`}
        >
          <div className="glass p-8 mb-8">
            <h2 className="text-3xl font-light text-center mb-8 text-green-400">
              Active Bonds
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-light text-green-400 mb-2">3.45 REAP</div>
                <div className="opacity-60">Claimable Rewards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-green-400 mb-2">2 days</div>
                <div className="opacity-60">Next Vest</div>
              </div>
            </div>
            
            <button className="w-full neo-button text-center mb-8">
              Claim All Vested
            </button>
          </div>

          <h2 className="text-3xl font-light text-center mb-8">
            Available <span className="text-green-400">Bonds</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBonds.map((bond) => (
              <div key={bond.id} className="glass p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-light text-green-400">{bond.asset}</h3>
                  <div className="text-right">
                    <div className="text-lg font-light text-green-400">{bond.roi}</div>
                    <div className="text-sm opacity-60">ROI</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="opacity-70">Bond Price</span>
                    <span>{bond.price} REAP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Vesting</span>
                    <span>{bond.vesting}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Available</span>
                    <span>{bond.available}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedBond(bond.asset)}
                  className="w-full neo-button text-center"
                >
                  Purchase Bond
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bond Purchase Modal */}
      {selectedBond && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass p-8 max-w-md w-full">
            <h3 className="text-2xl font-light mb-6 text-center">
              Purchase {selectedBond} Bond
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm opacity-70 mb-2">{selectedBond} Amount</label>
                <input
                  type="number"
                  value={bondAmount}
                  onChange={(e) => setBondAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-light"
                  placeholder={`Enter ${selectedBond} amount`}
                />
              </div>
              
              <div className="p-4 bg-green-400/10 rounded-lg border border-green-400/20">
                <div className="flex justify-between text-sm opacity-70 mb-2">
                  <span>You will receive:</span>
                  <span>~{(parseFloat(bondAmount || '0') * 1.237).toFixed(2)} REAP</span>
                </div>
                <div className="flex justify-between text-sm opacity-70">
                  <span>Vesting period:</span>
                  <span>5 days</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBond(null)}
                className="flex-1 neo-button opacity-60 text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleBondPurchase}
                className="flex-1 neo-button text-center"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purgatory;
