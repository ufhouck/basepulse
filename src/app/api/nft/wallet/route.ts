import { NextResponse } from 'next/server';
import { getNFTsForOwner, type Chain } from '@/lib/alchemy';

const VALID_CHAINS: Chain[] = ['base', 'ethereum', 'polygon', 'arbitrum', 'optimism'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const chainParam = searchParams.get('chain') || 'base';
  const pageKey = searchParams.get('pageKey') || undefined;

  if (!owner) {
    return NextResponse.json({ error: 'owner address required' }, { status: 400 });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(owner)) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
  }

  const chain = VALID_CHAINS.includes(chainParam as Chain) ? (chainParam as Chain) : 'base';

  const result = await getNFTsForOwner(owner, chain, pageKey);

  return NextResponse.json({
    collections: result.collections,
    pageKey: result.pageKey,
    chain,
  });
}
