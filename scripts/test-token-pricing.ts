import { getTokenUSDPrice, getMultipleTokenPrices } from '../src/lib/tokenPricing';
import { CONTRACT_ADDRESSES } from '../src/lib/contracts';

async function testTokenPricing() {
  console.log('🧪 Testing Token Pricing Utility');
  console.log('================================\n');

  try {
    // Test individual token pricing
    if (CONTRACT_ADDRESSES.HYPE) {
      console.log('1️⃣ Testing HYPE token pricing...');
      const hypePrice = await getTokenUSDPrice(CONTRACT_ADDRESSES.HYPE as any);
      console.log(`   HYPE Price: $${hypePrice.priceUsd.toFixed(6)}`);
      console.log(`   Source: ${hypePrice.source}`);
      console.log(`   Timestamp: ${new Date(hypePrice.timestamp).toLocaleString()}\n`);
    }

    if (CONTRACT_ADDRESSES.SCT) {
      console.log('2️⃣ Testing SCT token pricing...');
      const sctPrice = await getTokenUSDPrice(CONTRACT_ADDRESSES.SCT as any);
      console.log(`   SCT Price: $${sctPrice.priceUsd.toFixed(6)}`);
      console.log(`   Source: ${sctPrice.source}`);
      console.log(`   Timestamp: ${new Date(sctPrice.timestamp).toLocaleString()}\n`);
    }

    if (CONTRACT_ADDRESSES.GSCT) {
      console.log('3️⃣ Testing GSCT token pricing...');
      const gsctPrice = await getTokenUSDPrice(CONTRACT_ADDRESSES.GSCT as any);
      console.log(`   GSCT Price: $${gsctPrice.priceUsd.toFixed(6)}`);
      console.log(`   Source: ${gsctPrice.source}`);
      console.log(`   Timestamp: ${new Date(gsctPrice.timestamp).toLocaleString()}\n`);
    }

    // Test multiple token pricing
    const tokenAddresses = [
      CONTRACT_ADDRESSES.HYPE,
      CONTRACT_ADDRESSES.SCT,
      CONTRACT_ADDRESSES.GSCT,
    ].filter(Boolean) as any[];
    
    if (tokenAddresses.length > 0) {
      console.log('4️⃣ Testing multiple token pricing...');
      const multiplePrices = await getMultipleTokenPrices(tokenAddresses);
      
      Object.entries(multiplePrices).forEach(([address, price]) => {
        console.log(`   ${address}: $${price.priceUsd.toFixed(6)} (${price.source})`);
      });
      console.log();
    }

    console.log('✅ Token pricing tests completed successfully!');

  } catch (error) {
    console.error('❌ Token pricing tests failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTokenPricing().catch(console.error);
}

export { testTokenPricing };
