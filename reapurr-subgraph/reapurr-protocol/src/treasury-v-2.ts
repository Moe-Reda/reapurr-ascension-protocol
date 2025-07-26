import {
  BoughtBonds as BoughtBondsEvent,
  BurnedBonds as BurnedBondsEvent,
  DaoFundFunded as DaoFundFundedEvent,
  DevFundFunded as DevFundFundedEvent,
  Initialized as InitializedEvent,
  MasonryFunded as MasonryFundedEvent,
  OperatorTransferred as OperatorTransferredEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  RedeemedBonds as RedeemedBondsEvent,
  TeamFundFunded as TeamFundFundedEvent,
  TreasuryFunded as TreasuryFundedEvent
} from "../generated/TreasuryV2/TreasuryV2"
import {
  BoughtBonds,
  BurnedBonds,
  DaoFundFunded,
  DevFundFunded,
  Initialized,
  MasonryFunded,
  OperatorTransferred,
  OwnershipTransferred,
  RedeemedBonds,
  TeamFundFunded,
  TreasuryFunded
} from "../generated/schema"

export function handleBoughtBonds(event: BoughtBondsEvent): void {
  let entity = new BoughtBonds(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.SCTAmount = event.params.SCTAmount
  entity.bondAmount = event.params.bondAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBurnedBonds(event: BurnedBondsEvent): void {
  let entity = new BurnedBonds(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.bondAmount = event.params.bondAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDaoFundFunded(event: DaoFundFundedEvent): void {
  let entity = new DaoFundFunded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.timestamp = event.params.timestamp
  entity.seigniorage = event.params.seigniorage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDevFundFunded(event: DevFundFundedEvent): void {
  let entity = new DevFundFunded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.timestamp = event.params.timestamp
  entity.seigniorage = event.params.seigniorage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.executor = event.params.executor
  entity.at = event.params.at

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMasonryFunded(event: MasonryFundedEvent): void {
  let entity = new MasonryFunded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.timestamp = event.params.timestamp
  entity.seigniorage = event.params.seigniorage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOperatorTransferred(
  event: OperatorTransferredEvent
): void {
  let entity = new OperatorTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOperator = event.params.previousOperator
  entity.newOperator = event.params.newOperator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRedeemedBonds(event: RedeemedBondsEvent): void {
  let entity = new RedeemedBonds(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.SCTAmount = event.params.SCTAmount
  entity.bondAmount = event.params.bondAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTeamFundFunded(event: TeamFundFundedEvent): void {
  let entity = new TeamFundFunded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.timestamp = event.params.timestamp
  entity.seigniorage = event.params.seigniorage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTreasuryFunded(event: TreasuryFundedEvent): void {
  let entity = new TreasuryFunded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.timestamp = event.params.timestamp
  entity.seigniorage = event.params.seigniorage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
