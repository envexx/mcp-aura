#!/usr/bin/env node

/**
 * Test API with detailed error logging
 */

const http = require('http');

const API_URL = 'http://localhost:3000/api/mcp/action';

const testPayload = {
  fromAddress: '0x01C229f4bDb7552b564619554C8a805aE4Ca2ADB',
  action: 'swap',
  fromToken: 'ETH',
  toToken: 'USDT',
  amount: '0.01',
  slippage: 0.5,
  chain: 'ethereum'
};

console.log('🌐 Testing Local API with Detailed Logging');
console.log('=' .repeat(60));
console.log('API URL:', API_URL);
console.log('Payload:', JSON.stringify(testPayload, null, 2));
console.log();

function makeRequest(url, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'Test-Script/1.0'
      }
    };

    console.log('📡 Making request to:', `${options.hostname}:${options.port}${options.path}`);

    const req = http.request(options, (res) => {
      console.log(`📡 Response Status: ${res.statusCode}`);

      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log('📡 Raw Response Body Length:', body.length);

        try {
          const responseData = JSON.parse(body);
          console.log('📡 Parsed Response:', JSON.stringify(responseData, null, 2));
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            rawBody: body
          });
        } catch (parseError) {
          console.error('❌ Failed to parse response JSON:', parseError);
          console.log('📄 Raw response body:', body);
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

    req.on('timeout', () => {
      console.error('❌ Request timed out');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    // Set timeout
    req.setTimeout(30000); // 30 seconds

    console.log('📤 Sending payload...');
    req.write(data);
    req.end();
  });
}

async function testAPI() {
  try {
    console.log('⏳ Sending request...');
    const response = await makeRequest(API_URL, testPayload);

    console.log('\n📊 Test Results:');
    console.log('='.repeat(50));

    if (response.statusCode === 200 && response.data) {
      if (response.data.success) {
        console.log('✅ SUCCESS: API call completed successfully!');
        console.log('Transaction ready for signing.');
      } else {
        console.log('❌ API returned success=false');
        console.log('Error:', response.data.error);
        console.log('Message:', response.data.message);
      }
    } else {
      console.log(`❌ HTTP Error: ${response.statusCode}`);
      if (response.data && response.data.error) {
        console.log('API Error:', response.data.error);
        console.log('Message:', response.data.message);
      } else {
        console.log('Raw response:', response.rawBody);
      }
    }

  } catch (error) {
    console.log('\n💥 Test failed with exception:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
}

// Check if server is running first
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    }, (res) => {
      console.log('✅ Local server is running (status:', res.statusCode, ')');
      resolve(true);
    });

    req.on('error', () => {
      console.log('❌ Local server is NOT running on localhost:3000');
      console.log('💡 Please start the dev server with: npm run dev');
      resolve(false);
    });

    req.setTimeout(5000);
    req.end();
  });
};

// Run the test
async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }

  await testAPI();
}

main().catch(console.error);
