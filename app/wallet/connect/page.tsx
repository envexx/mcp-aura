'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface WalletConnectPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function WalletConnectContent({ searchParams }: WalletConnectPageProps) {
  const { address, isConnected } = useAccount();
  const [actionId, setActionId] = useState<string>('');
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    const init = async () => {
      const params = await searchParams;
      const id = typeof params.actionId === 'string' ? params.actionId : '';
      setActionId(id);
    };
    init();
  }, [searchParams]);

  useEffect(() => {
    if (isConnected && address) {
      // Store connection info
      localStorage.setItem('wallet_connected', 'true');
      localStorage.setItem('wallet_address', address);

      // Success message
      alert(`Successfully connected to wallet! Address: ${address}`);

      // Redirect to signing page after 2 seconds
      setTimeout(() => {
        if (actionId && actionId !== 'unknown') {
          window.location.href = `/wallet/sign?actionId=${actionId}`;
        }
      }, 2000);
    }
  }, [isConnected, address, actionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🔗 Connect Wallet
            </h1>
            <p className="text-gray-300">
              Connect your wallet to sign DeFi transactions securely
            </p>
          </div>

          {isConnected ? (
            <div className="space-y-6">
              <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-emerald-300">Wallet Connected</p>
                    <p className="text-sm text-emerald-200 font-mono break-all mt-1">{address}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem('wallet_connected');
                  localStorage.removeItem('wallet_address');
                  window.location.reload();
                }}
                className="w-full flex items-center justify-center px-6 py-4 bg-red-500/80 hover:bg-red-500 text-white rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm border border-red-400/30"
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <button
                  onClick={() => openConnectModal?.()}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
                >
                  🌟 Connect Wallet
                </button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-300">
                  Choose your preferred wallet to continue with the transaction
                </p>
                <div className="flex justify-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    <span>MetaMask</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <span>Coinbase</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-6 h-6 bg-purple-500 rounded"></div>
                    <span>WalletConnect</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Action ID: <span className="font-mono text-emerald-300">{actionId}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Secure connection powered by AppKit & ENVXX MCP AURA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletConnectPage(props: WalletConnectPageProps) {
  return <WalletConnectContent {...props} />;
}
