'use client';

import { useState, useCallback } from 'react';
import { useFarcasterSDK } from '@/hooks/useFarcasterSDK';
import { useNFTStats } from '@/hooks/useNFTStats';
import { useCollections } from '@/hooks/useCollections';
import { useWatchlist } from '@/hooks/useWatchlist';
import TabNav from './TabNav';
import StatsOverview from './StatsOverview';
import TopCollections from './TopCollections';
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
  const { stats, loading: statsLoading, refetch: refetchStats } = useNFTStats();
  const { collections, loading: collectionsLoading, refetch: refetchCollections } = useCollections();
  const { items: watchlistItems, add: addWatchlistItem, remove: removeWatchlistItem, check: checkWatchlistItem } = useWatchlist();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'watchlist'>('dashboard');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchCollections()]);
    setTimeout(() => setRefreshing(false), 600);
  }, [refetchStats, refetchCollections]);

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
      {/* macOS-style Header */}
      <header className="header">
        <div className="header__dots">
          <div className="win__dot win__dot--red" />
          <div className="win__dot win__dot--yellow" />
          <div className="win__dot win__dot--green" />
        </div>
        <div className="header__brand">
          <div className="header__logo">
            <PulseIcon />
          </div>
          <div className="header__title">Base Pulse</div>
        </div>
        <div className="header__actions">
          <div className="header__live">
            <span className="header__live-dot" />
            Live
          </div>
          <button className="btn-bevel" onClick={handleShare} title="Share">
            <ShareIcon />
          </button>
          <button
            className={`btn-bevel${refreshing ? ' btn-bevel--spinning' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh"
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
          {/* Network Stats Window */}
          <div className="win">
            <div className="win__titlebar">
              <div className="win__dots">
                <div className="win__dot win__dot--red" />
                <div className="win__dot win__dot--yellow" />
                <div className="win__dot win__dot--green" />
              </div>
              <div className="win__title">Network Stats</div>
            </div>
            <StatsOverview stats={stats} loading={statsLoading} />
          </div>

          {/* Watching Window */}
          {watchlistItems.length > 0 && (
            <div className="win">
              <div className="win__titlebar">
                <div className="win__dots">
                  <div className="win__dot win__dot--red" />
                  <div className="win__dot win__dot--yellow" />
                  <div className="win__dot win__dot--green" />
                </div>
                <div className="win__title">📌 Watching</div>
              </div>
              <div className="win__body">
                <WatchlistPreview items={watchlistItems} onViewAll={() => setActiveTab('watchlist')} />
              </div>
            </div>
          )}

          {/* Top Collections Window */}
          <div className="win">
            <div className="win__titlebar">
              <div className="win__dots">
                <div className="win__dot win__dot--red" />
                <div className="win__dot win__dot--yellow" />
                <div className="win__dot win__dot--green" />
              </div>
              <div className="win__title">🏆 Top Collections</div>
            </div>
            <div className="win__body">
              <TopCollections collections={collections} loading={collectionsLoading} />
            </div>
          </div>
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
