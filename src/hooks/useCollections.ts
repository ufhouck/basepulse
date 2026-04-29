'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TopCollection } from '@/types/nft';
import { REFRESH_INTERVAL } from '@/lib/constants';

export function useCollections() {
  const [collections, setCollections] = useState<TopCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/nft/collections');
      if (!res.ok) throw new Error('Failed to fetch collections');
      const data = await res.json();
      setCollections(data.collections || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
    const interval = setInterval(fetchCollections, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCollections]);

  return { collections, loading, error, refetch: fetchCollections };
}
