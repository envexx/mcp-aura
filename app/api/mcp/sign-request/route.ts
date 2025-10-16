import { NextRequest, NextResponse } from 'next/server';
import { getWeb3Utils } from '@/app/lib/web3-utils';
import { z } from 'zod';

const signRequestSchema = z.object({
  fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid from address'),
  operation: z.enum(['swap', 'stake', 'bridge', 'transfer']),
  platform: z.string().optional(),
  tokenIn: z.string().optional(),
  tokenOut: z.string().optional(),
  amountIn: z.string().optional(),
  targetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid target address').optional(),
  network: z.enum(['ethereum', 'arbitrum', 'polygon']),
  userCallbackUrl: z.string().url('Invalid callback URL'),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = signRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      fromAddress,
      operation,
      platform,
      tokenIn,
      tokenOut,
      amountIn,
      targetAddress,
      network,
      userCallbackUrl,
      metadata
    } = validation.data;

    // Get Web3 utilities for the specified network
    const web3Utils = getWeb3Utils(network);

    try {
      let transactionRequest;
      let operationDetails;

      // Build transaction based on operation type
      switch (operation) {
        case 'swap':
          if (!tokenIn || !tokenOut || !amountIn) {
            throw new Error('Missing required parameters for swap operation');
          }
          
          transactionRequest = await web3Utils.buildSwapTransaction({
            tokenIn,
            tokenOut,
            amountIn,
            amountOutMin: calculateMinAmountOut(amountIn, '0.5'), // 0.5% slippage
            recipient: fromAddress,
            deadline: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
          });

          operationDetails = {
            type: 'swap',
            description: `Swap ${amountIn} ${tokenIn} for ${tokenOut}`,
            platform: platform || 'Uniswap',
            risk: 'low'
          };
          break;

        case 'bridge':
          if (!tokenIn || !amountIn || !tokenOut) {
            throw new Error('Missing required parameters for bridge operation');
          }

          transactionRequest = await web3Utils.buildBridgeTransaction({
            token: tokenIn,
            amount: amountIn,
            destinationChain: tokenOut,
            recipient: fromAddress
          });

          operationDetails = {
            type: 'bridge',
            description: `Bridge ${amountIn} ${tokenIn} to ${tokenOut}`,
            platform: platform || 'Stargate',
            risk: 'moderate'
          };
          break;

        case 'stake':
          if (!tokenIn || !amountIn) {
            throw new Error('Missing required parameters for stake operation');
          }

          transactionRequest = {
            to: '0x1f98431c8ad98523631ae4a59f267346ea31f984', // Mock staking contract
            data: '0x', // This should be properly encoded
            value: '0'
          };

          operationDetails = {
            type: 'stake',
            description: `Stake ${amountIn} ${tokenIn}`,
            platform: platform || 'Aave',
            risk: 'low'
          };
          break;

        case 'transfer':
          if (!targetAddress || !tokenIn || !amountIn) {
            throw new Error('Missing required parameters for transfer operation');
          }

          transactionRequest = await web3Utils.buildTransferTransaction({
            token: tokenIn,
            amount: amountIn,
            recipient: targetAddress
          });

          operationDetails = {
            type: 'transfer',
            description: `Transfer ${amountIn} ${tokenIn} to ${targetAddress}`,
            platform: 'Native',
            risk: 'low'
          };
          break;

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      // Estimate gas fees
      const estimatedFees = await web3Utils.estimateGas(transactionRequest);

      // Generate session ID for tracking
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate WalletConnect URI
      const redirectUrl = web3Utils.generateWalletConnectUri({
        operation,
        txData: transactionRequest,
        callbackUrl: `${userCallbackUrl}?sessionId=${sessionId}`
      });

      // Store session data (in production, use Redis or database)
      const sessionData = {
        sessionId,
        fromAddress,
        operation,
        transactionRequest,
        estimatedFees,
        operationDetails,
        network,
        callbackUrl: userCallbackUrl,
        status: 'pending_signature',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        metadata
      };

      // In production, store this in a database
      // await storeSession(sessionId, sessionData);

      const response = NextResponse.json({
        success: true,
        data: {
          sessionId,
          redirectUrl,
          operationDetails,
          estimatedFees,
          expiresAt: sessionData.expiresAt,
          qrCode: generateQRCodeUrl(redirectUrl),
          deepLink: generateDeepLink(redirectUrl),
          instructions: {
            mobile: 'Tap the button below to open your wallet app',
            desktop: 'Scan the QR code with your mobile wallet or use WalletConnect',
            web: 'Connect your browser wallet extension'
          }
        },
        message: 'Silakan lakukan konfirmasi di wallet Anda.',
        timestamp: new Date().toISOString()
      });

      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;

    } catch (error) {
      console.error('Sign request preparation error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to prepare signature request',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Sign Request API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process signature request',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Helper functions
function calculateMinAmountOut(amountIn: string, slippage: string): string {
  const amount = parseFloat(amountIn);
  const slippagePercent = parseFloat(slippage) / 100;
  const minAmount = amount * (1 - slippagePercent);
  return minAmount.toString();
}

function generateQRCodeUrl(data: string): string {
  // Generate QR code URL using a service like qr-server.com
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
}

function generateDeepLink(walletConnectUri: string): Record<string, string> {
  // Generate deep links for popular wallets
  const encodedUri = encodeURIComponent(walletConnectUri);
  return {
    metamask: `metamask://wc?uri=${encodedUri}`,
    trust: `trust://wc?uri=${encodedUri}`,
    rainbow: `rainbow://wc?uri=${encodedUri}`,
    coinbase: `cbwallet://wc?uri=${encodedUri}`,
    generic: walletConnectUri
  };
}
