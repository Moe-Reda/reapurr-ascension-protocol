import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { getContractActions } from '../lib/contractActions';

const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (isConnected) {
      disconnect();
      return;
    }

    setIsConnecting(true);
    try {
      // Try to connect using ethers.js first
      const contractActions = getContractActions();
      const walletAddress = await contractActions.connectWallet();
      console.log('Wallet connected:', walletAddress);
    } catch (error) {
      console.error('Failed to connect with ethers.js, trying wagmi:', error);
      
      // Fallback to wagmi if ethers.js fails
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting || isPending}
      className="neo-button bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting || isPending ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Connecting...
        </div>
      ) : isConnected && address ? (
        formatAddress(address)
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
};

export default ConnectWallet;
