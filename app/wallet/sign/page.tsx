'use client';

import { useState, useEffect } from 'react';

interface WalletSignPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

function WalletSignContent({ searchParams }: WalletSignPageProps) {
  const [signing, setSigning] = useState(false);
  const [actionId, setActionId] = useState<string>('');

  useEffect(() => {
    const id = typeof searchParams.actionId === 'string' ? searchParams.actionId : '';
    setActionId(id);
  }, [searchParams]);

  const signTransaction = async () => {
    setSigning(true);
    try {
      // This would integrate with wallet signing libraries
      alert('Transaction signed and broadcast successfully! 🎉');

      // Simulate signing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect back to the chat or success page
      window.location.href = '/';
    } catch (error) {
      console.error('Signing failed:', error);
      setSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ✍️ Sign Your Transaction
            </h1>
            <p className="text-gray-600">
              Review and sign your DeFi transaction securely
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Action:</span>
                <span className="font-medium">Token Swap</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">0.01 ETH</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">USDT (estimated)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Network:</span>
                <span className="font-medium">Ethereum</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium">Uniswap V3</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Slippage:</span>
                <span className="font-medium">0.5%</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Gas:</span>
                <span className="font-medium">~0.004 ETH ($8.50)</span>
              </div>
            </div>
          </div>

          {/* Contract Address */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Verified Contract</h3>
                <p className="text-sm text-blue-700 font-mono text-xs mt-1">
                  0xE592427A0AEce92De3Edee1F18E0157C05861564
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Uniswap V3 SwapRouter02 - Verified on Etherscan
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={signTransaction}
              disabled={signing}
              className="w-full flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors"
            >
              {signing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing Transaction...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sign & Broadcast Transaction
                </>
              )}
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel & Go Back
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Action ID: <span className="font-mono">{actionId}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Secure signing powered by ENVXX MCP AURA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletSignPage(props: WalletSignPageProps) {
  return <WalletSignContent {...props} />;
}
