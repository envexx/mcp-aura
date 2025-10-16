#!/usr/bin/env node

/**
 * Simple test to check Uniswap SDK availability and basic functionality
 */

console.log('🧪 Testing Uniswap SDK Integration');
console.log('=' .repeat(50));

try {
  // Test basic ethers import
  console.log('📦 Testing ethers.js import...');
  const ethers = require('ethers');
  console.log('✅ ethers.js imported successfully');

  // Test Uniswap SDK imports
  console.log('📦 Testing Uniswap SDK imports...');
  const { AlphaRouter, SwapType } = require('@uniswap/smart-order-router');
  const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core');
  console.log('✅ Uniswap SDK imported successfully');

  // Test basic provider creation
  console.log('🌐 Testing provider creation...');
  const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/26a079c2ead849ab9681d56428dbbb71');
  console.log('✅ Provider created successfully');

  // Test network detection
  console.log('🔍 Testing network detection...');
  provider.getNetwork().then(network => {
    console.log('✅ Network detected:', network);
    console.log('📊 Network details:', {
      chainId: network.chainId,
      name: network.name
    });

    // Test AlphaRouter creation
    console.log('🎯 Testing AlphaRouter creation...');
    const router = new AlphaRouter({
      chainId: network.chainId,
      provider: provider
    });
    console.log('✅ AlphaRouter created successfully');

    console.log('\n🎉 ALL TESTS PASSED: Uniswap SDK integration is working!');

  }).catch(error => {
    console.log('❌ Network detection failed:', error.message);
    console.log('This might be expected if the RPC endpoint is rate-limited or unavailable');
  });

} catch (error) {
  console.log('\n❌ SDK TEST FAILED');
  console.log('Error:', error.message);

  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('💡 This indicates a missing dependency. Check if Uniswap SDK packages are installed.');
    console.log('Run: npm install @uniswap/smart-order-router @uniswap/sdk-core');
  }

  if (error.stack) {
    console.log('Stack trace:');
    console.log(error.stack);
  }
}
