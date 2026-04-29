'use client';

import { useState, useCallback } from 'react';
import { useFarcasterSDK } from '@/hooks/useFarcasterSDK';
import { useNFTStats } from '@/hooks/useNFTStats';
import { useCollections } from '@/hooks/useCollections';
import { useActivity } from '@/hooks/useActivity';
import StatsOverview from './StatsOverview';
import VolumeChart from './VolumeChart';
import TopCollections from './TopCollections';
import ActivityFeed from './ActivityFeed';
import WhaleTracker from './WhaleTracker';

export default function Dashboard() {
  const { isReady } = useFarcasterSDK();
  const { stats, volumes, whales, loading: statsLoading, refetch: refetchStats } = useNFTStats();
  const { collections, loading: collectionsLoading, refetch: refetchCollections } = useCollections();
  const { activity, loading: activityLoading, refetch: refetchActivity } = useActivity();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchCollections(), refetchActivity()]);
    setTimeout(() => setRefreshing(false), 600);
  }, [refetchStats, refetchCollections, refetchActivity]);

  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__logo">⚡</div>
        <div className="loading-spinner" />
        <div className="loading-screen__text">Connecting to Base...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header__brand">
          <div className="header__logo">⚡</div>
          <div>
            <div className="header__title">Base Pulse</div>
            <div className="header__subtitle">NFT Activity on Base</div>
          </div>
        </div>
        <div className="header__actions">
          <div className="header__live">
            <span className="header__live-dot" />
            LIVE
          </div>
          <button
            className={`btn-refresh${refreshing ? ' btn-refresh--loading' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            ↻
          </button>
        </div>
      </header>

      {/* Stats Overview — 4 KPI cards */}
      <StatsOverview stats={stats} loading={statsLoading} />

      {/* Volume Trend Chart */}
      <VolumeChart data={volumes} loading={statsLoading} />

      {/* Top Collections */}
      <TopCollections collections={collections} loading={collectionsLoading} />

      {/* Live Activity Feed */}
      <ActivityFeed activity={activity} loading={activityLoading} />

      {/* Whale Tracker */}
      <WhaleTracker whales={whales} loading={statsLoading} />

      {/* Footer */}
      <footer className="footer">
        <div className="footer__text">
          Base Pulse · Built on{' '}
          <a href="https://www.farcaster.xyz" target="_blank" rel="noopener noreferrer">
            Farcaster
          </a>
          {' · '}
          Powered by{' '}
          <a href="https://reservoir.tools" target="_blank" rel="noopener noreferrer">
            Reservoir
          </a>
        </div>
      </footer>
    </div>
  );
}
