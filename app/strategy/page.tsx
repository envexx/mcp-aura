'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertTriangle, Clock, Zap, RefreshCw } from 'lucide-react';

interface ActionStep {
  tokens: string;
  description: string;
  platforms: Array<{
    name: string;
    url: string;
  }>;
  networks: string[];
  operations: string[];
  apy?: string;
  risk?: string;
  estimatedGas?: string;
  slippage?: string;
}

interface Strategy {
  name: string;
  risk: 'low' | 'moderate' | 'high';
  expectedYield: string;
  timeframe: string;
  actions: ActionStep[];
  description: string;
}

interface StrategyResponse {
  strategies: Array<{
    llm: {
      provider: string;
      model: string;
    };
    response: Strategy[];
  }>;
}

export default function StrategyPage() {
  const [strategies, setStrategies] = useState<StrategyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'moderate' | 'high' | ''>('');

  const loadStrategies = async (walletAddress: string, risk?: string) => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({ address: walletAddress });
      if (risk) params.append('riskLevel', risk);
      
      const response = await fetch(`/api/mcp/strategy?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setStrategies(result.data);
      } else {
        console.error('Failed to load strategies:', result.error);
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.match(/^0x[a-fA-F0-9]{40}$/)) {
      loadStrategies(address, riskLevel || undefined);
    }
  };

  const executeAction = async (action: ActionStep) => {
    // This would integrate with the wallet connection and execute the action
    console.log('Executing action:', action);
    alert(`Would execute: ${action.description}`);
  };

  // Load demo strategies on mount
  useEffect(() => {
    const demoAddress = '0x742d35Cc6634C0532925a3b8D8C9C8C8C8C8C8C8';
    setAddress(demoAddress);
    loadStrategies(demoAddress);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <Target className="w-4 h-4" />;
      case 'moderate': return <TrendingUp className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            DeFi Strategy Recommendations
          </h1>
          <p className="text-gray-600">
            AI-powered strategies to optimize your DeFi portfolio
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="risk" className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  id="risk"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="moderate">Moderate Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Generate Strategies
              </button>
            </div>
          </form>
        </div>

        {/* Strategies */}
        {strategies && (
          <div className="space-y-8">
            {strategies.strategies.map((strategyGroup, groupIndex) => (
              <div key={groupIndex}>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      AI Recommendations
                    </h2>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {strategyGroup.llm.provider} {strategyGroup.llm.model}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {strategyGroup.response.map((strategy, strategyIndex) => (
                    <div key={strategyIndex} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {strategy.name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {strategy.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getRiskColor(strategy.risk)}`}>
                              {getRiskIcon(strategy.risk)}
                              {strategy.risk} risk
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            {strategy.expectedYield}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {strategy.timeframe}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Action Steps
                        </h4>
                        {strategy.actions.map((action, actionIndex) => (
                          <div key={actionIndex} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 mb-2">
                                  {action.description}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                    {action.tokens}
                                  </span>
                                  {action.operations.map((op, opIndex) => (
                                    <span key={opIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      {op}
                                    </span>
                                  ))}
                                  {action.networks.map((network, netIndex) => (
                                    <span key={netIndex} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                      {network}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  {action.apy && (
                                    <span className="flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4" />
                                      APY: {action.apy}
                                    </span>
                                  )}
                                  {action.estimatedGas && (
                                    <span>Gas: {action.estimatedGas}</span>
                                  )}
                                  {action.slippage && (
                                    <span>Slippage: {action.slippage}</span>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <button
                                  onClick={() => executeAction(action)}
                                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  Execute
                                </button>
                              </div>
                            </div>

                            {/* Platforms */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Platforms:</span>
                              {action.platforms.map((platform, platformIndex) => (
                                <a
                                  key={platformIndex}
                                  href={platform.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                  {platform.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Generating AI-powered strategies...</p>
          </div>
        )}

        {/* Empty State */}
        {!strategies && !loading && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Enter a wallet address to get strategy recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
}
