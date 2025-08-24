import { BigInt } from "@graphprotocol/graph-ts"
import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent
} from "../generated/SCTGenesisRewardPool/SCTGenesisRewardPool"
import { SCTPoolTVL } from "../generated/schema"

export function handleSCTPoolDeposit(event: DepositEvent): void {
  let poolId = "sct-pool-".concat(event.params.pid.toString())
  let poolTVL = SCTPoolTVL.load(poolId)
  
  if (!poolTVL) {
    poolTVL = new SCTPoolTVL(poolId)
    poolTVL.pid = event.params.pid.toI32()
    poolTVL.tvl = BigInt.fromI32(0)
  }
  
  poolTVL.tvl = poolTVL.tvl.plus(event.params.amount)
  poolTVL.lastUpdated = event.block.timestamp
  poolTVL.save()
}

export function handleSCTPoolWithdraw(event: WithdrawEvent): void {
  let poolId = "sct-pool-".concat(event.params.pid.toString())
  let poolTVL = SCTPoolTVL.load(poolId)
  
  if (!poolTVL) {
    poolTVL = new SCTPoolTVL(poolId)
    poolTVL.pid = event.params.pid.toI32()
    poolTVL.tvl = BigInt.fromI32(0)
  }
  
  poolTVL.tvl = poolTVL.tvl.minus(event.params.amount)
  poolTVL.lastUpdated = event.block.timestamp
  poolTVL.save()
} 