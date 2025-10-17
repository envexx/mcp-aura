const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const BASE_URL = 'http://localhost:3000'; // Force localhost for testing
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

console.log('🔍 URL Parameter Parsing Test');
console.log('===============================');
console.log(`Testing against: ${BASE_URL}`);
console.log('===============================\n');

// Test URL parameter parsing
async function testUrlParameterParsing() {
  console.log('🧪 Testing URL Parameter Parsing...');

  try {
    // First, create a transaction via API
    const testPayload = {
      fromAddress: '0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c',
      operation: 'swap',
      platform: 'Uniswap',
      tokenIn: 'ETH',
      tokenOut: 'USDC',
      amountIn: '0.01',
      network: 'ethereum',
      slippage: '0.5'
    };

    console.log('📡 Creating transaction...');
    const response = await axios.post(`${BASE_URL}/api/mcp/action`, testPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.data.success) {
      console.log('❌ Failed to create transaction:', response.data);
      return;
    }

    const walletUrl = response.data.data.walletConnectionUrl;
    console.log('✅ Transaction created');
    console.log('🔗 Wallet URL:', walletUrl);

    // Parse the URL to extract parameters
    const url = new URL(walletUrl);
    const params = url.searchParams;

    console.log('\n📊 URL Parameter Extraction:');
    console.log('Raw search:', url.search);
    console.log('action:', params.get('action'), 'Type:', typeof params.get('action'));
    console.log('fromToken:', params.get('fromToken'), 'Type:', typeof params.get('fromToken'));
    console.log('toToken:', params.get('toToken'), 'Type:', typeof params.get('toToken'));
    console.log('amount:', params.get('amount'), 'Type:', typeof params.get('amount'));
    console.log('nonce:', params.get('nonce'), 'Type:', typeof params.get('nonce'));

    // Simulate what the wallet page does
    console.log('\n🎭 Simulating Wallet Page Logic:');

    // This is what the wallet page does (simplified)
    const actionParam = typeof params.get('action') === 'string' ? params.get('action') : '';
    const fromTokenParam = typeof params.get('fromToken') === 'string' ? params.get('fromToken') : '';
    const toTokenParam = typeof params.get('toToken') === 'string' ? params.get('toToken') : '';
    const amountParam = typeof params.get('amount') === 'string' ? params.get('amount') : '';
    const nonceParam = typeof params.get('nonce') === 'string' ? params.get('nonce') : '';

    console.log('Parsed actionParam:', `"${actionParam}"`, 'Type:', typeof actionParam);
    console.log('Parsed fromTokenParam:', `"${fromTokenParam}"`, 'Type:', typeof fromTokenParam);
    console.log('Parsed toTokenParam:', `"${toTokenParam}"`, 'Type:', typeof toTokenParam);
    console.log('Parsed amountParam:', `"${amountParam}"`, 'Type:', typeof amountParam);
    console.log('Parsed nonceParam:', `"${nonceParam}"`, 'Type:', typeof nonceParam);

    console.log('\n🧠 Decision Logic:');
    if (actionParam) {
      console.log('✅ actionParam is truthy, wallet flow would proceed');
      console.log('🎯 Action:', actionParam);
    } else {
      console.log('❌ actionParam is falsy, would trigger "No action specified in URL" error');
      console.log('💥 This would cause: alert("No action specified in URL"); window.location.href = "/";');
    }

    // Test edge cases
    console.log('\n🧪 Edge Case Testing:');

    // Test with missing action parameter
    const urlWithoutAction = new URL(walletUrl);
    urlWithoutAction.searchParams.delete('action');
    console.log('URL without action param:', urlWithoutAction.href);
    const paramsWithoutAction = urlWithoutAction.searchParams;
    const actionParamMissing = typeof paramsWithoutAction.get('action') === 'string' ? paramsWithoutAction.get('action') : '';
    console.log('actionParam when missing:', `"${actionParamMissing}"`, 'Would cause error:', !actionParamMissing);

    // Test with empty action parameter
    const urlWithEmptyAction = new URL(walletUrl);
    urlWithEmptyAction.searchParams.set('action', '');
    console.log('URL with empty action param:', urlWithEmptyAction.href);
    const paramsWithEmptyAction = urlWithEmptyAction.searchParams;
    const actionParamEmpty = typeof paramsWithEmptyAction.get('action') === 'string' ? paramsWithEmptyAction.get('action') : '';
    console.log('actionParam when empty:', `"${actionParamEmpty}"`, 'Would cause error:', !actionParamEmpty);

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
}

testUrlParameterParsing().catch(console.error);
