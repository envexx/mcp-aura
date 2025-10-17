'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WalletPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function WalletContent({ searchParams }: WalletPageProps) {
  const [actionId, setActionId] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [fromToken, setFromToken] = useState<string>('');
  const [toToken, setToToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
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

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        console.log('🔍 Initializing wallet page...');

        const params = await searchParams;
        console.log('📦 Raw searchParams:', params);

        const getParamValue = (param: any): string => {
          if (typeof param === 'string') return param.trim();
          if (Array.isArray(param) && param.length > 0) return String(param[0]).trim();
          return '';
        };

        const actionParam = getParamValue(params?.action);
        const fromTokenParam = getParamValue(params?.fromToken);
        const toTokenParam = getParamValue(params?.toToken);
        const amountParam = getParamValue(params?.amount);
        const nonceParam = getParamValue(params?.nonce);

        const debug = `
Action: "${actionParam}" (length: ${actionParam.length})
FromToken: "${fromTokenParam}"
ToToken: "${toTokenParam}"
Amount: "${amountParam}"
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

        setAction(actionParam);
        setFromToken(fromTokenParam);
        setToToken(toTokenParam);
        setAmount(amountParam);
        setNonce(nonceParam);
        setActionId(nonceParam);

        const preview = {
          action: actionParam,
          fromToken: fromTokenParam,
          toToken: toTokenParam,
          amount: amountParam,
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
    }
  }, [isConfirmed, txHash]);

  const handleSignTransaction = () => {
    console.log('🔐 Signing transaction for action:', action);

    if (action !== 'swap') {
      alert('Unsupported action: ' + action);
      return;
    }

    if (!fromToken || !toToken || !amount) {
      alert('Missing required parameters: fromToken, toToken, or amount');
      return;
    }

    try {
      const mockSwapData = '0x7ff36ab5' +
        '0000000000000000000000000000000000000000000000000000000000000080' +
        '0000000000000000000000000000000000000000000000000000000000000002' +
        '000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' +
        '0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f' +
        '0000000000000000000000000000000000000000000000000000000000000000' +
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      const transactionValue = action === 'swap' && fromToken.toLowerCase() === 'eth'
        ? BigInt(amount) * BigInt(10 ** 18)
        : BigInt(0);

      sendTransaction({
        to: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
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

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">🔗 Quick Test URLs:</h3>
                    <div className="space-y-2 text-xs">
                      <div><a href="/wallet?action=swap&fromToken=ETH&toToken=USDC&amount=1&nonce=test123" className="text-blue-400 hover:text-blue-300 underline">Swap 1 ETH to USDC</a></div>
                      <div><a href="/wallet?action=swap&fromToken=USDC&toToken=ETH&amount=100&nonce=test456" className="text-blue-400 hover:text-blue-300 underline">Swap 100 USDC to ETH</a></div>
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

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300 font-medium">Network:</span>
                    <span className="text-white font-semibold">Ethereum</span>
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
                      0xE592427A0AEce92De3Edee1F18E0157C05861564
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Uniswap V3 SwapRouter02
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
  return <WalletContent {...props} />;
}
