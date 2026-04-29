// API route: Top NFT collections on Base
import { NextResponse } from 'next/server';
import { getTopCollections } from '@/lib/reservoir';

export const revalidate = 60;

export async function GET() {
  try {
    const collections = await getTopCollections(10);
    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Collections API error:', error);
    return NextResponse.json({ collections: [], error: 'Failed to fetch' }, { status: 500 });
  }
}
