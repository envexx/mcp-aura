import { NextRequest, NextResponse } from 'next/server';
import { getWeb3Utils } from '@/app/lib/web3-utils';
import { z } from 'zod';

const callbackSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  txHash: z.string().optional(),
  status: z.enum(['success', 'fail', 'cancelled']),
  network: z.enum(['ethereum', 'arbitrum', 'polygon']).optional(),
  error: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const txHash = searchParams.get('txHash');
    const status = searchParams.get('status') as 'success' | 'fail' | 'cancelled';
    const network = searchParams.get('network') as 'ethereum' | 'arbitrum' | 'polygon';
    const error = searchParams.get('error');

    // Validate parameters
    const validation = callbackSchema.safeParse({
      sessionId,
      txHash: txHash || undefined,
      status,
      network: network || undefined,
      error: error || undefined
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid callback parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // In production, retrieve session data from database
    // const sessionData = await getSession(sessionId);
    
    // Mock session data for development
    const sessionData = {
      sessionId: validatedData.sessionId,
      fromAddress: '0x742d35Cc6634C0532925a3b8D8C9C8C8C8C8C8C8',
      operation: 'swap',
      network: network || 'arbitrum',
      status: 'pending_signature',
      createdAt: new Date().toISOString()
    };

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    let transactionDetails = null;
    let portfolioRefreshNeeded = false;

    if (validatedData.status === 'success' && txHash && network) {
      try {
        // Get transaction status and details
        const web3Utils = getWeb3Utils(network);
        const txStatus = await web3Utils.getTransactionStatus(txHash);

        transactionDetails = {
          txHash,
          network,
          status: txStatus.status,
          blockNumber: txStatus.blockNumber,
          gasUsed: txStatus.gasUsed,
          effectiveGasPrice: txStatus.effectiveGasPrice,
          explorerUrl: getExplorerUrl(network, txHash),
          confirmations: txStatus.blockNumber ? await getConfirmations(network, txStatus.blockNumber) : 0
        };

        // If transaction is successful, mark portfolio for refresh
        if (txStatus.status === 'success') {
          portfolioRefreshNeeded = true;
        }

      } catch (error) {
        console.error('Error fetching transaction details:', error);
        transactionDetails = {
          txHash,
          network,
          status: 'unknown',
          error: 'Failed to fetch transaction details'
        };
      }
    }

    // Update session status (in production, update database)
    const updatedSessionData = {
      ...sessionData,
      status: validatedData.status,
      txHash: txHash || null,
      completedAt: new Date().toISOString(),
      error: validatedData.error || null,
      transactionDetails
    };

    // Generate response with appropriate redirect or data
    const responseData = {
      success: validatedData.status === 'success',
      data: {
        sessionId: validatedData.sessionId,
        operation: sessionData.operation,
        status: validatedData.status,
        transactionDetails,
        portfolioRefreshNeeded,
        nextSteps: generateNextSteps(validatedData.status, sessionData.operation, portfolioRefreshNeeded)
      },
      timestamp: new Date().toISOString()
    };

    // If this is a web callback, return HTML page
    const userAgent = request.headers.get('user-agent') || '';
    const isWebBrowser = userAgent.includes('Mozilla') && !userAgent.includes('Mobile');

    if (isWebBrowser) {
      // Return HTML page for web browsers
      const html = generateCallbackHtml(responseData);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Return JSON for API calls
    const response = NextResponse.json(responseData);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('Sign Callback API Error:', error);
    
    const errorResponse = {
      success: false,
      error: 'Failed to process callback',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };

    // Return HTML error page for browsers, JSON for API calls
    const userAgent = request.headers.get('user-agent') || '';
    const isWebBrowser = userAgent.includes('Mozilla') && !userAgent.includes('Mobile');

    if (isWebBrowser) {
      const html = generateErrorHtml(errorResponse);
      return new NextResponse(html, {
        status: 500,
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Helper functions
function getExplorerUrl(network: string, txHash: string): string {
  const explorers = {
    ethereum: 'https://etherscan.io/tx/',
    arbitrum: 'https://arbiscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/'
  };

  return `${explorers[network as keyof typeof explorers]}${txHash}`;
}

async function getConfirmations(network: 'ethereum' | 'arbitrum' | 'polygon', blockNumber: number): Promise<number> {
  try {
    const web3Utils = getWeb3Utils(network);
    // This would need to be implemented in web3Utils
    // const currentBlock = await web3Utils.getCurrentBlockNumber();
    // return currentBlock - blockNumber;
    return 1; // Mock confirmation count
  } catch (error) {
    return 0;
  }
}

function generateNextSteps(status: string, operation: string, portfolioRefreshNeeded: boolean): string[] {
  const steps: string[] = [];

  if (status === 'success') {
    steps.push('✅ Transaction completed successfully');
    
    if (portfolioRefreshNeeded) {
      steps.push('🔄 Your portfolio will be updated shortly');
    }

    switch (operation) {
      case 'swap':
        steps.push('💱 Swap completed - check your wallet for new tokens');
        break;
      case 'bridge':
        steps.push('🌉 Bridge transfer initiated - tokens will arrive on destination chain');
        break;
      case 'stake':
        steps.push('🏦 Staking position created - you will start earning rewards');
        break;
      case 'transfer':
        steps.push('💸 Transfer completed - recipient should receive tokens shortly');
        break;
    }

    steps.push('📊 View updated portfolio in the MCP dashboard');
  } else if (status === 'fail') {
    steps.push('❌ Transaction failed');
    steps.push('🔍 Check transaction details for more information');
    steps.push('🔄 You can try the operation again');
  } else if (status === 'cancelled') {
    steps.push('⏹️ Transaction was cancelled');
    steps.push('🔄 You can initiate a new transaction anytime');
  }

  return steps;
}

function generateCallbackHtml(data: any): string {
  const { success, data: responseData } = data;
  const { status, operation, transactionDetails, nextSteps } = responseData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transaction ${status === 'success' ? 'Successful' : status === 'fail' ? 'Failed' : 'Cancelled'} - MCP AURA</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div class="text-center mb-6">
            ${status === 'success' 
              ? '<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><i class="fas fa-check text-green-600 text-2xl"></i></div>'
              : status === 'fail'
              ? '<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><i class="fas fa-times text-red-600 text-2xl"></i></div>'
              : '<div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><i class="fas fa-pause text-yellow-600 text-2xl"></i></div>'
            }
            
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
                ${status === 'success' ? 'Transaction Successful!' : status === 'fail' ? 'Transaction Failed' : 'Transaction Cancelled'}
            </h1>
            
            <p class="text-gray-600 capitalize">
                ${operation} operation ${status}
            </p>
        </div>

        ${transactionDetails ? `
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 class="font-semibold text-gray-900 mb-2">Transaction Details</h3>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600">Network:</span>
                    <span class="font-medium capitalize">${transactionDetails.network}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Status:</span>
                    <span class="font-medium capitalize">${transactionDetails.status}</span>
                </div>
                ${transactionDetails.gasUsed ? `
                <div class="flex justify-between">
                    <span class="text-gray-600">Gas Used:</span>
                    <span class="font-medium">${parseInt(transactionDetails.gasUsed).toLocaleString()}</span>
                </div>
                ` : ''}
                <div class="flex justify-between items-center">
                    <span class="text-gray-600">Transaction:</span>
                    <a href="${transactionDetails.explorerUrl}" target="_blank" 
                       class="text-blue-600 hover:text-blue-800 text-xs">
                        View on Explorer <i class="fas fa-external-link-alt ml-1"></i>
                    </a>
                </div>
            </div>
        </div>
        ` : ''}

        <div class="mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Next Steps</h3>
            <ul class="space-y-2">
                ${nextSteps.map((step: string) => `<li class="text-sm text-gray-700 flex items-start"><span class="mr-2">•</span>${step}</li>`).join('')}
            </ul>
        </div>

        <div class="flex space-x-3">
            <button onclick="window.close()" 
                    class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                Close
            </button>
            <button onclick="window.location.href='/'" 
                    class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Return to App
            </button>
        </div>
    </div>

    <script>
        // Auto-close after 30 seconds if opened in popup
        if (window.opener) {
            setTimeout(() => {
                window.close();
            }, 30000);
        }
        
        // Post message to parent window if in iframe
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'MCP_TRANSACTION_CALLBACK',
                data: ${JSON.stringify(data)}
            }, '*');
        }
    </script>
</body>
</html>
  `;
}

function generateErrorHtml(error: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - MCP AURA</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p class="text-gray-600 mb-6">${error.message}</p>
        
        <button onclick="window.location.href='/'" 
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Return to App
        </button>
    </div>
</body>
</html>
  `;
}
