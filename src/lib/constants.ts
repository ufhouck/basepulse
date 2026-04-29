// Constants for Base Pulse

// OpenSea API v2
export const OPENSEA_API_URL = 'https://api.opensea.io/api/v2';
export const BASE_CHAIN_ID = 8453;
export const REFRESH_INTERVAL = 30000; // 30 seconds
export const ACTIVITY_REFRESH_INTERVAL = 15000; // 15 seconds

// Activity type colors (CSS variable names)
export const ACTIVITY_COLORS: Record<string, string> = {
  mint: 'var(--green)',
  transfer: 'var(--blue)',
  sale: 'var(--amber)',
  list: 'var(--purple)',
};

// Activity labels
export const ACTIVITY_LABELS: Record<string, string> = {
  mint: 'Mint',
  transfer: 'Transfer',
  sale: 'Sale',
  list: 'Listing',
};
