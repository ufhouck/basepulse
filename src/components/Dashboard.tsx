'use client';

import { useState, useCallback } from 'react';
import { useFarcasterSDK } from '@/hooks/useFarcasterSDK';
import { useNFTStats } from '@/hooks/useNFTStats';
import { useCollections } from '@/hooks/useCollections';
import { useActivity } from '@/hooks/useActivity';
import { useWatchlist } from '@/hooks/useWatchlist';
import TabNav from './TabNav';
import StatsOverview from './StatsOverview';
import VolumeChart from './VolumeChart';
import TopCollections from './TopCollections';
import ActivityFeed from './ActivityFeed';
import WhaleTracker from './WhaleTracker';
import WatchlistPage from './WatchlistPage';
import WatchlistPreview from './WatchlistPreview';

// SVG Icons
const PulseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h4l3-9 4 18 3-9h6" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-3.1-6.8" />
    <path d="M21 3v6h-6" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

export default function Dashboard() {
  const { isReady } = useFarcasterSDK();
  const { stats, volumes, whales, loading: statsLoading, refetch: refetchStats } = useNFTStats();
  const { collections, loading: collectionsLoading, refetch: refetchCollections } = useCollections();
  const { activity, loading: activityLoading, refetch: refetchActivity } = useActivity();
  const { items: watchlistItems, add: addWatchlistItem, remove: removeWatchlistItem, check: checkWatchlistItem } = useWatchlist();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'watchlist'>('dashboard');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchCollections(), refetchActivity()]);
    setTimeout(() => setRefreshing(false), 600);
  }, [refetchStats, refetchCollections, refetchActivity]);

  const handleShare = useCallback(async () => {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      await sdk.actions.composeCast({
        text: 'Check out Base NFT activity on Base Pulse ⚡',
        embeds: ['https://basepulse-alpha.vercel.app'],
      });
    } catch (e) {
      console.log('Share not available outside Farcaster', e);
    }
  }, []);

  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__logo">
          <PulseIcon />
        </div>
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
          <div className="header__logo">
            <PulseIcon />
          </div>
          <div>
            <div className="header__title">Base Pulse</div>
            <div className="header__subtitle">NFT Activity on Base</div>
          </div>
        </div>
        <div className="header__actions">
          <div className="header__live">
            <span className="header__live-dot" />
            Live
          </div>
          <button
            className="btn-icon"
            onClick={handleShare}
            title="Share on Farcaster"
          >
            <ShareIcon />
          </button>
          <button
            className={`btn-icon${refreshing ? ' btn-icon--spinning' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            <RefreshIcon />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        watchlistCount={watchlistItems.length}
      />

      {/* Tab Content */}
      {activeTab === 'dashboard' ? (
        <>
          <StatsOverview stats={stats} loading={statsLoading} />
          <WatchlistPreview items={watchlistItems} onViewAll={() => setActiveTab('watchlist')} />
          <VolumeChart data={volumes} loading={statsLoading} />
          <TopCollections collections={collections} loading={collectionsLoading} />
          <ActivityFeed activity={activity} loading={activityLoading} />
          <WhaleTracker whales={whales} loading={statsLoading} />
        </>
      ) : (
        <WatchlistPage
          sharedAdd={addWatchlistItem}
          sharedRemove={removeWatchlistItem}
          sharedCheck={checkWatchlistItem}
          sharedItems={watchlistItems}
        />
      )}

      <footer className="footer">
        <div className="footer__text">
          Base Pulse · Built on{' '}
          <a href="https://www.farcaster.xyz" target="_blank" rel="noopener noreferrer">Farcaster</a>
          {' · '}
          Powered by{' '}
          <a href="https://opensea.io" target="_blank" rel="noopener noreferrer">OpenSea</a>
        </div>
        <div className="footer__text" style={{ marginTop: '4px' }}>
          Development{' '}
          <a href="https://farcaster.xyz/ufhouck.eth" target="_blank" rel="noopener noreferrer">@ufhouck.eth</a>
        </div>
      </footer>
    </div>
  );
}
