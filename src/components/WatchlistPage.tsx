'use client';

import { useState, useEffect, useCallback } from 'react';
import { useContractSearch, type ContractResult } from '@/hooks/useWatchlist';
import { formatAddress } from '@/lib/formatters';
import type { WatchlistItem } from '@/lib/watchlist';

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14m-7-7h14" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface WalletCollection {
  contractAddress: string;
  name: string | null;
  tokenType: string;
  totalBalance: number;
  image: string | null;
  floorPrice: number | null;
  collectionSlug: string | null;
}

interface WatchlistPageProps {
  sharedItems: WatchlistItem[];
  sharedAdd: (item: WatchlistItem) => boolean;
  sharedRemove: (address: string) => void;
  sharedCheck: (address: string) => boolean;
}

export default function WatchlistPage({ sharedItems, sharedAdd, sharedRemove, sharedCheck }: WatchlistPageProps) {
  const { result, loading, error, search, clear } = useContractSearch();
  const [input, setInput] = useState('');
  const [searchMode, setSearchMode] = useState<'contract' | 'wallet'>('contract');
  const [notifyMap, setNotifyMap] = useState<Record<string, boolean>>({});

  // Wallet browse state
  const [walletAddr, setWalletAddr] = useState('');
  const [walletCollections, setWalletCollections] = useState<WalletCollection[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState('');

  // Live enrichment data
  const [enriched, setEnriched] = useState<Record<string, {
    volume24h: number;
    sales24h: number;
    volumeChange: number;
    floorPrice: number;
    numOwners: number;
    totalVolume: number;
    avgPrice: number;
  }>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bp_notify_prefs');
      if (saved) setNotifyMap(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Fetch live data for watchlist items
  useEffect(() => {
    const slugs = sharedItems
      .map(item => item.collectionSlug)
      .filter((s): s is string => !!s);
    if (slugs.length === 0) return;

    fetch('/api/nft/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs }),
    })
      .then(r => r.json())
      .then(data => { if (data.enriched) setEnriched(data.enriched); })
      .catch(() => { /* silent */ });
  }, [sharedItems]);

  const toggleNotify = useCallback((address: string) => {
    setNotifyMap(prev => {
      const next = { ...prev, [address]: prev[address] === false ? true : false };
      try { localStorage.setItem('bp_notify_prefs', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Contract search
  const handleSearch = () => {
    const addr = input.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      search(addr);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchMode === 'contract') handleSearch();
      else handleWalletBrowse();
    }
  };

  const handleAdd = (r: ContractResult) => {
    const item: WatchlistItem = {
      address: r.address,
      name: r.name,
      image: r.image,
      tokenType: r.tokenType,
      floorPrice: r.floorPrice,
      collectionSlug: r.collectionSlug,
      addedAt: Date.now(),
    };
    sharedAdd(item);
  };

  // Wallet browse
  const handleWalletBrowse = async () => {
    const addr = walletAddr.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setWalletError('Invalid wallet address');
      return;
    }
    setWalletLoading(true);
    setWalletError('');
    setWalletCollections([]);
    try {
      const res = await fetch(`/api/nft/wallet?owner=${addr}`);
      const data = await res.json();
      if (data.error) {
        setWalletError(data.error);
      } else {
        setWalletCollections(data.collections || []);
        if ((data.collections || []).length === 0) {
          setWalletError('No NFTs found in this wallet');
        }
      }
    } catch {
      setWalletError('Failed to fetch wallet NFTs');
    }
    setWalletLoading(false);
  };

  const handleAddFromWallet = (c: WalletCollection) => {
    const item: WatchlistItem = {
      address: c.contractAddress,
      name: c.name || formatAddress(c.contractAddress),
      image: c.image,
      tokenType: c.tokenType,
      floorPrice: c.floorPrice,
      collectionSlug: c.collectionSlug,
      addedAt: Date.now(),
    };
    sharedAdd(item);
  };

  return (
    <div className="watchlist-page">
      {/* Search / Browse Window */}
      <div className="win">
        <div className="win__titlebar">
          <div className="win__dots">
            <div className="win__dot win__dot--red" />
            <div className="win__dot win__dot--yellow" />
            <div className="win__dot win__dot--green" />
          </div>
          <div className="win__title">
            {searchMode === 'contract' ? '🔍 Search Contract' : '👛 Browse Wallet'}
          </div>
        </div>
        <div className="win__body">
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-toggle__btn${searchMode === 'contract' ? ' mode-toggle__btn--active' : ''}`}
              onClick={() => { setSearchMode('contract'); setWalletCollections([]); setWalletError(''); }}
            >
              Contract
            </button>
            <button
              className={`mode-toggle__btn${searchMode === 'wallet' ? ' mode-toggle__btn--active' : ''}`}
              onClick={() => { setSearchMode('wallet'); clear(); }}
            >
              My Wallet
            </button>
          </div>

          {searchMode === 'contract' ? (
            <>
              <div className="search-box">
                <input
                  type="text"
                  className="search-box__input"
                  placeholder="Paste contract address (0x...)"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="search-box__btn"
                  onClick={handleSearch}
                  disabled={loading || !input.trim()}
                >
                  {loading ? '...' : '→'}
                </button>
              </div>

              {error && <div className="search-error">{error}</div>}

              {result && (
                <div className="contract-card">
                  <div className="contract-card__header">
                    {result.image ? (
                      <img src={result.image} alt={result.name} className="contract-card__image" />
                    ) : (
                      <div className="contract-card__image contract-card__image--empty" />
                    )}
                    <div className="contract-card__info">
                      <div className="contract-card__name">{result.name}</div>
                      <div className="contract-card__address">{formatAddress(result.address)}</div>
                      <div className="contract-card__meta">
                        <span className="contract-card__tag">{result.tokenType}</span>
                        {result.floorPrice !== null && (
                          <span>{result.floorPrice.toFixed(4)} ETH</span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`contract-card__add${sharedCheck(result.address) ? ' contract-card__add--added' : ''}`}
                      onClick={() => handleAdd(result)}
                      disabled={sharedCheck(result.address)}
                    >
                      {sharedCheck(result.address) ? <CheckIcon /> : <PlusIcon />}
                    </button>
                  </div>

                  {result.description && (
                    <div className="contract-card__desc">{result.description}</div>
                  )}

                  {result.nfts && result.nfts.length > 0 && (
                    <div className="contract-card__nfts">
                      {result.nfts.map((nft, i) => (
                        nft.image && (
                          <img
                            key={i}
                            src={nft.image}
                            alt={nft.name || `#${nft.tokenId}`}
                            className="contract-card__nft-thumb"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="search-box">
                <input
                  type="text"
                  className="search-box__input"
                  placeholder="Paste wallet address (0x...)"
                  value={walletAddr}
                  onChange={e => setWalletAddr(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="search-box__btn"
                  onClick={handleWalletBrowse}
                  disabled={walletLoading || !walletAddr.trim()}
                >
                  {walletLoading ? '...' : '→'}
                </button>
              </div>

              {walletError && <div className="search-error">{walletError}</div>}

              {walletCollections.length > 0 && (
                <div className="wallet-grid">
                  {walletCollections.map(c => {
                    const isAdded = sharedCheck(c.contractAddress);
                    return (
                      <div key={c.contractAddress} className="wallet-card">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name || ''}
                            className="wallet-card__img"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="wallet-card__img wallet-card__img--empty">?</div>
                        )}
                        <div className="wallet-card__body">
                          <div className="wallet-card__name">
                            {c.name || formatAddress(c.contractAddress)}
                          </div>
                          <div className="wallet-card__meta">
                            <span className="wallet-card__type">{c.tokenType}</span>
                            <span className="wallet-card__count">×{c.totalBalance}</span>
                          </div>
                          {c.floorPrice !== null && c.floorPrice > 0 && (
                            <div className="wallet-card__floor">{c.floorPrice.toFixed(4)} ETH</div>
                          )}
                        </div>
                        <button
                          className={`wallet-card__add${isAdded ? ' wallet-card__add--added' : ''}`}
                          onClick={() => handleAddFromWallet(c)}
                          disabled={isAdded}
                        >
                          {isAdded ? <CheckIcon /> : <PlusIcon />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Watchlist Window */}
      <div className="win">
        <div className="win__titlebar">
          <div className="win__dots">
            <div className="win__dot win__dot--red" />
            <div className="win__dot win__dot--yellow" />
            <div className="win__dot win__dot--green" />
          </div>
          <div className="win__title">⭐ Watchlist ({sharedItems.length}/10)</div>
        </div>
        <div className="win__body">
        {sharedItems.length === 0 ? (
          <div className="watchlist-empty">
            <div className="empty-state">
              <div className="empty-state__text">Search contracts or browse your wallet to add NFTs</div>
            </div>
          </div>
        ) : (
          <div className="watchlist-list">
            {sharedItems.map(item => {
              const live = item.collectionSlug ? enriched[item.collectionSlug] : null;
              return (
                <div key={item.address} className="watchlist-item">
                  <div className="watchlist-item__row">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="watchlist-item__image" />
                    ) : (
                      <div className="watchlist-item__image watchlist-item__image--empty" />
                    )}
                    <div className="watchlist-item__info">
                      <div className="watchlist-item__name">{item.name}</div>
                      <div className="watchlist-item__meta">
                        <span>{item.tokenType}</span>
                        <span>·</span>
                        <span>{formatAddress(item.address)}</span>
                      </div>
                    </div>
                    <div className="watchlist-item__actions">
                      <button
                        className={`watchlist-item__bell${notifyMap[item.address] !== false ? ' watchlist-item__bell--active' : ''}`}
                        onClick={() => toggleNotify(item.address)}
                        title={notifyMap[item.address] !== false ? 'Notifications on' : 'Notifications off'}
                      >
                        <svg viewBox="0 0 24 24" fill={notifyMap[item.address] !== false ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                      </button>
                      <button
                        className="watchlist-item__remove"
                        onClick={() => sharedRemove(item.address)}
                        title="Remove"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                  {/* Live Stats Row */}
                  <div className="watchlist-item__stats">
                    <div className="watchlist-item__stat">
                      <span className="watchlist-item__stat-label">Floor</span>
                      <span className="watchlist-item__stat-value">
                        {live ? `${live.floorPrice.toFixed(4)} Ξ` : item.floorPrice !== null ? `${item.floorPrice.toFixed(4)} Ξ` : '—'}
                      </span>
                    </div>
                    <div className="watchlist-item__stat">
                      <span className="watchlist-item__stat-label">24h Vol</span>
                      <span className="watchlist-item__stat-value">
                        {live ? `${live.volume24h.toFixed(3)} Ξ` : '—'}
                      </span>
                    </div>
                    <div className="watchlist-item__stat">
                      <span className="watchlist-item__stat-label">Sales</span>
                      <span className="watchlist-item__stat-value">
                        {live ? live.sales24h : '—'}
                      </span>
                    </div>
                    <div className="watchlist-item__stat">
                      <span className="watchlist-item__stat-label">Owners</span>
                      <span className="watchlist-item__stat-value">
                        {live ? live.numOwners.toLocaleString() : '—'}
                      </span>
                    </div>
                    {live && live.volumeChange !== 0 && (
                      <div className="watchlist-item__stat">
                        <span className="watchlist-item__stat-label">Change</span>
                        <span className={`watchlist-item__stat-value ${live.volumeChange > 0 ? 'stat--up' : 'stat--down'}`}>
                          {live.volumeChange > 0 ? '+' : ''}{live.volumeChange}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
