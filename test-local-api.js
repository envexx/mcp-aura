// ENVXX MCP AURA - Local API Testing Script
const axios = require('axios');

// Test configuration
const TEST_CONFIG = {
  address: '0x01C229f4bDb7552b564619554C8a805aE4Ca2ADB',
  baseURL: 'http://localhost:3000/api/mcp',
  timeout: 10000
};

// Test functions
async function testLocalMCPAPI() {
  console.log('🧪 ENVXX MCP AURA - Local API Testing');
  console.log('====================================');
  console.log(`Testing address: ${TEST_CONFIG.address}`);
  console.log(`Base URL: ${TEST_CONFIG.baseURL}`);
  console.log('');

  // Test 1: Portfolio API
  await testPortfolioAPI();
  
  // Test 2: Strategy API
  await testStrategyAPI();
  
  // Test 3: Action API
  await testActionAPI();
  
  // Test 4: Transfer API
  await testTransferAPI();
  
  // Test 5: Sign Request API
  await testSignRequestAPI();
  
  console.log('✅ Local API testing completed!');
}

async function testPortfolioAPI() {
  console.log('📊 Testing Portfolio API...');
  try {
    const response = await axios.get(`${TEST_CONFIG.baseURL}/portfolio`, {
      params: { 
        address: TEST_CONFIG.address
      },
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ENVXX-MCP-AURA-Test/1.0.0'
      }
    });
    
    console.log('✅ Portfolio API - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Total Value: $${response.data.data?.totalValueUSD || 'N/A'}`);
    console.log(`Networks: ${response.data.data?.networks?.length || 0}`);
    
    if (response.data.data?.networks) {
      response.data.data.networks.forEach(network => {
        console.log(`  - ${network.network.name}: $${network.totalValueUSD} (${network.tokens.length} tokens)`);
      });
    }
    console.log('');
    
  } catch (error) {
    console.log('❌ Portfolio API - FAILED');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');
  }
}

async function testStrategyAPI() {
  console.log('🎯 Testing Strategy API...');
  try {
    const response = await axios.get(`${TEST_CONFIG.baseURL}/strategy`, {
      params: { 
        address: TEST_CONFIG.address,
        risk: 'moderate'
      },
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ENVXX-MCP-AURA-Test/1.0.0'
      }
    });
    
    console.log('✅ Strategy API - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Strategies: ${response.data.data?.strategies?.length || 0}`);
    
    if (response.data.data?.strategies) {
      response.data.data.strategies.forEach((strategyGroup, index) => {
        console.log(`  Strategy Group ${index + 1}:`);
        strategyGroup.response.forEach(strategy => {
          console.log(`    - ${strategy.name} (${strategy.risk} risk, ${strategy.expectedYield} yield)`);
        });
      });
    }
    console.log('');
    
  } catch (error) {
    console.log('❌ Strategy API - FAILED');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');
  }
}

async function testActionAPI() {
  console.log('⚡ Testing Action API...');
  try {
    const response = await axios.post(`${TEST_CONFIG.baseURL}/action`, {
      address: TEST_CONFIG.address,
      action: 'swap',
      fromToken: 'ETH',
      toToken: 'USDC',
      amount: '0.1',
      network: 'arbitrum'
    }, {
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ENVXX-MCP-AURA-Test/1.0.0'
      }
    });
    
    console.log('✅ Action API - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Action: ${response.data.data?.action || 'N/A'}`);
    console.log(`Status: ${response.data.data?.status || 'N/A'}`);
    console.log('');
    
  } catch (error) {
    console.log('❌ Action API - FAILED');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');
  }
}

async function testTransferAPI() {
  console.log('💸 Testing Transfer API...');
  try {
    const response = await axios.post(`${TEST_CONFIG.baseURL}/transfer`, {
      from: TEST_CONFIG.address,
      to: '0x742d35Cc6634C0532925a3b8D8C9C8C8C8C8C8C8',
      token: 'USDC',
      amount: '100',
      network: 'arbitrum'
    }, {
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ENVXX-MCP-AURA-Test/1.0.0'
      }
    });
    
    console.log('✅ Transfer API - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Transfer ID: ${response.data.data?.transferId || 'N/A'}`);
    console.log(`Status: ${response.data.data?.status || 'N/A'}`);
    console.log('');
    
  } catch (error) {
    console.log('❌ Transfer API - FAILED');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');
  }
}

async function testSignRequestAPI() {
  console.log('✍️ Testing Sign Request API...');
  try {
    const response = await axios.post(`${TEST_CONFIG.baseURL}/sign-request`, {
      address: TEST_CONFIG.address,
      message: 'Test message for ENVXX MCP AURA',
      type: 'personal_sign'
    }, {
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ENVXX-MCP-AURA-Test/1.0.0'
      }
    });
    
    console.log('✅ Sign Request API - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Request ID: ${response.data.data?.requestId || 'N/A'}`);
    console.log(`Status: ${response.data.data?.status || 'N/A'}`);
    console.log('');
    
  } catch (error) {
    console.log('❌ Sign Request API - FAILED');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');
  }
}

// Health check
async function testHealthCheck() {
  console.log('🏥 Testing Health Check...');
  try {
    const response = await axios.get('http://localhost:3000/api/health', {
      timeout: 5000
    });
    
    console.log('✅ Health Check - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Server: ${response.data.server || 'Unknown'}`);
    console.log('');
    
  } catch (error) {
    console.log('❌ Health Check - FAILED');
    console.log(`Error: ${error.message}`);
    console.log('Make sure the development server is running with: npm run dev');
    console.log('');
  }
}

// Run tests
if (require.main === module) {
  console.log('Starting tests in 2 seconds...');
  setTimeout(async () => {
    await testHealthCheck();
    await testLocalMCPAPI();
  }, 2000);
}

module.exports = {
  testLocalMCPAPI,
  testHealthCheck,
  TEST_CONFIG
};
