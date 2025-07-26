# Protocol Pinger

A TypeScript implementation of a protocol maintenance bot for your Tomb Finance fork. This pinger automatically updates the oracle and executes epoch transitions to keep your protocol running smoothly.

## 🚀 Features

### **Safety Improvements Over Original**
- ✅ **Gas estimation** with 20% buffer to prevent transaction failures
- ✅ **Retry mechanism** with configurable max retries
- ✅ **Graceful error handling** with detailed logging
- ✅ **Status monitoring** and health checks
- ✅ **Graceful shutdown** on SIGINT/SIGTERM
- ✅ **TypeScript** for better type safety
- ✅ **Integration** with existing contract setup

### **Core Functionality**
- 🔄 **Oracle Updates**: Calls `oracle.update()` every 30 minutes
- ⏰ **Epoch Management**: Automatically executes `treasury.allocateSeigniorage()` at epoch boundaries
- 📊 **Real-time Monitoring**: Logs all operations with timestamps
- 🛡️ **Error Recovery**: Automatic retries with exponential backoff

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **TypeScript** support
3. **RPC Endpoint** (Infura, Alchemy, or local node)
4. **Private Key** of the wallet that will execute transactions
5. **Deployed Contracts** with correct addresses

## 🔧 Setup

### 1. Update Contract Addresses
Make sure your contract addresses are correct in `src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  Oracle: '0x...', // Your oracle contract address
  TreasuryV2: '0x...', // Your treasury contract address
  // ... other addresses
};
```

### 2. Configure the Pinger
Edit `scripts/run-pinger.ts` and update the configuration:

```typescript
const RPC_URL = 'https://your-rpc-url.com'; // Your RPC endpoint
const PRIVATE_KEY = 'your-private-key-here'; // Your wallet private key
const ORACLE_ADDRESS = '0x...'; // Optional: Override oracle address
const TREASURY_ADDRESS = '0x...'; // Optional: Override treasury address
```

### 3. Ensure Wallet Has Funds
The wallet needs:
- **Native tokens** for gas fees
- **Permissions** to call oracle and treasury functions

## 🚀 Usage

### Method 1: Direct Import
```typescript
import { createPinger } from './src/lib/pinger';

const pinger = createPinger(
  'https://your-rpc-url.com',
  'your-private-key-here'
);

pinger.start();

// Later, to stop:
pinger.stop();

// Check status:
console.log(pinger.getStatus());
```

### Method 2: Run Script
```bash
# Compile TypeScript
npx tsc scripts/run-pinger.ts --outDir dist --target es2020 --module commonjs

# Run the pinger
node dist/scripts/run-pinger.js
```

### Method 3: Development Mode
```bash
# Install ts-node for development
npm install -g ts-node

# Run directly
ts-node scripts/run-pinger.ts
```

## 📊 Monitoring

### Console Output
The pinger provides detailed logging:

```
🔧 Protocol Pinger initialized
📍 Oracle: 0x1234...
📍 Treasury: 0x5678...
👤 Wallet: 0xabcd...
🚀 Starting protocol pinger (interval: 30 minutes)

⏰ Tick started at 2024-01-15T10:30:00.000Z
📊 Updating oracle...
⛽ Estimated gas: 50000
🔗 Oracle update transaction: 0x...
✅ Oracle updated (gas used: 48500)
📅 Current time: 1705312200
📅 Next epoch point: 1705314000
📅 Current epoch: 42
⏳ No epoch yet (30 minutes until next epoch)
✅ Tick completed successfully
```

### Status Monitoring
```typescript
const status = pinger.getStatus();
console.log(status);
// Output:
// {
//   isRunning: true,
//   retryCount: 0,
//   walletAddress: "0x...",
//   oracleAddress: "0x...",
//   treasuryAddress: "0x..."
// }
```

## ⚙️ Configuration

### Timing
- **Ping Interval**: 30 minutes (configurable in `PING_INTERVAL`)
- **Retry Delay**: 5 seconds (configurable in `RETRY_DELAY`)
- **Max Retries**: 3 attempts (configurable in `MAX_RETRIES`)

### Gas Management
- **Gas Estimation**: Automatic estimation before each transaction
- **Gas Buffer**: 20% buffer added to prevent failures
- **Gas Limit**: Uses estimated gas + buffer

## 🛡️ Safety Features

### Error Handling
- **Automatic Retries**: Failed transactions are retried up to 3 times
- **Graceful Degradation**: Pinger stops after max retries to prevent spam
- **Detailed Logging**: All errors are logged with context

### Transaction Safety
- **Gas Estimation**: Prevents out-of-gas errors
- **Gas Buffering**: 20% buffer for network congestion
- **Transaction Confirmation**: Waits for confirmations before proceeding

### System Safety
- **Graceful Shutdown**: Handles SIGINT/SIGTERM properly
- **Resource Cleanup**: Clears intervals on shutdown
- **Status Monitoring**: Regular status checks

## 🔍 Troubleshooting

### Common Issues

**1. "Failed to get latest block"**
- Check RPC URL connectivity
- Verify network is accessible

**2. "Oracle update failed"**
- Check wallet has sufficient gas
- Verify oracle contract address
- Check wallet has permission to call update()

**3. "Epoch check/execution failed"**
- Check treasury contract address
- Verify wallet has permission to call allocateSeigniorage()
- Check if epoch boundary logic is correct

**4. "Max retries reached"**
- Check network stability
- Verify contract addresses
- Check wallet permissions

### Debug Mode
Add more detailed logging by modifying the pinger:

```typescript
// Add to executeTick() method
console.log('🔍 Debug: Current block number:', await this.provider.getBlockNumber());
console.log('🔍 Debug: Wallet balance:', await this.wallet.getBalance());
```

## 🚨 Important Notes

### Security
- ⚠️ **Never commit private keys** to version control
- ⚠️ **Use environment variables** or secure key management
- ⚠️ **Test on testnet** before mainnet deployment
- ⚠️ **Monitor gas costs** and wallet balances

### Maintenance
- 🔄 **Regular monitoring** of pinger logs
- 💰 **Ensure wallet** has sufficient funds for gas
- 📊 **Monitor transaction** success rates
- 🛠️ **Update contract addresses** if redeployed

### Production Deployment
- 🏗️ **Use process managers** like PM2 for production
- 📝 **Set up logging** to files for production
- 🔔 **Configure alerts** for failed transactions
- 🔄 **Set up monitoring** for pinger health

## 📝 License

This pinger is part of your Tomb Finance fork project. Ensure you have the necessary permissions and licenses for the underlying protocol contracts. 