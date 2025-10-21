<div align="center">
  <img src="Aura.png" alt="ENVXX MCP AURA Logo" width="120" height="120">
  <br>
  <h1>Smart Chatbot Onchain</h1>
  <h2>MCP AURA by ENVEXX</h2>
  <p><em>AI-Powered DeFi Portfolio Management & Automation</em></p>
  <br>
  <p>
    <a href="#installation">Get Started</a> •
    <a href="#api-endpoints">API Docs</a> •
    <a href="#deployment">Deploy</a> •
    <a href="#support">Support</a>
  </p>
  <br>
</div>

---

## 🚀 Overview

**ENVEXX MCP AURA** is an advanced AI-powered DeFi assistant that integrates with ChatGPT through the Model Context Protocol (MCP). Built for intelligent Web3 portfolio management, it provides seamless DeFi operations across multiple blockchains with automated trading, yield farming, and portfolio analytics.

### ✨ Key Features

- 🤖 **AI-Powered Chat Interface** - Natural language DeFi interactions
- 📊 **Multi-Chain Portfolio Analysis** - Real-time holdings across Ethereum, Polygon, Arbitrum, and more
- ⚡ **One-Click Execution** - Automated swaps, stakes, and transfers
- 🎯 **Strategy Recommendations** - AI-driven yield farming and investment strategies
- 🔒 **Non-Custodial Security** - User maintains full control of private keys
- 🌐 **Cross-Chain Support** - Unified operations across major blockchains

### 🏗️ Architecture

This project demonstrates the **OpenAI Apps SDK** integration with MCP server, featuring:
- **Tool Registration** with ChatGPT-specific metadata
- **Resource Registration** for iframe widget rendering
- **Cross-Origin RSC** handling for seamless navigation
- **Wallet Integration** with RainbowKit

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

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/envxx/mcp-aura.git
cd mcp-aura

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Environment Setup

Create a `.env.local` file with required API keys:

```env
# AURA API Configuration
AURA_API_KEY=your_aura_api_key
AURA_API_SECRET=your_aura_api_secret

# Optional: Additional RPC endpoints
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
```

## 🔧 Configuration

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

## 📡 API Endpoints

### Base URL
```
https://your-deployment-url.vercel.app/api
```

### 🔄 DeFi Actions

#### Execute Swap/Stake/Bridge
```http
POST /mcp/action
```

**Request:**
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

**Supported Actions:** `swap`, `stake`, `bridge`
**Supported Chains:** `ethereum`, `polygon`, `arbitrum`, `optimism`, `base`, `bnb`, `avalanche`, `celo`

### 📊 Portfolio Analysis

#### Get Portfolio Data
```http
GET /mcp/portfolio?address={address}&chains={chains}
```

**Example:**
```bash
curl "https://api.envxx.dev/mcp/portfolio?address=0xd3a12CA02256CD74AD8659974cfF36f62Aa0485c&chains=ethereum,base"
```

### 🎯 Strategy Recommendations

#### Get AI Strategies
```http
GET /mcp/strategy?address={address}&risk={risk}
```

**Risk Levels:** `low`, `medium`, `high`

### 💸 Token Transfer

#### Transfer Tokens
```http
POST /mcp/transfer
```

**Request:**
```json
{
  "fromAddress": "0x...",
  "toAddress": "0x...",
  "token": "USDC",
  "amount": "100.0",
  "chain": "ethereum"
}
```

## 🚀 Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/envxx/mcp-aura)

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
npm i -g vercel
vercel --prod

# Or deploy to Netlify
npm run build
npm i -g netlify-cli
netlify deploy --prod --dir .next
```

### Environment Variables

Set these in your deployment platform:

```env
AURA_API_KEY=your_api_key
AURA_API_SECRET=your_api_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🆘 Support & Community

- 📖 **Documentation**: [docs.envexx.dev/mcp-aura](https://docs.envexx.dev/mcp-aura)
- 💬 **Discord**: [discord.gg/envexx](https://discord.gg/envexx)
- 🐛 **Issues**: [github.com/envexx/mcp-aura/issues](https://github.com/envexx/mcp-aura/issues)
- 📧 **Email**: support@envexx.dev

## 📄 License

**ENVEXX MCP AURA** is built by ENVEXX for the decentralized future.

---

<div align="center">
  <p><strong>Built with ❤️ by ENVEXX Team</strong></p>
  <p>
    <a href="https://envexx.dev">Website</a> •
    <a href="https://twitter.com/envexx">Twitter</a> •
    <a href="https://github.com/envexx">GitHub</a>
  </p>
</div>
