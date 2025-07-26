import React, { useState, useEffect } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useAccount } from 'wagmi';
import { 
  useGSCTPoolUserInfo, 
  useGSCTPoolPendingShare, 
  useGSCTPoolInfo, 
  useTokenBalance 
} from '../hooks/useContracts';
import { CONTRACT_ADDRESSES } from '../lib/contracts';
import { stakeInGSCTPool, withdrawFromGSCTPool, claimGSCTRewards, getContractActions } from '../lib/contractActions';

const Lazarus = () => {
  const header = useScrollAnimation();
  const farms = useScrollAnimation();
  
  const { address: userAddress } = useAccount();
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const contractActions = getContractActions();
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalTx, setApprovalTx] = useState<string | null>(null);

  // GSCT Reward Pool farms - using the single GSCTRewardPool contract
  const lpFarms = [
    {
      id: 'sct-hype',
      pair: 'SCT/HYPE',
      poolAddress: CONTRACT_ADDRESSES.GSCTRewardPool,
      lpTokenAddress: '0x95086e54952C1EaE95d0381c1bE801728ed64d83', // SCT-HYPE LP from contract
      pid: 0, // Pool ID 0 for SCT-HYPE
      multiplier: '2.5x',
      tokenImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=64&h=64&fit=crop&crop=center',
    },
    {
      id: 'gsct-hype',
      pair: 'gSCT/HYPE',
      poolAddress: CONTRACT_ADDRESSES.GSCTRewardPool,
      lpTokenAddress: '0x162991e2926089D493beB9458Bd1f94db2F5efB1', // GSCT-HYPE LP from contract
      pid: 1, // Pool ID 1 for GSCT-HYPE
      multiplier: '2.0x',
      tokenImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=64&h=64&fit=crop&crop=center',
    },
  ];

  // Fetch real data for each farm using GSCT pool hooks
  const farmData = lpFarms.map(farm => {
    const userInfo = useGSCTPoolUserInfo(farm.poolAddress, farm.pid, userAddress);
    const pendingGSCT = useGSCTPoolPendingShare(farm.poolAddress, farm.pid, userAddress);
    const poolInfo = useGSCTPoolInfo(farm.poolAddress, farm.pid);
    const lpBalance = useTokenBalance(farm.lpTokenAddress, userAddress);

    return {
      ...farm,
      userLp: userInfo.data && userInfo.data[0] ? Number(userInfo.data[0]) / 1e18 : 0,
      earned: pendingGSCT.data ? Number(pendingGSCT.data) / 1e18 : 0,
      totalLp: poolInfo.data && poolInfo.data[0] ? Number(poolInfo.data[0]) / 1e18 : 0,
      lpTokenBalance: lpBalance.data ? Number(lpBalance.data) / 1e18 : 0,
      isLoading: userInfo.isLoading || pendingGSCT.isLoading || poolInfo.isLoading || lpBalance.isLoading,
    };
  });

  const handleFarmAction = async () => {
    if (!selectedFarm || !amount || !userAddress) return;
    
    setIsLoading(true);
    try {
      const farm = lpFarms.find(f => f.pair === selectedFarm);
      if (!farm) return;

      await stakeInGSCTPool(farm.poolAddress, farm.pid, amount);
      
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
      await claimGSCTRewards(poolAddress, pid);
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Approve handler
  const handleApprove = async () => {
    if (!selectedFarm || !amount || !userAddress) return;
    setIsApproving(true);
    try {
      const farm = lpFarms.find(f => f.pair === selectedFarm);
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
  }, [selectedFarm, amount]);

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
                    <span className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm font-nav">
                      {farm.multiplier}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-60 font-nav">APR</span>
                      <span className="text-lg font-data text-green-400">
                        {farm.isLoading ? '...' : 'APR'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60 font-nav">TVL</span>
                      <span className="font-data">
                        {farm.isLoading ? '...' : `$${(farm.totalLp * 2.5).toLocaleString()}`}
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
                    className="neo-button text-center w-full opacity-80 font-nav disabled:opacity-50"
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
                  disabled={isLoading || isApproving}
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
                disabled={isLoading}
                className="flex-1 neo-button opacity-60 text-center font-nav disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFarmAction}
                disabled={!amount || isLoading || !isApproved}
                className="flex-1 neo-button text-center font-nav disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lazarus;
