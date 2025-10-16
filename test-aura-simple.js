// ENVXX MCP AURA - Simple API Testing
const axios = require('axios');

async function testAuraConnection() {
  console.log('🧪 Testing AURA API Connection');
  console.log('==============================');
  
  const baseURL = 'https://aura.adex.network';
  
  // Test 1: Basic connection
  console.log('1. Testing basic connection...');
  try {
    const response = await axios.get(baseURL, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ENVXX-MCP-AURA/1.0.0'
      }
    });
    console.log(`✅ Connection successful (${response.status})`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
  }
  
  // Test 2: API endpoint discovery
  console.log('\n2. Testing API endpoints...');
  const endpoints = [
    '/api',
    '/v1', 
    '/api/v1',
    '/portfolio',
    '/health',
    '/status'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${baseURL}${endpoint}`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'ENVXX-MCP-AURA/1.0.0'
        }
      });
      console.log(`✅ ${endpoint} - ${response.status} (${response.headers['content-type']})`);
    } catch (error) {
      if (error.response) {
        console.log(`⚠️  ${endpoint} - ${error.response.status} ${error.response.statusText}`);
      } else {
        console.log(`❌ ${endpoint} - ${error.message}`);
      }
    }
  }
  
  // Test 3: Portfolio endpoint with address
  console.log('\n3. Testing portfolio endpoint...');
  const testAddress = '0x01C229f4bDb7552b564619554C8a805aE4Ca2ADB';
  
  const portfolioEndpoints = [
    '/api/portfolio/balances',
    '/portfolio/balances',
    '/api/portfolio',
    '/portfolio'
  ];
  
  for (const endpoint of portfolioEndpoints) {
    try {
      const response = await axios.get(`${baseURL}${endpoint}`, {
        params: { address: testAddress },
        timeout: 10000,
        headers: {
          'User-Agent': 'ENVXX-MCP-AURA/1.0.0',
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ ${endpoint} - SUCCESS (${response.status})`);
      console.log(`   Data keys: ${Object.keys(response.data).join(', ')}`);
      break; // Stop on first success
    } catch (error) {
      if (error.response) {
        console.log(`⚠️  ${endpoint} - ${error.response.status} ${error.response.statusText}`);
      } else {
        console.log(`❌ ${endpoint} - ${error.message}`);
      }
    }
  }
  
  console.log('\n✅ API discovery completed!');
}

// Run the test
testAuraConnection().catch(console.error);
