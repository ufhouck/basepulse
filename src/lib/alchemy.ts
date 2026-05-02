// Alchemy NFT API v3 client — multi-chain support

export type Chain = 'base' | 'ethereum' | 'polygon' | 'arbitrum' | 'optimism';

const CHAIN_URLS: Record<Chain, string> = {
  base: 'https://base-mainnet.g.alchemy.com/nft/v3',
  ethereum: 'https://eth-mainnet.g.alchemy.com/nft/v3',
  polygon: 'https://polygon-mainnet.g.alchemy.com/nft/v3',
  arbitrum: 'https://arb-mainnet.g.alchemy.com/nft/v3',
  optimism: 'https://opt-mainnet.g.alchemy.com/nft/v3',
};

export const CHAIN_LABELS: Record<Chain, string> = {
  base: 'Base',
  ethereum: 'Ethereum',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
};

function getApiKey(): string {
  return process.env.ALCHEMY_API_KEY || '';
}

function getBaseUrl(chain: Chain = 'base'): string {
  return CHAIN_URLS[chain];
}

export interface ContractMetadata {
  address: string;
  name: string | null;
  symbol: string | null;
  totalSupply: string | null;
  tokenType: string;
  contractDeployer: string | null;
  deployedBlockNumber: number | null;
  openSeaMetadata: {
    floorPrice: number | null;
    collectionName: string | null;
    collectionSlug: string | null;
    safelistRequestStatus: string | null;
    imageUrl: string | null;
    description: string | null;
    externalUrl: string | null;
    twitterUsername: string | null;
    bannerImageUrl: string | null;
  };
}

export interface NFTToken {
  tokenId: string;
  tokenType: string;
  name: string | null;
  description: string | null;
  image: {
    cachedUrl: string | null;
    thumbnailUrl: string | null;
    pngUrl: string | null;
    originalUrl: string | null;
  };
}

// Get contract-level metadata
export async function getContractMetadata(contractAddress: string, chain: Chain = 'base'): Promise<ContractMetadata | null> {
  try {
    const res = await fetch(
      `${getBaseUrl(chain)}/${getApiKey()}/getContractMetadata?contractAddress=${contractAddress}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      console.error('Alchemy getContractMetadata error:', res.status);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Failed to fetch contract metadata:', error);
    return null;
  }
}

// Get NFTs for a contract (first few for preview)
export async function getNFTsForContract(
  contractAddress: string,
  limit = 4,
  chain: Chain = 'base'
): Promise<NFTToken[]> {
  try {
    const res = await fetch(
      `${getBaseUrl(chain)}/${getApiKey()}/getNFTsForContract?contractAddress=${contractAddress}&limit=${limit}&withMetadata=true`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data?.nfts || []).map((nft: Record<string, unknown>) => ({
      tokenId: nft.tokenId,
      tokenType: nft.tokenType,
      name: nft.name,
      description: nft.description,
      image: nft.image || {},
    }));
  } catch (error) {
    console.error('Failed to fetch NFTs for contract:', error);
    return [];
  }
}

// Wallet owner NFT collection summary
export interface OwnerCollection {
  contractAddress: string;
  name: string | null;
  tokenType: string;
  totalBalance: number;
  image: string | null;
  floorPrice: number | null;
  collectionSlug: string | null;
}

export interface OwnerResult {
  collections: OwnerCollection[];
  pageKey: string | null;
}

// Get NFT collections owned by a wallet address
export async function getNFTsForOwner(
  ownerAddress: string,
  chain: Chain = 'base',
  pageKey?: string
): Promise<OwnerResult> {
  try {
    let url = `${getBaseUrl(chain)}/${getApiKey()}/getContractsForOwner?owner=${ownerAddress}&pageSize=100`;
    if (pageKey) url += `&pageKey=${pageKey}`;

    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      console.error('Alchemy getContractsForOwner error:', res.status);
      return { collections: [], pageKey: null };
    }

    const data = await res.json();
    const contracts = data?.contracts || [];

    const collections = contracts.map((c: Record<string, unknown>) => {
      const opensea = (c.openSeaMetadata || {}) as Record<string, unknown>;
      return {
        contractAddress: c.address as string,
        name: (c.name as string) || (opensea.collectionName as string) || null,
        tokenType: (c.tokenType as string) || 'UNKNOWN',
        totalBalance: Number(c.totalBalance) || 0,
        image: (opensea.imageUrl as string) || (c.media as Record<string, unknown>)?.thumbnail as string || null,
        floorPrice: (opensea.floorPrice as number) || null,
        collectionSlug: (opensea.collectionSlug as string) || null,
      };
    }).filter((c: OwnerCollection) => c.totalBalance > 0);

    return { collections, pageKey: data?.pageKey || null };
  } catch (error) {
    console.error('Failed to fetch NFTs for owner:', error);
    return { collections: [], pageKey: null };
  }
}

