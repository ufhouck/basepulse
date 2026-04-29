// API route: NFT activity feed on Base
import { NextResponse } from 'next/server';
import { getActivity } from '@/lib/reservoir';

export const revalidate = 15;

export async function GET() {
  try {
    const activity = await getActivity(20);
    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json({ activity: [], error: 'Failed to fetch' }, { status: 500 });
  }
}
