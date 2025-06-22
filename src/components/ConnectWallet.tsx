
import React, { useState } from 'react';

const ConnectWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');

  const handleConnect = () => {
    // Simulate wallet connection
    if (!isConnected) {
      setAddress('0x1234...5678');
      setIsConnected(true);
      console.log('Wallet connected');
    } else {
      setAddress('');
      setIsConnected(false);
      console.log('Wallet disconnected');
    }
  };

  return (
    <button
      onClick={handleConnect}
      className="neo-button bg-green-500/20 hover:bg-green-500/30"
    >
      {isConnected ? `${address}` : 'Connect Wallet'}
    </button>
  );
};

export default ConnectWallet;
