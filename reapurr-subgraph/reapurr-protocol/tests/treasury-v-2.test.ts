import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { BoughtBonds } from "../generated/schema"
import { BoughtBonds as BoughtBondsEvent } from "../generated/TreasuryV2/TreasuryV2"
import { handleBoughtBonds } from "../src/treasury-v-2"
import { createBoughtBondsEvent } from "./treasury-v-2-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let from = Address.fromString("0x0000000000000000000000000000000000000001")
    let SCTAmount = BigInt.fromI32(234)
    let bondAmount = BigInt.fromI32(234)
    let newBoughtBondsEvent = createBoughtBondsEvent(
      from,
      SCTAmount,
      bondAmount
    )
    handleBoughtBonds(newBoughtBondsEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("BoughtBonds created and stored", () => {
    assert.entityCount("BoughtBonds", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BoughtBonds",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "from",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "BoughtBonds",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "SCTAmount",
      "234"
    )
    assert.fieldEquals(
      "BoughtBonds",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "bondAmount",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
