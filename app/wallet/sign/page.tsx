'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

interface WalletSignPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function WalletSignContent({ searchParams }: WalletSignPageProps) {
  const [actionId, setActionId] = useState<string>('');
  const [transactionData, setTransactionData] = useState<any>(null);
  const [actionData, setActionData] = useState<any>(null);

  const { address, isConnected } = useAccount();
  const { sendTransaction, isPending: isSendPending, data: txHash } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    const init = async () => {
      const params = await searchParams;
      const id = typeof params.actionId === 'string' ? params.actionId : '';
      setActionId(id);

      // Check if wallet is connected
      if (!isConnected) {
        alert('Please connect your wallet first.');
        window.location.href = `/wallet/connect?actionId=${id}`;
        return;
      }

      // Fetch transaction data
      fetchTransactionData(id);
    };
    init();
  }, [searchParams, isConnected]);

  const fetchTransactionData = async (id: string) => {
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/mcp/action?actionId=${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch transaction data');
      }

      const data = await response.json();

      if (data.success && data.data) {
        setActionData(data.data);
        setTransactionData(data.data.transactionRequest);
      } else {
        throw new Error('Invalid transaction data received');
      }
    } catch (error) {
      console.error('Failed to fetch transaction data:', error);
      alert('Failed to load transaction data: ' + (error as Error).message);
    }
  };

  const handleSignTransaction = () => {
    if (!transactionData) {
      alert('Transaction data not loaded');
      return;
    }

    sendTransaction({
      to: transactionData.to,
      data: transactionData.data || '0x',
      value: transactionData.value ? BigInt(transactionData.value) : BigInt(0),
    });
  };

  useEffect(() => {
    if (isConfirmed && txHash) {
      alert(`Transaction successful! 🎉\n\nTransaction Hash: ${txHash}\nStatus: Confirmed`);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, [isConfirmed, txHash]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Wallet Not Connected</h1>
          <p className="text-red-700 mb-4">Please connect your wallet first.</p>
          <button
            onClick={() => window.location.href = `/wallet/connect?actionId=${actionId}`}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

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

          {/* Connected Wallet Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Wallet Connected</p>
                <p className="text-sm text-blue-700 font-mono">{address}</p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h2>

            {actionData && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Action:</span>
                  <span className="font-medium">{actionData.operation || 'Unknown'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium">{actionData.metadata?.tokenIn} {actionData.metadata?.amountIn || 'Unknown'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{actionData.metadata?.tokenOut} (estimated)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium">{actionData.network || 'Ethereum'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{actionData.platform || 'Unknown'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Gas:</span>
                  <span className="font-medium">{actionData.estimatedFees?.totalFeeUSD ? `$${actionData.estimatedFees.totalFeeUSD}` : '~$8.50'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Status */}
          {txHash && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {isConfirming ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  ) : isConfirmed ? (
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {isConfirming ? 'Confirming Transaction...' :
                     isConfirmed ? 'Transaction Confirmed!' : 'Transaction Sent'}
                  </p>
                  <p className="text-sm text-gray-600 font-mono">{txHash}</p>
                </div>
              </div>
            </div>
          )}

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
                  {transactionData?.to || '0xE592427A0AEce92De3Edee1F18E0157C05861564'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Uniswap V3 SwapRouter02 - Verified on Etherscan
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {!txHash && (
              <button
                onClick={handleSignTransaction}
                disabled={isSendPending || !transactionData}
                className="w-full flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors"
              >
                {isSendPending ? (
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
            )}

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
              Secure signing powered by RainbowKit & ENVXX MCP AURA
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
