"use client";

import Image from "next/image";
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
    <div className="min-h-screen bg-black text-white">
      {displayMode !== "fullscreen" && (
        <button
          aria-label="Enter fullscreen"
          className="fixed top-4 right-4 z-50 rounded-full bg-gray-900 border border-gray-700 text-white p-2.5 hover:bg-gray-800 transition-colors cursor-pointer"
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
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
                  <span className="font-bold text-sm">AI</span>
                </div>
                <div className="text-sm text-gray-300">
                  This app works best when connected to ChatGPT via MCP
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Image
                src="/Aura.png"
                alt="AURA Logo"
                width={60}
                height={60}
                className="rounded-xl"
              />
              <h1 className="text-6xl font-bold text-white tracking-tight">
                MCP AURA
              </h1>
            </div>
            
            <div className="mb-6">
              <p className="text-2xl font-light text-gray-300 mb-2">
                Smart Chatbot Onchain
              </p>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                AI-powered DeFi assistant for portfolio analysis and onchain automation
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/portfolio"
                className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 justify-center font-semibold border border-gray-300"
              >
                Analyze Portfolio
              </Link>
              <Link
                href="/strategy"
                className="px-8 py-3 bg-transparent border border-white text-white rounded-lg hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 justify-center font-semibold"
              >
                Get Strategies
              </Link>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">MCP Server Active</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            DeFi Automation Suite
          </h2>
          <p className="text-lg text-gray-400">
            Everything you need for intelligent portfolio management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {/* Portfolio Analysis */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold">P</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Portfolio Analysis
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Multi-chain portfolio tracking with real-time balances, token prices, and DeFi positions.
            </p>
            <Link
              href="/portfolio"
              className="text-white hover:text-gray-300 flex items-center gap-1 font-medium mt-auto"
            >
              Analyze →
            </Link>
          </div>

          {/* AI Strategy Recommendations */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold">S</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              AI Strategy Recommendations
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Get personalized DeFi strategies powered by AURA API with yield farming and cross-chain opportunities.
            </p>
            <Link
              href="/strategy"
              className="text-white hover:text-gray-300 flex items-center gap-1 font-medium mt-auto"
            >
              Get strategies →
            </Link>
          </div>

          {/* One-Click Execution */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold">E</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              One-Click Execution
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Execute swaps, stakes, bridges, and transfers directly from chat with wallet integration.
            </p>
            <div className="text-gray-500 font-medium mt-auto">
              Coming soon
            </div>
          </div>

          {/* Yield Optimization */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold">Y</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Yield Optimization
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Maximize returns with intelligent yield farming recommendations and automated position management.
            </p>
            <div className="text-green-400 font-medium mt-auto">
              Active
            </div>
          </div>

          {/* Security First */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold">S</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Security First
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Non-custodial design with transaction simulation, slippage protection, and multi-signature support.
            </p>
            <div className="text-green-400 font-medium mt-auto">
              Built-in
            </div>
          </div>

          {/* Cross-Chain Support */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold">C</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Cross-Chain Support
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Seamless operations across Ethereum, Arbitrum, Polygon with unified bridge and swap recommendations.
            </p>
            <div className="text-green-400 font-medium mt-auto">
              Multi-chain
            </div>
          </div>
        </div>
      </div>

      {/* API Integration */}
      <div className="bg-gray-900 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              MCP API Integration
            </h2>
            <p className="text-lg text-gray-400">
              RESTful APIs ready for ChatGPT, Claude, and other AI assistants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Available Endpoints</h3>
              <div className="space-y-3 text-sm font-mono">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-white text-black rounded text-xs font-semibold">GET</span>
                  <code className="text-gray-300">/api/mcp/portfolio</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-white text-black rounded text-xs font-semibold">GET</span>
                  <code className="text-gray-300">/api/mcp/strategy</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-semibold">POST</span>
                  <code className="text-gray-300">/api/mcp/action</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-semibold">POST</span>
                  <code className="text-gray-300">/api/mcp/transfer</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-semibold">POST</span>
                  <code className="text-gray-300">/api/mcp/sign-request</code>
                </div>
              </div>
            </div>

            <div className="bg-black border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">MCP Tools</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div>
                    <code className="font-semibold text-white">get_portfolio</code>
                    <span className="text-gray-400 ml-2">- Portfolio analysis</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div>
                    <code className="font-semibold text-white">get_strategy</code>
                    <span className="text-gray-400 ml-2">- Strategy recommendations</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div>
                    <code className="font-semibold text-white">execute_action</code>
                    <span className="text-gray-400 ml-2">- DeFi actions</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div>
                    <code className="font-semibold text-white">transfer_tokens</code>
                    <span className="text-gray-400 ml-2">- Token transfers</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div>
                    <code className="font-semibold text-white">estimate_fees</code>
                    <span className="text-gray-400 ml-2">- Gas estimation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Optimize Your DeFi Portfolio?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect your wallet and let AURA AI guide your DeFi journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/portfolio"
              className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              Start Analysis
            </Link>
            <a
              href="https://github.com/envexx/mcp-aura"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 ENVXX. Built for the decentralized future.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <a 
                href="https://github.com/envexx/mcp-aura" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://mcp-aura.vercel.app/api/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                API
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
