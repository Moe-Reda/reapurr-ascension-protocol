import 'dotenv/config';
import { createPinger, loadPingerConfig } from '../src/lib/pinger';

// Load configuration from environment variables
const config = loadPingerConfig();

console.log('🔧 Pinger Configuration:');
console.log(`📍 RPC URL: ${config.rpcUrl}`);
console.log(`📍 Oracle: ${config.oracleAddress}`);
console.log(`📍 Treasury: ${config.treasuryAddress}`);
console.log(`👤 Wallet: ${config.privateKey.slice(0, 6)}...${config.privateKey.slice(-4)}`);

// Create and start the pinger
const pinger = createPinger(
  config.rpcUrl, 
  config.privateKey, 
  config.oracleAddress, 
  config.treasuryAddress
);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  pinger.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  pinger.stop();
  process.exit(0);
});

// Start the pinger
console.log('🚀 Starting protocol pinger...');
pinger.start();

// Log status every hour
setInterval(() => {
  const status = pinger.getStatus();
  console.log('📊 Pinger Status:', status);
}, 60 * 60 * 1000); // Every hour 