# Environment Setup

This project uses environment variables to configure RPC URLs, contract addresses, and other sensitive configuration. This keeps sensitive data out of the codebase and makes it easy to switch between different networks and deployments.

## Setup Instructions

### 1. Create Environment File

Copy the example environment file and rename it to `.env`:

```bash
cp env.example .env
```

### 2. Configure Your Environment Variables

Edit the `.env` file with your actual values:

```env
# Network Configuration
VITE_NETWORK_ID=998
VITE_RPC_URL=https://rpc.hyperliquid-testnet.xyz/evm
VITE_BLOCK_EXPLORER=https://testnet.purrsec.com/

# WalletConnect Configuration
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Contract Addresses
VITE_SCT_ADDRESS=0x2013E4F92536329040DAbA2A0B24c467c839b72A
VITE_BSCT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_GSCT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_HYPE_ADDRESS=0x0d01dc56dcaaca66ad901c959b4011ec

# Core Protocol Contracts
VITE_MASONRY_V2_ADDRESS=0x0000000000000000000000000000000000000000
VITE_TREASURY_V2_ADDRESS=0x0000000000000000000000000000000000000000
VITE_ORACLE_ADDRESS=0x0000000000000000000000000000000000000000

# Reward Pools
VITE_SCT_GENESIS_REWARD_POOL_ADDRESS=0x0000000000000000000000000000000000000000
VITE_GSCT_REWARD_POOL_ADDRESS=0x0000000000000000000000000000000000000000

# Pinger Configuration (for Node.js scripts)
PINGER_RPC_URL=https://rpc.hyperliquid-testnet.xyz/evm
PINGER_PRIVATE_KEY=your-private-key-here
PINGER_ORACLE_ADDRESS=0x0000000000000000000000000000000000000000
PINGER_TREASURY_ADDRESS=0x0000000000000000000000000000000000000000
```

### 3. Environment Variable Reference

#### Frontend Variables (VITE_*)

These variables are used by the React frontend and are exposed to the browser:

- `VITE_NETWORK_ID`: The network ID (998 for HyperEVM Testnet)
- `VITE_RPC_URL`: RPC endpoint for blockchain interactions
- `VITE_BLOCK_EXPLORER`: Block explorer URL for transaction links
- `VITE_WALLETCONNECT_PROJECT_ID`: WalletConnect project ID for wallet connections
- `VITE_SCT_ADDRESS`: SCT token contract address
- `VITE_BSCT_ADDRESS`: BSCT token contract address
- `VITE_GSCT_ADDRESS`: GSCT token contract address
- `VITE_HYPE_ADDRESS`: HyPE token contract address
- `VITE_MASONRY_V2_ADDRESS`: MasonryV2 contract address
- `VITE_TREASURY_V2_ADDRESS`: TreasuryV2 contract address
- `VITE_ORACLE_ADDRESS`: Oracle contract address
- `VITE_SCT_GENESIS_REWARD_POOL_ADDRESS`: SCT Genesis Reward Pool address
- `VITE_GSCT_REWARD_POOL_ADDRESS`: GSCT Reward Pool address

#### Backend Variables (PINGER_*)

These variables are used by Node.js scripts like the pinger:

- `PINGER_RPC_URL`: RPC endpoint for the pinger script
- `PINGER_PRIVATE_KEY`: Private key for the wallet that executes pinger transactions
- `PINGER_ORACLE_ADDRESS`: Oracle contract address for the pinger
- `PINGER_TREASURY_ADDRESS`: Treasury contract address for the pinger

## Getting WalletConnect Project ID

To get a WalletConnect project ID:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy the project ID and add it to your `.env` file

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your `.env` file** - It's already in `.gitignore`
2. **Keep your private key secure** - Only use it for the pinger script, never expose it to the frontend
3. **Use different wallets** - Consider using a dedicated wallet for the pinger with limited funds
4. **Environment separation** - Use different `.env` files for different environments (dev, staging, prod)

## Usage

### Frontend Development

The frontend will automatically load environment variables when you run:

```bash
npm run dev
```

### Running the Pinger

The pinger script will automatically load environment variables:

```bash
npm run pinger
```

### Building for Production

When building for production, make sure your production environment variables are set:

```bash
npm run build
```

## Troubleshooting

### Missing Environment Variables

If you see errors about missing environment variables:

1. Make sure you've created a `.env` file
2. Check that all required variables are set
3. Restart your development server after making changes

### Pinger Configuration Errors

If the pinger fails to start:

1. Verify `PINGER_PRIVATE_KEY` is set correctly
2. Check that `PINGER_RPC_URL` is accessible
3. Ensure contract addresses are correct for your network

### Frontend Build Issues

If the frontend build fails:

1. Check that all `VITE_*` variables are set
2. Verify contract addresses are valid
3. Ensure RPC URL is accessible from the browser

### WalletConnect Issues

If wallet connections fail:

1. Verify `VITE_WALLETCONNECT_PROJECT_ID` is set correctly
2. Check that your WalletConnect project is active
3. Ensure the project ID matches your WalletConnect Cloud project 