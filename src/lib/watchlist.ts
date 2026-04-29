// Watchlist localStorage CRUD — max 10 items

const STORAGE_KEY = 'basepulse_watchlist';
const MAX_ITEMS = 10;

export interface WatchlistItem {
  address: string;
  name: string;
  image: string | null;
  tokenType: string;
  floorPrice: number | null;
  collectionSlug: string | null;
  addedAt: number;
}

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(item: WatchlistItem): boolean {
  const list = getWatchlist();
  
  // Check duplicates
  if (list.some(w => w.address.toLowerCase() === item.address.toLowerCase())) {
    return false;
  }

  // Check limit
  if (list.length >= MAX_ITEMS) {
    return false;
  }

  list.unshift({ ...item, addedAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return true;
}

export function removeFromWatchlist(address: string): void {
  const list = getWatchlist().filter(
    w => w.address.toLowerCase() !== address.toLowerCase()
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function isInWatchlist(address: string): boolean {
  return getWatchlist().some(
    w => w.address.toLowerCase() === address.toLowerCase()
  );
}

export function getWatchlistCount(): number {
  return getWatchlist().length;
}
