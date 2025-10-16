import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connect Wallet - ENVXX MCP AURA',
  description: 'Connect your wallet to sign DeFi transactions',
};

interface WalletConnectPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

function WalletConnectContent({ searchParams }: WalletConnectPageProps) {
  const actionId = typeof searchParams.actionId === 'string' ? searchParams.actionId : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🔗 Connect Your Wallet
            </h1>
            <p className="text-gray-600">
              Connect your wallet to sign DeFi transactions securely
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => connectWallet('metamask')}
              className="w-full flex items-center justify-center px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              <img src="/metamask-icon.svg" alt="MetaMask" className="w-6 h-6 mr-3" />
              Connect MetaMask
            </button>

            <button
              onClick={() => connectWallet('walletconnect')}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <img src="/walletconnect-icon.svg" alt="WalletConnect" className="w-6 h-6 mr-3" />
              WalletConnect
            </button>

            <button
              onClick={() => connectWallet('coinbase')}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <img src="/coinbase-icon.svg" alt="Coinbase Wallet" className="w-6 h-6 mr-3" />
              Coinbase Wallet
            </button>

            <button
              onClick={() => connectWallet('ledger')}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              <img src="/ledger-icon.svg" alt="Ledger" className="w-6 h-6 mr-3" />
              Ledger
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Action ID</h3>
            <p className="text-sm text-gray-600 font-mono break-all">{actionId}</p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Secure connection powered by ENVXX MCP AURA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function connectWallet(walletType: string) {
  // This would integrate with actual wallet connection libraries
  console.log(`Connecting to ${walletType}...`);

  // For demo purposes, redirect to signing page
  const actionId = new URLSearchParams(window.location.search).get('actionId');
  if (actionId) {
    window.location.href = `/wallet/sign?actionId=${actionId}`;
  }
}

export default function WalletConnectPage(props: WalletConnectPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletConnectContent {...props} />
    </Suspense>
  );
}
