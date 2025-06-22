
import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Sepulchre = () => {
  const header = useScrollAnimation();
  const stats = useScrollAnimation();
  const actions = useScrollAnimation();
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(true);

  const boardroomStats = {
    currentEpoch: 247,
    twap: 1.034,
    totalShares: '1,234,567',
    nextEpoch: '05:42:18',
  };

  const handleBoardroomAction = () => {
    console.log(`${isStaking ? 'Staking' : 'Withdrawing'} ${stakeAmount} shares`);
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
          <h1 className="text-5xl md:text-6xl font-light tracking-tighter mb-6">
            The <span className="text-green-400">Sepulchre</span>
          </h1>
          <p className="text-xl font-light opacity-70 max-w-2xl mx-auto">
            The sacred chamber where share holders gather to guide the protocol's destiny. 
            Stake your shares and partake in the ecosystem's expansion.
          </p>
        </div>

        {/* Boardroom Stats */}
        <div
          ref={stats.ref}
          className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 scroll-fade ${stats.isVisible ? 'visible' : ''}`}
        >
          <div className="glass p-6 text-center">
            <div className="text-3xl font-light text-green-400 mb-2">
              #{boardroomStats.currentEpoch}
            </div>
            <div className="opacity-60">Current Epoch</div>
          </div>
          
          <div className="glass p-6 text-center">
            <div className="text-3xl font-light text-green-400 mb-2">
              ${boardroomStats.twap}
            </div>
            <div className="opacity-60">TWAP</div>
          </div>
          
          <div className="glass p-6 text-center">
            <div className="text-3xl font-light text-green-400 mb-2">
              {boardroomStats.totalShares}
            </div>
            <div className="opacity-60">Total Shares</div>
          </div>
          
          <div className="glass p-6 text-center">
            <div className="text-3xl font-light text-green-400 mb-2">
              {boardroomStats.nextEpoch}
            </div>
            <div className="opacity-60">Next Epoch</div>
          </div>
        </div>

        {/* Boardroom Actions */}
        <div
          ref={actions.ref}
          className={`scroll-fade ${actions.isVisible ? 'visible' : ''}`}
        >
          <div className="glass p-8">
            <h2 className="text-3xl font-light text-center mb-8">
              Your Position
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-light text-green-400 mb-2">2,450.00</div>
                <div className="opacity-60">Shares Staked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-green-400 mb-2">134.67</div>
                <div className="opacity-60">Earned REAP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-light text-green-400 mb-2">$8,934.12</div>
                <div className="opacity-60">Total Value</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm opacity-70 mb-2">
                  {isStaking ? 'Stake Amount' : 'Withdraw Amount'}
                </label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-light"
                  placeholder="Enter share amount"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsStaking(true)}
                  className={`flex-1 neo-button text-center ${isStaking ? '' : 'opacity-60'}`}
                >
                  Stake
                </button>
                <button
                  onClick={() => setIsStaking(false)}
                  className={`flex-1 neo-button text-center ${!isStaking ? '' : 'opacity-60'}`}
                >
                  Withdraw
                </button>
              </div>

              <button
                onClick={handleBoardroomAction}
                className="w-full neo-button text-center"
              >
                {isStaking ? 'Stake Shares' : 'Withdraw Shares'}
              </button>

              <button className="w-full neo-button text-center opacity-90">
                Claim Rewards
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sepulchre;
