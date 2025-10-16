"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-400">
            ENVXX MCP AURA - Smart Chatbot Onchain
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: October 16, 2025 • Version 1.0.0
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Overview */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
            <p className="text-gray-300 leading-relaxed">
              ENVXX MCP AURA is committed to protecting your privacy while providing AI-powered DeFi portfolio management services. 
              This privacy policy explains how we handle data in our decentralized, non-custodial Web3 application.
            </p>
          </section>

          {/* Data Collection */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Collection</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">What We Collect:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Wallet addresses (public blockchain data)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Transaction history (public blockchain data)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Portfolio preferences and settings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Usage analytics for service improvement
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-3">What We DON'T Collect:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">×</span>
                  Private keys or seed phrases
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">×</span>
                  Personal identification information
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">×</span>
                  Email addresses or contact information
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">×</span>
                  Financial account details
                </li>
              </ul>
            </div>
          </section>

          {/* Web3 & Security */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Web3 Security & Privacy</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Non-Custodial Design</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• We never have access to your private keys</li>
                  <li>• You maintain full control of your assets</li>
                  <li>• Read-only access to public wallet data</li>
                  <li>• No fund custody or management</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Data Security</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• End-to-end encryption</li>
                  <li>• Secure API endpoints</li>
                  <li>• No sensitive data storage</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>
            </div>
          </section>

          {/* AI Processing */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">AI Processing</h2>
            <p className="text-gray-300 mb-4">
              We use AI to analyze portfolio data and provide personalized DeFi recommendations:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                Real-time analysis without permanent storage
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                Privacy-preserving AI processing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                Anonymized data for model improvement
              </li>
            </ul>
          </section>

          {/* User Rights */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Data Rights</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Access your processed data</li>
                  <li>• Update preferences anytime</li>
                  <li>• Request data deletion</li>
                  <li>• Export your settings</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Web3 Rights</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Self-sovereign data control</li>
                  <li>• Decentralized service access</li>
                  <li>• Transparent operations</li>
                  <li>• Cross-chain privacy</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact & Compliance</h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                <strong>Questions or Concerns:</strong> Contact us through our{" "}
                <a 
                  href="https://github.com/envexx/mcp-aura" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  GitHub repository
                </a>
              </p>
              
              <p className="text-gray-300">
                <strong>Compliance:</strong> We comply with GDPR, CCPA, and Web3 privacy standards
              </p>
              
              <p className="text-gray-300">
                <strong>Response Time:</strong> We respond to privacy inquiries within 30 days
              </p>
            </div>
          </section>

          {/* API Access */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">API Access</h2>
            <p className="text-gray-300 mb-4">
              Developers can access our privacy policy programmatically:
            </p>
            <div className="bg-black border border-gray-600 rounded-lg p-4">
              <code className="text-green-400 text-sm">
                GET https://mcp-aura.vercel.app/api/privacy-policy
              </code>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            © 2025 ENVXX. Built with privacy and decentralization in mind.
          </p>
        </div>
      </div>
    </div>
  );
}
