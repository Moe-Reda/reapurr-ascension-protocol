import React, { useState, useEffect } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useAccount } from 'wagmi';
import { useTokenBalance, useTreasuryBondDiscountRate, useTreasuryBondPremiumRate, useTreasurySCTPrice, useTreasuryBSCTPrice, useOraclePrice } from '../hooks/useContracts';
import { CONTRACT_ADDRESSES } from '../lib/contracts';
import { buyBonds, redeemBonds, getContractActions } from '../lib/contractActions';

const Purgatory = () => {
  const header = useScrollAnimation();
  const bonds = useScrollAnimation();
  const activity = useScrollAnimation();
  
  const { address: userAddress } = useAccount();
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalTx, setApprovalTx] = useState<string | null>(null);
  const [isRedeemApproved, setIsRedeemApproved] = useState(false);
  const [isRedeemApproving, setIsRedeemApproving] = useState(false);
  const [redeemApprovalTx, setRedeemApprovalTx] = useState<string | null>(null);

  const contractActions = getContractActions();

  // Fetch real bond data
  const sctBalance = useTokenBalance(CONTRACT_ADDRESSES.SCT, userAddress);
  const bsctBalance = useTokenBalance(CONTRACT_ADDRESSES.BSCT, userAddress);
  const sctPrice = useTreasurySCTPrice();
  const bsctPrice = useTreasuryBSCTPrice();
  const bondDiscountRate = useTreasuryBondDiscountRate();
  const bondPremiumRate = useTreasuryBondPremiumRate();
  
  // Get current price from Oracle using consult
  const sctOraclePrice = useOraclePrice(CONTRACT_ADDRESSES.SCT);

  const bondData = {
    sctBalance: sctBalance.data ? Number(sctBalance.data) / 1e18 : 0,
    bsctBalance: bsctBalance.data ? Number(bsctBalance.data) / 1e18 : 0,
    sctPrice: sctPrice.data ? Number(sctPrice.data) / 1e18 : 1,
    bsctPrice: bsctPrice.data ? Number(bsctPrice.data) / 1e18 : 1,
    discountRate: bondDiscountRate.data ? Number(bondDiscountRate.data) / 1e18 : 0,
    premiumRate: bondPremiumRate.data ? Number(bondPremiumRate.data) / 1e18 : 0,
    sctOraclePrice: sctOraclePrice.data ? Number(sctOraclePrice.data) / 1e18 : 1,
    isLoading: sctBalance.isLoading || bsctBalance.isLoading || sctPrice.isLoading || bsctPrice.isLoading || bondDiscountRate.isLoading || bondPremiumRate.isLoading || sctOraclePrice.isLoading,
  };

  // Reset approval state when purchase amount changes
  useEffect(() => {
    setIsApproved(false);
    setApprovalTx(null);
  }, [purchaseAmount]);

  // Reset redeem approval state when redeem amount changes
  useEffect(() => {
    setIsRedeemApproved(false);
    setRedeemApprovalTx(null);
  }, [redeemAmount]);

  const handleApprove = async () => {
    if (!userAddress || !purchaseAmount) return;
    
    setIsApproving(true);
    try {
      // Approve SCT spending for Treasury
      const tx = await contractActions.approveToken(
        CONTRACT_ADDRESSES.SCT,
        CONTRACT_ADDRESSES.TreasuryV2,
        purchaseAmount
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

  const handlePurchase = async () => {
    if (!purchaseAmount || !userAddress) return;
    
    setIsLoading(true);
    try {
      // Use Treasury's price as target price (same as Treasury's getSCTPrice())
      const targetPrice = sctPrice.data;

      const tx = await buyBonds(purchaseAmount, targetPrice.toString());
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await contractActions.waitForTransaction(tx);
      console.log('Bond purchase transaction confirmed:', receipt);
      
      setPurchaseAmount('');
      setIsApproved(false);
      setApprovalTx(null);
    } catch (error) {
      console.error('Failed to purchase bonds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemApprove = async () => {
    if (!userAddress || !redeemAmount) return;
    
    setIsRedeemApproving(true);
    try {
      // Approve bSCT spending for Treasury
      const tx = await contractActions.approveToken(
        CONTRACT_ADDRESSES.BSCT,
        CONTRACT_ADDRESSES.TreasuryV2,
        redeemAmount
      );
      setRedeemApprovalTx(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await contractActions.waitForTransaction(tx);
      console.log('Redeem approval transaction confirmed:', receipt);
      
      setIsRedeemApproved(true);
    } catch (error) {
      console.error('Failed to approve redeem:', error);
    } finally {
      setIsRedeemApproving(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemAmount || !userAddress) return;
    
    setIsLoading(true);
    try {
      // Use Treasury's price as target price (same as Treasury's getSCTPrice())
      const targetPrice = sctPrice.data;

      const tx = await redeemBonds(redeemAmount, targetPrice.toString());
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await contractActions.waitForTransaction(tx);
      console.log('Bond redemption transaction confirmed:', receipt);
      
      setRedeemAmount('');
      setIsRedeemApproved(false);
      setRedeemApprovalTx(null);
    } catch (error) {
      console.error('Failed to redeem bonds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-enter">
      {/* Header */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            ref={header.ref}
            className={`text-center scroll-fade ${header.isVisible ? 'visible' : ''}`}
          >
            <h1 className="text-6xl md:text-8xl font-hero tracking-tighter mb-8">
              <span className="text-green-400">Purgatory</span>
            </h1>
            <p className="text-xl md:text-2xl font-nav opacity-70 max-w-3xl mx-auto leading-relaxed">
              The realm of bonds and redemptions. Purchase bonds when SCT is above peg, 
              redeem them when it's below. Navigate the cycles of expansion and contraction.
            </p>
          </div>
        </div>
      </section>

      {/* Bonds Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            ref={bonds.ref}
            className={`scroll-fade ${bonds.isVisible ? 'visible' : ''}`}
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Buy Bonds */}
              <div className="glass p-8">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=64&h=64&fit=crop&crop=center" 
                    alt="SCT"
                    className="w-8 h-8 rounded-full"
                  />
                  <h3 className="text-2xl font-nav text-green-400">Buy Bonds</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="opacity-70 font-nav">Your SCT</span>
                    <span className="font-data">
                      {bondData.isLoading ? '...' : bondData.sctBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70 font-nav">Current Treasury Price</span>
                    <span className="text-green-400 font-data">
                      {bondData.isLoading ? '...' : `${bondData.sctPrice.toFixed(3)} SCT`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70 font-nav">Discount</span>
                    <span className="font-fx">
                      {bondData.isLoading ? '...' : `-${(bondData.discountRate * 100).toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-data"
                    placeholder="Enter SCT amount"
                    disabled={isLoading || isApproving || !userAddress}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={isApproving || isApproved || !purchaseAmount}
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
                  <button
                    onClick={handlePurchase}
                    disabled={!purchaseAmount || isLoading || !userAddress || !isApproved}
                    className="w-full neo-button text-center font-nav disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Buy Bond'}
                  </button>
                </div>
              </div>

              {/* Redeem Bonds */}
              <div className="glass p-8">
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
                    <span className="font-data">
                      {bondData.isLoading ? '...' : bondData.bsctBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70 font-nav">Current Treasury Price</span>
                    <span className="text-green-400 font-data">
                      {bondData.isLoading ? '...' : `${bondData.sctPrice.toFixed(3)} SCT`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70 font-nav">Premium</span>
                    <span className="font-fx">
                      {bondData.isLoading ? '...' : `+${(bondData.premiumRate * 100).toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-data"
                    placeholder="Enter bSCT amount"
                    disabled={isLoading || isRedeemApproving || !userAddress}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleRedeemApprove}
                      disabled={isRedeemApproving || isRedeemApproved || !redeemAmount}
                      className="flex-1 neo-button text-center font-nav disabled:opacity-50"
                    >
                      {isRedeemApproving ? 'Approving...' : isRedeemApproved ? 'Approved' : 'Approve'}
                    </button>
                    {redeemApprovalTx && (
                      <a
                        href={`https://testnet.purrsec.com/tx/${redeemApprovalTx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-xs text-green-400 underline text-center"
                      >
                        View Tx
                      </a>
                    )}
                  </div>
                  <button
                    onClick={handleRedeem}
                    disabled={!redeemAmount || isLoading || !userAddress || !isRedeemApproved}
                    className="w-full neo-button text-center font-nav disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Redeem Bond'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Status */}
        {(txHash || approvalTx || redeemApprovalTx) && (
          <div className="mt-8 text-center space-y-4">
            {approvalTx && (
              <div className="glass p-4 inline-block">
                <div className="text-green-400 font-nav mb-2">Purchase Approval Transaction</div>
                <div className="font-data text-sm opacity-70 break-all">{approvalTx}</div>
              </div>
            )}
            {redeemApprovalTx && (
              <div className="glass p-4 inline-block">
                <div className="text-green-400 font-nav mb-2">Redeem Approval Transaction</div>
                <div className="font-data text-sm opacity-70 break-all">{redeemApprovalTx}</div>
              </div>
            )}
            {txHash && (
              <div className="glass p-4 inline-block">
                <div className="text-green-400 font-nav mb-2">Bond Transaction</div>
                <div className="font-data text-sm opacity-70 break-all">{txHash}</div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Purgatory;
