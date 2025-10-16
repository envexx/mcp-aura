import { NextRequest, NextResponse } from 'next/server';
import { auraAPI } from '@/app/lib/aura-api';
import { z } from 'zod';

const portfolioSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Validate address format
    const validation = portfolioSchema.safeParse({ address });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid address format', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Fetch portfolio data from AURA API
    const portfolio = await auraAPI.getPortfolio(address);

    // Add CORS headers for MCP compatibility
    const response = NextResponse.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString(),
      meta: {
        source: 'AURA AdEx API',
        version: '1.0.0',
        cached: false
      }
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('Portfolio API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch portfolio data',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
