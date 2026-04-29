import { NextResponse } from 'next/server';

const OPENSEA_API_URL = 'https://api.opensea.io/api/v2';

function getHeaders(): Record<string, string> {
  return {
    'accept': 'application/json',
    'x-api-key': process.env.OPENSEA_API_KEY || '',
  };
}

export const dynamic = 'force-dynamic';

// Enrich watchlist items with live data from OpenSea
export async function POST(request: Request) {
  try {
    const { slugs } = await request.json();

    if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ enriched: {} });
    }

    // Fetch stats for each slug in parallel
    const results = await Promise.allSettled(
      slugs.slice(0, 10).map(async (slug: string) => {
        const res = await fetch(
          `${OPENSEA_API_URL}/collections/${slug}/stats`,
          { headers: getHeaders(), next: { revalidate: 60 } }
        );
        if (!res.ok) return { slug, stats: null };
        const stats = await res.json();
        return { slug, stats };
      })
    );

    const enriched: Record<string, {
      volume24h: number;
      sales24h: number;
      volumeChange: number;
      floorPrice: number;
      numOwners: number;
      totalVolume: number;
      avgPrice: number;
    }> = {};

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.stats) {
        const { slug, stats } = result.value;
        const interval1d = stats.intervals?.find((i: { interval: string }) => i.interval === 'one_day');
        const interval7d = stats.intervals?.find((i: { interval: string }) => i.interval === 'seven_day');

        const vol1d = interval1d?.volume || 0;
        const vol7d = interval7d?.volume || 0;
        const avgDaily7d = vol7d / 7;
        let volumeChange = 0;
        if (avgDaily7d > 0.0001) {
          volumeChange = ((vol1d - avgDaily7d) / avgDaily7d) * 100;
        }

        enriched[slug] = {
          volume24h: vol1d,
          sales24h: interval1d?.sales || 0,
          volumeChange: Math.round(volumeChange * 10) / 10,
          floorPrice: stats.total?.floor_price || 0,
          numOwners: stats.total?.num_owners || 0,
          totalVolume: stats.total?.volume || 0,
          avgPrice: interval1d?.average_price || 0,
        };
      }
    }

    return NextResponse.json({ enriched });
  } catch (error) {
    console.error('Watchlist enrich error:', error);
    return NextResponse.json({ enriched: {} }, { status: 500 });
  }
}
