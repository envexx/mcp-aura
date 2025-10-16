"use client";

import Link from "next/link";
import {
  useWidgetProps,
  useMaxHeight,
  useDisplayMode,
  useRequestDisplayMode,
  useIsChatGptApp,
} from "./hooks";

export default function Home() {
  const toolOutput = useWidgetProps<{
    name?: string;
    result?: { structuredContent?: { name?: string } };
  }>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const isChatGptApp = useIsChatGptApp();

  const name = toolOutput?.result?.structuredContent?.name || toolOutput?.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {displayMode !== "fullscreen" && (
        <button
          aria-label="Enter fullscreen"
          className="fixed top-4 right-4 z-50 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg ring-1 ring-slate-900/10 dark:ring-white/10 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          onClick={() => requestDisplayMode("fullscreen")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </button>
      )}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {!isChatGptApp && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  This app works best when connected to ChatGPT via MCP
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">✨</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Chatbot Onchain MCP AURA
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered DeFi assistant that analyzes portfolios, recommends strategies, and executes onchain actions seamlessly through natural language conversations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/portfolio"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
              >
                💼 Analyze Portfolio
              </Link>
              <Link
                href="/strategy"
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 justify-center"
              >
                🎯 Get Strategies
              </Link>
            </div>

            {/* Demo Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Demo Ready • MCP Server Active
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive DeFi Automation
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need for intelligent DeFi portfolio management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {/* Portfolio Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Portfolio Analysis
            </h3>
            <p className="text-gray-600 mb-4 flex-grow">
              Multi-chain portfolio tracking with real-time balances, token prices, and DeFi positions across Ethereum, Arbitrum, and Polygon.
            </p>
            <Link
              href="/portfolio"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium mt-auto"
            >
              Try it now →
            </Link>
          </div>

          {/* AI Strategy Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI Strategy Recommendations
            </h3>
            <p className="text-gray-600 mb-4 flex-grow">
              Get personalized DeFi strategies powered by AURA API with yield farming, staking, and cross-chain opportunities.
            </p>
            <Link
              href="/strategy"
              className="text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium mt-auto"
            >
              Get strategies →
            </Link>
          </div>

          {/* One-Click Execution */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              One-Click Execution
            </h3>
            <p className="text-gray-600 mb-4 flex-grow">
              Execute swaps, stakes, bridges, and transfers directly from chat with wallet integration and fee estimation.
            </p>
            <div className="text-green-600 font-medium mt-auto">
              Coming soon
            </div>
          </div>

          {/* Yield Optimization */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Yield Optimization
            </h3>
            <p className="text-gray-600 mb-4 flex-grow">
              Maximize returns with intelligent yield farming recommendations and automated position management.
            </p>
            <div className="text-yellow-600 font-medium mt-auto">
              Integrated
            </div>
          </div>

          {/* Security First */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Security First
            </h3>
            <p className="text-gray-600 mb-4 flex-grow">
              Non-custodial design with transaction simulation, slippage protection, and multi-signature support.
            </p>
            <div className="text-red-600 font-medium mt-auto">
              Built-in
            </div>
          </div>

          {/* Cross-Chain Support */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col h-full">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Cross-Chain Support
            </h3>
            <p className="text-gray-600 mb-4 flex-grow">
              Seamless operations across Ethereum, Arbitrum, Polygon with unified bridge and swap recommendations.
            </p>
            <div className="text-indigo-600 font-medium mt-auto">
              Multi-chain
            </div>
          </div>
        </div>
      </div>

      {/* API Integration */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              MCP API Integration
            </h2>
            <p className="text-lg text-gray-600">
              RESTful APIs ready for ChatGPT, Claude, and other AI assistants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Endpoints</h3>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">GET</span>
                  <code className="text-gray-700">/api/mcp/portfolio</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">GET</span>
                  <code className="text-gray-700">/api/mcp/strategy</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">POST</span>
                  <code className="text-gray-700">/api/mcp/action</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">POST</span>
                  <code className="text-gray-700">/api/mcp/transfer</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">POST</span>
                  <code className="text-gray-700">/api/mcp/sign-request</code>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">MCP Tools</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <code className="font-semibold text-gray-900">get_portfolio</code>
                    <span className="text-gray-600 ml-2">- Portfolio analysis</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <code className="font-semibold text-gray-900">get_strategy</code>
                    <span className="text-gray-600 ml-2">- Strategy recommendations</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <code className="font-semibold text-gray-900">execute_action</code>
                    <span className="text-gray-600 ml-2">- DeFi actions</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <code className="font-semibold text-gray-900">transfer_tokens</code>
                    <span className="text-gray-600 ml-2">- Token transfers</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <code className="font-semibold text-gray-900">estimate_fees</code>
                    <span className="text-gray-600 ml-2">- Gas estimation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your DeFi Portfolio?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Connect your wallet and let AI guide your DeFi journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/portfolio"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              💼 Start Analysis
            </Link>
            <a
              href="https://github.com/your-repo/smart-chatbot-onchain-mcp-aura"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              📚 View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
