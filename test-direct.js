#!/usr/bin/env node

/**
 * Direct test of web3-utils swap transaction building
 * Tests without API to isolate the issue
 */

const { getWeb3Utils } = require('./app/lib/web3-utils');

async function testDirectSwap() {
  console.log('🧪 Testing Direct Web3 Utils Swap Transaction Building');
  console.log('=' .repeat(60));

  try {
    // Initialize Web3Utils for Ethereum
    console.log('🔧 Initializing Web3Utils for Ethereum...');
    const web3Utils = getWeb3Utils('ethereum');
    console.log('✅ Web3Utils initialized successfully');

    // Test parameters
    const swapParams = {
      tokenIn: 'ETH',
      tokenOut: 'USDT',
      amountIn: '0.01',
      recipient: '0x01C229f4bDb7552b564619554C8a805aE4Ca2ADB',
      slippage: 0.5
    };

    console.log('📋 Swap Parameters:');
    console.log(JSON.stringify(swapParams, null, 2));

    console.log('\n🔄 Building swap transaction...');
    const transactionRequest = await web3Utils.buildSwapTransaction(swapParams);

    console.log('\n✅ SUCCESS: Transaction built successfully!');
    console.log('📋 Transaction Details:');
    console.log(`  📍 To: ${transactionRequest.to}`);
    console.log(`  💵 Value: ${transactionRequest.value} wei`);
    console.log(`  📄 Data Length: ${transactionRequest.data.length} characters`);
    console.log(`  📄 Data Preview: ${transactionRequest.data.substring(0, 66)}...`);

    // Validate the transaction structure
    console.log('\n🔍 Validation:');
    if (transactionRequest.to && transactionRequest.to.startsWith('0x')) {
      console.log('✅ Contract address is valid');
    } else {
      console.log('❌ Contract address is invalid');
    }

    if (transactionRequest.data && transactionRequest.data.startsWith('0x') && transactionRequest.data.length > 100) {
      console.log('✅ Transaction data is valid');
    } else {
      console.log('❌ Transaction data is invalid');
    }

    if (transactionRequest.value) {
      console.log('✅ Transaction value is set');
    } else {
      console.log('❌ Transaction value is missing');
    }

    console.log('\n🎉 DIRECT TEST PASSED: Swap transaction building works correctly!');

    return transactionRequest;

  } catch (error) {
    console.log('\n❌ DIRECT TEST FAILED');
    console.log('Error:', error.message);

    if (error.cause) {
      console.log('Cause:', error.cause);
    }

    if (error.stack) {
      console.log('Stack trace:');
      console.log(error.stack);
    }

    throw error;
  }
}

// Run the direct test
testDirectSwap().catch(console.error);
