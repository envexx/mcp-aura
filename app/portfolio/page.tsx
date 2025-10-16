'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, DollarSign, Activity, RefreshCw } from 'lucide-react';

interface Token {
  address: string;
  symbol: string;
  balance: string;
  balanceUSD: string;
  network: string;
  decimals?: number;
  logoURI?: string;
}

interface Network {
  name: string;
  chainId: string;
  rpcUrl?: string;
  explorerUrl?: string;
}

interface Portfolio {
  address: string;
  totalValueUSD: string;
  networks: Array<{
    network: Network;
    tokens: Token[];
    totalValueUSD: string;
  }>;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  const loadPortfolio = async (walletAddress: string) => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/mcp/portfolio?address=${walletAddress}`);
      const result = await response.json();
      
      if (result.success) {
        setPortfolio(result.data);
      } else {
        console.error('Failed to load portfolio:', result.error);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.match(/^0x[a-fA-F0-9]{40}$/)) {
      loadPortfolio(address);
    }
  };

  // Load demo portfolio on mount
  useEffect(() => {
    const demoAddress = '0x742d35Cc6634C0532925a3b8D8C9C8C8C8C8C8C8';
    setAddress(demoAddress);
    loadPortfolio(demoAddress);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Portfolio Analysis
          </h1>
          <p className="text-gray-600">
            Comprehensive DeFi portfolio tracking powered by AURA
          </p>
        </div>

        {/* Address Input */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
                Analyze
              </button>
            </div>
          </form>
        </div>

        {/* Portfolio Overview */}
        {portfolio && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Value</h3>
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ${parseFloat(portfolio.totalValueUSD).toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Networks</h3>
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {portfolio.networks.length}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Assets</h3>
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {portfolio.networks.reduce((acc, n) => acc + n.tokens.length, 0)}
                </p>
              </div>
            </div>

            {/* Network Breakdown */}
            <div className="space-y-6">
              {portfolio.networks.map((networkData, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {networkData.network.name}
                      </h3>
                      <p className="text-gray-600">
                        Chain ID: {networkData.network.chainId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${parseFloat(networkData.totalValueUSD).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {((parseFloat(networkData.totalValueUSD) / parseFloat(portfolio.totalValueUSD)) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>

                  {/* Tokens */}
                  <div className="space-y-3">
                    {networkData.tokens.map((token, tokenIndex) => (
                      <div key={tokenIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {token.logoURI ? (
                            <img 
                              src={token.logoURI} 
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {token.symbol.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{token.symbol}</p>
                            <p className="text-sm text-gray-500">
                              {token.address.slice(0, 6)}...{token.address.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {parseFloat(token.balance).toLocaleString()} {token.symbol}
                          </p>
                          <p className="text-sm text-green-600">
                            ${parseFloat(token.balanceUSD).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Analyzing portfolio...</p>
          </div>
        )}

        {/* Empty State */}
        {!portfolio && !loading && (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Enter a wallet address to analyze portfolio</p>
          </div>
        )}
      </div>
    </div>
  );
}
