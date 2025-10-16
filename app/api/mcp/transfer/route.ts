import { NextRequest, NextResponse } from 'next/server';
import { getWeb3Utils } from '@/app/lib/web3-utils';
import { z } from 'zod';

const transferSchema = z.object({
  fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid from address'),
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid to address'),
  token: z.string().min(1, 'Token is required'),
  amount: z.string().min(1, 'Amount is required'),
  network: z.enum(['ethereum', 'arbitrum', 'polygon']),
  memo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = transferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      fromAddress,
      toAddress,
      token,
      amount,
      network,
      memo
    } = validation.data;

    // Get Web3 utilities for the specified network
    const web3Utils = getWeb3Utils(network);

    try {
      // Check sender balance first
      const balance = await web3Utils.getTokenBalance(token, fromAddress);
      const transferAmount = parseFloat(amount);
      const currentBalance = parseFloat(balance);

      if (transferAmount > currentBalance) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient balance',
            data: {
              requested: amount,
              available: balance,
              token
            }
          },
          { status: 400 }
        );
      }

      // Build transfer transaction
      const transactionRequest = await web3Utils.buildTransferTransaction({
        token,
        amount,
        recipient: toAddress
      });

      // Estimate gas fees
      const estimatedFees = await web3Utils.estimateGas(transactionRequest);

      // Check if user has enough ETH for gas fees
      const ethBalance = await web3Utils.getTokenBalance('0x0000000000000000000000000000000000000000', fromAddress);
      const gasFeesETH = parseFloat(estimatedFees.totalFeeETH);
      const availableETH = parseFloat(ethBalance);

      if (gasFeesETH > availableETH) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient ETH for gas fees',
            data: {
              requiredGas: estimatedFees.totalFeeETH,
              availableETH: ethBalance,
              shortfall: (gasFeesETH - availableETH).toFixed(6)
            }
          },
          { status: 400 }
        );
      }

      // Generate transfer ID for tracking
      const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = NextResponse.json({
        success: true,
        data: {
          transferId,
          fromAddress,
          toAddress,
          token,
          amount,
          network,
          memo,
          transactionRequest,
          estimatedFees,
          status: 'prepared',
          requiresSignature: true,
          balanceCheck: {
            sufficient: true,
            currentBalance: balance,
            afterTransfer: (currentBalance - transferAmount).toString()
          },
          metadata: {
            estimatedTime: '1-3 minutes',
            riskLevel: 'low',
            type: token === '0x0000000000000000000000000000000000000000' ? 'ETH_TRANSFER' : 'ERC20_TRANSFER'
          }
        },
        timestamp: new Date().toISOString()
      });

      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return response;

    } catch (error) {
      console.error('Transfer preparation error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to prepare transfer',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Transfer API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process transfer request',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transferId = searchParams.get('transferId');
    const txHash = searchParams.get('txHash');
    const network = searchParams.get('network') as 'ethereum' | 'arbitrum' | 'polygon';

    if (!txHash || !network) {
      return NextResponse.json(
        { error: 'txHash and network parameters are required' },
        { status: 400 }
      );
    }

    // Get transaction status
    const web3Utils = getWeb3Utils(network);
    const txStatus = await web3Utils.getTransactionStatus(txHash);

    const response = NextResponse.json({
      success: true,
      data: {
        transferId,
        txHash,
        network,
        status: txStatus.status,
        blockNumber: txStatus.blockNumber,
        gasUsed: txStatus.gasUsed,
        effectiveGasPrice: txStatus.effectiveGasPrice,
        explorerUrl: getExplorerUrl(network, txHash)
      },
      timestamp: new Date().toISOString()
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('Transfer status API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get transfer status',
        message: error instanceof Error ? error.message : 'Unknown error'
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function getExplorerUrl(network: string, txHash: string): string {
  const explorers = {
    ethereum: 'https://etherscan.io/tx/',
    arbitrum: 'https://arbiscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/'
  };

  return `${explorers[network as keyof typeof explorers]}${txHash}`;
}
