import { NextResponse } from 'next/server';
import { getNFTsForOwner } from '@/lib/alchemy';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');

  if (!owner) {
    return NextResponse.json({ error: 'owner address required' }, { status: 400 });
  }

  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(owner)) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
  }

  const collections = await getNFTsForOwner(owner);

  return NextResponse.json({ collections });
}
