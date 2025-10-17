const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const BASE_URL = process.env.NODE_ENV === 'production'
  ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://mcp-aura.vercel.app')
  : 'http://localhost:3000';
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

console.log('🧪 Testing Wallet Integration with Environment Variables');
console.log('='.repeat(60));
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`WALLET_CONNECT_PROJECT_ID: ${WALLET_CONNECT_PROJECT_ID ? '✅ Set' : '❌ Not set'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log('='.repeat(60));

// Test data for swap transaction
const testSwapPayload = {
  fromAddress: '0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c', // User's provided address
  operation: 'swap',
  platform: 'Uniswap',
  tokenIn: 'WETH', // Use wrapped ETH instead of ETH
  tokenOut: 'USDC',
  amountIn: '0.01', // Smaller amount for testing
  network: 'ethereum',
  slippage: '0.5'
};

async function testActionAPI() {
  console.log('📡 Testing Action API (POST /api/mcp/action)...');

  try {
    const response = await axios.post(`${BASE_URL}/api/mcp/action`, testSwapPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = response.data;

    if (response.status !== 200) {
      console.log('❌ Action API failed:', result);
      return null;
    }

    console.log('✅ Action API success');
    console.log('📋 Response data:');
    console.log('   - actionId:', result.data?.actionId);
    console.log('   - operation:', result.data?.operation);
    console.log('   - status:', result.data?.status);
    console.log('   - walletConnectionUrl:', result.data?.walletConnectionUrl);

    // Analyze the generated URL
    const walletUrl = result.data?.walletConnectionUrl;
    if (walletUrl) {
      const url = new URL(walletUrl);
      console.log('🔍 URL Analysis:');
      console.log('   - Protocol:', url.protocol);
      console.log('   - Hostname:', url.hostname);
      console.log('   - Port:', url.port || 'default');
      console.log('   - Pathname:', url.pathname);
      console.log('   - Search params:', url.search);

      // Check if URL matches expected environment
      const expectedHost = process.env.NODE_ENV === 'production'
        ? 'mcp-aura.vercel.app'
        : 'localhost';

      if (url.hostname === expectedHost) {
        console.log(`✅ URL hostname matches ${process.env.NODE_ENV} environment`);
      } else {
        console.log(`❌ URL hostname mismatch! Expected: ${expectedHost}, Got: ${url.hostname}`);
        console.log('💡 This indicates a configuration issue in the action API');
      }
    }

    return result.data;
  } catch (error) {
    console.log('❌ Action API error:', error.response?.data || error.message);
    return null;
  }
}

async function testWalletPage(walletUrl) {
  console.log('🔗 Testing Wallet Page URL...');

  try {
    // Extract URL parameters from the wallet connection URL
    const url = new URL(walletUrl);
    const params = url.searchParams;

    console.log('📊 URL Parameters:');
    console.log('   - action:', params.get('action'));
    console.log('   - fromToken:', params.get('fromToken'));
    console.log('   - toToken:', params.get('toToken'));
    console.log('   - amount:', params.get('amount'));
    console.log('   - nonce:', params.get('nonce'));

    // Check if required parameters are present
    const action = params.get('action');
    if (!action) {
      console.log('❌ Missing required "action" parameter!');
      return false;
    }

    // Test if the wallet page is accessible (HEAD request to check status)
    const walletPageUrl = `${BASE_URL}/wallet${url.search}`;
    console.log('🌐 Testing wallet page accessibility:', walletPageUrl);

    try {
      const response = await axios.head(walletPageUrl);

      if (response.status === 200) {
        console.log('✅ Wallet page is accessible');
        console.log('📱 Wallet URL parameters are correctly formatted');
        return true;
      } else {
        console.log('❌ Wallet page not accessible:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Wallet page test error:', error.response?.status || error.message);
      return false;
    }

  } catch (error) {
    console.log('❌ Wallet page test error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Wallet Integration Tests...\n');

  // Test 1: Action API
  const actionData = await testActionAPI();

  if (!actionData) {
    console.log('\n❌ Test failed: Action API is not working');
    return;
  }

  // Test 2: Wallet URL generation
  const walletUrl = actionData.walletConnectionUrl;
  if (!walletUrl) {
    console.log('\n❌ Test failed: No wallet URL generated');
    return;
  }

  console.log('\n🔗 Generated Wallet URL:', walletUrl);

  // Test 3: Wallet page accessibility
  const walletTestPassed = await testWalletPage(walletUrl);

  // Final results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60));

  if (walletTestPassed) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('🎉 Wallet integration is working correctly');
    console.log('💡 The "No action specified in URL" error should be resolved');
  } else {
    console.log('❌ TESTS FAILED!');
    console.log('🔧 Please check the wallet URL generation and accessibility');
  }

  console.log('\n📋 Environment Variables Check:');
  console.log(`   NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL ? '✅' : '❌'} ${process.env.NEXT_PUBLIC_BASE_URL || 'Not set'}`);
  console.log(`   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: ${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? '✅' : '❌'} ${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? 'Set' : 'Not set'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
}

runTests().catch(console.error);
