import { createConfig, http } from 'wagmi';
import { mainnet, polygon, bsc, bscTestnet } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { NETWORKS } from './contracts';

// Environment variable helper - works in both browser and Node.js
const getEnvVar = (key: string): string => {
  // In Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  // In browser environment (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || '';
  }
  return '';
};

// Define HyperEVM chain
const hyperEVM = {
  id: Number(getEnvVar('VITE_NETWORK_ID')),
  name: 'HyperEVM Testnet',
  network: 'hyperevm-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HyPE',
    symbol: 'HyPE',
  },
  rpcUrls: {
    public: { http: [getEnvVar('VITE_RPC_URL')] },
    default: { http: [getEnvVar('VITE_RPC_URL')] },
  },
  blockExplorers: {
    default: { name: 'Purrsec', url: getEnvVar('VITE_BLOCK_EXPLORER') },
  },
} as const;

// Set up wagmi config
export const config = createConfig({
  chains: [hyperEVM, mainnet, polygon, bsc, bscTestnet],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: getEnvVar('VITE_WALLETCONNECT_PROJECT_ID'),
    }),
    coinbaseWallet({
      appName: 'Reapurr Ascension Protocol',
    }),
  ],
  transports: {
    [hyperEVM.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});

// Export chains for use in components
export { hyperEVM, mainnet, polygon, bsc, bscTestnet as chains }; 