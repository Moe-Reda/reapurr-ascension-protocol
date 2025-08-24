# Reapurr Protocol Subgraph

This subgraph indexes events from the Reapurr Protocol smart contracts on HyperEVM testnet.

## Contracts Indexed

- **TreasuryV2** (`0xbC855e87C76c85256E5E788b04bc8d3Fd10CE103`) - Bond purchases, redemptions, and treasury funding
- **MasonryV2** (`0x771Ff7409e84952c79bD930BBd396617335e0873`) - Staking and reward claiming
- **SCTGenesisRewardPool** (`0x1D8688617590548250E4327930DE826668e65b73`) - SCT reward pool deposits and withdrawals
- **GSCTRewardPool** (`0x97CFC3285797545A25BAF4b4E2dDEdca863AEf68`) - GSCT reward pool deposits and withdrawals

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Generate types from ABIs:
```bash
yarn codegen
```

3. Build the subgraph:
```bash
yarn build
```

## Local Development

1. Start a local Graph Node:
```bash
docker-compose up -d
```

2. Create the subgraph:
```bash
yarn create-local
```

3. Deploy to local node:
```bash
yarn deploy-local
```

## Deployment

### To The Graph Studio (Hosted Service)

1. Create a new subgraph on [The Graph Studio](https://studio.thegraph.com/)
2. Get your access token
3. Deploy:
```bash
yarn deploy
```

### To Decentralized Network

1. Deploy to the decentralized network:
```bash
yarn deploy --product hosted-service <GITHUB_USER>/<SUBGRAPH_NAME>
```

## Schema Overview

### Treasury Events
- `BoughtBonds` - When users purchase bonds
- `RedeemedBonds` - When users redeem bonds
- `TreasuryFunded` - When treasury receives seigniorage
- `MasonryFunded` - When masonry receives funding

### Staking Events
- `Stake` - When users stake tokens in masonry
- `Unstake` - When users unstake tokens from masonry
- `Claim` - When users claim rewards from masonry

### Pool Events
- `PoolDeposit` - When users deposit into SCT reward pool
- `PoolWithdraw` - When users withdraw from SCT reward pool
- `PoolReward` - When users claim rewards from SCT pool

### Farm Events
- `FarmDeposit` - When users deposit into GSCT reward pool
- `FarmWithdraw` - When users withdraw from GSCT reward pool
- `FarmReward` - When users claim rewards from GSCT pool

### Aggregate Stats
- `ProtocolStats` - Global protocol statistics
- `PoolStats` - Per-pool statistics
- `FarmStats` - Per-farm statistics
- `MasonryStats` - Masonry-specific statistics
- `DailyEmission` - Daily emission tracking
- `MasonryEpoch` - Epoch-based masonry data

## Testing

Run tests:
```bash
yarn test
```

## Query Examples

### Get Protocol Stats
```graphql
{
  protocolStats(id: "global") {
    totalBondsPurchased
    totalBondsRedeemed
    totalSeigniorage
    totalStaked
    totalRewardsClaimed
    lastSeigniorage
    lastUpdated
  }
}
```

### Get Recent Bond Purchases
```graphql
{
  boughtBonds(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
    from
    SCTAmount
    bondAmount
    blockTimestamp
  }
}
```

### Get Pool Statistics
```graphql
{
  poolStats(id: "pool-0") {
    pid
    totalStaked
    lastUpdated
  }
}
```

## Environment Variables

Create a `.env` file with:
```
GRAPH_ACCESS_TOKEN=your_access_token_here
```

## Notes

- The `RewardPaid` events from both reward pools don't include the `pid` parameter, so pool-specific reward tracking is limited
- All timestamps are stored as BigInt representing Unix timestamps
- The subgraph uses HyperEVM testnet network configuration 