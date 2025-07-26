import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import StatsDashboard from '../components/StatsDashboard';
import { useAccount } from 'wagmi';
import { useGenesisPoolUserInfo, useGenesisPoolPendingSCT, useGenesisPoolInfo, useTokenBalance } from '../hooks/useContracts';
import { CONTRACT_ADDRESSES } from '../lib/contracts';
import { stakeInPool, unstakeFromPool, claimRewards, getContractActions } from '../lib/contractActions';

const Awakening = () => {
  const header = useScrollAnimation();
  const stats = useScrollAnimation();
  const pools = useScrollAnimation();
  
  const { address: userAddress } = useAccount();
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStakeModal, setIsStakeModal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const contractActions = getContractActions();
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalTx, setApprovalTx] = useState<string | null>(null);

  // Genesis pool addresses - you'll need to update these with actual addresses
  const genesisPools = [
    {
      id: 'sct-hype',
      asset: 'SCT/HYPE',
      poolAddress: CONTRACT_ADDRESSES.SCTGenesisRewardPool, // Update with actual address
      tokenAddress: CONTRACT_ADDRESSES.SCTHYPE, // Update with actual LP token address
      pid: 0, // SCT-HYPE pool is at pid 0 according to the contract
      tokenImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=64&h=64&fit=crop&crop=center',
    },
    {
      id: 'hype',
      asset: 'HYPE',
      poolAddress: '0x...', // Add actual HYPE pool address
      tokenAddress: '0x...', // Add actual HYPE token address
      pid: 3, // HYPE pool is at pid 3 according to the contract
      tokenImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=64&h=64&fit=crop&crop=center',
    },
    {
      id: 'purr',
      asset: 'PURR',
      poolAddress: CONTRACT_ADDRESSES.SCTGenesisRewardPool, // Same pool contract
      tokenAddress: CONTRACT_ADDRESSES.PURR, // PURR token address
      pid: 1, // PURR pool is at pid 1
      tokenImage: 'https://placekitten.com/64/64', // Placeholder image
    },
    // Add more pools with actual addresses
  ];

  // Fetch real data for each pool
  const poolData = genesisPools.map(pool => {
    const userInfo = useGenesisPoolUserInfo(pool.poolAddress, pool.pid, userAddress);
    const pendingSCT = useGenesisPoolPendingSCT(pool.poolAddress, pool.pid, userAddress);
    const poolInfo = useGenesisPoolInfo(pool.poolAddress, pool.pid);
    const tokenBalance = useTokenBalance(pool.tokenAddress, userAddress);

    return {
      ...pool,
      userStake: userInfo.data && userInfo.data[0] ? Number(userInfo.data[0]) / 1e18 : 0,
      earned: pendingSCT.data ? Number(pendingSCT.data) / 1e18 : 0,
      totalStaked: poolInfo.data && poolInfo.data[0] ? Number(poolInfo.data[0]) / 1e18 : 0, // This might need adjustment based on poolInfo structure
      tokenBalance: tokenBalance.data ? Number(tokenBalance.data) / 1e18 : 0,
      isLoading: userInfo.isLoading || pendingSCT.isLoading || poolInfo.isLoading || tokenBalance.isLoading,
    };
  });

  const handleStakeAction = async () => {
    if (!selectedPool || !stakeAmount || !userAddress) return;
    
    setIsLoading(true);
    try {
      const pool = genesisPools.find(p => p.asset === selectedPool);
      if (!pool) return;

      if (isStakeModal) {
        await stakeInPool(pool.poolAddress, pool.pid, stakeAmount);
      } else {
        await unstakeFromPool(pool.poolAddress, pool.pid, stakeAmount);
      }
      
      setSelectedPool(null);
      setStakeAmount('');
    } catch (error) {
      console.error('Stake action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (poolAddress: string, pid: number) => {
    if (!userAddress) return;
    
    setIsLoading(true);
    try {
      await claimRewards(poolAddress, pid);
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Approve handler
  const handleApprove = async () => {
    if (!selectedPool || !stakeAmount || !userAddress) return;
    setIsApproving(true);
    try {
      const pool = genesisPools.find(p => p.asset === selectedPool);
      if (!pool || !pool.tokenAddress || !pool.poolAddress) {
        throw new Error('Pool or addresses not set ' + pool.tokenAddress + ' ' + pool.poolAddress);
      }
      const tx = await contractActions.approveToken(
        pool.tokenAddress,
        pool.poolAddress,
        stakeAmount
      );
      setApprovalTx(tx.hash);
      await tx.wait();
      setIsApproved(true);
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsApproving(false);
    }
  };

  // Reset approval state when modal opens/closes or pool/amount changes
  React.useEffect(() => {
    setIsApproved(false);
    setApprovalTx(null);
  }, [selectedPool, stakeAmount]);

  return (
    <div className="min-h-screen pt-24 pb-12 page-enter">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div
          ref={header.ref}
          className={`text-center mb-16 scroll-fade ${header.isVisible ? 'visible' : ''}`}
        >
          <h1 className="text-5xl md:text-6xl font-hero tracking-tighter mb-6">
            The <span className="text-green-400">Awakening</span>
          </h1>
          <p className="text-xl font-nav opacity-70 max-w-2xl mx-auto">
            Genesis pools where the resurrection begins. Stake your assets 
            and witness the birth of a new era in tomb finance.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div
          ref={stats.ref}
          className={`scroll-fade ${stats.isVisible ? 'visible' : ''}`}
        >
          <StatsDashboard />
        </div>

        {/* Genesis Pools */}
        <div
          ref={pools.ref}
          className={`scroll-fade ${pools.isVisible ? 'visible' : ''}`}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poolData.map((pool) => (
              <div key={pool.id} className="glass p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={pool.tokenImage} 
                      alt={pool.asset}
                      className="w-8 h-8 rounded-full"
                    />
                    <h3 className="text-2xl font-nav text-green-400">{pool.asset}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-data">
                      {pool.isLoading ? '...' : 'APR'}%
                    </div>
                    <div className="text-sm opacity-60 font-nav">APR</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="opacity-70 font-nav">TVL</span>
                    <span className="font-data">
                      {pool.isLoading ? '...' : `$${(pool.totalStaked * 1.5).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70 font-nav">Your Stake</span>
                    <span className="font-data">
                      {pool.isLoading ? '...' : `${pool.userStake.toFixed(2)} ${pool.asset}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70 font-nav">Earned</span>
                    <span className="text-green-400 font-data">
                      {pool.isLoading ? '...' : `${pool.earned.toFixed(4)} SCT`}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPool(pool.asset);
                      setIsStakeModal(true);
                    }}
                    disabled={!userAddress || pool.isLoading}
                    className="flex-1 neo-button text-center text-sm font-nav disabled:opacity-50"
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPool(pool.asset);
                      setIsStakeModal(false);
                    }}
                    disabled={!userAddress || pool.isLoading}
                    className="flex-1 neo-button text-center opacity-80 text-sm font-nav disabled:opacity-50"
                  >
                    Unstake
                  </button>
                  <button
                    onClick={() => handleClaim(pool.poolAddress, pool.pid)}
                    disabled={!userAddress || pool.isLoading || pool.earned <= 0}
                    className="flex-1 neo-button text-center text-sm font-nav disabled:opacity-50"
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
            <h3 className="text-2xl font-hero mb-6 text-center">
              {isStakeModal ? 'Stake' : 'Unstake'} {selectedPool}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm opacity-70 mb-2 font-nav">Amount</label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-data"
                  placeholder={`Enter ${selectedPool} amount`}
                  disabled={isLoading || isApproving}
                />
              </div>
              {isStakeModal && (
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={isApproving || isApproved || !stakeAmount}
                    className="flex-1 neo-button text-center font-nav disabled:opacity-50"
                  >
                    {isApproving ? 'Approving...' : isApproved ? 'Approved' : 'Approve'}
                  </button>
                  {approvalTx && (
                    <a
                      href={`https://testnet.purrsec.com/tx/${approvalTx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-xs text-green-400 underline text-center"
                    >
                      View Tx
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPool(null)}
                disabled={isLoading || isApproving}
                className="flex-1 neo-button opacity-60 text-center font-nav disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStakeAction}
                disabled={!stakeAmount || isLoading || (isStakeModal && !isApproved)}
                className="flex-1 neo-button text-center font-nav disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : (isStakeModal ? 'Stake' : 'Unstake')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Awakening;
