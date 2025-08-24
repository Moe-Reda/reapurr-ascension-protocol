import { BigInt } from "@graphprotocol/graph-ts"
import {
  Staked as StakedEvent,
  Withdrawn as WithdrawnEvent
} from "../generated/MasonryV2/MasonryV2"
import { MasonryTVL } from "../generated/schema"

export function handleMasonryStake(event: StakedEvent): void {
  let masonryTVL = MasonryTVL.load("masonry")
  
  if (!masonryTVL) {
    masonryTVL = new MasonryTVL("masonry")
    masonryTVL.tvl = BigInt.fromI32(0)
  }
  
  masonryTVL.tvl = masonryTVL.tvl.plus(event.params.amount)
  masonryTVL.lastUpdated = event.block.timestamp
  masonryTVL.save()
}

export function handleMasonryWithdraw(event: WithdrawnEvent): void {
  let masonryTVL = MasonryTVL.load("masonry")
  
  if (!masonryTVL) {
    masonryTVL = new MasonryTVL("masonry")
    masonryTVL.tvl = BigInt.fromI32(0)
  }
  
  masonryTVL.tvl = masonryTVL.tvl.minus(event.params.amount)
  masonryTVL.lastUpdated = event.block.timestamp
  masonryTVL.save()
} 