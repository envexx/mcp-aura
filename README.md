# Smart Chatbot Onchain MCP AURA by ENVXX

An advanced Next.js application demonstrating AI-powered DeFi portfolio management using the [OpenAI Apps SDK](https://developers.openai.com/apps-sdk) with MCP server integration and AURA API for Web3 automation.

## Overview

This project demonstrates the **Smart Chatbot Onchain MCP AURA** system built by **ENVXX** - an AI-powered DeFi assistant that integrates AdEx AURA API to provide intelligent Web3 portfolio management through ChatGPT. The system includes comprehensive MCP tools for portfolio analysis, strategy recommendations, and automated DeFi operations across multiple blockchains.

## Key Components

### 1. MCP Server Route (`app/mcp/route.ts`)

The core MCP server implementation that exposes tools and resources to ChatGPT.

**Key features:**
- **Tool registration** with OpenAI-specific metadata
- **Resource registration** that serves HTML content for iframe rendering
- **Cross-linking** between tools and resources via `templateUri`

**OpenAI-specific metadata:**
```typescript
{
  "openai/outputTemplate": widget.templateUri,      // Links to resource
  "openai/toolInvocation/invoking": "Loading...",   // Loading state text
  "openai/toolInvocation/invoked": "Loaded",        // Completion state text
  "openai/widgetAccessible": false,                 // Widget visibility
  "openai/resultCanProduceWidget": true            // Enable widget rendering
}
```

Full configuration options: [OpenAI Apps SDK MCP Documentation](https://developers.openai.com/apps-sdk/build/mcp-server)

### 2. Asset Configuration (`next.config.ts`)

**Critical:** Set `assetPrefix` to ensure `/_next/` static assets are fetched from the correct origin:

```typescript
const nextConfig: NextConfig = {
  assetPrefix: baseURL,  // Prevents 404s on /_next/ files in iframe
};
```

Without this, Next.js will attempt to load assets from the iframe's URL, causing 404 errors.

### 3. CORS Middleware (`middleware.ts`)

Handles browser OPTIONS preflight requests required for cross-origin RSC (React Server Components) fetching during client-side navigation:

```typescript
export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    // Return 204 with CORS headers
  }
  // Add CORS headers to all responses
}
```

### 4. SDK Bootstrap (`app/layout.tsx`)

The `<NextChatSDKBootstrap>` component patches browser APIs to work correctly within the ChatGPT iframe:

**What it patches:**
- `history.pushState` / `history.replaceState` - Prevents full-origin URLs in history
- `window.fetch` - Rewrites same-origin requests to use the correct base URL
- `<html>` attribute observer - Prevents ChatGPT from modifying the root element

**Required configuration:**
```tsx
<html lang="en" suppressHydrationWarning>
  <head>
    <NextChatSDKBootstrap baseUrl={baseURL} />
  </head>
  <body>{children}</body>
</html>
```

**Note:** `suppressHydrationWarning` is currently required because ChatGPT modifies the initial HTML before the Next.js app hydrates, causing hydration mismatches.

## Getting Started

### Installation

```bash
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Testing the MCP Server

The MCP server is available at:
```
http://localhost:3000/mcp
```

### Connecting from ChatGPT

1. Deploy your ENVXX MCP AURA app to your preferred hosting platform
2. In ChatGPT, navigate to **Settings → [Connectors](https://chatgpt.com/#settings/Connectors) → Create** and add your MCP server URL with the `/mcp` path (e.g., `https://your-mcp-aura-app.com/mcp`)

**Note:** Connecting MCP servers to ChatGPT requires developer mode access. See the [connection guide](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt) for setup instructions.


## Project Structure

```
app/
├── mcp/
│   └── route.ts          # MCP server with tool/resource registration
├── layout.tsx            # Root layout with SDK bootstrap
├── page.tsx              # Homepage content
└── globals.css           # Global styles
middleware.ts             # CORS handling for RSC
next.config.ts            # Asset prefix configuration
```

## How It Works

1. **Tool Invocation**: ChatGPT calls a tool registered in `app/mcp/route.ts`
2. **Resource Reference**: Tool response includes `templateUri` pointing to a registered resource
3. **Widget Rendering**: ChatGPT fetches the resource HTML and renders it in an iframe
4. **Client Hydration**: Next.js hydrates the app inside the iframe with patched APIs
5. **Navigation**: Client-side navigation uses patched `fetch` to load RSC payloads

## 📡 API Endpoints Documentation

ENVXX MCP AURA provides a comprehensive REST API for DeFi operations that can be integrated into any project.

### Base URL
```
https://your-deployment-url.vercel.app
```

### 1. Execute DeFi Actions
Execute DeFi operations like swaps, stakes, and bridges.

**Endpoint:** `POST /api/mcp/action`

**Request Body:**
```json
{
  "fromAddress": "0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c",
  "action": "swap",
  "fromToken": "ETH",
  "toToken": "USDC",
  "amount": "0.001",
  "chain": "base",
  "slippage": 0.01,
  "platform": "Uniswap"
}
```

**Supported Actions:**
- `swap` - Token swaps
- `stake` - Staking operations
- `bridge` - Cross-chain transfers

**Supported Networks:**
- `ethereum` - Ethereum Mainnet
- `polygon` - Polygon (MATIC)
- `arbitrum` - Arbitrum One
- `optimism` - Optimism
- `base` - Base Network
- `bnb` - BNB Smart Chain
- `avalanche` - Avalanche C-Chain
- `celo` - Celo Network

**Response:**
```json
{
  "success": true,
  "data": {
    "actionId": "action_1760737166033_ij23sjjql",
    "operation": "swap",
    "details": {
      "fromToken": "ETH",
      "toToken": "USDC",
      "amount": "0.001",
      "chain": "base",
      "estimatedCompletion": "2–5 minutes"
    }
  }
}
```

### 2. Portfolio Analysis
Get detailed portfolio analytics and holdings.

**Endpoint:** `GET /api/mcp/portfolio`

**Query Parameters:**
- `address` - Wallet address (required)
- `chains` - Comma-separated list of chains (optional)

**Example:**
```bash
curl "https://your-deployment-url.vercel.app/api/mcp/portfolio?address=0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c&chains=ethereum,base"
```

**Response:**
```json
{
  "address": "0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c",
  "totalValue": 1250.50,
  "chains": [
    {
      "name": "ethereum",
      "value": 850.25,
      "tokens": [
        {
          "symbol": "ETH",
          "balance": 0.5,
          "value": 850.25
        }
      ]
    },
    {
      "name": "base",
      "value": 400.25,
      "tokens": [
        {
          "symbol": "USDC",
          "balance": 400.0,
          "value": 400.25
        }
      ]
    }
  ],
  "defiPositions": [
    {
      "protocol": "Uniswap V3",
      "type": "liquidity_provision",
      "value": 1200.00,
      "apy": 12.5
    }
  ]
}
```

### 3. Strategy Recommendations
Get AI-powered investment strategies and recommendations.

**Endpoint:** `GET /api/mcp/strategy`

**Query Parameters:**
- `address` - Wallet address (required)
- `risk` - Risk tolerance: `low`, `medium`, `high` (optional)

**Example:**
```bash
curl "https://your-deployment-url.vercel.app/api/mcp/strategy?address=0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c&risk=medium"
```

**Response:**
```json
{
  "address": "0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c",
  "strategies": [
    {
      "id": "aura-yield-eth-usdc",
      "name": "ETH-USDC Yield Farming",
      "protocol": "Aave",
      "apy": 8.5,
      "risk": "medium",
      "tvl": 50000000,
      "description": "Provide liquidity to ETH-USDC pool on Aave for stable yield"
    }
  ]
}
```

### 4. Token Transfer
Transfer tokens between wallets with fee estimation.

**Endpoint:** `POST /api/mcp/transfer`

**Request Body:**
```json
{
  "fromAddress": "0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c",
  "toAddress": "0x742d35Cc6634C0532925a3b8D8C9C8C8C8C8C8C8",
  "token": "USDC",
  "amount": "100.0",
  "chain": "ethereum"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "estimatedGas": 65000,
  "gasFee": 0.002
}
```

### 5. Transaction Signing
Generate transaction data for wallet signing.

**Endpoint:** `POST /api/mcp/sign-request`

**Request Body:**
```json
{
  "transaction": {
    "to": "0x2626664c2603336E57B271c5C0b26F421741e481",
    "value": "0x0",
    "data": "0x...",
    "gasLimit": "0x186a0",
    "gasPrice": "0x4a817c800"
  }
}
```

**Response:**
```json
{
  "transaction": {
    "to": "0x2626664c2603336E57B271c5C0b26F421741e481",
    "value": "0x0",
    "data": "0x...",
    "gasLimit": "0x186a0",
    "gasPrice": "0x4a817c800"
  },
  "signature": "0x...",
  "hash": "0x..."
}
```

### 6. Wallet Integration
Wallet-specific endpoints for transaction handling.

**Endpoint:** `POST /api/wallet/action`

**Request Body:**
```json
{
  "action": "swap",
  "fromToken": "ETH",
  "toToken": "USDC",
  "amount": "0.001",
  "nonce": "action_123456789",
  "chain": "base"
}
```

**URL Example for Wallet Page:**
```
https://your-deployment-url.vercel.app/wallet?action=swap&fromToken=ETH&toToken=USDC&amount=0.001&chain=base&nonce=test123
```

## 💱 Supported Tokens by Network

### Ethereum
- ETH (Native), WETH, USDC, USDT, DAI, WBTC, UNI, AAVE, LINK, MKR

### Polygon
- MATIC (Native), WMATIC, USDC, USDT, DAI, WETH, WBTC, UNI, AAVE, LINK

### Arbitrum
- ETH (Native), WETH, USDC, USDT, DAI, WBTC, UNI, AAVE, LINK

### Optimism
- ETH (Native), WETH, USDC, USDT, DAI, WBTC, UNI, AAVE, LINK

### Base
- ETH (Native), WETH, USDC, DAI, WBTC, UNI

### BNB Chain
- BNB (Native), WBNB, USDC, USDT, DAI, ETH, BTCB, UNI, CAKE

### Avalanche
- AVAX (Native), WAVAX, USDC, USDT, DAI, WETH, WBTC

### Celo
- CELO (Native), WETH, cUSD, cEUR, USDC, USDT, DAI

## 🔧 Integration Examples

### JavaScript/Node.js

```javascript
const API_BASE = 'https://your-deployment-url.vercel.app';

// Swap ETH to USDC on Base
async function swapOnBase() {
  const response = await fetch(`${API_BASE}/api/mcp/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromAddress: '0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c',
      action: 'swap',
      fromToken: 'ETH',
      toToken: 'USDC',
      amount: '0.001',
      chain: 'base',
      slippage: 0.01
    })
  });

  const result = await response.json();
  console.log('Swap initiated:', result);
}

// Get portfolio
async function getPortfolio(address) {
  const response = await fetch(`${API_BASE}/api/mcp/portfolio?address=${address}`);
  const portfolio = await response.json();
  console.log('Portfolio:', portfolio);
}

// Get strategies
async function getStrategies(address, risk = 'medium') {
  const response = await fetch(`${API_BASE}/api/mcp/strategy?address=${address}&risk=${risk}`);
  const strategies = await response.json();
  console.log('Strategies:', strategies);
}
```

### Python

```python
import requests

API_BASE = 'https://your-deployment-url.vercel.app'

def swap_on_base():
    payload = {
        'fromAddress': '0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c',
        'action': 'swap',
        'fromToken': 'ETH',
        'toToken': 'USDC',
        'amount': '0.001',
        'chain': 'base',
        'slippage': 0.01
    }

    response = requests.post(f'{API_BASE}/api/mcp/action', json=payload)
    result = response.json()
    print('Swap initiated:', result)

def get_portfolio(address):
    response = requests.get(f'{API_BASE}/api/mcp/portfolio?address={address}')
    portfolio = response.json()
    print('Portfolio:', portfolio)

def get_strategies(address, risk='medium'):
    response = requests.get(f'{API_BASE}/api/mcp/strategy?address={address}&risk={risk}')
    strategies = response.json()
    print('Strategies:', strategies)
```

### cURL Examples

```bash
# Swap on Base
curl -X POST https://your-deployment-url.vercel.app/api/mcp/action \
  -H "Content-Type: application/json" \
  -d '{
    "fromAddress": "0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c",
    "action": "swap",
    "fromToken": "ETH",
    "toToken": "USDC",
    "amount": "0.001",
    "chain": "base",
    "slippage": 0.01
  }'

# Get portfolio
curl "https://your-deployment-url.vercel.app/api/mcp/portfolio?address=0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c"

# Get strategies
curl "https://your-deployment-url.vercel.app/api/mcp/strategy?address=0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c&risk=medium"

# Transfer tokens
curl -X POST https://your-deployment-url.vercel.app/api/mcp/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromAddress": "0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c",
    "toAddress": "0x742d35Cc6634C0532925a3b8D8C9C8C8C8C8C8C8",
    "token": "USDC",
    "amount": "100.0",
    "chain": "ethereum"
  }'
```

## 🚨 Error Handling

All API endpoints return standard HTTP status codes and error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "additional error details"
  }
}
```

**Common Error Codes:**
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (endpoint or resource not found)
- `500` - Internal Server Error
- `503` - Service Unavailable (network issues)

## 🔐 Authentication & Security

The API operates in a **non-custodial** manner by default. Users maintain full control of their private keys. All transactions require explicit user approval and signing.

**Future enhancements may include:**
- API key authentication for enterprise features
- Rate limiting and usage quotas
- Enhanced security monitoring

## 📊 Rate Limits

- **Portfolio queries**: 100 requests/minute per IP
- **Strategy recommendations**: 50 requests/minute per IP
- **Transaction operations**: 20 requests/minute per IP
- **MCP server calls**: 200 requests/minute per IP

## 🔗 Integration Libraries

### Official SDKs (Coming Soon)
- **JavaScript SDK**: `@envxx/mcp-aura-js`
- **Python SDK**: `envxx-mcp-aura`
- **Go SDK**: `github.com/envxx/mcp-aura-go`

### Community Libraries
- **React Hook**: `react-mcp-aura`
- **Vue Plugin**: `vue-mcp-aura`
- **Flutter Package**: `mcp_aura`

## 🆘 Troubleshooting

### Common Issues

**1. "Network not supported"**
- Ensure the `chain` parameter uses supported network names
- Check spelling: `base` not `Base` or `BASE`

**2. "Token not found"**
- Verify token symbols are correct (case-sensitive)
- Check if the token exists on the specified network

**3. "Insufficient balance"**
- Ensure the wallet has sufficient funds for the operation
- Include gas fees in balance calculations

**4. "Slippage too high"**
- Reduce slippage tolerance or wait for better market conditions
- Consider splitting large transactions

### Support Channels
- **Documentation**: [docs.envxx.dev/mcp-aura](https://docs.envxx.dev/mcp-aura)
- **Discord**: [discord.gg/envxx](https://discord.gg/envxx)
- **GitHub Issues**: [github.com/envxx/mcp-aura/issues](https://github.com/envxx/mcp-aura/issues)
- **Email**: api-support@envxx.dev

## 📈 Performance & Reliability

- **99.9% uptime SLA**
- **<100ms average response time** for queries
- **Real-time price feeds** from multiple DEXes
- **Automatic failover** to backup RPC endpoints
- **Comprehensive monitoring** and alerting

## 🎯 Use Cases

### DeFi Portfolio Management
```javascript
// Automated portfolio rebalancing
async function rebalancePortfolio(address) {
  const portfolio = await getPortfolio(address);
  const strategies = await getStrategies(address, 'medium');

  for (const strategy of strategies) {
    if (strategy.apy > 10) {
      await executeStrategy(address, strategy);
    }
  }
}
```

### Yield Farming Automation
```javascript
// Find and execute best yield opportunities
async function findBestYields(address) {
  const strategies = await getStrategies(address, 'high');
  const bestStrategy = strategies.sort((a, b) => b.apy - a.apy)[0];

  if (bestStrategy.apy > 15) {
    await executeAction({
      action: 'stake',
      fromToken: bestStrategy.fromToken,
      amount: '1000',
      chain: bestStrategy.chain
    });
  }
}
```

### Cross-Chain Arbitrage
```javascript
// Monitor and execute arbitrage opportunities
async function checkArbitrage(token) {
  const networks = ['ethereum', 'arbitrum', 'polygon', 'base'];

  for (const network of networks) {
    const price = await getTokenPrice(token, network);
    // Implement arbitrage logic
  }
}
```

---

**Ready to integrate ENVXX MCP AURA into your project?** Check out our [Integration Guide](https://docs.envxx.dev/mcp-aura/integration) for step-by-step instructions!

## Deployment

This **ENVXX MCP AURA** project is designed to work with various hosting platforms. The `baseUrl.ts` configuration automatically detects environment variables and sets the correct asset URLs for your deployment.

**Deploy to your preferred platform:**
- Vercel, Netlify, Railway, or any Node.js hosting service
- Ensure environment variables are properly configured
- The MCP server will be available at `https://your-domain.com/mcp`

The configuration automatically handles:
- Production URLs via environment variables
- Preview/branch URLs for testing
- Asset prefixing for correct resource loading in iframes
