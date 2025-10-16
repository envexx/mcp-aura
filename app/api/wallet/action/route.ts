import { NextRequest, NextResponse } from 'next/server';

// Store for action data (in production, use Redis/database)
const actionStore = new Map<string, any>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const actionId = searchParams.get('actionId');

  if (!actionId) {
    return NextResponse.json({ error: 'Action ID required' }, { status: 400 });
  }

  // In production, fetch from database
  const actionData = (global as any).actionStore?.get(actionId);

  if (!actionData) {
    return NextResponse.json({ error: 'Action not found' }, { status: 404 });
  }

  return NextResponse.json(actionData);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionId, transactionRequest, metadata } = body;

    if (!actionId || !transactionRequest) {
      return NextResponse.json({ error: 'Action ID and transaction request required' }, { status: 400 });
    }

    // Store action data (in production, save to database)
    actionStore.set(actionId, {
      actionId,
      transactionRequest,
      metadata,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      message: 'Action stored successfully',
      actionId
    });

  } catch (error) {
    console.error('Error storing action:', error);
    return NextResponse.json({ error: 'Failed to store action' }, { status: 500 });
  }
}
