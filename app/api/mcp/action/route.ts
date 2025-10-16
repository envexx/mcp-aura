import { NextRequest, NextResponse } from 'next/server';
import { getWeb3Utils } from '@/app/lib/web3-utils';
import { z } from 'zod';

const actionSchema = z.object({
  fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  operation: z.enum(['swap', 'stake', 'bridge']),
  platform: z.string().min(1, 'Platform is required'),
  tokenIn: z.string().min(1, 'Input token is required'),
  tokenOut: z.string().min(1, 'Output token is required'),
  amountIn: z.string().min(1, 'Amount is required'),
  network: z.enum(['ethereum', 'arbitrum', 'polygon']),
  slippage: z.string().optional().default('0.5'),
  deadline: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const normalizedBody = normalizePayload(body);
    
    // Validate request body
    const validation = actionSchema.safeParse(normalizedBody);
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
      network,
      slippage,
      deadline
    } = validation.data;

    // Get Web3 utilities for the specified network
    const web3Utils = getWeb3Utils(network);

    let transactionRequest;
    let estimatedFees;

    try {
      switch (operation) {
        case 'swap':
          transactionRequest = await web3Utils.buildSwapTransaction({
            tokenIn,
            tokenOut,
            amountIn,
            recipient: fromAddress,
            deadline: deadline || Math.floor(Date.now() / 1000) + 1800, // 30 minutes
            slippage: parseFloat(slippage)
          });
          break;

        case 'bridge':
          transactionRequest = await web3Utils.buildBridgeTransaction({
            token: tokenIn,
            amount: amountIn,
            destinationChain: tokenOut, // For bridge, tokenOut represents destination chain
            recipient: fromAddress
          });
          break;

        case 'stake':
          // Implement staking logic based on platform
          transactionRequest = await buildStakeTransaction(platform, {
            token: tokenIn,
            amount: amountIn,
            staker: fromAddress
          });
          break;

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      // Estimate gas fees
      estimatedFees = await web3Utils.estimateGas(transactionRequest);

    } catch (error) {
      console.error('Transaction building error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to build transaction',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Generate action ID for tracking
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response = NextResponse.json({
      success: true,
      data: {
        actionId,
        operation,
        platform,
        network,
        transactionRequest,
        estimatedFees,
        status: 'prepared',
        requiresSignature: true,
        metadata: {
          tokenIn,
          tokenOut,
          amountIn,
          slippage,
          deadline,
          estimatedTime: '2-5 minutes',
          riskLevel: getRiskLevel(operation, platform)
        }
      },
      timestamp: new Date().toISOString()
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('Action API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to prepare action',
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
function normalizePayload(payload: Record<string, unknown>) {
  const rawNetwork = typeof payload.network === 'string' ? payload.network :
                    typeof payload.chain === 'string' ? payload.chain : undefined;
  const normalizedNetwork = rawNetwork ? normalizeNetwork(rawNetwork) : undefined;

  const rawSlippage = typeof payload.slippage === 'string' ? payload.slippage :
                     typeof payload.slippage === 'number' ? payload.slippage.toString() : undefined;
  const normalizedSlippage = rawSlippage ? rawSlippage.replace('%', '').trim() : undefined;

  const platform = typeof payload.platform === 'string' && payload.platform.trim().length > 0
    ? payload.platform.trim()
    : 'Uniswap';

  const operation = typeof payload.operation === 'string'
    ? payload.operation.trim().toLowerCase()
    : typeof payload.action === 'string'
      ? payload.action.trim().toLowerCase()
      : payload.operation;

  const amountIn = typeof payload.amountIn === 'number'
    ? payload.amountIn.toString()
    : typeof payload.amountIn === 'string'
      ? normalizeNumericString(payload.amountIn)
      : typeof payload.amount === 'number'
        ? payload.amount.toString()
        : typeof payload.amount === 'string'
          ? normalizeNumericString(payload.amount)
          : payload.amountIn;

  const fromAddress = typeof payload.fromAddress === 'string'
    ? payload.fromAddress.trim()
    : typeof payload.fromAddress === 'string'
      ? payload.fromAddress.trim()
      : process.env.DEFAULT_WALLET_ADDRESS || '0x01C229f4bDb7552b564619554C8a805aE4Ca2ADB'; // Fallback to provided address

  return {
    ...payload,
    fromAddress,
    tokenIn: typeof payload.tokenIn === 'string' ? payload.tokenIn.trim() :
             typeof payload.fromToken === 'string' ? payload.fromToken.trim() : payload.tokenIn,
    tokenOut: typeof payload.tokenOut === 'string' ? payload.tokenOut.trim() :
              typeof payload.toToken === 'string' ? payload.toToken.trim() : payload.tokenOut,
    amountIn,
    network: normalizedNetwork,
    slippage: normalizedSlippage,
    platform,
    operation
  };
}

function normalizeNetwork(value: string) {
  const cleaned = value.trim().toLowerCase();
  const aliases: Record<string, typeof NETWORK_OPTIONS[number]> = {
    ethereum: 'ethereum',
    'eth': 'ethereum',
    'mainnet': 'ethereum',
    'ethereum mainnet': 'ethereum',
    'arbitrum': 'arbitrum',
    'arbitrum one': 'arbitrum',
    'arb': 'arbitrum',
    'polygon': 'polygon',
    'matic': 'polygon',
    'polygon mainnet': 'polygon'
  };

  return aliases[cleaned] ?? cleaned;
}

const NETWORK_OPTIONS = ['ethereum', 'arbitrum', 'polygon'] as const;

function normalizeNumericString(value: string) {
  const cleaned = value.trim();
  const match = cleaned.match(/\d+(?:\.\d+)?/);
  return match ? match[0] : cleaned;
}

async function buildStakeTransaction(platform: string, params: {
  token: string;
  amount: string;
  staker: string;
}) {
  // This is a simplified staking transaction builder
  // In production, implement specific logic for each platform
  const stakingContracts = {
    'Uniswap': '0x1f98431c8ad98523631ae4a59f267346ea31f984',
    'Aave': '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    'Compound': '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B'
  };

  const contractAddress = stakingContracts[platform as keyof typeof stakingContracts];
  if (!contractAddress) {
    throw new Error(`Unsupported staking platform: ${platform}`);
  }

  return {
    to: contractAddress,
    data: '0x', // This should be properly encoded function call
    value: '0'
  };
}

function getRiskLevel(operation: string, platform: string): 'low' | 'moderate' | 'high' {
  const riskMatrix: Record<string, Record<string, 'low' | 'moderate' | 'high'>> = {
    swap: { 'Uniswap': 'low', 'SushiSwap': 'low', '1inch': 'moderate' },
    bridge: { 'Stargate': 'moderate', 'Hop': 'moderate', 'Synapse': 'high' },
    stake: { 'Aave': 'low', 'Compound': 'low', 'Yearn': 'moderate' }
  };

  return riskMatrix[operation]?.[platform] || 'moderate';
}
