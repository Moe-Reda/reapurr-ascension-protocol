# Reapurr Protocol - Tomb Finance Fork on HyperEVM

A production-ready frontend for the Reapurr Protocol, a Tomb Finance fork running on HyperEVM. This application provides a complete interface for staking, bonding, and managing the protocol's algorithmic stablecoin ecosystem.

## Features

- **Real-time Onchain Data**: Live blockchain data integration using Wagmi and React Query
- **Wallet Integration**: Support for MetaMask, Coinbase Wallet, and WalletConnect
- **Staking Interface**: Stake gSCT tokens and claim SCT rewards
- **Bonding System**: Purchase bonds with USDC to receive SCT tokens
- **Treasury Management**: Monitor protocol reserves, debt, and backing ratio
- **Responsive Design**: Modern UI with glassmorphism effects and smooth animations
- **Production Ready**: Error handling, loading states, and transaction feedback

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**: Wagmi v2 + Ethers.js
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Notifications**: Sonner toast notifications

## Prerequisites

- Node.js 18+ 
- npm, yarn, or bun
- MetaMask or other Web3 wallet
- Access to HyperEVM RPC endpoint

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reapurr-ascension-protocol
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_HYPER_EVM_RPC_URL=https://rpc.hyperevm.com
   VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   VITE_CHAIN_ID=4242
   ```

4. **Update contract addresses**
   Edit `src/lib/contracts.ts` and replace the placeholder addresses with your actual deployed contract addresses:
   ```typescript
   export const CONTRACT_ADDRESSES = {
     SCT: '0x...', // Your SCT token address
     gSCT: '0x...', // Your gSCT token address
     USDC: '0x...', // USDC address on HyperEVM
     TREASURY: '0x...', // Treasury contract
     STAKING: '0x...', // Staking contract
     BONDING: '0x...', // Bonding contract
     // ... other addresses
   }
   ```

5. **Configure HyperEVM chain**
   Update `src/lib/wagmi.ts` with the correct HyperEVM configuration:
   ```typescript
   export const hyperEVM = {
     id: 4242, // Replace with actual HyperEVM chain ID
     name: 'HyperEVM',
     network: 'hyperevm',
     nativeCurrency: {
       decimals: 18,
       name: 'Ether',
       symbol: 'ETH',
     },
     rpcUrls: {
       public: { http: ['https://rpc.hyperevm.com'] }, // Replace with actual RPC URL
       default: { http: ['https://rpc.hyperevm.com'] },
     },
     blockExplorers: {
       etherscan: { name: 'HyperEVM Explorer', url: 'https://explorer.hyperevm.com' },
       default: { name: 'HyperEVM Explorer', url: 'https://explorer.hyperevm.com' },
     },
   }
   ```

## Development

1. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:5173`

3. **Connect your wallet**
   - Install MetaMask or another Web3 wallet
   - Add HyperEVM network to your wallet
   - Connect your wallet to the application

## Production Build

1. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   # or
   bun run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   # or
   yarn preview
   # or
   bun run preview
   ```

## Contract Integration

### Required Smart Contracts

The application expects the following smart contracts to be deployed on HyperEVM:

1. **SCT Token** - The main algorithmic stablecoin
2. **gSCT Token** - Governance token for staking
3. **Treasury Contract** - Manages protocol reserves and debt
4. **Staking Contract** - Handles gSCT staking and SCT rewards
5. **Bonding Contract** - Manages bond purchases and redemptions

### Contract ABIs

The application includes basic ABIs for common functions. You may need to update these based on your specific contract implementations:

- `ERC20_ABI` - Standard ERC20 token functions
- `STAKING_ABI` - Staking contract functions
- `TREASURY_ABI` - Treasury contract functions
- `BONDING_ABI` - Bonding contract functions

### Price Oracle Integration

The current implementation includes placeholder price fetching. You'll need to implement price oracle integration:

1. **DEX Integration**: Connect to a DEX like Uniswap for price feeds
2. **Price Oracle**: Use Chainlink or similar price oracle
3. **Custom API**: Implement your own price API

Update the `useTokenPrice` hook in `src/hooks/useProtocolData.ts` to fetch real prices.

## Key Features Implementation

### Staking System
- Users can stake gSCT tokens to earn SCT rewards
- Real-time display of staked amounts and pending rewards
- Transaction status feedback and error handling

### Bonding System
- Purchase bonds with USDC to receive SCT tokens
- Bond vesting and redemption functionality
- Bond price calculation and discount display

### Treasury Management
- Monitor protocol reserves and total debt
- Backing ratio calculation and display
- Bonding discount management

### Wallet Integration
- Multi-wallet support (MetaMask, Coinbase Wallet, WalletConnect)
- Automatic wallet detection and connection
- Transaction signing and confirmation

## Security Considerations

1. **Contract Verification**: Ensure all contracts are verified on the block explorer
2. **Access Control**: Implement proper access controls for admin functions
3. **Input Validation**: Validate all user inputs on both frontend and smart contracts
4. **Error Handling**: Implement comprehensive error handling for failed transactions
5. **Rate Limiting**: Consider implementing rate limiting for API calls

## Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify Deployment
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Manual Deployment
1. Build the application: `npm run build`
2. Upload the `dist` folder to your web server
3. Configure your web server to serve the static files

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Join our Telegram: https://t.me/reapurr
- Follow us on X: https://x.com/reapurr

## Roadmap

- [ ] Bonding interface implementation
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Multi-chain support
- [ ] Governance voting interface
- [ ] Advanced portfolio tracking
