import { NextResponse } from 'next/server';
import { saveUserWatchConfig, getUserWatchConfig } from '@/lib/notifications';

// Save user's watched contracts to KV
export async function POST(request: Request) {
  try {
    const { fid, contracts } = await request.json();

    if (!fid || !contracts) {
      return NextResponse.json(
        { error: 'fid and contracts required' },
        { status: 400 }
      );
    }

    await saveUserWatchConfig(fid, contracts);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watch sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's watched contracts from KV
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json(
        { error: 'fid required' },
        { status: 400 }
      );
    }

    const config = await getUserWatchConfig(Number(fid));

    return NextResponse.json(config || { contracts: [], notifyEnabled: false });
  } catch (error) {
    console.error('Watch sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
