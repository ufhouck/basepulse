// Constants for Base Pulse

// OpenSea API v2
export const OPENSEA_API_URL = 'https://api.opensea.io/api/v2';
export const BASE_CHAIN_ID = 8453;
export const REFRESH_INTERVAL = 30000; // 30 seconds
export const ACTIVITY_REFRESH_INTERVAL = 15000; // 15 seconds

export const ACTIVITY_COLORS: Record<string, string> = {
  mint: '#10B981',
  transfer: '#3B82F6',
  sale: '#F59E0B',
  list: '#8B5CF6',
};

export const ACTIVITY_ICONS: Record<string, string> = {
  mint: '🟢',
  transfer: '🔵',
  sale: '🟡',
  list: '🟣',
};

export const ACTIVITY_LABELS: Record<string, string> = {
  mint: 'Mint',
  transfer: 'Transfer',
  sale: 'Sale',
  list: 'Listing',
};
