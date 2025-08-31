import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useAccount } from 'wagmi';
import { useOptimizedGSCTPoolData, OptimizedGSCTPoolData } from '../hooks/useOptimizedGSCTPoolData';
import { CONTRACT_ADDRESSES } from '../lib/contracts';
import { stakeInGSCTPool, withdrawFromGSCTPool, claimGSCTRewards, getContractActions } from '../lib/contractActions';
import { formatTVL } from '../lib/utils';

const Lazarus = () => {
  const header = useScrollAnimation();
  const farms = useScrollAnimation();
  
  const { address: userAddress } = useAccount();
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStakeModal, setIsStakeModal] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalTx, setApprovalTx] = useState<string | null>(null);
  const [isProcessingStake, setIsProcessingStake] = useState(false);
  const [stakeTxHash, setStakeTxHash] = useState<string | null>(null);
  const [localFarmData, setLocalFarmData] = useState<OptimizedGSCTPoolData[]>([]);
  const hasInitialized = React.useRef(false);

  // Use optimized GSCT pool data hook for consistent TVL calculation
  const { pools: farmData, isLoading: farmsLoading, error: farmsError, isVisible, isPolling } = useOptimizedGSCTPoolData();
  
  // Log hook data changes for debugging
  React.useEffect(() => {
    console.log('📊 [Lazarus] Hook data updated:', {
      isLoading: farmsLoading,
      error: farmsError,
      isVisible,
      isPolling,
      farmDataLength: farmData?.length || 0,
      farmData: farmData?.map(f => ({ 
        pair: f.pair, 
        userLp: f.userLp, 
        earned: f.earned, 
        isLoading: f.isLoading 
      }))
    });
  }, [farmData, farmsLoading, farmsError, isVisible, isPolling]);
  
  // Contract actions instance
  const contractActions = getContractActions();

  // Add continuous background polling like PriceTicker
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Trigger refetch of all farm data every 30 seconds
      // This ensures data stays fresh even when tab is not visible
      console.log('🔄 [Lazarus] Background polling - refetching farm data');
      // refetchAll(); // No longer needed - wagmi hooks handle polling
    }, 30000); // 30 seconds like PriceTicker
    
    return () => clearInterval(interval);
  }, []);

  // Fast polling when modal is open (every 3 seconds)
  React.useEffect(() => {
    if (!selectedFarm) return;
    
    console.log('⏰ [Lazarus] Starting fast polling for modal:', selectedFarm);
    
    const fastInterval = setInterval(() => {
      console.log('🔄 [Lazarus] Fast polling tick - modal is open for:', selectedFarm);
      // Trigger a refetch of all farm data
      // This will be handled by the useOptimizedGSCTPoolData hook
    }, 3000);
    
    return () => {
      console.log('⏹️ [Lazarus] Stopping fast polling for modal:', selectedFarm);
      clearInterval(fastInterval);
    };
  }, [selectedFarm]);

  // Reset approval state when modal opens/closes or farm/amount changes
  React.useEffect(() => {
    setIsApproved(false);
    setApprovalTx(null);
  }, [selectedFarm, stakeAmount]);

  // Initialize local farm data once
  React.useEffect(() => {
    console.log('🔄 [Lazarus] Farm data effect triggered:', {
      farmDataLength: farmData?.length || 0,
      hasInitialized: hasInitialized.current,
      farmData: farmData?.map(f => ({ pair: f.pair, userLp: f.userLp, earned: f.earned }))
    });
    
    if (farmData && farmData.length > 0 && !hasInitialized.current) {
      console.log('✅ [Lazarus] Initializing local farm data:', farmData.map(f => ({ pair: f.pair, userLp: f.userLp, earned: f.earned })));
      setLocalFarmData([...farmData]);
      hasInitialized.current = true;
    }
  }, [farmData]);

  // Function to update local farm data immediately after transactions
  const updateLocalFarmData = (farmPair: string, updates: Partial<OptimizedGSCTPoolData>) => {
    console.log('🔄 [Lazarus] Updating local farm data:', {
      farmPair,
      updates,
      currentLocalData: localFarmData.map(f => ({ pair: f.pair, userLp: f.userLp, earned: f.earned }))
    });
    
    setLocalFarmData(prevData => {
      const newData = prevData.map(farm => 
        farm.pair === farmPair 
          ? { ...farm, ...updates }
          : farm
      );
      
      console.log('✅ [Lazarus] Local farm data updated:', {
        farmPair,
        updates,
        newData: newData.map(f => ({ pair: f.pair, userLp: f.userLp, earned: f.earned }))
      });
      
      return newData;
    });
  };

  const handleStakeAction = async () => {
    if (!selectedFarm || !stakeAmount || !userAddress) return;
    
    console.log('🚀 [Lazarus] Starting stake action:', {
      selectedFarm,
      stakeAmount,
      isStakeModal,
      userAddress
    });
    
    setIsProcessingStake(true);
    try {
      const farm = farmData.find(f => f.pair === selectedFarm);
      if (!farm) {
        console.error('❌ [Lazarus] Farm not found:', selectedFarm);
        return;
      }
      
      console.log('📊 [Lazarus] Found farm for action:', {
        pair: farm.pair,
        poolAddress: farm.poolAddress,
        pid: farm.pid,
        currentUserLp: farm.userLp
      });

      if (isStakeModal) {
        // Stake operation
        console.log('📈 [Lazarus] Executing stake transaction...');
        const tx = await stakeInGSCTPool(farm.poolAddress, farm.pid, stakeAmount);
        setStakeTxHash(tx.hash);
        console.log('⏳ [Lazarus] Transaction submitted:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ [Lazarus] Transaction confirmed:', {
          hash: tx.hash,
          status: receipt.status,
          blockNumber: receipt.blockNumber
        });
        
        if (receipt.status === 1) {
          console.log('🎉 [Lazarus] Stake successful, updating local data...');
          const stakeAmountNum = parseFloat(stakeAmount);
          const currentFarm = localFarmData.find(f => f.pair === selectedFarm);
          
          console.log('📊 [Lazarus] Current farm state before update:', {
            farmPair: selectedFarm,
            currentUserLp: currentFarm?.userLp || 0,
            stakeAmount: stakeAmountNum,
            newUserLp: (currentFarm?.userLp || 0) + stakeAmountNum
          });
          
          if (currentFarm) {
            // Update user LP immediately
            updateLocalFarmData(selectedFarm, {
              userLp: currentFarm.userLp + stakeAmountNum
            });
          } else {
            console.warn('⚠️ [Lazarus] Current farm not found in local data for update');
          }
          
          // Trigger immediate refetch of all farm data
          // This will be handled by the useOptimizedGSCTPoolData hook's event listeners
          console.log('🔄 [Lazarus] Hook will handle data refetch via event listeners');
        }
      } else {
        // Unstake operation
        console.log('📉 [Lazarus] Executing unstake transaction...');
        const tx = await withdrawFromGSCTPool(farm.poolAddress, farm.pid, stakeAmount);
        setStakeTxHash(tx.hash);
        console.log('⏳ [Lazarus] Unstake transaction submitted:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ [Lazarus] Unstake transaction confirmed:', {
          hash: tx.hash,
          status: receipt.status,
          blockNumber: receipt.blockNumber
        });
        
        if (receipt.status === 1) {
          console.log('🎉 [Lazarus] Unstake successful, updating local data...');
          const unstakeAmountNum = parseFloat(stakeAmount);
          const currentFarm = localFarmData.find(f => f.pair === selectedFarm);
          
          console.log('📊 [Lazarus] Current farm state before unstake update:', {
            farmPair: selectedFarm,
            currentUserLp: currentFarm?.userLp || 0,
            unstakeAmount: unstakeAmountNum,
            newUserLp: Math.max(0, (currentFarm?.userLp || 0) - unstakeAmountNum)
          });
          
          if (currentFarm) {
            // Update user LP immediately
            updateLocalFarmData(selectedFarm, {
              userLp: Math.max(0, currentFarm.userLp - unstakeAmountNum)
            });
          } else {
            console.warn('⚠️ [Lazarus] Current farm not found in local data for unstake update');
          }
          
          // Trigger immediate refetch of all farm data
          // This will be handled by the useOptimizedGSCTPoolData hook's event listeners
          console.log('🔄 [Lazarus] Hook will handle data refetch via event listeners');
        }
      }
      
      // Reset modal state
      console.log('🔄 [Lazarus] Resetting modal state after successful transaction');
      setSelectedFarm(null);
      setStakeAmount('');
      setIsApproved(false);
      setApprovalTx(null);
      setStakeTxHash(null);
      
    } catch (error) {
      console.error('❌ [Lazarus] Stake action failed:', error);
    } finally {
      setIsProcessingStake(false);
      console.log('🏁 [Lazarus] Stake action completed, processing state reset');
    }
  };

  const handleClaim = async (poolAddress: string, pid: number) => {
    if (!userAddress) return;
    
    console.log('💰 [Lazarus] Starting claim action:', {
      poolAddress,
      pid,
      userAddress
    });
    
    try {
      const tx = await claimGSCTRewards(poolAddress, pid);
      console.log('⏳ [Lazarus] Claim transaction submitted:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ [Lazarus] Claim transaction confirmed:', {
        hash: tx.hash,
        status: receipt.status,
        blockNumber: receipt.blockNumber
      });
      
      if (receipt.status === 1) {
        console.log('🎉 [Lazarus] Claim successful, updating local data...');
        // Find the farm by poolAddress and pid
        const farmToUpdate = localFarmData.find(f => 
          f.poolAddress === poolAddress && f.pid === pid
        );
        
        console.log('🔍 [Lazarus] Looking for farm to update:', {
          poolAddress,
          pid,
          foundFarm: farmToUpdate ? { pair: farmToUpdate.pair, earned: farmToUpdate.earned } : null,
          allFarms: localFarmData.map(f => ({ pair: f.pair, poolAddress: f.poolAddress, pid: f.pid, earned: f.earned }))
        });
        
        if (farmToUpdate) {
          console.log('📊 [Lazarus] Resetting earned rewards for farm:', {
            pair: farmToUpdate.pair,
            currentEarned: farmToUpdate.earned,
            newEarned: 0
          });
          
          // Reset earned rewards to 0 immediately
          updateLocalFarmData(farmToUpdate.pair, {
            earned: 0
          });
        } else {
          console.warn('⚠️ [Lazarus] Farm not found in local data for claim update');
        }
        
        // Trigger immediate refetch of all farm data
        // This will be handled by the useOptimizedGSCTPoolData hook's event listeners
        console.log('🔄 [Lazarus] Hook will handle data refetch via event listeners');
      }
    } catch (error) {
      console.error('❌ [Lazarus] Claim failed:', error);
    }
  };

  // Approve handler
  const handleApprove = async () => {
    if (!selectedFarm || !stakeAmount || !userAddress) return;
    
    console.log('🔐 [Lazarus] Starting approval process:', {
      selectedFarm,
      stakeAmount,
      userAddress
    });
    
    setIsApproving(true);
    try {
      const farm = farmData.find(f => f.pair === selectedFarm);
      if (!farm || !farm.lpTokenAddress || !farm.poolAddress) {
        console.error('❌ [Lazarus] Farm or addresses not set:', {
          farm: farm ? { pair: farm.pair, lpTokenAddress: farm.lpTokenAddress, poolAddress: farm.poolAddress } : null
        });
        throw new Error('Farm or addresses not set');
      }
      
      console.log('📋 [Lazarus] Approving token:', {
        lpTokenAddress: farm.lpTokenAddress,
        poolAddress: farm.poolAddress,
        amount: '999999999'
      });
      
      const tx = await contractActions.approveToken(
        farm.lpTokenAddress,
        farm.poolAddress,
        '999999999' // Approve max amount
      );
      
      setApprovalTx(tx.hash);
      console.log('⏳ [Lazarus] Approval transaction submitted:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ [Lazarus] Approval transaction confirmed:', {
        hash: tx.hash,
        status: receipt.status,
        blockNumber: receipt.blockNumber
      });
      
      if (receipt.status === 1) {
        setIsApproved(true);
        console.log('🎉 [Lazarus] Approval successful, user can now stake');
      }
      
    } catch (error) {
      console.error('❌ [Lazarus] Approval failed:', error);
    } finally {
      setIsApproving(false);
      console.log('🏁 [Lazarus] Approval process completed');
    }
  };

  // Check if any operations are in progress
  const isLoading = farmsLoading;

  return (
    <div className="min-h-screen pt-24 pb-12 page-enter">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div
          ref={header.ref}
          className={`text-center mb-16 scroll-fade ${header.isVisible ? 'visible' : ''}`}
        >
          <h1 className="text-5xl md:text-6xl font-hero tracking-tighter mb-6">
            <span className="text-green-400">Lazarus</span> Farms
          </h1>
          <p className="text-xl font-nav opacity-70 max-w-2xl mx-auto">
            Provide liquidity and earn rewards as we restore life to the ecosystem. 
            Your LP tokens become the lifeblood of the resurrection.
          </p>
        </div>

        {/* Status Display */}
        <div className="mb-6 flex gap-4">
          {farmsError && (
            <div className="glass p-4 border border-red-400/20 flex-1">
              <p className="text-red-400 text-sm">
                Error loading farm data: {farmsError}
              </p>
            </div>
          )}
        </div>

        {/* LP Farms - Square Cards Grid */}
        <div
          ref={farms.ref}
          className={`scroll-fade ${farms.isVisible ? 'visible' : ''}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {farmData.map((farm) => (
              <div key={farm.id} className="pool-card">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={farm.tokenImage} 
                        alt={farm.pair}
                        className="w-8 h-8 rounded-full"
                      />
                      <h3 className="text-2xl font-nav text-green-400">{farm.pair}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-60 font-nav">APR</span>
                      <span className="text-lg font-data text-green-400">
                        {farm.isLoading ? '...' : farm.apr > 0 ? farm.apr.toFixed(2) : '0.00'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60 font-nav">TVL</span>
                      <span className="font-data">
                        {formatTVL(farm.totalPoolTVL, farm.isLoading)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60 font-nav">Your LP</span>
                      <span className="font-data">
                        {farm.isLoading ? '...' : farm.userLp.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60 font-nav">Earned</span>
                      <span className="font-data text-green-400">
                        {farm.isLoading ? '...' : `${farm.earned.toFixed(4)} gSCT`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                  <button
                    onClick={() => {
                      setSelectedFarm(farm.pair);
                      setIsStakeModal(true);
                      setStakeAmount('');
                    }}
                    disabled={!userAddress || farm.isLoading}
                    className="neo-button text-center text-xs md:text-sm py-2 font-nav disabled:opacity-50"
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFarm(farm.pair);
                      setIsStakeModal(false);
                      setStakeAmount('');
                    }}
                    disabled={!userAddress || farm.isLoading}
                    className="neo-button flex items-center justify-center text-center opacity-80 text-xs md:text-sm py-2 font-nav disabled:opacity-50"
                  >
                    Unstake
                  </button>
                  <button
                    onClick={() => handleClaim(farm.poolAddress, farm.pid)}
                    disabled={!userAddress || farm.isLoading || farm.earned <= 0}
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
      {selectedFarm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1"></div>
              <h3 className="text-2xl font-hero text-center flex-1">
                {isStakeModal ? 'Stake' : 'Unstake'} {selectedFarm}
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
                  placeholder={`Enter ${selectedFarm} amount`}
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
                  setSelectedFarm(null);
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

export default Lazarus;
