
import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Sepulchre = () => {
  const header = useScrollAnimation();
  const actions = useScrollAnimation();
  
  const [stakeAmount, setStakeAmount] = useState('');

  const handleClaim = () => {
    console.log('Claiming SCT rewards');
  };

  const handleStake = () => {
    console.log(`Staking ${stakeAmount} gSCT`);
    setStakeAmount('');
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
            The <span className="text-green-400">Sepulchre</span>
          </h1>
          <p className="text-xl font-nav opacity-70 max-w-2xl mx-auto">
            The sacred chamber where share holders gather to guide the protocol's destiny. 
            Stake your shares and partake in the ecosystem's expansion.
          </p>
        </div>

        {/* Action Cards */}
        <div
          ref={actions.ref}
          className={`scroll-fade ${actions.isVisible ? 'visible' : ''}`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* SCT Rewards Card */}
            <div className="pool-card">
              <h3 className="text-2xl font-nav text-green-400 mb-6">SCT Rewarded</h3>
              
              <div className="space-y-4 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-data text-green-400 mb-2">134.67</div>
                  <div className="font-nav opacity-60">Claimable SCT</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-data mb-2">$2,456.78</div>
                  <div className="font-nav opacity-60">USD Value</div>
                </div>
              </div>

              <button
                onClick={handleClaim}
                className="w-full neo-button text-center font-nav"
              >
                Claim
              </button>
            </div>

            {/* gSCT Staking Card */}
            <div className="pool-card">
              <h3 className="text-2xl font-nav text-green-400 mb-6">gSCT Staked</h3>
              
              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-data text-green-400 mb-2">2,450.00</div>
                  <div className="font-nav opacity-60">Staked gSCT</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-data mb-2">$8,934.12</div>
                  <div className="font-nav opacity-60">USD Value</div>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-data"
                  placeholder="Enter gSCT amount"
                />
                <button
                  onClick={handleStake}
                  className="w-full neo-button text-center font-nav"
                >
                  Stake
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sepulchre;
