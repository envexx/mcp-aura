"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Search, Users, PlusCircle, Book, Scale, Globe, Laptop, Share2, MoreVertical, ChevronDown, Mic, ArrowUp, Wallet, Menu, X, Clock, ExternalLink, Zap } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';

interface Portfolio {
  address: string;
  totalValueUSD: string;
  networks: Array<{
    network: any;
    tokens: any[];
    totalValueUSD: string;
  }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'protocol' | 'portfolio' | 'strategy'>('chat');
  const [strategies, setStrategies] = useState<any>(null);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [strategyFilters, setStrategyFilters] = useState({
    riskLevel: 'medium',
    timeframe: 'medium'
  });

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('mcp-aura-chat-history');
  };

  const fetchStrategies = async () => {
    if (!address) return;

    setLoadingStrategies(true);
    try {
      const response = await fetch(`/api/mcp/strategy?address=${address}&risk=${strategyFilters.riskLevel}`);
      const data = await response.json();

      if (data.success) {
        setStrategies(data.data);
      } else {
        console.error('Failed to fetch strategies:', data.error);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoadingStrategies(false);
    }
  };

  useEffect(() => {
    if (chatHistory.length > 0) {
      const latestMessage = document.getElementById(`message-${chatHistory.length - 1}`);
      latestMessage?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  useEffect(() => {
    if (activeTab === 'strategy' && isConnected && address && !strategies) {
      fetchStrategies();
    }
  }, [activeTab, isConnected, address, strategyFilters.riskLevel]);

  const fetchPortfolio = async () => {
    if (!address) return;
    setLoadingPortfolio(true);
    try {
      const response = await fetch(`/api/mcp/portfolio?address=${address}`);
      const data = await response.json();
      if (data.success) {
        setPortfolio(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && activeTab === 'portfolio' && !portfolio) {
      fetchPortfolio();
    }
  }, [isConnected, address, activeTab, portfolio]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('mcp-aura-chat-history');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        // Convert timestamp strings back to Date objects
        const chatsWithDates = parsedChats.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp)
        }));
        setChatHistory(chatsWithDates);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('mcp-aura-chat-history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleActionClick = (actionType: string, params: any) => {
    if (actionType === 'connect_wallet') {
      // Trigger wallet connection modal
      const connectButton = document.querySelector('[data-rainbowkit="connect-button"]');
      if (connectButton) {
        (connectButton as HTMLElement).click();
      }
    } else if (actionType === 'swap') {
      // Handle swap action
      console.log('Swap action triggered');
      // You can implement specific swap logic here
    }
  };

  const customComponents = {
    p: ({ children }: any) => {
      const textContent = children?.toString() || '';

      // Check if paragraph contains wallet connection related text
      const walletConnectionPatterns = [
        /wallet connection url/i,
        /connect your wallet/i,
        /sign the transaction here/i,
        /sign.*here/i,
        /connect.*here/i,
        /\bhere\b.*sign/i,
        /\bhere\b.*connect/i
      ];

      const hasWalletConnection = walletConnectionPatterns.some(pattern => pattern.test(textContent));

      if (hasWalletConnection && !isConnected) {
        // Split and highlight the actionable part
        let processedText = textContent;
        let actionText = '';

        if (textContent.toLowerCase().includes('wallet connection url')) {
          const parts = textContent.split(/(wallet connection URL)/i);
          return (
            <p className="text-gray-900 leading-relaxed">
              {parts[0]}
              <button
                onClick={() => handleActionClick('connect_wallet', {})}
                className="inline-flex items-center gap-2 px-3 py-1 mx-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-sm underline decoration-2 decoration-blue-300 hover:decoration-blue-400"
              >
                <Wallet className="w-3 h-3" />
                wallet connection URL
                <ExternalLink className="w-3 h-3" />
              </button>
              {parts[2] || ''}
            </p>
          );
        } else if (textContent.toLowerCase().includes('sign the transaction here') ||
                   textContent.toLowerCase().includes('connect your wallet')) {
          // Handle "sign the transaction here" or "connect your wallet" patterns
          const parts = textContent.split(/(sign the transaction here|connect your wallet)/i);
          return (
            <p className="text-gray-900 leading-relaxed">
              {parts[0]}
              <button
                onClick={() => handleActionClick('connect_wallet', {})}
                className="inline-flex items-center gap-2 px-3 py-1 mx-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-sm underline decoration-2 decoration-blue-300 hover:decoration-blue-400"
              >
                <Wallet className="w-3 h-3" />
                {parts[1]}
                <ExternalLink className="w-3 h-3" />
              </button>
              {parts[2] || ''}
            </p>
          );
        }
      }

      // Check if paragraph contains any URL patterns
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      if (urlRegex.test(textContent)) {
        const parts = textContent.split(urlRegex);
        return (
          <p className="text-gray-900 leading-relaxed">
            {parts.map((part: string, index: number) => {
              if (urlRegex.test(part)) {
                return (
                  <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 mx-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors font-medium text-sm underline decoration-blue-400 hover:decoration-blue-600"
                  >
                    {part}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                );
              }
              return part;
            })}
          </p>
        );
      }

      return <p className="text-gray-900 leading-relaxed">{children}</p>;
    },
    strong: ({ children }: any) => {
      return <strong className="font-semibold text-gray-900">{children}</strong>;
    },
    ul: ({ children }: any) => {
      return <ul className="list-disc list-inside space-y-1 text-gray-900 leading-relaxed ml-4">{children}</ul>;
    },
    li: ({ children }: any) => {
      return <li className="text-gray-900">{children}</li>;
    },
    a: ({ href, children }: any) => {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors font-medium text-sm underline decoration-blue-400 hover:decoration-blue-600"
        >
          {children}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    },
  };

  const handleSend = () => {
    sendMessage();
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const messagesForAPI = chatHistory.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesForAPI,
          walletAddress: address
        })
      });

      const data = await response.json();

      if (data.message) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-black border-r border-gray-800 transition-all duration-300 overflow-hidden flex flex-col text-white`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="/Aura.png"
                alt="AURA Logo"
                className="w-8 h-8 rounded-lg"
              />
              <h2 className="text-lg font-bold text-white">MCP AURA</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <PlusCircle className="w-4 h-4" />
            <span className="text-sm font-medium">New Chat</span>
          </button>
          {chatHistory.length > 0 && (
            <button
              onClick={clearChatHistory}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Clear History
            </button>
          )}
        </div>

        {/* Portfolio Section */}
        <div className="p-4 border-b border-gray-800">
          <div className="text-xs text-gray-500 mb-2 px-3">Portfolio</div>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'portfolio' ? 'bg-gray-900 text-white' : 'hover:bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium">My Portfolio</span>
          </button>
        </div>

        {/* Protocol Section */}
        <div className="p-4 border-b border-gray-800">
          <div className="text-xs text-gray-500 mb-2 px-3">Tools</div>
          <button
            onClick={() => setActiveTab('protocol')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'protocol' ? 'bg-gray-900 text-white' : 'hover:bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="text-sm font-medium">Protocol</span>
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'strategy' ? 'bg-gray-900 text-white' : 'hover:bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Book className="w-5 h-5" />
            <span className="text-sm font-medium">Strategy</span>
          </button>
        </div>

        {/* Settings or additional sections can go here */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-black border-b border-gray-800">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
              {activeTab === 'protocol' && (
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-900 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Chat</span>
                </button>
              )}
              {activeTab === 'portfolio' && (
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-900 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Chat</span>
                </button>
              )}
              {activeTab === 'strategy' && (
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-900 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Chat</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isConnected ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm font-medium">Connect Wallet</span>
                    </button>
                  )}
                </ConnectButton.Custom>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-900 rounded-lg border border-green-700">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium text-green-300">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="px-3 py-2 text-sm text-red-400 hover:bg-red-900 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === 'chat' ? (
            <>
              {chatHistory.length === 0 ? (
                <div className="flex flex-col h-full">
                  {/* Greeting and Suggestions - Centered */}
                  <div className="flex-1 flex flex-col justify-center px-6 py-8">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mb-4">
                        <Laptop className="w-6 h-6 text-purple-400" />
                      </div>
                      <h1 className="text-2xl font-bold text-white mb-2">
                        Hello, DeFi Explorer
                      </h1>
                      <p className="text-sm text-gray-400">
                        Your AI assistant for DeFi analysis and automation
                      </p>
                    </div>

                    <div className="max-w-4xl mx-auto mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button className="p-4 bg-gray-900 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors text-left">
                          <div className="text-sm font-medium text-white mb-1">Analyze Portfolio</div>
                          <div className="text-xs text-gray-400">Check your DeFi positions</div>
                        </button>
                        <button className="p-4 bg-gray-900 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors text-left">
                          <div className="text-sm font-medium text-white mb-1">Yield Strategies</div>
                          <div className="text-xs text-gray-400">Find farming opportunities</div>
                        </button>
                        <button className="p-4 bg-gray-900 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors text-left">
                          <div className="text-sm font-medium text-white mb-1">Execute Actions</div>
                          <div className="text-xs text-gray-400">Automate DeFi operations</div>
                        </button>
                        <button className="p-4 bg-gray-900 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors text-left">
                          <div className="text-sm font-medium text-white mb-1">Market Analysis</div>
                          <div className="text-xs text-gray-400">Get market insights</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Message Input - Full Width */}
                  <div className="w-full px-4 pb-6">
                    <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-700 p-4 mx-2">
                      <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                          <PlusCircle className="w-4 h-4 text-gray-400" />
                        </button>
                        <input
                          type="text"
                          placeholder="Ask about your portfolio, strategies, or DeFi actions..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                          className="flex-1 bg-transparent border-none outline-none text-gray-300 placeholder-gray-500 text-sm"
                        />
                        <button
                          onClick={handleSend}
                          className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                          disabled={!message.trim() || isLoading}
                        >
                          <ArrowUp className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
              <div className="flex flex-col h-full">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400" style={{maxHeight: 'calc(100vh - 200px)'}}>
                  <div className="max-w-4xl mx-auto space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        id={`message-${index}`}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <div>
                              <ReactMarkdown components={customComponents}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div className="whitespace-pre-line leading-relaxed">
                              {msg.content}
                            </div>
                          )}
                          <div className={`text-xs mt-2 ${
                            msg.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                          }`}>
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Input - Bottom */}
                <div className="w-full px-4 pb-6 bg-black">
                  <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-700 p-4 mx-2">
                    <div className="flex items-center gap-3">
                      <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <PlusCircle className="w-5 h-5 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <Mic className="w-5 h-5 text-gray-400" />
                      </button>
                      <input
                        type="text"
                        placeholder="Ask about your portfolio, strategies, or DeFi actions..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-transparent border-none outline-none text-gray-300 placeholder-gray-500 text-sm"
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleSend}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                        disabled={!message.trim() || isLoading}
                      >
                        <ArrowUp className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
          ) : activeTab === 'protocol' ? (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-4">Protocol Explorer</h1>
                  <p className="text-gray-400">Explore and interact with DeFi protocols</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-blue-400 font-bold">U</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Uniswap</h3>
                    <p className="text-gray-400 text-sm mb-4">Decentralized exchange protocol</p>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition">
                      View Details
                    </button>
                  </div>

                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-green-400 font-bold">A</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Aave</h3>
                    <p className="text-gray-400 text-sm mb-4">Decentralized lending protocol</p>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition">
                      View Details
                    </button>
                  </div>

                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="w-12 h-12 bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-purple-400 font-bold">C</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Compound</h3>
                    <p className="text-gray-400 text-sm mb-4">Algorithmic money markets</p>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'portfolio' ? (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-4">My Portfolio</h1>
                  <p className="text-gray-400">Complete overview of your DeFi assets</p>
                </div>

                {!isConnected ? (
                  <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-400 mb-6">Connect your wallet to view your portfolio</p>
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <button
                          onClick={openConnectModal}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          Connect Wallet
                        </button>
                      )}
                    </ConnectButton.Custom>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Portfolio Summary */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-white mb-1">Portfolio Overview</h2>
                          <p className="text-gray-400 text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                        </div>
                        <button
                          onClick={fetchPortfolio}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                          disabled={loadingPortfolio}
                        >
                          {loadingPortfolio ? 'Loading...' : 'Refresh'}
                        </button>
                      </div>

                      {portfolio ? (
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400 mb-1">
                              ${parseFloat(portfolio.totalValueUSD || '0').toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-400">Total Value</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                              {portfolio.networks?.length || 0}
                            </div>
                            <div className="text-sm text-gray-400">Networks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400 mb-1">
                              {portfolio.networks?.reduce((acc, network) => acc + (network.tokens?.length || 0), 0) || 0}
                            </div>
                            <div className="text-sm text-gray-400">Assets</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No portfolio data available</p>
                        </div>
                      )}
                    </div>

                    {/* Networks and Assets */}
                    {portfolio && portfolio.networks && (
                      <div className="space-y-4">
                        {portfolio.networks.map((network, networkIndex) => (
                          <div key={networkIndex} className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-700">
                              <h3 className="text-lg font-semibold text-white">
                                {network.network?.name || `Network ${networkIndex + 1}`}
                              </h3>
                            </div>
                            <div className="p-4">
                              {network.tokens && network.tokens.length > 0 ? (
                                <div className="space-y-3">
                                  {network.tokens.map((token, tokenIndex) => (
                                    <div key={tokenIndex} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                          <span className="text-white font-bold text-sm">
                                            {token.symbol?.charAt(0) || '?'}
                                          </span>
                                        </div>
                                        <div>
                                          <div className="text-white font-medium">{token.name || 'Unknown Token'}</div>
                                          <div className="text-gray-400 text-sm">{token.symbol || 'UNKNOWN'}</div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-white font-medium">
                                          {parseFloat(token.balance || '0').toFixed(4)} {token.symbol}
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                          ${parseFloat(token.balanceUSD || '0').toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-400 text-center py-4">No tokens found</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'strategy' ? (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-4">AI Strategy Recommendations</h1>
                  <p className="text-gray-400">Get personalized DeFi strategies powered by AURA API</p>
                </div>

                {!isConnected ? (
                  <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-400 mb-6">Connect your wallet to get personalized strategy recommendations</p>
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <button
                          onClick={openConnectModal}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          Connect Wallet
                        </button>
                      )}
                    </ConnectButton.Custom>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Strategy Filters */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                      <h2 className="text-xl font-semibold text-white mb-4">Strategy Preferences</h2>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
                          <select
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            value={strategyFilters.riskLevel}
                            onChange={(e) => setStrategyFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                          >
                            <option value="low">Low Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="high">High Risk</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Time Horizon</label>
                          <select
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            value={strategyFilters.timeframe}
                            onChange={(e) => setStrategyFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                          >
                            <option value="short">Short Term (1-3 months)</option>
                            <option value="medium">Medium Term (3-6 months)</option>
                            <option value="long">Long Term (6+ months)</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={fetchStrategies}
                            disabled={loadingStrategies}
                            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                          >
                            {loadingStrategies ? 'Loading...' : 'Generate Strategies'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Strategy Results */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Recommended Strategies</h3>

                      {loadingStrategies ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                          <p className="text-gray-400 mt-4">Analyzing your portfolio and generating strategies...</p>
                        </div>
                      ) : strategies && strategies.strategies ? (
                        strategies.strategies.flatMap((strategyGroup: any) =>
                          (strategyGroup.response || []).map((strategy: any, index: number) => (
                            <div key={`${strategyGroup.strategy || 'strategy'}-${index}`} className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-white mb-1">{strategy.name || strategy.title || 'Strategy Recommendation'}</h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <span className={`w-2 h-2 rounded-full ${
                                        strategy.risk === 'low' ? 'bg-green-400' :
                                        strategy.risk === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                                      }`}></span>
                                      {strategy.protocol || strategy.platform || 'Multiple Protocols'}
                                    </span>
                                    <span>Risk: {strategy.risk || 'Medium'}</span>
                                    <span>APY: {strategy.apy ? `${strategy.apy}%` : strategy.expectedReturn ? `${strategy.expectedReturn}%` : 'Variable'}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-green-400">
                                    {strategy.tvl ? `$${strategy.tvl.toLocaleString()}` :
                                     strategy.poolSize ? `$${strategy.poolSize.toLocaleString()}` : 'Variable'}
                                  </div>
                                  <div className="text-sm text-gray-400">TVL</div>
                                </div>
                              </div>
                              <p className="text-gray-300 mb-4">
                                {strategy.description || strategy.explanation || 'AI-powered strategy recommendation based on current market conditions.'}
                              </p>
                              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                                View Details
                              </button>
                            </div>
                          ))
                        )
                      ) : (
                        <>
                          {/* Default mockup data when no API data available */}
                          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-1">ETH-USDC Yield Farming</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    Aave Protocol
                                  </span>
                                  <span>Risk: Medium</span>
                                  <span>APY: 8.5%</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-400">$1,200</div>
                                <div className="text-sm text-gray-400">TVL</div>
                              </div>
                            </div>
                            <p className="text-gray-300 mb-4">
                              Provide liquidity to the ETH-USDC pool on Aave to earn stable yield through lending fees and protocol rewards.
                            </p>
                            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                              View Details
                            </button>
                          </div>

                          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-1">Cross-Chain Arbitrage</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                    Multi-Chain
                                  </span>
                                  <span>Risk: High</span>
                                  <span>Potential: 2-5%</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-400">Variable</div>
                                <div className="text-sm text-gray-400">Returns</div>
                              </div>
                            </div>
                            <p className="text-gray-300 mb-4">
                              Exploit price differences across different DEXes and blockchains to capture arbitrage opportunities.
                            </p>
                            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                              View Details
                            </button>
                          </div>

                          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-1">Stablecoin Stacking</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    Compound
                                  </span>
                                  <span>Risk: Low</span>
                                  <span>APY: 4.2%</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-400">$500K</div>
                                <div className="text-sm text-gray-400">TVL</div>
                              </div>
                            </div>
                            <p className="text-gray-300 mb-4">
                              Deposit stablecoins into Compound's lending protocol to earn interest from borrowers.
                            </p>
                            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                              View Details
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
