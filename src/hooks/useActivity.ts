'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ActivityItem } from '@/types/nft';
import { ACTIVITY_REFRESH_INTERVAL } from '@/lib/constants';

export function useActivity() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/nft/activity');
      if (!res.ok) throw new Error('Failed to fetch activity');
      const data = await res.json();
      setActivity(data.activity || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, ACTIVITY_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  return { activity, loading, error, refetch: fetchActivity };
}
