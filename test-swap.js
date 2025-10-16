#!/usr/bin/env node

/**
 * Test script for ENVXX MCP AURA DeFi Action API
 * Tests swap transaction building with real wallet address
 */

const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:3000/api/mcp/action';

// Test data for ETH to USDT swap
const testPayload = {
  fromAddress: '0x01C229f4bDb7552b564619554C8a805aE4Ca2ADB',
  action: 'swap',
  fromToken: 'ETH',
  toToken: 'USDT',
  amount: '0.01',
  slippage: 0.5,
  chain: 'ethereum'
};

console.log('🚀 Testing ENVXX MCP AURA DeFi Action API');
console.log('📋 Test Payload:', JSON.stringify(testPayload, null, 2));
console.log('🌐 API URL:', API_URL);
console.log('⏳ Sending request...\n');

function makeRequest(url, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'ENVXX-MCP-Test/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      console.log(`📡 Response Status: ${res.statusCode}`);
      console.log(`📡 Response Headers:`, res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const responseData = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            rawBody: body
          });
        } catch (parseError) {
          console.error('❌ Failed to parse response JSON:', parseError);
          resolve({
            statusCode: res.statusCode,
            data: null,
            rawBody: body,
            parseError
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runTest() {
  try {
    const response = await makeRequest(API_URL, testPayload);

    console.log('\n📊 Test Results:');
    console.log('=' .repeat(50));

    if (response.statusCode === 200 && response.data) {
      console.log('✅ SUCCESS: API responded with status 200');

      if (response.data.success) {
        console.log('✅ SUCCESS: Action prepared successfully');

        if (response.data.data) {
          console.log('✅ SUCCESS: Transaction data received');

          const { transactionRequest, estimatedFees, metadata } = response.data.data;

          console.log('\n💰 Transaction Request:');
          console.log(`  📍 To: ${transactionRequest.to}`);
          console.log(`  💵 Value: ${transactionRequest.value} wei`);
          console.log(`  📄 Data Length: ${transactionRequest.data.length} characters`);
          console.log(`  📄 Data Preview: ${transactionRequest.data.substring(0, 66)}...`);

          console.log('\n⛽ Estimated Fees:');
          console.log(`  💎 ETH Fee: ${estimatedFees.totalFeeETH} ETH`);
          console.log(`  💵 USD Fee: $${estimatedFees.totalFeeUSD}`);

          console.log('\n📋 Swap Metadata:');
          console.log(`  🔄 ${metadata.amountIn} ${metadata.tokenIn} → ${metadata.tokenOut}`);
          console.log(`  🎯 Slippage: ${metadata.slippage}%`);

          console.log('\n🎉 TEST PASSED: Transaction ready for wallet signature!');
        } else {
          console.log('❌ ERROR: Missing transaction data in response');
        }
      } else {
        console.log('❌ ERROR: Action failed');
        console.log('Error message:', response.data.message);
      }
    } else {
      console.log(`❌ ERROR: API responded with status ${response.statusCode}`);

      if (response.data && response.data.error) {
        console.log('Error details:', response.data.error);
        if (response.data.details) {
          console.log('Validation errors:', JSON.stringify(response.data.details, null, 2));
        }
      } else {
        console.log('Raw response:', response.rawBody);
      }
    }

  } catch (error) {
    console.error('\n💥 TEST FAILED: Unexpected error');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
runTest().catch(console.error);
