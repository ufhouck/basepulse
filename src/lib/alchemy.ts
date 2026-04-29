// Alchemy NFT API v3 client for Base chain

const ALCHEMY_BASE_URL = 'https://base-mainnet.g.alchemy.com/nft/v3';

function getApiKey(): string {
  return process.env.ALCHEMY_API_KEY || '';
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
export async function getContractMetadata(contractAddress: string): Promise<ContractMetadata | null> {
  try {
    const res = await fetch(
      `${ALCHEMY_BASE_URL}/${getApiKey()}/getContractMetadata?contractAddress=${contractAddress}`,
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
  limit = 4
): Promise<NFTToken[]> {
  try {
    const res = await fetch(
      `${ALCHEMY_BASE_URL}/${getApiKey()}/getNFTsForContract?contractAddress=${contractAddress}&limit=${limit}&withMetadata=true`,
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
