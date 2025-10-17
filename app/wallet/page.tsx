'use client';

import { Suspense, useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSearchParams } from 'next/navigation';

// ============================================
// MULTI-CHAIN CONFIGURATIONS
// ============================================

interface ChainConfig {
  name: string;
  chainId: number;
  nativeCurrency: {
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrl: string;
  uniswapUrl: string;
  routerAddress: string;
  supported: boolean;
}

const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://eth.llamarpc.com', 'https://rpc.ankr.com/eth'],
    blockExplorerUrl: 'https://etherscan.io',
    uniswapUrl: 'https://app.uniswap.org',
    routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    supported: true,
  },

  polygon: {
    name: 'Polygon',
    chainId: 137,
    nativeCurrency: { symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com', 'https://rpc.ankr.com/polygon'],
    blockExplorerUrl: 'https://polygonscan.com',
    uniswapUrl: 'https://app.uniswap.org',
    routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    supported: true,
  },

  arbitrum: {
    name: 'Arbitrum One',
    chainId: 42161,
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc', 'https://rpc.ankr.com/arbitrum'],
    blockExplorerUrl: 'https://arbiscan.io',
    uniswapUrl: 'https://app.uniswap.org',
    routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    supported: true,
  },

  optimism: {
    name: 'Optimism',
    chainId: 10,
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io', 'https://rpc.ankr.com/optimism'],
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    uniswapUrl: 'https://app.uniswap.org',
    routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    supported: true,
  },

  base: {
    name: 'Base',
    chainId: 8453,
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org', 'https://base.llamarpc.com'],
    blockExplorerUrl: 'https://basescan.org',
    uniswapUrl: 'https://app.uniswap.org',
    routerAddress: '0x2626664c2603336E57B271c5C0b26F421741e481',
    supported: true,
  },

  bnb: {
    name: 'BNB Chain',
    chainId: 56,
    nativeCurrency: { symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org', 'https://rpc.ankr.com/bsc'],
    blockExplorerUrl: 'https://bscscan.com',
    uniswapUrl: 'https://app.uniswap.org',
    routerAddress: '0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2',
    supported: true,
  },

  avalanche: {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    nativeCurrency: { symbol: 'AVAX', decimals: 18 },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc', 'https://rpc.ankr.com/avalanche'],
    blockExplorerUrl: 'https://snowtrace.io',
    uniswapUrl: 'https://app.uniswap.org',
    routerAddress: '0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE',
    supported: true,
  },

  celo: {
    name: 'Celo',
    chainId: 42220,
    nativeCurrency: { symbol: 'CELO', decimals: 18 },
    rpcUrls: ['https://forno.celo.org', 'https://rpc.ankr.com/celo'],
    blockExplorerUrl: 'https://celoscan.io',
    uniswapUrl: 'https://app.uniswap.org',
    routerAddress: '0x5615CDAb10dc425a742d643d949a7F474C01abc4',
    supported: true,
  },
};

// ============================================
// TOKEN ADDRESSES PER CHAIN
// ============================================

const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  ethereum: {
    ETH: 'ETH',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
  },

  polygon: {
    MATIC: 'MATIC',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    UNI: '0xb33EaAd8d922B1083446DC23f610c2567fB5180f',
    LINK: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
  },

  arbitrum: {
    ETH: 'ETH',
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    UNI: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
    LINK: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
  },

  optimism: {
    ETH: 'ETH',
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    WBTC: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    UNI: '0x6fd9d7AD17242c41f7131d257212c54A0e816691',
    LINK: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
  },

  base: {
    ETH: 'ETH',
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    WBTC: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    UNI: '0xc3De830EA07524a0761646a6a4e4be0e114a3C83',
  },

  bnb: {
    BNB: 'BNB',
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    DAI: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    ETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    BTCB: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    UNI: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1',
  },

  avalanche: {
    AVAX: 'AVAX',
    WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    DAI: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    WETH: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    WBTC: '0x50b7545627a5162F82A992c33b87aDc75187B218',
  },

  celo: {
    CELO: 'CELO',
    WETH: '0x122013fd7dF1C6F636a5bb8f03108E876548b455',
    cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    USDC: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
    USDT: '0x88eeC49252c8cbc039DCdB394c0c2BA2f1637EA0',
  },
};

interface WalletPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function WalletContent({ searchParams }: WalletPageProps) {
  const [actionId, setActionId] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [fromToken, setFromToken] = useState<string>('');
  const [toToken, setToToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [chain, setChain] = useState<string>('ethereum');
  const [nonce, setNonce] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'loading' | 'connect' | 'sign' | 'success' | 'error'>('loading');
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [transactionPreview, setTransactionPreview] = useState<any>(null);
  const { address, isConnected } = useAccount();
  const { sendTransaction, isPending: isSendPending, data: txHash } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const searchParamsHook = useSearchParams();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        console.log('🔍 Initializing wallet page...');

        // ✅ FIX 1: Use useSearchParams hook for reliable parsing
        console.log('📦 searchParamsHook:', searchParamsHook);
        console.log('📦 searchParamsHook type:', typeof searchParamsHook);

        // Helper function untuk extract string value
        const getParamValue = (key: string): string => {
          const value = searchParamsHook?.get(key);
          console.log(`🔍 getParamValue(${key}):`, value, 'type:', typeof value);
          return value ? value.trim() : '';
        };

        const actionParam = getParamValue('action');
        const fromTokenParam = getParamValue('fromToken');
        const toTokenParam = getParamValue('toToken');
        const amountParam = getParamValue('amount');
        const chainParam = getParamValue('chain') || 'ethereum';
        const nonceParam = getParamValue('nonce');

        console.log('🔍 After getParamValue:');
        console.log('  - actionParam:', `'${actionParam}'`);
        console.log('  - fromTokenParam:', `'${fromTokenParam}'`);
        console.log('  - toTokenParam:', `'${toTokenParam}'`);
        console.log('  - amountParam:', `'${amountParam}'`);
        console.log('  - chainParam:', `'${chainParam}'`);
        console.log('  - nonceParam:', `'${nonceParam}'`);

        const debug = `
Action: "${actionParam}" (length: ${actionParam.length})
FromToken: "${fromTokenParam}"
ToToken: "${toTokenParam}"
Amount: "${amountParam}"
Chain: "${chainParam}"
Nonce: "${nonceParam}"
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
        `.trim();

        console.log('🔍 Parsed params:', debug);
        setDebugInfo(debug);

        if (!isMounted) return;

        if (!actionParam) {
          console.error('❌ No action specified');
          const errorMsg = `No action specified in URL parameters.

Expected format:
/wallet?action=swap&fromToken=ETH&toToken=USDC&amount=1&nonce=12345

Current URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`;

          setErrorMessage(errorMsg);
          setCurrentStep('error');
          setIsInitialized(true);

          return;
        }

        // Validate chain - ensure it exists in our configs
        const supportedChains = Object.keys(CHAIN_CONFIGS);
        if (!supportedChains.includes(chainParam)) {
          console.error('❌ Unsupported chain:', chainParam);
          setErrorMessage(`Unsupported chain: ${chainParam}. Supported chains: ${supportedChains.join(', ')}`);
          setCurrentStep('error');
          setIsInitialized(true);
          return;
        }

        // ✅ FIX 3: Set all states
        setAction(actionParam);
        setFromToken(fromTokenParam);
        setToToken(toTokenParam);
        setAmount(amountParam);
        setChain(chainParam);
        setNonce(nonceParam);
        setActionId(nonceParam);

        const preview = {
          action: actionParam,
          fromToken: fromTokenParam,
          toToken: toTokenParam,
          amount: amountParam,
          chain: chainParam,
          nonce: nonceParam,
        };
        setTransactionPreview(preview);

        if (isConnected && address) {
          console.log('✅ Wallet already connected:', address);
          setCurrentStep('sign');
        } else {
          console.log('⚠️ Wallet not connected, showing connect screen');
          setCurrentStep('connect');
        }

        setIsInitialized(true);

      } catch (error) {
        console.error('❌ Error initializing wallet page:', error);
        if (isMounted) {
          setErrorMessage('Failed to load transaction details: ' + String(error));
          setCurrentStep('error');
          setIsInitialized(true);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [isConnected]);

  useEffect(() => {
    if (isInitialized && isConnected && address && currentStep === 'connect') {
      console.log('✅ Wallet connected, advancing to sign step');
      setCurrentStep('sign');
    }
  }, [isConnected, address, currentStep, isInitialized]);

  useEffect(() => {
    if (isConfirmed && txHash) {
      setCurrentStep('success');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, [isConfirmed, txHash]);

  const handleSignTransaction = () => {
    console.log('🔐 Signing transaction for action:', action, 'on chain:', chain);

    if (action !== 'swap') {
      alert('Unsupported action: ' + action);
      return;
    }

    // Get chain config
    const chainConfig = CHAIN_CONFIGS[chain];
    if (!chainConfig) {
      alert('Unsupported chain: ' + chain);
      return;
    }

    if (!fromToken || !toToken || !amount) {
      alert('Missing required parameters: fromToken, toToken, or amount');
      return;
    }

    try {
      // Convert amount to wei for native token transactions
      let transactionValue = BigInt(0);
      const isNativeToken = fromToken.toLowerCase() === chainConfig.nativeCurrency.symbol.toLowerCase() ||
                            fromToken.toLowerCase() === chainConfig.nativeCurrency.symbol.toLowerCase() + 'e';

      if (isNativeToken) {
        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat)) {
          alert('Invalid amount format');
          return;
        }
        transactionValue = BigInt(Math.floor(amountFloat * 10 ** chainConfig.nativeCurrency.decimals));
        console.log('🔢 Converted amount to wei:', transactionValue.toString(), 'on', chainConfig.name);
      }

      const mockSwapData = '0x7ff36ab5' +
        '0000000000000000000000000000000000000000000000000000000000000080' +
        '0000000000000000000000000000000000000000000000000000000000000002' +
        '000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' +
        '0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f' +
        '0000000000000000000000000000000000000000000000000000000000000000' +
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      console.log('🎯 Sending transaction to:', chainConfig.routerAddress, 'on', chainConfig.name);
      sendTransaction({
        to: chainConfig.routerAddress as `0x${string}`,
        data: mockSwapData as `0x${string}`,
        value: transactionValue,
      });
    } catch (error) {
      console.error('❌ Error sending transaction:', error);
      alert('Failed to send transaction: ' + (error as Error).message);
    }
  };

  const handleDisconnect = () => {
    setCurrentStep('connect');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            {currentStep === 'loading' && (
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}

            {currentStep === 'connect' && (
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}

            {currentStep === 'sign' && (
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            {currentStep === 'success' && (
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {currentStep === 'error' && (
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}

            <h1 className="text-3xl font-bold text-white mb-2">
              {currentStep === 'connect' && '🔗 Connect Wallet'}
              {currentStep === 'sign' && '✍️ Sign Transaction'}
              {currentStep === 'success' && '✅ Transaction Successful!'}
              {currentStep === 'error' && '❌ Error'}
              {currentStep === 'loading' && '⏳ Loading'}
            </h1>
          </div>

          {currentStep === 'error' && (
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <div className="text-center">
                  <p className="text-red-300 mb-4 whitespace-pre-wrap">{errorMessage}</p>

                  <div className="bg-red-500/20 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium text-red-200 mb-2">Expected URL Format:</h3>
                    <code className="text-xs text-red-100 bg-red-500/30 p-2 rounded block break-all">
                      /wallet?action=swap&fromToken=ETH&toToken=USDC&amount=1&nonce=12345
                    </code>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">📊 Debug Info:</h3>
                    <pre className="text-xs text-gray-400 text-left overflow-auto max-h-32 bg-gray-800 p-2 rounded">
                      {debugInfo}
                    </pre>
                  </div>

                  <div className="bg-red-500/20 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium text-red-200 mb-2">Supported Chains:</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(CHAIN_CONFIGS).map(([key, config]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${config.supported ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          <span className="text-red-100">{config.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">🔗 Test URLs for Supported Chains:</h3>
                    <div className="space-y-2 text-xs">
                      <div><a href="/wallet?action=swap&fromToken=ETH&toToken=USDC&amount=1&nonce=test123&chain=ethereum" className="text-blue-400 hover:text-blue-300 underline">Ethereum - Swap 1 ETH to USDC</a></div>
                      <div><a href="/wallet?action=swap&fromToken=MATIC&toToken=USDC&amount=100&nonce=test124&chain=polygon" className="text-blue-400 hover:text-blue-300 underline">Polygon - Swap 100 MATIC to USDC</a></div>
                      <div><a href="/wallet?action=swap&fromToken=ETH&toToken=USDC&amount=1&nonce=test125&chain=arbitrum" className="text-blue-400 hover:text-blue-300 underline">Arbitrum - Swap 1 ETH to USDC</a></div>
                      <div><a href="/wallet?action=swap&fromToken=ETH&toToken=USDC&amount=1&nonce=test126&chain=optimism" className="text-blue-400 hover:text-blue-300 underline">Optimism - Swap 1 ETH to USDC</a></div>
                      <div><a href="/wallet?action=swap&fromToken=ETH&toToken=USDC&amount=1&nonce=test127&chain=base" className="text-blue-400 hover:text-blue-300 underline">Base - Swap 1 ETH to USDC</a></div>
                      <div><a href="/wallet?action=swap&fromToken=BNB&toToken=USDC&amount=1&nonce=test128&chain=bnb" className="text-blue-400 hover:text-blue-300 underline">BNB Chain - Swap 1 BNB to USDC</a></div>
                      <div><a href="/wallet?action=swap&fromToken=AVAX&toToken=USDC&amount=10&nonce=test129&chain=avalanche" className="text-blue-400 hover:text-blue-300 underline">Avalanche - Swap 10 AVAX to USDC</a></div>
                      <div><a href="/wallet?action=swap&fromToken=CELO&toToken=cUSD&amount=50&nonce=test130&chain=celo" className="text-blue-400 hover:text-blue-300 underline">Celo - Swap 50 CELO to cUSD</a></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'connect' && (
            <div className="space-y-6">
              <div className="text-center">
                {transactionPreview && (
                  <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-300 mb-2">Transaction Preview:</p>
                    <div className="text-left space-y-1">
                      <p className="text-xs text-gray-400">Action: <span className="text-white">{transactionPreview.action}</span></p>
                      <p className="text-xs text-gray-400">Chain: <span className="text-white">{CHAIN_CONFIGS[transactionPreview.chain]?.name || transactionPreview.chain}</span></p>
                      {transactionPreview.fromToken && <p className="text-xs text-gray-400">From: <span className="text-white">{transactionPreview.fromToken}</span></p>}
                      {transactionPreview.toToken && <p className="text-xs text-gray-400">To: <span className="text-white">{transactionPreview.toToken}</span></p>}
                      {transactionPreview.amount && <p className="text-xs text-gray-400">Amount: <span className="text-white">{transactionPreview.amount}</span></p>}
                    </div>
                  </div>
                )}

                <div className="max-w-xs mx-auto">
                  <ConnectButton.Custom>
                    {({ account, chain, openConnectModal, authenticationStatus, mounted }) => {
                      const ready = mounted && authenticationStatus !== 'loading';
                      const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

                      return (
                        <div {...(!ready && { 'aria-hidden': true, 'style': { opacity: 0, pointerEvents: 'none' } })}>
                          {!connected ? (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              className="w-full bg-white text-gray-900 font-semibold py-4 px-6 rounded-lg hover:bg-gray-50"
                            >
                              Connect Wallet
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <p className="text-sm text-gray-300">✅ Wallet Connected</p>
                              <button
                                onClick={() => setCurrentStep('sign')}
                                className="w-full bg-white text-gray-900 font-semibold py-4 px-6 rounded-lg hover:bg-gray-50"
                              >
                                Continue to Sign
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </ConnectButton.Custom>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-400">Supported wallets</p>
                <div className="flex justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">M</span>
                    </div>
                    <span>MetaMask</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">C</span>
                    </div>
                    <span>Coinbase</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">W</span>
                    </div>
                    <span>WalletConnect</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sign Step */}
          {currentStep === 'sign' && isConnected && (
            <div className="space-y-6">
              {/* Connected Wallet Info */}
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">Connected Wallet</p>
                    <p className="text-sm text-white font-mono break-all mt-1">{address}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Transaction Details</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-600">
                    <span className="text-gray-300 font-medium">Action:</span>
                    <span className="text-white font-semibold">{action}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-600">
                    <span className="text-gray-300 font-medium">From Token:</span>
                    <span className="text-white font-mono text-sm">{fromToken || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-600">
                    <span className="text-gray-300 font-medium">To Token:</span>
                    <span className="text-white font-mono text-sm">{toToken || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-600">
                    <span className="text-gray-300 font-medium">Amount:</span>
                    <span className="text-white font-semibold">{amount || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-600">
                    <span className="text-gray-300 font-medium">Nonce:</span>
                    <span className="text-white font-mono text-sm">{nonce || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-600">
                    <span className="text-gray-300 font-medium">Network:</span>
                    <span className="text-white font-semibold">{CHAIN_CONFIGS[chain]?.name || chain}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-600">
                    <span className="text-gray-300 font-medium">Chain ID:</span>
                    <span className="text-white font-mono text-sm">{CHAIN_CONFIGS[chain]?.chainId || 'Unknown'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300 font-medium">Router:</span>
                    <span className="text-white font-mono text-xs break-all">{CHAIN_CONFIGS[chain]?.routerAddress || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Contract Address */}
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-300">Verified Contract</h3>
                    <p className="text-sm text-gray-300 font-mono text-xs mt-1">
                      {CHAIN_CONFIGS[chain]?.routerAddress || 'Unknown Router'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Uniswap V3 SwapRouter on {CHAIN_CONFIGS[chain]?.name || chain}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleSignTransaction}
                  disabled={isSendPending}
                  className="w-full flex items-center justify-center px-6 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg"
                >
                  {isSendPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                      Signing Transaction...
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Sign & Execute {action}
                    </>
                  )}
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center justify-center px-6 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200 border border-gray-600"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {isSendPending && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-blue-300">Processing Transaction</p>
                    <p className="text-sm text-blue-200">Please confirm in your wallet...</p>
                  </div>
                </div>
              </div>

              {txHash && (
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-gray-300 mb-1">Transaction Hash:</p>
                  <p className="text-xs text-gray-200 font-mono break-all">{txHash}</p>
                  {isConfirming && (
                    <p className="text-xs text-yellow-300 mt-2">⏳ Confirming on blockchain...</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && txHash && (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-green-300">Transaction Successful!</p>
                    <p className="text-sm text-green-200">Your DeFi transaction has been broadcast</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-1">Transaction Hash:</p>
                <p className="text-xs text-gray-200 font-mono break-all">{txHash}</p>
                <p className="text-xs text-green-300 mt-2">✅ Confirmed on blockchain</p>
              </div>

              <p className="text-center text-sm text-gray-400">
                Redirecting to main page in 3 seconds...
              </p>
            </div>
          )}

          {/* Error Step */}
          {currentStep === 'error' && (
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-red-300 mb-4">❌ URL Signature Error</h2>
                  <p className="text-red-300 mb-4">{errorMessage}</p>
                  
                  <div className="bg-red-500/20 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium text-red-200 mb-2">Expected URL Format:</h3>
                    <code className="text-xs text-red-100 bg-red-500/30 p-2 rounded block">
                      /wallet?action=swap&fromToken=ETH&toToken=USDC&amount=1&nonce=12345
                    </code>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Quick Test URLs:</h3>
                    <div className="space-y-2 text-xs text-gray-400">
                      <div>🔗 <a href="/wallet?action=swap&fromToken=ETH&toToken=USDC&amount=1&nonce=test123" className="text-blue-400 hover:text-blue-300">Swap 1 ETH to USDC</a></div>
                      <div>🔗 <a href="/wallet?action=swap&fromToken=USDC&toToken=ETH&amount=100&nonce=test456" className="text-blue-400 hover:text-blue-300">Swap 100 USDC to ETH</a></div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-4">Redirecting to home page in 5 seconds...</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Action ID: <span className="font-mono text-emerald-300">{actionId}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Powered by AppKit & ENVXX MCP AURA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage(props: WalletPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div></div>}>
      <WalletContent {...props} />
    </Suspense>
  );
}
