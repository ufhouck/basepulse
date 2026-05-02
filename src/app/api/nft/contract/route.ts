import { NextRequest, NextResponse } from 'next/server';
import { getContractMetadata, getNFTsForContract, type Chain } from '@/lib/alchemy';

const VALID_CHAINS: Chain[] = ['base', 'ethereum', 'polygon', 'arbitrum', 'optimism'];

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  const chainParam = request.nextUrl.searchParams.get('chain') || 'base';
  const chain = VALID_CHAINS.includes(chainParam as Chain) ? (chainParam as Chain) : 'base';

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: 'Invalid contract address' },
      { status: 400 }
    );
  }

  try {
    const [metadata, nfts] = await Promise.all([
      getContractMetadata(address, chain),
      getNFTsForContract(address, 4, chain),
    ]);

    if (!metadata || metadata.tokenType === 'NOT_A_CONTRACT') {
      return NextResponse.json(
        { error: `Not a valid NFT contract on ${chain}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      address: metadata.address,
      name: metadata.openSeaMetadata?.collectionName || metadata.name || 'Unknown',
      symbol: metadata.symbol,
      tokenType: metadata.tokenType,
      totalSupply: metadata.totalSupply,
      deployer: metadata.contractDeployer,
      image: metadata.openSeaMetadata?.imageUrl || null,
      description: metadata.openSeaMetadata?.description || null,
      floorPrice: metadata.openSeaMetadata?.floorPrice || null,
      collectionSlug: metadata.openSeaMetadata?.collectionSlug || null,
      externalUrl: metadata.openSeaMetadata?.externalUrl || null,
      twitter: metadata.openSeaMetadata?.twitterUsername || null,
      banner: metadata.openSeaMetadata?.bannerImageUrl || null,
      nfts: nfts.slice(0, 4).map(n => ({
        tokenId: n.tokenId,
        name: n.name,
        image: n.image?.thumbnailUrl || n.image?.cachedUrl || n.image?.pngUrl || null,
      })),
    });
  } catch (error) {
    console.error('Contract lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract data' },
      { status: 500 }
    );
  }
}
