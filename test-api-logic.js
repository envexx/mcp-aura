#!/usr/bin/env node

/**
 * Test the API route logic directly
 * Simulates what happens in the Next.js API route
 */

const { getWeb3Utils } = require('./app/lib/web3-utils');

async function testAPILogic() {
  console.log('🔍 Testing API Route Logic');
  console.log('=' .repeat(50));

  try {
    // Simulate the incoming payload
    const payload = {
      fromAddress: '0x01C229f4bDb7552b564619554C8a805aE4Ca2ADB',
      action: 'swap',
      fromToken: 'ETH',
      toToken: 'USDT',
      amount: '0.01',
      slippage: 0.5,
      chain: 'ethereum'
    };

    console.log('📋 Incoming Payload:', JSON.stringify(payload, null, 2));

    // Simulate normalizePayload function
    console.log('\n🔄 Normalizing payload...');

    const rawNetwork = typeof payload.chain === 'string' ? payload.chain : undefined;
    const normalizedNetwork = rawNetwork ? rawNetwork : undefined;

    const rawSlippage = typeof payload.slippage === 'number' ? payload.slippage.toString() : undefined;
    const normalizedSlippage = rawSlippage ? rawSlippage.replace('%', '').trim() : undefined;

    const platform = 'Uniswap';

    const operation = typeof payload.action === 'string'
      ? payload.action.trim().toLowerCase()
      : payload.action;

    const amountIn = typeof payload.amount === 'string'
      ? payload.amount
      : payload.amount;

    const fromAddress = payload.fromAddress;

    const normalizedPayload = {
      fromAddress,
      tokenIn: payload.fromToken,
      tokenOut: payload.toToken,
      amountIn,
      network: normalizedNetwork,
      slippage: normalizedSlippage,
      platform,
      operation
    };

    console.log('✅ Normalized Payload:', JSON.stringify(normalizedPayload, null, 2));

    // Extract parameters like in the API
    const {
      fromAddress: finalFromAddress,
      operation: finalOperation,
      platform: finalPlatform,
      tokenIn,
      tokenOut,
      amountIn: finalAmountIn,
      network,
      slippage
    } = normalizedPayload;

    console.log('\n📊 Final Parameters:');
    console.log(`  fromAddress: ${finalFromAddress}`);
    console.log(`  operation: ${finalOperation}`);
    console.log(`  platform: ${finalPlatform}`);
    console.log(`  tokenIn: ${tokenIn}`);
    console.log(`  tokenOut: ${tokenOut}`);
    console.log(`  amountIn: ${finalAmountIn}`);
    console.log(`  network: ${network}`);
    console.log(`  slippage: ${slippage}`);

    // Initialize Web3Utils
    console.log('\n🔧 Initializing Web3Utils...');
    const web3Utils = getWeb3Utils(network);
    console.log('✅ Web3Utils initialized');

    // Build transaction
    console.log('\n🔄 Building swap transaction...');
    const transactionRequest = await web3Utils.buildSwapTransaction({
      tokenIn,
      tokenOut,
      amountIn: finalAmountIn,
      recipient: finalFromAddress,
      deadline: Math.floor(Date.now() / 1000) + 1800,
      slippage: parseFloat(slippage)
    });

    console.log('✅ Transaction built successfully!');
    console.log('📋 Transaction Request:', transactionRequest);

    // Try to estimate gas
    console.log('\n⛽ Estimating gas fees...');
    const estimatedFees = await web3Utils.estimateGas(transactionRequest);
    console.log('✅ Gas estimation successful:', estimatedFees);

    console.log('\n🎉 API LOGIC TEST PASSED: Everything works correctly!');

    return {
      transactionRequest,
      estimatedFees
    };

  } catch (error) {
    console.log('\n❌ API LOGIC TEST FAILED');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);

    if (error.cause) {
      console.log('Cause:', error.cause);
    }

    throw error;
  }
}

// Run the API logic test
testAPILogic().catch(console.error);
