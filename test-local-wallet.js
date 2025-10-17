const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const BASE_URL = 'http://localhost:3000'; // Force localhost for local testing
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

console.log('🧪 LOCAL WALLET INTEGRATION TEST');
console.log('=====================================');
console.log(`Testing against: ${BASE_URL}`);
console.log(`WalletConnect Project ID: ${WALLET_CONNECT_PROJECT_ID ? '✅ Set' : '❌ Not set'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log('=====================================\n');

// Test scenarios
const testScenarios = [
  {
    name: 'ETH → USDC Swap',
    payload: {
      fromAddress: '0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c',
      operation: 'swap',
      platform: 'Uniswap',
      tokenIn: 'ETH',
      tokenOut: 'USDC',
      amountIn: '0.01',
      network: 'ethereum',
      slippage: '0.5'
    }
  },
  {
    name: 'USDT → DAI Swap',
    payload: {
      fromAddress: '0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c',
      operation: 'swap',
      platform: 'Uniswap',
      tokenIn: 'USDT',
      tokenOut: 'DAI',
      amountIn: '10',
      network: 'ethereum',
      slippage: '0.5'
    }
  },
  {
    name: 'WETH → USDC Swap',
    payload: {
      fromAddress: '0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c',
      operation: 'swap',
      platform: 'Uniswap',
      tokenIn: 'WETH',
      tokenOut: 'USDC',
      amountIn: '0.005',
      network: 'ethereum',
      slippage: '0.5'
    }
  }
];

async function testActionAPI(scenario) {
  console.log(`📡 Testing: ${scenario.name}`);
  console.log('─'.repeat(50));

  try {
    console.log('🔄 Sending request to Action API...');
    const response = await axios.post(`${BASE_URL}/api/mcp/action`, scenario.payload, {
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
    console.log('📋 Response details:');
    console.log(`   • Action ID: ${result.data?.actionId}`);
    console.log(`   • Operation: ${result.data?.operation}`);
    console.log(`   • Platform: ${result.data?.platform}`);
    console.log(`   • Network: ${result.data?.network}`);
    console.log(`   • Status: ${result.data?.status}`);

    const walletUrl = result.data?.walletConnectionUrl;
    if (walletUrl) {
      console.log(`   • Wallet URL: ${walletUrl}`);

      // Parse and validate URL
      const url = new URL(walletUrl);
      const params = url.searchParams;

      console.log('🔍 URL Parameters:');
      console.log(`   • action: ${params.get('action')}`);
      console.log(`   • fromToken: ${params.get('fromToken')}`);
      console.log(`   • toToken: ${params.get('toToken')}`);
      console.log(`   • amount: ${params.get('amount')}`);
      console.log(`   • nonce: ${params.get('nonce')}`);

      // Validate required parameters
      const requiredParams = ['action', 'fromToken', 'toToken', 'amount', 'nonce'];
      const missingParams = requiredParams.filter(param => !params.get(param));

      if (missingParams.length > 0) {
        console.log(`❌ Missing required URL parameters: ${missingParams.join(', ')}`);
        return null;
      }

      console.log('✅ All required URL parameters present');
    } else {
      console.log('❌ No wallet URL generated');
      return null;
    }

    console.log(''); // Empty line for spacing
    return result.data;

  } catch (error) {
    console.log('❌ Action API error:', error.response?.data || error.message);
    console.log(''); // Empty line for spacing
    return null;
  }
}

async function testWalletPageAccessibility(walletUrl) {
  console.log('🌐 Testing Wallet Page Accessibility');
  console.log('─'.repeat(50));

  try {
    // Extract the wallet path from the URL
    const url = new URL(walletUrl);
    const walletPageUrl = `${BASE_URL}${url.pathname}${url.search}`;

    console.log(`🔗 Testing URL: ${walletPageUrl}`);

    // Test if the page is accessible (HEAD request)
    const response = await axios.head(walletPageUrl);

    if (response.status === 200) {
      console.log('✅ Wallet page is accessible');
      console.log('📱 Page responds with status 200');
      return true;
    } else {
      console.log(`❌ Wallet page not accessible (status: ${response.status})`);
      return false;
    }

  } catch (error) {
    console.log('❌ Wallet page test error:', error.response?.status || error.message);
    return false;
  }
}

async function runLocalTests() {
  console.log('🚀 Starting Local Wallet Integration Tests\n');

  let passedTests = 0;
  let totalTests = testScenarios.length * 2; // API test + accessibility test per scenario

  for (const scenario of testScenarios) {
    // Test 1: Action API
    const actionData = await testActionAPI(scenario);

    if (actionData) {
      passedTests++;

      // Test 2: Wallet Page Accessibility
      const walletUrl = actionData.walletConnectionUrl;
      if (walletUrl) {
        const accessible = await testWalletPageAccessibility(walletUrl);
        if (accessible) {
          passedTests++;
        }
      }
    }

    console.log(''); // Extra spacing between scenarios
  }

  // Final Results
  console.log('=' .repeat(60));
  console.log('📊 LOCAL TEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);

  if (passedTests === totalTests) {
    console.log('🎉 ALL LOCAL TESTS PASSED!');
    console.log('✅ Wallet integration is working correctly locally');
    console.log('🚀 Ready for production deployment');
    console.log('\n💡 Next steps:');
    console.log('   1. Deploy to production');
    console.log('   2. Test production environment');
    console.log('   3. Verify ChatGPT MCP integration');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('🔧 Please fix the issues before deploying to production');
  }

  console.log('\n📋 Environment Check:');
  console.log(`   NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'Not set (using localhost for tests)'}`);
  console.log(`   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: ${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? '✅ Set' : '❌ Not set'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Local test server should be running on: ${BASE_URL}`);
}

runLocalTests().catch(console.error);
