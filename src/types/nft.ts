// NFT data type definitions for Base Pulse

export interface NFTStats {
  totalMints24h: number;
  totalTransfers24h: number;
  totalVolume24h: string;
  totalSales24h: number;
  uniqueBuyers24h: number;
  avgFloorChange24h: number;
}

export interface TopCollection {
  id: string;
  name: string;
  image: string;
  floorPrice: string;
  volume24h: string;
  volumeChange24h: number;
  sales24h: number;
  tokenCount: number;
}

export interface ActivityItem {
  type: 'mint' | 'transfer' | 'sale' | 'list';
  collection: string;
  collectionImage: string;
  tokenId: string;
  from: string;
  to: string;
  price?: string;
  timestamp: number;
  txHash: string;
}

export interface WhaleTransaction {
  wallet: string;
  action: 'buy' | 'sell' | 'mint';
  collection: string;
  collectionImage: string;
  quantity: number;
  totalValue: string;
  timestamp: number;
}

export interface VolumeDataPoint {
  date: string;
  volume: number;
  sales: number;
}
