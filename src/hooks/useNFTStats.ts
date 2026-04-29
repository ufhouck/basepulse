'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NFTStats, VolumeDataPoint, WhaleTransaction } from '@/types/nft';
import { REFRESH_INTERVAL } from '@/lib/constants';

export function useNFTStats() {
  const [stats, setStats] = useState<NFTStats | null>(null);
  const [volumes, setVolumes] = useState<VolumeDataPoint[]>([]);
  const [whales, setWhales] = useState<WhaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/nft/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data.stats);
      setVolumes(data.volumes || []);
      setWhales(data.whales || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, volumes, whales, loading, error, refetch: fetchStats };
}
