#!/usr/bin/env node

/**
 * Detailed test of the swap transaction building process
 * Mimics the web3-utils implementation step by step
 */

const ethers = require('ethers');
const { AlphaRouter, SwapType } = require('@uniswap/smart-order-router');
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core');

// Configuration matching web3-utils.ts
const NETWORKS = {
  ethereum: {
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/26a079c2ead849ab9681d56428dbbb71',
    swapRouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  }
};

const TOKEN_MAP = {
  ethereum: {
    'ETH': '0x0000000000000000000000000000000000000000',
    'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    'USDC': '0xA0b86a33E6441e88C5F2712C3E9b74AF6b7f9EDD',
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  }
};

async function testSwapBuilding() {
  console.log('🔄 Testing Detailed Swap Transaction Building');
  console.log('=' .repeat(60));

  try {
    // Step 1: Initialize provider
    console.log('🌐 Step 1: Initializing provider...');
    const provider = new ethers.providers.JsonRpcProvider(NETWORKS.ethereum.rpcUrl);
    console.log('✅ Provider initialized');

    // Step 2: Test network connection
    console.log('🔗 Step 2: Testing network connection...');
    const network = await provider.getNetwork();
    console.log('✅ Network connected:', { chainId: network.chainId, name: network.name });

    // Step 3: Resolve token addresses
    console.log('🏷️  Step 3: Resolving token addresses...');
    const tokenInAddress = TOKEN_MAP.ethereum['ETH'];
    const tokenOutAddress = TOKEN_MAP.ethereum['USDT'];
    console.log('✅ Token addresses resolved:', { tokenInAddress, tokenOutAddress });

    // Step 4: Create Token instances
    console.log('🪙 Step 4: Creating token instances...');

    // Handle native token (ETH)
    const tokenIn = tokenInAddress === '0x0000000000000000000000000000000000000000'
      ? new Token(1, NETWORKS.ethereum.weth, 18, 'WETH', 'Wrapped Ether')
      : new Token(1, tokenInAddress, 18, 'UNKNOWN', 'Unknown Token');

    const tokenOut = new Token(1, tokenOutAddress, 6, 'USDT', 'Tether USD'); // USDT has 6 decimals
    console.log('✅ Token instances created');

    // Step 5: Create AlphaRouter
    console.log('🎯 Step 5: Creating AlphaRouter...');
    const router = new AlphaRouter({
      chainId: 1,
      provider: provider
    });
    console.log('✅ AlphaRouter created');

    // Step 6: Prepare swap parameters
    console.log('⚙️  Step 6: Preparing swap parameters...');
    const amountIn = '0.01'; // 0.01 ETH
    const amountInWei = ethers.utils.parseUnits(amountIn, 18);
    const amountInCurrency = CurrencyAmount.fromRawAmount(tokenIn, amountInWei.toString());
    const slippagePercent = new Percent(5, 1000); // 0.5% slippage

    console.log('✅ Swap parameters prepared:', {
      amountIn,
      amountInWei: amountInWei.toString(),
      slippage: '0.5%'
    });

    // Step 7: Get swap route
    console.log('🔍 Step 7: Getting swap route from Uniswap...');
    const route = await router.route(
      amountInCurrency,
      tokenOut,
      TradeType.EXACT_INPUT,
      {
        recipient: '0x01C229f4bDb7552b564619554C8a805aE4Ca2ADB',
        slippageTolerance: slippagePercent,
        deadline: Math.floor(Date.now() / 1000) + 1800,
        type: SwapType.SWAP_ROUTER_02,
      }
    );

    console.log('✅ Route calculated successfully');

    if (!route || !route.methodParameters) {
      throw new Error('No route found for the swap');
    }

    // Step 8: Build final transaction
    console.log('📋 Step 8: Building final transaction...');
    const transactionRequest = {
      to: route.methodParameters.to,
      data: route.methodParameters.calldata,
      value: route.methodParameters.value || '0'
    };

    console.log('✅ Transaction built successfully!');
    console.log('📋 Final Transaction:');
    console.log(`  📍 To: ${transactionRequest.to}`);
    console.log(`  💵 Value: ${transactionRequest.value} wei`);
    console.log(`  📄 Data Length: ${transactionRequest.data.length} characters`);
    console.log(`  📄 Data Preview: ${transactionRequest.data.substring(0, 66)}...`);

    // Additional route information
    console.log('\n📊 Route Information:');
    console.log(`  🔄 Input: ${route.trade.inputAmount.toSignificant(6)} ${route.trade.inputAmount.currency.symbol}`);
    console.log(`  🔄 Output: ${route.trade.outputAmount.toSignificant(6)} ${route.trade.outputAmount.currency.symbol}`);
    console.log(`  💰 Price: ${route.trade.executionPrice.toSignificant(6)}`);
    console.log(`  ⛽ Gas Estimate: ${route.estimatedGasUsed.toString()}`);

    console.log('\n🎉 COMPREHENSIVE TEST PASSED: Swap transaction building works perfectly!');

    return transactionRequest;

  } catch (error) {
    console.log('\n❌ COMPREHENSIVE TEST FAILED');
    console.log('Error:', error.message);

    if (error.cause) {
      console.log('Cause:', error.cause);
    }

    // More detailed error logging
    if (error.reason) {
      console.log('Reason:', error.reason);
    }

    if (error.code) {
      console.log('Error Code:', error.code);
    }

    throw error;
  }
}

// Run the comprehensive test
testSwapBuilding().catch(console.error);
