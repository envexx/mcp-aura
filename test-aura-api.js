// ENVXX MCP AURA - API Testing Script
const axios = require('axios');

// Test configuration
const TEST_CONFIG = {
  address: '0x01C229f4bDb7552b564619554C8a805aE4Ca2ADB',
  baseURL: 'https://aura.adex.network/api', // AURA API base URL
  timeout: 10000
};

// Test functions
async function testAuraAPI() {
  console.log('🧪 ENVXX MCP AURA - API Testing');
  console.log('================================');
  console.log(`Testing address: ${TEST_CONFIG.address}`);
  console.log(`Base URL: ${TEST_CONFIG.baseURL}`);
  console.log('');

  // Test 1: Portfolio Balances
  await testPortfolioBalances();
  
  // Test 2: Portfolio Analysis
  await testPortfolioAnalysis();
  
  // Test 3: Strategy Recommendations
  await testStrategyRecommendations();
  
  // Test 4: Market Data
  await testMarketData();
  
  console.log('✅ Testing completed!');
}

async function testPortfolioBalances() {
  console.log('📊 Testing Portfolio Balances...');
  try {
    const response = await axios.get(`${TEST_CONFIG.baseURL}/portfolio/balances`, {
      params: { 
        address: TEST_CONFIG.address,
        chains: 'ethereum,arbitrum,polygon'
      },
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ENVXX-MCP-AURA/1.0.0'
      }
    });
    
    console.log('✅ Portfolio Balances - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Data keys: ${Object.keys(response.data).join(', ')}`);
    console.log('Sample data:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
    console.log('');
    
  } catch (error) {
    console.log('❌ Portfolio Balances - FAILED');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');
  }
}

async function testPortfolioAnalysis() {
  console.log('🔍 Testing Portfolio Analysis...');
  try {
    const response = await axios.get(`${TEST_CONFIG.baseURL}/portfolio/analysis`, {
      params: { 
        address: TEST_CONFIG.address,
        include_defi: true,
        include_nfts: false
      },
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ENVXX-MCP-AURA/1.0.0'
      }
    });
    
    console.log('✅ Portfolio Analysis - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Data keys: ${Object.keys(response.data).join(', ')}`);
    console.log('');
    
  } catch (error) {
    console.log('❌ Portfolio Analysis - FAILED');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');
  }
}

async function testStrategyRecommendations() {
  console.log('🎯 Testing Strategy Recommendations...');
  try {
    const response = await axios.get(`${TEST_CONFIG.baseURL}/strategies/recommendations`, {
      params: { 
        address: TEST_CONFIG.address,
        risk_level: 'medium',
        min_apy: 5
      },
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ENVXX-MCP-AURA/1.0.0'
      }
    });
    
    console.log('✅ Strategy Recommendations - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Data keys: ${Object.keys(response.data).join(', ')}`);
    console.log('');
    
  } catch (error) {
    console.log('❌ Strategy Recommendations - FAILED');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');
  }
}

async function testMarketData() {
  console.log('📈 Testing Market Data...');
  try {
    const response = await axios.get(`${TEST_CONFIG.baseURL}/market/overview`, {
      timeout: TEST_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ENVXX-MCP-AURA/1.0.0'
      }
    });
    
    console.log('✅ Market Data - SUCCESS');
    console.log(`Status: ${response.status}`);
    console.log(`Data keys: ${Object.keys(response.data).join(', ')}`);
    console.log('');
    
  } catch (error) {
    console.log('❌ Market Data - FAILED');
    console.log(`Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');
  }
}

// Alternative API endpoints to test
async function testAlternativeEndpoints() {
  console.log('🔄 Testing Alternative Endpoints...');
  
  const alternativeURLs = [
    'https://aura.adex.network/api',
    'https://aura.adex.network/v1',
    'https://aura.adex.network'
  ];
  
  for (const baseURL of alternativeURLs) {
    console.log(`Testing: ${baseURL}`);
    try {
      const response = await axios.get(`${baseURL}/portfolio/balances`, {
        params: { address: TEST_CONFIG.address },
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ENVXX-MCP-AURA/1.0.0'
        }
      });
      
      console.log(`✅ ${baseURL} - SUCCESS (${response.status})`);
      return baseURL; // Return working URL
      
    } catch (error) {
      console.log(`❌ ${baseURL} - FAILED (${error.message})`);
    }
  }
  
  console.log('');
  return null;
}

// Mock data generator for testing
function generateMockData() {
  return {
    portfolio: {
      address: TEST_CONFIG.address,
      totalValue: 15420.50,
      chains: [
        {
          name: 'ethereum',
          value: 8500.25,
          tokens: [
            { symbol: 'ETH', balance: 2.5, value: 5000.00, price: 2000.00 },
            { symbol: 'USDC', balance: 3500.25, value: 3500.25, price: 1.00 }
          ]
        },
        {
          name: 'arbitrum',
          value: 4920.15,
          tokens: [
            { symbol: 'ARB', balance: 1000, value: 1200.00, price: 1.20 },
            { symbol: 'USDC', balance: 3720.15, value: 3720.15, price: 1.00 }
          ]
        }
      ],
      defiPositions: [
        {
          protocol: 'Uniswap V3',
          type: 'liquidity_provision',
          value: 2000.10,
          apy: 12.5
        }
      ]
    },
    strategies: [
      {
        id: 'aura-yield-eth-usdc',
        name: 'ETH-USDC Yield Farming',
        protocol: 'Aave',
        apy: 8.5,
        risk: 'medium',
        tvl: 50000000,
        description: 'Provide liquidity to ETH-USDC pool on Aave for stable yield'
      }
    ]
  };
}

// Run tests
if (require.main === module) {
  testAuraAPI().catch(console.error);
}

module.exports = {
  testAuraAPI,
  testAlternativeEndpoints,
  generateMockData,
  TEST_CONFIG
};
