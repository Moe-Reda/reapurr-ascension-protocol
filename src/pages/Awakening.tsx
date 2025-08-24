import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import StatsDashboard from '../components/StatsDashboard';
import { useAccount } from 'wagmi';
import { useOptimizedPoolData, OptimizedPoolData } from '../hooks/useOptimizedPoolData';
import { CONTRACT_ADDRESSES } from '../lib/contracts';
import { formatTVL } from '../lib/utils';
import { stakeInPool, unstakeFromPool, claimRewards, getContractActions } from '../lib/contractActions';

const Awakening = () => {
  const header = useScrollAnimation();
  const stats = useScrollAnimation();
  const pools = useScrollAnimation();
  
  const { address: userAddress } = useAccount();
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStakeModal, setIsStakeModal] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalTx, setApprovalTx] = useState<string | null>(null);
  const [isProcessingStake, setIsProcessingStake] = useState(false);
  const [stakeTxHash, setStakeTxHash] = useState<string | null>(null);
  const [localPoolData, setLocalPoolData] = useState<OptimizedPoolData[]>([]);
  const hasInitialized = React.useRef(false);

  // Use optimized pool data hook
  const { pools: poolData, isLoading: poolsLoading, error: poolsError, isVisible, isPolling } = useOptimizedPoolData();
  
  // Contract actions instance
  const contractActions = getContractActions();

  // Fast polling when modal is open (every 3 seconds)
  React.useEffect(() => {
    if (!selectedPool) return;
    
    const fastInterval = setInterval(() => {
      // Trigger a refetch of all pool data
      // This will be handled by the useOptimizedPoolData hook
    }, 3000);
    
    return () => clearInterval(fastInterval);
  }, [selectedPool]);

  // Reset approval state when modal opens/closes or pool/amount changes
  React.useEffect(() => {
    setIsApproved(false);
    setApprovalTx(null);
  }, [selectedPool, stakeAmount]);

  // Initialize local pool data once
  React.useEffect(() => {
    if (poolData && poolData.length > 0 && !hasInitialized.current) {
      setLocalPoolData([...poolData]);
      hasInitialized.current = true;
    }
  }, [poolData]);

  // Check if required contract addresses are available
  if (!CONTRACT_ADDRESSES.SCTGenesisRewardPool) {
    return (
      <div className="min-h-screen pt-24 pb-12 page-enter">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-hero tracking-tighter mb-6">
              The <span className="text-green-400">Awakening</span>
            </h1>
            <div className="glass p-8">
              <p className="text-xl font-nav text-red-400">
                Error: SCT Genesis Reward Pool address not configured
              </p>
              <p className="text-sm opacity-60 mt-2">
                Please check your environment variables
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to format TVL from wei to human readable
  const formatTVLFromWei = (tvlWei: bigint | undefined): string => {
    if (!tvlWei) return '0';
    const tvlNumber = Number(tvlWei) / 1e18;
    return tvlNumber.toLocaleString(undefined, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  // Function to update local pool data immediately after transactions
  const updateLocalPoolData = (poolAsset: string, updates: Partial<OptimizedPoolData>) => {
    setLocalPoolData(prevData => 
      prevData.map(pool => 
        pool.asset === poolAsset 
          ? { ...pool, ...updates }
          : pool
      )
    );
  };

  const handleStakeAction = async () => {
    if (!selectedPool || !stakeAmount || !userAddress) return;
    
    setIsProcessingStake(true);
    try {
      const pool = poolData.find(p => p.asset === selectedPool);
      if (!pool) return;

      if (isStakeModal) {
        // Stake operation
        const tx = await stakeInPool(pool.poolAddress, pool.pid, stakeAmount);
        setStakeTxHash(tx.hash);
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
          console.log('Stake successful, updating local data...');
          const stakeAmountNum = parseFloat(stakeAmount);
          const currentPool = localPoolData.find(p => p.asset === selectedPool);
          
          if (currentPool) {
            // Update user stake immediately
            updateLocalPoolData(selectedPool, {
              userStake: currentPool.userStake + stakeAmountNum
            });
          }
          
          // Trigger immediate refetch of all pool data
          // This will be handled by the useOptimizedPoolData hook's event listeners
        }
      } else {
        // Unstake operation
        const tx = await unstakeFromPool(pool.poolAddress, pool.pid, stakeAmount);
        setStakeTxHash(tx.hash);
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
          console.log('Unstake successful, updating local data...');
          const unstakeAmountNum = parseFloat(stakeAmount);
          const currentPool = localPoolData.find(p => p.asset === selectedPool);
          
          if (currentPool) {
            // Update user stake immediately
            updateLocalPoolData(selectedPool, {
              userStake: Math.max(0, currentPool.userStake - unstakeAmountNum)
            });
          }
          
          // Trigger immediate refetch of all pool data
          // This will be handled by the useOptimizedPoolData hook's event listeners
        }
      }
      
      // Reset modal state
      setSelectedPool(null);
      setStakeAmount('');
      setIsApproved(false);
      setApprovalTx(null);
      setStakeTxHash(null);
      
    } catch (error) {
      console.error('Stake action failed:', error);
    } finally {
      setIsProcessingStake(false);
    }
  };

  const handleClaim = async (poolAddress: string, pid: number) => {
    if (!userAddress) return;
    
    try {
      const tx = await claimRewards(poolAddress, pid);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('Claim successful, updating local data...');
        // Find the pool by poolAddress and pid
        const poolToUpdate = localPoolData.find(p => 
          p.poolAddress === poolAddress && p.pid === pid
        );
        
        if (poolToUpdate) {
          // Reset earned rewards to 0 immediately
          updateLocalPoolData(poolToUpdate.asset, {
            earned: 0
          });
        }
        
        // Trigger immediate refetch of all pool data
        // This will be handled by the useOptimizedPoolData hook's event listeners
      }
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  // Approve handler
  const handleApprove = async () => {
    if (!selectedPool || !stakeAmount || !userAddress) return;
    
    setIsApproving(true);
    try {
      const pool = poolData.find(p => p.asset === selectedPool);
      if (!pool || !pool.tokenAddress || !pool.poolAddress) {
        throw new Error('Pool or addresses not set');
      }
      
      const tx = await contractActions.approveToken(
        pool.tokenAddress,
        pool.poolAddress,
        '999999999' // Approve max amount
      );
      
      setApprovalTx(tx.hash);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setIsApproved(true);
      }
      
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsApproving(false);
    }
  };

  // Check if any operations are in progress
  const isLoading = poolsLoading;

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
              <div key={pool.id} className="glass p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={pool.tokenImage}
                      alt={pool.asset}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full"
                    />
                    <h3 className="text-xl md:text-lg font-nav text-green-400">
                      {pool.asset}
                    </h3>
                  </div>
                  <div className="text-right shrink-0 pl-3 md:pl-6">
                    <div className="text-lg md:text-lg font-data leading-none">
                      {pool.isLoading ? '...' : pool.apr > 0 ? pool.apr.toFixed(2) : '0.00'}%
                    </div>
                    <div className="text-xs md:text-sm opacity-60 font-nav">APR</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between min-w-0">
                    <span className="opacity-70 font-nav">TVL</span>
                    <span className="font-data whitespace-nowrap truncate">
                      {formatTVL(pool.usdTVL, pool.isLoading)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between min-w-0">
                    <span className="opacity-70 font-nav">Your Stake</span>
                    <span className="font-data whitespace-nowrap truncate">
                      {pool.isLoading ? '...' : `${pool.userStake.toFixed(2)} ${pool.asset}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between min-w-0">
                    <span className="opacity-70 font-nav">Earned</span>
                    <span className="text-green-400 font-data whitespace-nowrap truncate">
                      {pool.isLoading ? '...' : `${pool.earned.toFixed(4)} SCT`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setSelectedPool(pool.asset);
                      setIsStakeModal(true);
                      setStakeAmount('');
                    }}
                    disabled={!userAddress || pool.isLoading}
                    className="neo-button text-center text-xs md:text-sm py-2 font-nav disabled:opacity-50"
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPool(pool.asset);
                      setIsStakeModal(false);
                      setStakeAmount('');
                    }}
                    disabled={!userAddress || pool.isLoading}
                    className="neo-button flex items-center justify-center text-center opacity-80 text-xs md:text-sm py-2 font-nav disabled:opacity-50"
                  >
                    Unstake
                  </button>
                  <button
                    onClick={() => handleClaim(pool.poolAddress, pool.pid)}
                    disabled={!userAddress || pool.isLoading || pool.earned <= 0}
                    className="neo-button text-center text-xs md:text-sm py-2 font-nav disabled:opacity-50 md:col-auto col-span-2"
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1"></div>
              <h3 className="text-2xl font-hero text-center flex-1">
                {isStakeModal ? 'Stake' : 'Unstake'} {selectedPool}
              </h3>
              <div className="flex-1 flex justify-end">
                {(isApproved && approvalTx) || stakeTxHash ? (
                  <a
                    href={`https://testnet.purrsec.com/tx/${stakeTxHash || approvalTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-400 underline"
                  >
                    View Tx
                  </a>
                ) : (
                  <div className="w-16"></div>
                )}
              </div>
            </div>
            
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
                    disabled={isApproving || isApproved || !stakeAmount || isLoading}
                    className="flex-1 neo-button text-center font-nav disabled:opacity-50"
                  >
                    {isApproving ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Approving...
                      </div>
                    ) : isApproved ? 'Approved' : 'Approve'}
                  </button>
                </div>
              )}
            </div>
            

            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedPool(null);
                  setStakeAmount('');
                }}
                disabled={isLoading || isApproving}
                className="flex-1 neo-button text-center font-nav disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStakeAction}
                disabled={!stakeAmount || isProcessingStake || (isStakeModal && !isApproved)}
                className="flex-1 neo-button text-center font-nav disabled:opacity-50"
              >
                {isProcessingStake ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  isStakeModal ? 'Stake' : 'Unstake'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Awakening;