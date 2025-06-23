
import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Purgatory = () => {
  const header = useScrollAnimation();
  const bonds = useScrollAnimation();
  
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');

  const handlePurchase = () => {
    console.log(`Purchasing ${purchaseAmount} bSCT bonds`);
    setPurchaseAmount('');
  };

  const handleRedeem = () => {
    console.log(`Redeeming ${redeemAmount} bSCT bonds`);
    setRedeemAmount('');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 page-enter">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div
          ref={header.ref}
          className={`text-center mb-16 scroll-fade ${header.isVisible ? 'visible' : ''}`}
        >
          <h1 className="text-5xl md:text-6xl font-hero tracking-tighter mb-6">
            <span className="text-green-400">Purgatory</span>
          </h1>
          <p className="text-xl font-nav opacity-70 max-w-2xl mx-auto">
            A place of transformation where assets are committed to the fire, 
            emerging reborn as protocol bonds with enhanced value.
          </p>
        </div>

        {/* Bond Cards */}
        <div
          ref={bonds.ref}
          className={`scroll-fade ${bonds.isVisible ? 'visible' : ''}`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Purchase bSCT Card */}
            <div className="pool-card">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=64&h=64&fit=crop&crop=center" 
                  alt="bSCT"
                  className="w-8 h-8 rounded-full"
                />
                <h3 className="text-2xl font-nav text-green-400">Purchase bSCT</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="opacity-70 font-nav">Bond Price</span>
                  <span className="font-data">0.854 SCT</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70 font-nav">ROI</span>
                  <span className="text-green-400 font-data">+14.6%</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70 font-nav">Vesting</span>
                  <span className="font-data">5 days</span>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-data"
                  placeholder="Enter SCT amount"
                />
                <button
                  onClick={handlePurchase}
                  className="w-full neo-button text-center font-nav"
                >
                  Purchase Bond
                </button>
              </div>
            </div>

            {/* Redeem bSCT Card */}
            <div className="pool-card">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=64&h=64&fit=crop&crop=center" 
                  alt="bSCT"
                  className="w-8 h-8 rounded-full"
                />
                <h3 className="text-2xl font-nav text-green-400">Redeem bSCT</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="opacity-70 font-nav">Your bSCT</span>
                  <span className="font-data">145.67</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70 font-nav">Claimable</span>
                  <span className="text-green-400 font-data">23.45 SCT</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70 font-nav">Next Vest</span>
                  <span className="font-fx">2d 4h 12m</span>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-data"
                  placeholder="Enter bSCT amount"
                />
                <button
                  onClick={handleRedeem}
                  className="w-full neo-button text-center font-nav"
                >
                  Redeem Bond
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purgatory;
