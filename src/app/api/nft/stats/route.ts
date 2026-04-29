// API route: Aggregated NFT stats, volume chart data, and whale transactions
import { NextResponse } from 'next/server';
import { getStats, getDailyVolumes, getWhaleTransactions } from '@/lib/reservoir';

export const revalidate = 60;

export async function GET() {
  try {
    const [stats, volumes, whales] = await Promise.all([
      getStats(),
      getDailyVolumes(7),
      getWhaleTransactions(1),
    ]);

    return NextResponse.json({ stats, volumes, whales });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { stats: null, volumes: [], whales: [], error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}
