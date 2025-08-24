import { debugLPToken, getTokenUSDPrice } from '../src/lib/tokenPricing';
import { CONTRACT_ADDRESSES } from '../src/lib/contracts';

// Helper function to safely stringify objects containing BigInt
function safeStringify(obj: any): string {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  , 2);
}

async function testLPCalculation() {
  console.log('Testing LP token calculation...\n');

  // Debug: Show all contract addresses
  console.log('=== Contract Addresses Debug ===');
  console.log('SCT:', CONTRACT_ADDRESSES.SCT || 'NOT SET');
  console.log('GSCT:', CONTRACT_ADDRESSES.GSCT || 'NOT SET');
  console.log('HYPE:', CONTRACT_ADDRESSES.HYPE || 'NOT SET');
  console.log('SCTHYPE:', CONTRACT_ADDRESSES.SCTHYPE || 'NOT SET');
  console.log('GSCTHYPE:', CONTRACT_ADDRESSES.GSCTHYPE || 'NOT SET');
  console.log('Oracle:', CONTRACT_ADDRESSES.Oracle || 'NOT SET');
  console.log('USDC:', CONTRACT_ADDRESSES.USDC || 'NOT SET');
  console.log('');

  // Only test if addresses are available
  if (!CONTRACT_ADDRESSES.SCTHYPE) {
    console.log('❌ SCTHYPE address not set - skipping test');
  } else {
    // Test 1: SCT-HYPE LP Token (this should work with oracle + DexScreener)
    console.log('=== Testing SCT-HYPE LP Token ===');
    console.log('LP Address:', CONTRACT_ADDRESSES.SCTHYPE);
    
    try {
      const debugInfo = await debugLPToken(CONTRACT_ADDRESSES.SCTHYPE as any);
      console.log('Debug Info:', safeStringify(debugInfo));
      
      const priceResult = await getTokenUSDPrice(CONTRACT_ADDRESSES.SCTHYPE as any);
      console.log('Price Result:', safeStringify(priceResult));
      
      if (priceResult.source === 'lp-reserves') {
        console.log('✅ SCT-HYPE LP calculation successful!');
        console.log(`Price: $${priceResult.priceUsd}`);
      } else {
        console.log('❌ SCT-HYPE LP calculation failed');
        console.log('Source:', priceResult.source);
        if (priceResult.error) {
          console.log('Error:', priceResult.error);
        }
      }
    } catch (error) {
      console.error('Error testing SCT-HYPE LP:', error);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: GSCT Price Calculation from LP reserves
  if (!CONTRACT_ADDRESSES.GSCT) {
    console.log('❌ GSCT address not set - skipping test');
  } else {
    console.log('=== Testing GSCT Price from LP Reserves ===');
    console.log('GSCT Address:', CONTRACT_ADDRESSES.GSCT);
    
    try {
      const gsctPriceResult = await getTokenUSDPrice(CONTRACT_ADDRESSES.GSCT as any);
      console.log('GSCT Price Result:', safeStringify(gsctPriceResult));
      
      if (gsctPriceResult.source === 'gsct-lp') {
        console.log('✅ GSCT price calculation successful!');
        console.log(`Price: $${gsctPriceResult.priceUsd}`);
      } else {
        console.log('❌ GSCT price calculation failed');
        console.log('Source:', gsctPriceResult.source);
        if (gsctPriceResult.error) {
          console.log('Error:', gsctPriceResult.error);
        }
      }
    } catch (error) {
      console.error('Error testing GSCT price:', error);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: GSCT-HYPE LP Token (this might fail due to wrong token pair)
  if (!CONTRACT_ADDRESSES.GSCTHYPE) {
    console.log('❌ GSCTHYPE address not set - skipping test');
  } else {
    console.log('=== Testing GSCT-HYPE LP Token ===');
    console.log('LP Address:', CONTRACT_ADDRESSES.GSCTHYPE);
    console.log('Note: This address might contain GSCT-WETH instead of GSCT-HYPE');
    
    try {
      const debugInfo = await debugLPToken(CONTRACT_ADDRESSES.GSCTHYPE as any);
      console.log('Debug Info:', safeStringify(debugInfo));
      
      const priceResult = await getTokenUSDPrice(CONTRACT_ADDRESSES.GSCTHYPE as any);
      console.log('Price Result:', safeStringify(priceResult));
      
      if (priceResult.source === 'lp-reserves') {
        console.log('✅ GSCT-HYPE LP calculation successful!');
        console.log(`Price: $${priceResult.priceUsd}`);
      } else {
        console.log('❌ GSCT-HYPE LP calculation failed');
        console.log('Source:', priceResult.source);
        if (priceResult.error) {
          console.log('Error:', priceResult.error);
        }
      }
    } catch (error) {
      console.error('Error testing GSCT-HYPE LP:', error);
    }
  }
}

testLPCalculation().catch(console.error);
