import React, { useState, useEffect } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useMasonryUserData, useUserTokenBalances } from '../hooks/useContracts';
import { useAccount } from 'wagmi';
import { getContractActions } from '../lib/contractActions';
import { CONTRACT_ADDRESSES, parseEther } from '../lib/contracts';
import SepulchreStats from '../components/SepulchreStats';

const Sepulchre = () => {
  const header = useScrollAnimation();
  const stats = useScrollAnimation();
  const actions = useScrollAnimation();
  
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalTx, setApprovalTx] = useState<string | null>(null);

  // Get real user data
  const userData = useMasonryUserData(address);
  const tokenBalances = useUserTokenBalances(address);

  // Reset approval state when stake amount changes
  useEffect(() => {
    setIsApproved(false);
    setApprovalTx(null);
  }, [stakeAmount]);

  const handleClaim = async () => {
    if (!address) return;
    
    setIsProcessing(true);
    try {
      const contractActions = getContractActions();
      const tx = await contractActions.claimReward();
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await contractActions.waitForTransaction(tx);
      console.log('Claim transaction confirmed:', receipt);
      
      // Reset form
      setTxHash(null);
    } catch (error) {
      console.error('Failed to claim reward:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!address || !stakeAmount) return;
    
    setIsApproving(true);
    try {
      const contractActions = getContractActions();
      
      // Approve gSCT spending for Masonry
      const tx = await contractActions.approveToken(
        CONTRACT_ADDRESSES.GSCT,
        CONTRACT_ADDRESSES.MasonryV2,
        stakeAmount
      );
      setApprovalTx(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await contractActions.waitForTransaction(tx);
      console.log('Approval transaction confirmed:', receipt);
      
      setIsApproved(true);
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleStake = async () => {
    if (!address || !stakeAmount) return;
    
    setIsProcessing(true);
    try {
      const contractActions = getContractActions();
      
      // Stake gSCT
      const stakeTx = await contractActions.stakeGSCT(stakeAmount);
      setTxHash(stakeTx.hash);
      
      // Wait for transaction confirmation
      const receipt = await contractActions.waitForTransaction(stakeTx);
      console.log('Stake transaction confirmed:', receipt);
      
      // Reset form
      setStakeAmount('');
      setTxHash(null);
    } catch (error) {
      console.error('Failed to stake:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateUSDValue = (amount: string, price: string) => {
    const numAmount = Number(amount);
    const numPrice = Number(price);
    return (numAmount * numPrice).toFixed(2);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 page-enter">
      <div className="max-w-6xl mx-auto px-6">
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

        {/* Stats Dashboard */}
        <div
          ref={stats.ref}
          className={`scroll-fade ${stats.isVisible ? 'visible' : ''}`}
        >
          <SepulchreStats />
        </div>

        {/* Action Cards */}
        <div
          ref={actions.ref}
          className={`scroll-fade ${actions.isVisible ? 'visible' : ''}`}
        >
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* SCT Rewards Card */}
            <div className="pool-card">
              <h3 className="text-2xl font-nav text-green-400 mb-6">SCT</h3>
              
              <div className="space-y-4 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-data text-green-400 mb-2">
                    {userData.isLoading ? (
                      <div className="animate-pulse bg-white/20 h-10 w-24 rounded mx-auto"></div>
                    ) : (
                      userData.earned
                    )}
                  </div>
                  <div className="font-nav opacity-60">Claimable SCT</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-data mb-2">
                    {userData.isLoading ? (
                      <div className="animate-pulse bg-white/20 h-8 w-20 rounded mx-auto"></div>
                    ) : (
                      `$${calculateUSDValue(userData.earned, '1.00')}` // Replace with actual SCT price
                    )}
                  </div>
                  <div className="font-nav opacity-60">USD Value</div>
                </div>
              </div>

              <button
                onClick={handleClaim}
                disabled={!userData.canClaim || isProcessing || userData.isLoading}
                className="w-full neo-button text-center font-nav disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Claiming...
                  </div>
                ) : (
                  'Claim'
                )}
              </button>
            </div>

            {/* gSCT Staking Card */}
            <div className="pool-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-nav text-green-400">gSCT</h3>
                {isApproved && approvalTx && (
                  <a
                    href={`https://testnet.purrsec.com/tx/${approvalTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-400 underline"
                  >
                    View Tx
                  </a>
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-data text-green-400 mb-2">
                    {userData.isLoading ? (
                      <div className="animate-pulse bg-white/20 h-10 w-24 rounded mx-auto"></div>
                    ) : (
                      userData.staked
                    )}
                  </div>
                  <div className="font-nav opacity-60">Staked gSCT</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-data mb-2">
                    {userData.isLoading ? (
                      <div className="animate-pulse bg-white/20 h-8 w-20 rounded mx-auto"></div>
                    ) : (
                      `$${calculateUSDValue(userData.staked, '1.00')}` // Replace with actual gSCT price
                    )}
                  </div>
                  <div className="font-nav opacity-60">USD Value</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-data opacity-60">
                    Available: {tokenBalances.gsct} gSCT
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  disabled={isProcessing || isApproving}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-data disabled:opacity-50"
                  placeholder="Enter gSCT amount"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={isApproving || isApproved || !stakeAmount}
                    className="flex-1 neo-button text-center font-nav disabled:opacity-50"
                  >
                    {isApproving ? 'Approving...' : isApproved ? 'Approved' : 'Approve'}
                  </button>
                </div>
                <button
                  onClick={handleStake}
                  disabled={!stakeAmount || isProcessing || userData.isLoading || !isApproved}
                  className="w-full neo-button text-center font-nav disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Staking...
                    </div>
                  ) : (
                    'Stake'
                  )}
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
