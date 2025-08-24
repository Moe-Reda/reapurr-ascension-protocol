import { BigInt } from "@graphprotocol/graph-ts"
import {
  Deposit as DepositEvent,
  Withdraw as WithdrawEvent
} from "../generated/GSCTRewardPool/GSCTRewardPool"
import { GSCTPoolTVL } from "../generated/schema"

export function handleGSCTPoolDeposit(event: DepositEvent): void {
  let poolId = "gsct-pool-".concat(event.params.pid.toString())
  let poolTVL = GSCTPoolTVL.load(poolId)
  
  if (!poolTVL) {
    poolTVL = new GSCTPoolTVL(poolId)
    poolTVL.pid = event.params.pid.toI32()
    poolTVL.tvl = BigInt.fromI32(0)
  }
  
  poolTVL.tvl = poolTVL.tvl.plus(event.params.amount)
  poolTVL.lastUpdated = event.block.timestamp
  poolTVL.save()
}

export function handleGSCTPoolWithdraw(event: WithdrawEvent): void {
  let poolId = "gsct-pool-".concat(event.params.pid.toString())
  let poolTVL = GSCTPoolTVL.load(poolId)
  
  if (!poolTVL) {
    poolTVL = new GSCTPoolTVL(poolId)
    poolTVL.pid = event.params.pid.toI32()
    poolTVL.tvl = BigInt.fromI32(0)
  }
  
  poolTVL.tvl = poolTVL.tvl.minus(event.params.amount)
  poolTVL.lastUpdated = event.block.timestamp
  poolTVL.save()
} 