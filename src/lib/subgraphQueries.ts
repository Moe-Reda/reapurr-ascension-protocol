import { gql } from '@apollo/client';

// Protocol Statistics Queries
export const GET_PROTOCOL_STATS = gql`
  query GetProtocolStats {
    protocolStats_collection(first: 1) {
      id
      totalBondsPurchased
      totalBondsRedeemed
      totalSeigniorage
      totalStaked
      totalRewardsClaimed
      lastSeigniorage
      lastUpdated
    }
    boughtBonds_collection(first: 1000, orderBy: blockTimestamp, orderDirection: desc) {
      id
      from
      SCTAmount
      bondAmount
      blockTimestamp
      blockNumber
      transactionHash
    }
    redeemedBonds_collection(first: 1000, orderBy: blockTimestamp, orderDirection: desc) {
      id
      from
      SCTAmount
      bondAmount
      blockTimestamp
      blockNumber
      transactionHash
    }
    treasuryFundeds(first: 100, orderBy: blockTimestamp, orderDirection: desc) {
      id
      timestamp
      seigniorage
      blockTimestamp
      blockNumber
      transactionHash
    }
    masonryFundeds(first: 100, orderBy: blockTimestamp, orderDirection: desc) {
      id
      timestamp
      seigniorage
      blockTimestamp
      blockNumber
      transactionHash
    }
  }
`;

// Staking Statistics Queries
export const GET_STAKING_STATS = gql`
  query GetStakingStats {
    masonryStats_collection(first: 1) {
      id
      totalStaked
      lastUpdated
    }
    stakes(first: 1000, orderBy: timestamp, orderDirection: desc) {
      id
      user
      amount
      timestamp
      blockNumber
      transactionHash
    }
    unstakes(first: 1000, orderBy: timestamp, orderDirection: desc) {
      id
      user
      amount
      timestamp
      blockNumber
      transactionHash
    }
    claims(first: 1000, orderBy: timestamp, orderDirection: desc) {
      id
      user
      amount
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

// Pool Statistics Queries
export const GET_POOL_STATS = gql`
  query GetPoolStats {
    poolStats_collection(first: 100, orderBy: lastUpdated, orderDirection: desc) {
      id
      pid
      totalStaked
      lastUpdated
    }
    poolDeposits(first: 1000, orderBy: timestamp, orderDirection: desc) {
      id
      user
      pid
      amount
      timestamp
      blockNumber
      transactionHash
    }
    poolWithdraws(first: 1000, orderBy: timestamp, orderDirection: desc) {
      id
      user
      pid
      amount
      timestamp
      blockNumber
      transactionHash
    }
    poolRewards(first: 1000, orderBy: timestamp, orderDirection: desc) {
      id
      user
      pid
      amount
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

// Farm Statistics Queries
export const GET_FARM_STATS = gql`
  query GetFarmStats {
    farmStats_collection(first: 100, orderBy: lastUpdated, orderDirection: desc) {
      id
      pid
      totalStaked
      lastUpdated
    }
    farmDeposits(first: 1000, orderBy: timestamp, orderDirection: desc) {
      id
      user
      pid
      amount
      timestamp
      blockNumber
      transactionHash
    }
    farmWithdraws(first: 1000, orderBy: timestamp, orderDirection: desc) {
      id
      user
      pid
      amount
      timestamp
      blockNumber
      transactionHash
    }
    farmRewards(first: 1000, orderBy: timestamp, orderDirection: desc) {
      id
      user
      pid
      amount
      timestamp
      blockNumber
      transactionHash
    }
  }
`;

// User Activity Queries
export const GET_USER_ACTIVITY = gql`
  query GetUserActivity($userAddress: String!) {
    boughtBonds_collection(where: { from: $userAddress }, first: 100, orderBy: blockTimestamp, orderDirection: desc) {
      id
      SCTAmount
      bondAmount
      blockTimestamp
      transactionHash
    }
    redeemedBonds_collection(where: { from: $userAddress }, first: 100, orderBy: blockTimestamp, orderDirection: desc) {
      id
      SCTAmount
      bondAmount
      blockTimestamp
      transactionHash
    }
    stakes(where: { user: $userAddress }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      timestamp
      transactionHash
    }
    unstakes(where: { user: $userAddress }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      timestamp
      transactionHash
    }
    claims(where: { user: $userAddress }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      timestamp
      transactionHash
    }
    poolDeposits(where: { user: $userAddress }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      pid
      amount
      timestamp
      transactionHash
    }
    poolWithdraws(where: { user: $userAddress }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      pid
      amount
      timestamp
      transactionHash
    }
    farmDeposits(where: { user: $userAddress }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      pid
      amount
      timestamp
      transactionHash
    }
    farmWithdraws(where: { user: $userAddress }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      pid
      amount
      timestamp
      transactionHash
    }
  }
`;

// Recent Activity Query
export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity {
    boughtBonds_collection(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
      id
      from
      SCTAmount
      bondAmount
      blockTimestamp
    }
    redeemedBonds_collection(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
      id
      from
      SCTAmount
      bondAmount
      blockTimestamp
    }
    stakes(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      user
      amount
      timestamp
    }
    unstakes(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      user
      amount
      timestamp
    }
    poolDeposits(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      user
      pid
      amount
      timestamp
    }
    farmDeposits(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      user
      pid
      amount
      timestamp
    }
  }
`;

// Daily Emissions Query
export const GET_DAILY_EMISSIONS = gql`
  query GetDailyEmissions($days: Int!) {
    dailyEmissions(first: $days, orderBy: dayStart, orderDirection: desc) {
      id
      amount
      dayStart
    }
  }
`;

// Masonry Epochs Query
export const GET_MASONRY_EPOCHS = gql`
  query GetMasonryEpochs($limit: Int!) {
    masonryEpoches(first: $limit, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      seigniorage
      totalStaked
    }
  }
`;

// Pool-specific Stats Query
export const GET_POOL_BY_ID = gql`
  query GetPoolById($pid: Int!) {
    poolStats_collection(where: { pid: $pid }) {
      id
      pid
      totalStaked
      lastUpdated
    }
    poolDeposits(where: { pid: $pid }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      user
      amount
      timestamp
      transactionHash
    }
    poolWithdraws(where: { pid: $pid }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      user
      amount
      timestamp
      transactionHash
    }
  }
`;

// Farm-specific Stats Query
export const GET_FARM_BY_ID = gql`
  query GetFarmById($pid: Int!) {
    farmStats_collection(where: { pid: $pid }) {
      id
      pid
      totalStaked
      lastUpdated
    }
    farmDeposits(where: { pid: $pid }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      user
      amount
      timestamp
      transactionHash
    }
    farmWithdraws(where: { pid: $pid }, first: 100, orderBy: timestamp, orderDirection: desc) {
      id
      user
      amount
      timestamp
      transactionHash
    }
  }
`;

// Simplified TVL Queries for the new subgraph
export const GET_SCT_POOL_TVLS = gql`
  query GetSCTPoolTVLs {
    sctPoolTVLs {
      id
      pid
      tvl
      lastUpdated
    }
  }
`;

export const GET_GSCT_POOL_TVLS = gql`
  query GetGSCTPoolTVLs {
    gsctpoolTVLs {
      id
      pid
      tvl
      lastUpdated
    }
  }
`;

export const GET_MASONRY_TVL = gql`
  query GetMasonryTVL {
    masonryTVL(id: "masonry") {
      id
      tvl
      lastUpdated
    }
  }
`;

export const GET_ALL_TVLS = gql`
  query GetAllTVLs {
    sctpoolTVLs {
      id
      pid
      tvl
      lastUpdated
    }
    gsctpoolTVLs {
      id
      pid
      tvl
      lastUpdated
    }
    masonryTVL(id: "masonry") {
      id
      tvl
      lastUpdated
    }
  }
`;

export const GET_SCT_POOL_BY_PID = gql`
  query GetSCTPoolByPid($pid: Int!) {
    sctpoolTVLs(where: { pid: $pid }) {
      id
      pid
      tvl
      lastUpdated
    }
  }
`;

export const GET_GSCT_POOL_BY_PID = gql`
  query GetGSCTPoolByPid($pid: Int!) {
    gsctpoolTVLs(where: { pid: $pid }) {
      id
      pid
      tvl
      lastUpdated
    }
  }
`; 