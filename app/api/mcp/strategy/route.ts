import { NextRequest, NextResponse } from 'next/server';
import { auraAPI } from '@/app/lib/aura-api';
import { z } from 'zod';

const strategySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  riskLevel: z.enum(['low', 'moderate', 'high']).optional(),
  timeframe: z.enum(['1d', '7d', '30d', '90d']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const riskLevel = searchParams.get('riskLevel') as 'low' | 'moderate' | 'high' | null;
    const timeframe = searchParams.get('timeframe') as '1d' | '7d' | '30d' | '90d' | null;

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // Validate parameters
    const validation = strategySchema.safeParse({ 
      address, 
      riskLevel: riskLevel || undefined,
      timeframe: timeframe || undefined 
    });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Fetch strategy data from AURA API
    console.log(`[MCP][Strategy] Fetching strategies for address: ${address}`);
    const strategies = await auraAPI.getStrategies(address);
    console.log(`[MCP][Strategy] Response summary: strategyGroups=${strategies.strategies?.length ?? 0}`);

    // Filter strategies based on risk level if provided
    let filteredStrategies = strategies;
    if (riskLevel) {
      filteredStrategies = {
        ...strategies,
        strategies: strategies.strategies.map(strategy => ({
          ...strategy,
          response: strategy.response.filter(s => s.risk === riskLevel)
        }))
      };
    }

    // Validate and enrich strategy data
    let enrichedStrategies;
    try {
      enrichedStrategies = {
        ...filteredStrategies,
        strategies: filteredStrategies.strategies?.map(strategy => ({
          ...strategy,
          response: strategy.response?.map(s => ({
            ...s,
            actions: (s.actions || []).map(action => ({
              ...action,
              id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              executable: true,
              estimatedTime: '2-5 minutes',
              complexity: (action.operations && action.operations.length > 1) ? 'complex' : 'simple'
            }))
          })) || []
        })) || []
      };
    } catch (enrichError) {
      console.error('Error enriching strategy data:', enrichError);
      // Return basic structure if enrichment fails
      enrichedStrategies = filteredStrategies;
    }

    const response = NextResponse.json({
      success: true,
      data: enrichedStrategies,
      filters: {
        riskLevel,
        timeframe
      },
      timestamp: new Date().toISOString(),
      meta: {
        source: 'AURA AdEx API',
        version: '1.0.0',
        totalStrategies: enrichedStrategies.strategies?.reduce(
          (acc, s) => acc + (s.response?.length || 0), 0
        ) || 0
      }
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('Strategy API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch strategy data',
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
