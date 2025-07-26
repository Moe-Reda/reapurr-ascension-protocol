import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './contracts';


// Configuration
const PING_INTERVAL = 0.5 * 60 * 1000; // should be 30 minutes in milliseconds but for testing purposes we are using 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Oracle ABI for update function
const ORACLE_UPDATE_ABI = ["function update() external"];

// Treasury ABI for epoch management
const TREASURY_EPOCH_ABI = [
  "function allocateSeigniorage() external",
  "function nextEpochPoint() external view returns (uint256)",
  "function epoch() external view returns (uint256)"
];

// Environment configuration loader
export const loadPingerConfig = (): {
  rpcUrl: string;
  privateKey: string;
  oracleAddress: string;
  treasuryAddress?: string;
} => {
  const rpcUrl = process.env.PINGER_RPC_URL;
  const privateKey = process.env.PINGER_PRIVATE_KEY;
  const oracleAddress = process.env.PINGER_ORACLE_ADDRESS;
  const treasuryAddress = process.env.PINGER_TREASURY_ADDRESS;

  if (!privateKey) {
    throw new Error('PINGER_PRIVATE_KEY environment variable is required');
  }

  if (!rpcUrl) {
    throw new Error('PINGER_RPC_URL environment variable is required');
  }

  if (!oracleAddress) {
    throw new Error('PINGER_ORACLE_ADDRESS environment variable is required');
  }

  return {
    rpcUrl,
    privateKey,
    oracleAddress,
    treasuryAddress,
  };
};

export class ProtocolPinger {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private oracle: ethers.Contract;
  private treasury: ethers.Contract | null;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private retryCount: number = 0;

  constructor(
    rpcUrl: string,
    privateKey: string,
    oracleAddress?: string,
    treasuryAddress?: string
  ) {
    // Initialize provider and wallet
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // Initialize oracle contract
    this.oracle = new ethers.Contract(
      oracleAddress || CONTRACT_ADDRESSES.Oracle,
      ORACLE_UPDATE_ABI,
      this.wallet
    );

    // Initialize treasury contract (optional)
    this.treasury = treasuryAddress ? new ethers.Contract(
      treasuryAddress,
      TREASURY_EPOCH_ABI,
      this.wallet
    ) : null;

    console.log('🔧 Protocol Pinger initialized');
    console.log(`📍 Oracle: ${this.oracle.address}`);
    console.log(`📍 Treasury: ${this.treasury ? this.treasury.address : 'Not configured'}`);
    console.log(`👤 Wallet: ${this.wallet.address}`);
  }

  /**
   * Execute one protocol tick
   */
  private async executeTick(): Promise<void> {
    try {
      console.log(`\n⏰ Tick started at ${new Date().toISOString()}`);

      // Step 1: Update oracle (cheap operation)
      await this.updateOracle();

      // Step 2: Check and execute epoch if treasury is configured
      // if (this.treasury) {
      //   await this.checkAndExecuteEpoch();
      // } else {
      //   console.log('⏭️ Skipping epoch check (treasury not configured)');
      // }

      // Reset retry count on success
      this.retryCount = 0;
      console.log('✅ Tick completed successfully');

    } catch (error) {
      this.retryCount++;
      console.error(`❌ Tick failed (attempt ${this.retryCount}/${MAX_RETRIES}):`, error);

      if (this.retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying in ${RETRY_DELAY / 1000} seconds...`);
        setTimeout(() => this.executeTick(), RETRY_DELAY);
      } else {
        console.error('🚨 Max retries reached, stopping pinger');
        this.stop();
      }
    }
  }

  /**
   * Update oracle with current price data
   */
  private async updateOracle(): Promise<void> {
    try {
      console.log('📊 Updating oracle...');
      
      // Estimate gas first
      const gasEstimate = await this.oracle.estimateGas.update();
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

      // Execute oracle update
      const tx = await this.oracle.update({
        gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
      });

      console.log(`🔗 Oracle update transaction: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Oracle updated (gas used: ${receipt.gasUsed.toString()})`);

    } catch (error) {
      // Check if this is an "already known" error (which is not a real error)
      const errorMessage = error.toString().toLowerCase();
      if (errorMessage.includes('already known') || errorMessage.includes('-32603')) {
        console.log('ℹ️ Oracle already up-to-date (transaction already known)');
        return; // Don't throw error, just return successfully
      }
      
      console.error('❌ Oracle update failed:', error);
      throw error;
    }
  }

  /**
   * Check if epoch boundary has arrived and execute if needed
   */
  private async checkAndExecuteEpoch(): Promise<void> {
    try {
      // Get current block timestamp
      const latestBlock = await this.provider.getBlock('latest');
      if (!latestBlock) {
        throw new Error('Failed to get latest block');
      }

      const now = latestBlock.timestamp;
      const nextEpochPoint = await this.treasury.nextEpochPoint();
      const currentEpoch = await this.treasury.epoch();

      console.log(`📅 Current time: ${now}`);
      console.log(`📅 Next epoch point: ${nextEpochPoint}`);
      console.log(`📅 Current epoch: ${currentEpoch}`);

      if (now >= nextEpochPoint) {
        console.log('🎯 Epoch boundary reached, executing seigniorage allocation...');
        
        // Estimate gas for seigniorage allocation
        const gasEstimate = await this.treasury.estimateGas.allocateSeigniorage();
        console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);

        // Execute seigniorage allocation
        const tx = await this.treasury.allocateSeigniorage({
          gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
        });

        console.log(`🔗 Seigniorage allocation transaction: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`✅ Epoch executed (gas used: ${receipt.gasUsed.toString()})`);

      } else {
        const timeUntilEpoch = nextEpochPoint - now;
        const minutesUntilEpoch = Math.floor(timeUntilEpoch / 60);
        console.log(`⏳ No epoch yet (${minutesUntilEpoch} minutes until next epoch)`);
      }

    } catch (error) {
      console.error('❌ Epoch check/execution failed:', error);
      throw error;
    }
  }

  /**
   * Start the pinger
   */
  public start(): void {
    if (this.isRunning) {
      console.log('⚠️ Pinger is already running');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Starting protocol pinger (interval: ${PING_INTERVAL / 1000 / 60} minutes)`);

    // Execute immediately
    this.executeTick();

    // Then schedule regular execution
    this.intervalId = setInterval(() => {
      this.executeTick();
    }, PING_INTERVAL);
  }

  /**
   * Stop the pinger
   */
  public stop(): void {
    if (!this.isRunning) {
      console.log('⚠️ Pinger is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('🛑 Protocol pinger stopped');
  }

  /**
   * Get pinger status
   */
  public getStatus(): {
    isRunning: boolean;
    retryCount: number;
    walletAddress: string;
    oracleAddress: string;
    treasuryAddress: string | null;
  } {
    return {
      isRunning: this.isRunning,
      retryCount: this.retryCount,
      walletAddress: this.wallet.address,
      oracleAddress: this.oracle.address,
      treasuryAddress: this.treasury ? this.treasury.address : null,
    };
  }
}

// Utility function to create pinger instance
export const createPinger = (
  rpcUrl: string,
  privateKey: string,
  oracleAddress?: string,
  treasuryAddress?: string
): ProtocolPinger => {
  return new ProtocolPinger(rpcUrl, privateKey, oracleAddress, treasuryAddress);
};

// Example usage (commented out for safety)
/*
const pinger = createPinger(
  'https://your-rpc-url.com',
  'your-private-key-here'
);

pinger.start();

// To stop: pinger.stop();
// To check status: console.log(pinger.getStatus());
*/ 