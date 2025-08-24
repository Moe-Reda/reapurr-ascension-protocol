import { parseAbi } from 'viem';

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

// Check if we're on testnet
const isTestnet = getEnvVar('VITE_IS_TESTNET') === "true";

// Mainnet addresses for DexScreener price fetching
const MAINNET_ADDRESSES = {
  PURR: '0xc1fb593aeffbeb02f85e0308e9956a90',
  HYPE: '0x5555555555555555555555555555555555555555',
} as const;

// Testnet to mainnet address mapping
const TESTNET_TO_MAINNET_MAP: Record<string, string> = {
  // Testnet PURR -> Mainnet PURR
  '0xC003D79B8a489703b1753711E3ae9fFDFC8d1a82': MAINNET_ADDRESSES.PURR,
  // Testnet HYPE -> Mainnet HYPE  
  '0x5555555555555555555555555555555555555555': MAINNET_ADDRESSES.HYPE,
  // Additional testnet HYPE address -> Mainnet HYPE
  '0xADcb2f358Eae6492F61A5F87eb8893d09391d160': MAINNET_ADDRESSES.HYPE,
};

// Function to get the appropriate address for price fetching
export const getPriceFetchAddress = (address: string): string => {
  if (isTestnet && TESTNET_TO_MAINNET_MAP[address]) {
    return TESTNET_TO_MAINNET_MAP[address];
  }
  return address;
};

// Contract addresses from environment variables
export const CONTRACT_ADDRESSES = {
  // Main tokens
  SCT: getEnvVar('VITE_SCT_ADDRESS') || '0x65545d42515e4c860EF51C2d06f8Ced58b4F3a74',
  BSCT: getEnvVar('VITE_BSCT_ADDRESS') || '0x0Cf7005999CC40063853F2DD95f887b672d11De0',
  GSCT: getEnvVar('VITE_GSCT_ADDRESS') || '0x65b8397C3501172131cA7dF0e48e7a8Cf5b18738',
  HYPE: getEnvVar('VITE_HYPE_ADDRESS') || '0x5555555555555555555555555555555555555555',
  USDC: getEnvVar('VITE_USDC_ADDRESS') || '0xd9CBEC81df392A88AEff575E962d149d57F4d6bc',
  PURR: getEnvVar('VITE_PURR_ADDRESS') || '0xC003D79B8a489703b1753711E3ae9fFDFC8d1a82',
  
  // Core protocol contracts
  MasonryV2: getEnvVar('VITE_MASONRY_V2_ADDRESS') || '0x771Ff7409e84952c79bD930BBd396617335e0873',
  TreasuryV2: getEnvVar('VITE_TREASURY_V2_ADDRESS') || '0xbC855e87C76c85256E5E788b04bc8d3Fd10CE103',
  Oracle: getEnvVar('VITE_ORACLE_ADDRESS') || '0x7D37a5324D1012EaF1cEE1fA0E4aaaBFD9Ed3FBe',
  
  // Reward pools
  SCTGenesisRewardPool: getEnvVar('VITE_SCT_GENESIS_REWARD_POOL_ADDRESS') || '0x65545d42515e4c860EF51C2d06f8Ced58b4F3a74',
  GSCTRewardPool: getEnvVar('VITE_GSCT_REWARD_POOL_ADDRESS') || '0x97CFC3285797545A25BAF4b4E2dDEdca863AEf68',

  // LP Tokens
  SCTHYPE: getEnvVar('VITE_SCT_HYPE_LP_ADDRESS') || '0x95086e54952C1EaE95d0381c1bE801728ed64d83',
  GSCTHYPE: getEnvVar('VITE_GSCT_HYPE_LP_ADDRESS') || '0x162991e2926089D493beB9458Bd1f94db2F5efB1'
  
} as const;

// Contract ABIs - extracted from your artifacts
export const CONTRACT_ABIS = {
  // ERC20 Token ABI (for SCT, BSCT, GSCT)
  ERC20: parseAbi([
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address,address) view returns (uint256)',
    'function approve(address,uint256) returns (bool)',
    'function transfer(address,uint256) returns (bool)',
    'function transferFrom(address,address,uint256) returns (bool)',
  ]),

  // Oracle ABI - Simplified without parameter names
  Oracle: parseAbi([
    'function consult(address,uint256) view returns (uint256)',
    'function twap(address,uint256) view returns (uint256)',
    'function update()',
    'function pair() view returns (address)',
    'function token0() view returns (address)',
    'function token1() view returns (address)',
    'function price0CumulativeLast() view returns (uint256)',
    'function price1CumulativeLast() view returns (uint256)',
    'function blockTimestampLast() view returns (uint32)',
  ]),

  // MasonryV2 ABI
  MasonryV2: parseAbi([
    'function SCT() view returns (address)',
    'function share() view returns (address)',
    'function treasury() view returns (address)',
    'function epoch() view returns (uint256)',
    'function nextEpochPoint() view returns (uint256)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function earned(address) view returns (uint256)',
    'function canClaimReward(address) view returns (bool)',
    'function canWithdraw(address) view returns (bool)',
    'function rewardLockupEpochs() view returns (uint256)',
    'function withdrawLockupEpochs() view returns (uint256)',
    'function stake(uint256)',
    'function withdraw(uint256)',
    'function claimReward()',
    'function exit()',
  ]),

  // TreasuryV2 ABI
  TreasuryV2: parseAbi([
    'function SCT() view returns (address)',
    'function BSCT() view returns (address)',
    'function epoch() view returns (uint256)',
    'function nextEpochPoint() view returns (uint256)',
    'function getSCTPrice() view returns (uint256)',
    'function getBSCTPrice() view returns (uint256)',
    'function getBondDiscountRate() view returns (uint256)',
    'function getBondPremiumRate() view returns (uint256)',
    'function buyBonds(uint256,uint256)',
    'function redeemBonds(uint256,uint256)',
    'function allocateSeigniorage()',
  ]),

  // Reward Pool ABI
  RewardPool: parseAbi([
    // View functions
    'function SCT() view returns (address)',
    'function devFund() view returns (address)',
    'function operator() view returns (address)',
    'function poolStartTime() view returns (uint256)',
    'function poolEndTime() view returns (uint256)',
    'function SCTPerSecond() view returns (uint256)',
    'function sharePerSecond() view returns (uint256)',
    'function runningTime() view returns (uint256)',
    'function totalAllocPoint() view returns (uint256)',
    'function poolLength() view returns (uint256)',
    'function pendingSCT(uint256,address) view returns (uint256)',
    'function pendingShare(uint256,address) view returns (uint256)',
    'function poolInfo(uint256) view returns (address,uint256,uint256,uint256,uint256,bool,uint256)',
    'function userInfo(uint256,address) view returns (uint256,uint256)',
    'function getGeneratedReward(uint256,uint256) view returns (uint256)',
    'function poolTVL(uint256) view returns (uint256)',
    'function allPoolsTVL() view returns (uint256[])',
    
    // State changing functions
    'function deposit(uint256,uint256)',
    'function withdraw(uint256,uint256)',
    'function emergencyWithdraw(uint256)',
    'function massUpdatePools()',
    'function updatePool(uint256)',
    
    // Admin functions
    'function add(uint256,uint256,address,bool,uint256)',
    'function set(uint256,uint256,uint256)',
    'function setOperator(address)',
    'function setDevFund(address)',
    'function governanceRecoverUnsupported(address,uint256,address)',
  ]),

  // GSCT Reward Pool ABI
  GSCTRewardPool: parseAbi([
    // View functions
    'function SCT() view returns (address)',
    'function devFund() view returns (address)',
    'function operator() view returns (address)',
    'function poolStartTime() view returns (uint256)',
    'function poolEndTime() view returns (uint256)',
    'function SCTPerSecond() view returns (uint256)',
    'function sharePerSecond() view returns (uint256)',
    'function runningTime() view returns (uint256)',
    'function totalAllocPoint() view returns (uint256)',
    'function poolLength() view returns (uint256)',
    'function pendingSCT(uint256,address) view returns (uint256)',
    'function pendingShare(uint256,address) view returns (uint256)',
    'function poolInfo(uint256) view returns (address,uint256,uint256,uint256,uint256,bool)',
    'function userInfo(uint256,address) view returns (uint256,uint256)',
    'function getGeneratedReward(uint256,uint256) view returns (uint256)',
    'function poolTVL(uint256) view returns (uint256)',
    'function allPoolsTVL() view returns (uint256[])',
    
    // State changing functions
    'function deposit(uint256,uint256)',
    'function withdraw(uint256,uint256)',
    'function emergencyWithdraw(uint256)',
    'function massUpdatePools()',
    'function updatePool(uint256)',
    
    // Admin functions
    'function add(uint256,uint256,address,bool,uint256)',
    'function set(uint256,uint256,uint256)',
    'function setOperator(address)',
    'function setDevFund(address)',
    'function governanceRecoverUnsupported(address,uint256,address)',
  ]),
} as const;

// Network configuration from environment variables
export const NETWORKS = {
  998: {
    name: 'HyperEVM Testnet',
    rpcUrl: getEnvVar('VITE_RPC_URL'),
    blockExplorer: getEnvVar('VITE_BLOCK_EXPLORER'),
  },
} as const;

// Utility functions
export const formatEther = (value: bigint): string => {
  return (Number(value) / 1e18).toFixed(6);
};

export const parseEther = (value: string): bigint => {
  return BigInt(Math.floor(Number(value) * 1e18));
};

export const formatToken = (value: bigint, decimals: number = 18): string => {
  return (Number(value) / Math.pow(10, decimals)).toFixed(6);
};

export const parseToken = (value: string, decimals: number = 18): bigint => {
  return BigInt(Math.floor(Number(value) * Math.pow(10, decimals)));
}; 