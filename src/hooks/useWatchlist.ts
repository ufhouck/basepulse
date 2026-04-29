'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  type WatchlistItem,
} from '@/lib/watchlist';

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(getWatchlist());
    setIsLoaded(true);
  }, []);

  const add = useCallback((item: WatchlistItem) => {
    const success = addToWatchlist(item);
    if (success) {
      setItems(getWatchlist());
    }
    return success;
  }, []);

  const remove = useCallback((address: string) => {
    removeFromWatchlist(address);
    setItems(getWatchlist());
  }, []);

  const check = useCallback((address: string) => {
    return isInWatchlist(address);
  }, []);

  return { items, isLoaded, add, remove, check };
}

// Contract search result type
export interface ContractResult {
  address: string;
  name: string;
  symbol: string | null;
  tokenType: string;
  totalSupply: string | null;
  deployer: string | null;
  image: string | null;
  description: string | null;
  floorPrice: number | null;
  collectionSlug: string | null;
  externalUrl: string | null;
  twitter: string | null;
  banner: string | null;
  nfts: { tokenId: string; name: string | null; image: string | null }[];
}

export function useContractSearch() {
  const [result, setResult] = useState<ContractResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (address: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/nft/contract?address=${address}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Contract not found');
        return;
      }

      setResult(data);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, search, clear };
}
