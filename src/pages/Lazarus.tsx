import React, { useState, useEffect } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useAccount } from 'wagmi';
import { useOptimizedGSCTPoolData } from '../hooks/useOptimizedGSCTPoolData';
import { CONTRACT_ADDRESSES } from '../lib/contracts';
import { stakeInGSCTPool, withdrawFromGSCTPool, claimGSCTRewards, getContractActions } from '../lib/contractActions';
import { formatTVL } from '../lib/utils';

const Lazarus = () => {
  const header = useScrollAnimation();
  const farms = useScrollAnimation();
  
  const { address: userAddress } = useAccount();
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const contractActions = getContractActions();
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalTx, setApprovalTx] = useState<string | null>(null);

  // Use optimized GSCT pool data hook for consistent TVL calculation
  const { pools: farmData, isLoading: farmsLoading, error: farmsError, isVisible, isPolling } = useOptimizedGSCTPoolData();

  const handleFarmAction = async () => {
    if (!selectedFarm || !amount || !userAddress) return;
    
    setIsLoading(true);
    try {
      const farm = farmData.find(f => f.pair === selectedFarm);
      if (!farm) return;

      const tx = await stakeInGSCTPool(farm.poolAddress, farm.pid, amount);
      
      // Wait for transaction receipt and immediately refresh data
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('Transaction successful, refreshing data...');
        // Force immediate data refresh by triggering a page reload
        // This ensures all hooks refetch their data
        window.location.reload();
      }
      
      setSelectedFarm(null);
      setAmount('');
    } catch (error) {
      console.error('Farm action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (poolAddress: string, pid: number) => {
    if (!userAddress) return;
    
    setIsLoading(true);
    try {
      const tx = await claimGSCTRewards(poolAddress, pid);
      
      // Wait for transaction receipt and immediately refresh data
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('Claim successful, refreshing data...');
        // Force immediate data refresh
        window.location.reload();
      }
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (poolAddress: string, pid: number, amount: string) => {
    if (!userAddress || !amount) return;
    
    setIsLoading(true);
    try {
      const tx = await withdrawFromGSCTPool(poolAddress, pid, amount);
      
      // Wait for transaction receipt and immediately refresh data
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('Withdraw successful, refreshing data...');
        // Force immediate data refresh
        window.location.reload();
      }
    } catch (error) {
      console.error('Withdraw failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Approve handler
  const handleApprove = async () => {
    if (!selectedFarm || !amount || !userAddress) return;
    setIsApproving(true);
    try {
      const farm = farmData.find(f => f.pair === selectedFarm);
      if (!farm || !farm.lpTokenAddress || !farm.poolAddress) {
        throw new Error('Farm or addresses not set ' + farm.lpTokenAddress + ' ' + farm.poolAddress);
      }
      const tx = await contractActions.approveToken(
        farm.lpTokenAddress,
        farm.poolAddress,
        amount
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

  // Reset approval state when modal opens/closes or farm/amount changes
  useEffect(() => {
    setIsApproved(false);
    setApprovalTx(null);
    setWithdrawAmount('');
  }, [selectedFarm, amount]);

  // Check if any operations are in progress
  const hasPendingOperations = false; // No batch operations in Lazarus yet
  const isDataLoading = farmsLoading || isLoading || hasPendingOperations;

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
                
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => setSelectedFarm(farm.pair)}
                    disabled={!userAddress || farm.isLoading}
                    className="neo-button text-center w-full font-nav disabled:opacity-50"
                  >
                    Manage
                  </button>
                  <button 
                    onClick={() => handleClaim(farm.poolAddress, farm.pid)}
                    disabled={!userAddress || farm.isLoading || farm.earned <= 0}
                    className="neo-button text-center w-full font-nav opacity-100 disabled:opacity-50"
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
            <h3 className="text-2xl font-hero mb-6 text-center">
              Manage {selectedFarm} Farm
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm opacity-70 mb-2 font-nav">LP Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-data"
                  placeholder="Enter LP amount"
                  disabled={isDataLoading || isApproving}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isApproving || isApproved || !amount}
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
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFarm(null)}
                disabled={isDataLoading}
                className="flex-1 neo-button opacity-60 text-center font-nav disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFarmAction}
                disabled={!amount || isDataLoading || !isApproved}
                className="flex-1 neo-button text-center font-nav disabled:opacity-50"
              >
                {isDataLoading ? 'Processing...' : 'Deposit'}
              </button>
            </div>
            
            {/* Withdraw Section */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-sm opacity-70 mb-3 font-nav">Withdraw LP</h4>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-data"
                  placeholder="Enter amount to withdraw"
                  disabled={isDataLoading}
                />
                <button
                  onClick={() => {
                    const farm = farmData.find(f => f.pair === selectedFarm);
                    if (farm) {
                      handleWithdraw(farm.poolAddress, farm.pid, withdrawAmount);
                    }
                  }}
                  disabled={!withdrawAmount || isDataLoading}
                  className="neo-button text-center font-nav disabled:opacity-50 px-6"
                >
                  {isDataLoading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lazarus;
