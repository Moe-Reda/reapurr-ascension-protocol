import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
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
} from "../generated/TreasuryV2/TreasuryV2"

export function createBoughtBondsEvent(
  from: Address,
  SCTAmount: BigInt,
  bondAmount: BigInt
): BoughtBonds {
  let boughtBondsEvent = changetype<BoughtBonds>(newMockEvent())

  boughtBondsEvent.parameters = new Array()

  boughtBondsEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  boughtBondsEvent.parameters.push(
    new ethereum.EventParam(
      "SCTAmount",
      ethereum.Value.fromUnsignedBigInt(SCTAmount)
    )
  )
  boughtBondsEvent.parameters.push(
    new ethereum.EventParam(
      "bondAmount",
      ethereum.Value.fromUnsignedBigInt(bondAmount)
    )
  )

  return boughtBondsEvent
}

export function createBurnedBondsEvent(
  from: Address,
  bondAmount: BigInt
): BurnedBonds {
  let burnedBondsEvent = changetype<BurnedBonds>(newMockEvent())

  burnedBondsEvent.parameters = new Array()

  burnedBondsEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  burnedBondsEvent.parameters.push(
    new ethereum.EventParam(
      "bondAmount",
      ethereum.Value.fromUnsignedBigInt(bondAmount)
    )
  )

  return burnedBondsEvent
}

export function createDaoFundFundedEvent(
  timestamp: BigInt,
  seigniorage: BigInt
): DaoFundFunded {
  let daoFundFundedEvent = changetype<DaoFundFunded>(newMockEvent())

  daoFundFundedEvent.parameters = new Array()

  daoFundFundedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  daoFundFundedEvent.parameters.push(
    new ethereum.EventParam(
      "seigniorage",
      ethereum.Value.fromUnsignedBigInt(seigniorage)
    )
  )

  return daoFundFundedEvent
}

export function createDevFundFundedEvent(
  timestamp: BigInt,
  seigniorage: BigInt
): DevFundFunded {
  let devFundFundedEvent = changetype<DevFundFunded>(newMockEvent())

  devFundFundedEvent.parameters = new Array()

  devFundFundedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  devFundFundedEvent.parameters.push(
    new ethereum.EventParam(
      "seigniorage",
      ethereum.Value.fromUnsignedBigInt(seigniorage)
    )
  )

  return devFundFundedEvent
}

export function createInitializedEvent(
  executor: Address,
  at: BigInt
): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam("executor", ethereum.Value.fromAddress(executor))
  )
  initializedEvent.parameters.push(
    new ethereum.EventParam("at", ethereum.Value.fromUnsignedBigInt(at))
  )

  return initializedEvent
}

export function createMasonryFundedEvent(
  timestamp: BigInt,
  seigniorage: BigInt
): MasonryFunded {
  let masonryFundedEvent = changetype<MasonryFunded>(newMockEvent())

  masonryFundedEvent.parameters = new Array()

  masonryFundedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  masonryFundedEvent.parameters.push(
    new ethereum.EventParam(
      "seigniorage",
      ethereum.Value.fromUnsignedBigInt(seigniorage)
    )
  )

  return masonryFundedEvent
}

export function createOperatorTransferredEvent(
  previousOperator: Address,
  newOperator: Address
): OperatorTransferred {
  let operatorTransferredEvent = changetype<OperatorTransferred>(newMockEvent())

  operatorTransferredEvent.parameters = new Array()

  operatorTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOperator",
      ethereum.Value.fromAddress(previousOperator)
    )
  )
  operatorTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "newOperator",
      ethereum.Value.fromAddress(newOperator)
    )
  )

  return operatorTransferredEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createRedeemedBondsEvent(
  from: Address,
  SCTAmount: BigInt,
  bondAmount: BigInt
): RedeemedBonds {
  let redeemedBondsEvent = changetype<RedeemedBonds>(newMockEvent())

  redeemedBondsEvent.parameters = new Array()

  redeemedBondsEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  redeemedBondsEvent.parameters.push(
    new ethereum.EventParam(
      "SCTAmount",
      ethereum.Value.fromUnsignedBigInt(SCTAmount)
    )
  )
  redeemedBondsEvent.parameters.push(
    new ethereum.EventParam(
      "bondAmount",
      ethereum.Value.fromUnsignedBigInt(bondAmount)
    )
  )

  return redeemedBondsEvent
}

export function createTeamFundFundedEvent(
  timestamp: BigInt,
  seigniorage: BigInt
): TeamFundFunded {
  let teamFundFundedEvent = changetype<TeamFundFunded>(newMockEvent())

  teamFundFundedEvent.parameters = new Array()

  teamFundFundedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  teamFundFundedEvent.parameters.push(
    new ethereum.EventParam(
      "seigniorage",
      ethereum.Value.fromUnsignedBigInt(seigniorage)
    )
  )

  return teamFundFundedEvent
}

export function createTreasuryFundedEvent(
  timestamp: BigInt,
  seigniorage: BigInt
): TreasuryFunded {
  let treasuryFundedEvent = changetype<TreasuryFunded>(newMockEvent())

  treasuryFundedEvent.parameters = new Array()

  treasuryFundedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  treasuryFundedEvent.parameters.push(
    new ethereum.EventParam(
      "seigniorage",
      ethereum.Value.fromUnsignedBigInt(seigniorage)
    )
  )

  return treasuryFundedEvent
}
