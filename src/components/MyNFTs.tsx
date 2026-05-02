'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useContractSearch, type ContractResult } from '@/hooks/useWatchlist';
import { formatAddress } from '@/lib/formatters';
import type { WatchlistItem } from '@/lib/watchlist';

const BellIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14m-7-7h14" />
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

interface MyNFTsProps {
  walletAddress: string | null;
  isInFrame: boolean;
  fid: number | null;
  sharedItems: WatchlistItem[];
  sharedAdd: (item: WatchlistItem) => boolean;
  sharedRemove: (address: string) => void;
  sharedCheck: (address: string) => boolean;
  pendingDetail?: Record<string, unknown> | null;
  onDetailConsumed?: () => void;
}

export default function MyNFTs({
  walletAddress,
  isInFrame,
  fid,
  sharedItems,
  sharedAdd,
  sharedRemove,
  sharedCheck,
  pendingDetail,
  onDetailConsumed,
}: MyNFTsProps) {
  const { result, loading: searchLoading, error: searchError, search, clear } = useContractSearch();
  const [searchInput, setSearchInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Wallet NFT state
  const [collections, setCollections] = useState<WalletCollection[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [nextPageKey, setNextPageKey] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter for wallet NFTs list
  const [filterText, setFilterText] = useState('');

  // Detail modal
  const [detail, setDetail] = useState<WalletCollection | null>(null);

  // Live enrichment data
  const [enriched, setEnriched] = useState<Record<string, {
    volume24h: number;
    sales24h: number;
    volumeChange: number;
    floorPrice: number;
    numOwners: number;
  }>>({});

  // Filter collections by name or address
  const filteredCollections = useMemo(() => {
    if (!filterText.trim()) return collections;
    const q = filterText.toLowerCase();
    return collections.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      c.contractAddress.toLowerCase().includes(q)
    );
  }, [collections, filterText]);

  // Pick up detail from Dashboard (top collection click)
  useEffect(() => {
    if (pendingDetail) {
      setDetail(pendingDetail as unknown as WalletCollection);
      onDetailConsumed?.();
    }
  }, [pendingDetail, onDetailConsumed]);

  // Auto-fetch wallet NFTs
  useEffect(() => {
    if (!walletAddress) return;
    fetchWalletNFTs(walletAddress);
  }, [walletAddress]);

  // Fetch live data for watched items
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

  // Sync watched contracts to server
  const syncToServer = useCallback((contracts: string[]) => {
    if (!fid) return;
    fetch('/api/watch-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fid, contracts }),
    }).catch(() => { /* silent */ });
  }, [fid]);

  useEffect(() => {
    if (!fid) return;
    const contracts = sharedItems.map(item => item.address);
    syncToServer(contracts);
  }, [sharedItems, fid, syncToServer]);

  const fetchWalletNFTs = async (addr: string) => {
    setWalletLoading(true);
    setWalletError('');
    setCollections([]);
    setNextPageKey(null);
    try {
      const res = await fetch(`/api/nft/wallet?owner=${addr}&chain=base`);
      const data = await res.json();
      if (data.error) {
        setWalletError(data.error);
      } else {
        setCollections(data.collections || []);
        setNextPageKey(data.pageKey || null);
        if ((data.collections || []).length === 0) {
          setWalletError('No NFTs found on Base');
        }
      }
    } catch {
      setWalletError('Failed to fetch NFTs');
    }
    setWalletLoading(false);
  };

  const loadMore = async () => {
    if (!walletAddress || !nextPageKey || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/nft/wallet?owner=${walletAddress}&chain=base&pageKey=${nextPageKey}`);
      const data = await res.json();
      if (!data.error) {
        setCollections(prev => [...prev, ...(data.collections || [])]);
        setNextPageKey(data.pageKey || null);
      }
    } catch { /* silent */ }
    setLoadingMore(false);
  };

  const toggleAlert = (c: WalletCollection) => {
    if (sharedCheck(c.contractAddress)) {
      sharedRemove(c.contractAddress);
    } else {
      sharedAdd({
        address: c.contractAddress,
        name: c.name || formatAddress(c.contractAddress),
        image: c.image,
        tokenType: c.tokenType,
        floorPrice: c.floorPrice,
        collectionSlug: c.collectionSlug,
        addedAt: Date.now(),
      });
    }
  };

  const handleSearchAdd = (r: ContractResult) => {
    sharedAdd({
      address: r.address,
      name: r.name,
      image: r.image,
      tokenType: r.tokenType,
      floorPrice: r.floorPrice,
      collectionSlug: r.collectionSlug,
      addedAt: Date.now(),
    });
  };

  const handleSearch = () => {
    const addr = searchInput.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      search(addr, 'base');
    }
  };

  const shareOnFarcaster = async (name: string, address: string) => {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      await sdk.actions.composeCast({
        text: `Check out ${name} (${formatAddress(address)}) on Base ⚡\n\nTracking with Base Pulse`,
        embeds: ['https://basepulse-alpha.vercel.app'],
      });
    } catch {
      // Not in Farcaster
    }
  };

  // Not in Farcaster
  if (!isInFrame) {
    return (
      <div className="mynfts-page">
        <div className="win">
          <div className="win__titlebar">
            <div className="win__title">👛 My NFTs</div>
          </div>
          <div className="win__body">
            <div className="not-in-frame">
              <div className="not-in-frame__icon">📱</div>
              <div className="not-in-frame__title">Open in Farcaster</div>
              <div className="not-in-frame__text">
                This feature requires Farcaster. Open Base Pulse as a Mini App to connect your wallet automatically.
              </div>
              <a href="https://warpcast.com/~/mini-app/basepulse" className="not-in-frame__btn" target="_blank" rel="noopener noreferrer">
                Open in Warpcast →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detail Modal
  if (detail) {
    const isWatching = sharedCheck(detail.contractAddress);
    const live = detail.collectionSlug ? enriched[detail.collectionSlug] : null;
    return (
      <div className="mynfts-page">
        <div className="win">
          <div className="win__titlebar">
            <div className="win__title">
              ← {detail.name || formatAddress(detail.contractAddress)}
            </div>
          </div>
          <div className="win__body">
            <button className="btn-bevel" onClick={() => setDetail(null)} style={{ marginBottom: 12 }}>
              ← Back
            </button>

            <div className="detail-header">
              {detail.image ? (
                <img src={detail.image} alt={detail.name || ''} className="detail-header__img" />
              ) : (
                <div className="detail-header__img detail-header__img--empty">?</div>
              )}
              <div className="detail-header__info">
                <div className="detail-header__name">{detail.name || 'Unknown'}</div>
                <div className="detail-header__addr">{formatAddress(detail.contractAddress)}</div>
                <div className="detail-header__meta">
                  <span className="nft-card__type">{detail.tokenType}</span>
                  <span>×{detail.totalBalance}</span>
                  <span>Base</span>
                </div>
              </div>
            </div>

            <div className="detail-stats">
              <div className="detail-stats__row">
                <span className="detail-stats__label">Floor Price</span>
                <span className="detail-stats__value">
                  {live ? `${live.floorPrice.toFixed(4)} Ξ` : detail.floorPrice ? `${detail.floorPrice.toFixed(4)} Ξ` : '—'}
                </span>
              </div>
              {live && (
                <>
                  <div className="detail-stats__row">
                    <span className="detail-stats__label">24h Volume</span>
                    <span className="detail-stats__value">{live.volume24h.toFixed(3)} Ξ</span>
                  </div>
                  <div className="detail-stats__row">
                    <span className="detail-stats__label">24h Sales</span>
                    <span className="detail-stats__value">{live.sales24h}</span>
                  </div>
                  <div className="detail-stats__row">
                    <span className="detail-stats__label">Owners</span>
                    <span className="detail-stats__value">{live.numOwners.toLocaleString()}</span>
                  </div>
                  {live.volumeChange !== 0 && (
                    <div className="detail-stats__row">
                      <span className="detail-stats__label">Volume Change</span>
                      <span className={`detail-stats__value ${live.volumeChange > 0 ? 'stat--up' : 'stat--down'}`}>
                        {live.volumeChange > 0 ? '+' : ''}{live.volumeChange}%
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="detail-stats__row">
                <span className="detail-stats__label">Contract</span>
                <span className="detail-stats__value" style={{ fontSize: 10 }}>
                  {detail.contractAddress}
                </span>
              </div>
            </div>

            <div className="detail-actions">
              <button
                className={`detail-actions__btn${isWatching ? ' detail-actions__btn--active' : ''}`}
                onClick={() => toggleAlert(detail)}
              >
                {isWatching ? '🔔 Watching' : '🔕 Set Alert'}
              </button>
              <button
                className="detail-actions__btn detail-actions__btn--share"
                onClick={() => shareOnFarcaster(detail.name || 'NFT Collection', detail.contractAddress)}
              >
                📤 Share on Farcaster
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mynfts-page">
      {/* Add by Contract */}
      <button
        className="btn-bevel mynfts-search-toggle"
        onClick={() => { setShowSearch(!showSearch); if (showSearch) clear(); }}
      >
        {showSearch ? '✕ Close' : '+ Add by Contract'}
      </button>

      {showSearch && (
        <div className="win">
          <div className="win__titlebar">
            <div className="win__title">🔍 Search</div>
          </div>
          <div className="win__body">
            <div className="search-box">
              <div className="input-clearable">
                <input
                  type="text"
                  className="search-box__input"
                  placeholder="Paste contract address (0x...)"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                {searchInput && (
                  <button className="input-clearable__btn" onClick={() => { setSearchInput(''); clear(); }} type="button">✕</button>
                )}
              </div>
              <button
                className="search-box__btn"
                onClick={handleSearch}
                disabled={searchLoading || !searchInput.trim()}
              >
                {searchLoading ? '...' : '→'}
              </button>
            </div>
            {searchError && <div className="search-error">{searchError}</div>}
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
                      {result.floorPrice !== null && <span>{result.floorPrice.toFixed(4)} ETH</span>}
                    </div>
                  </div>
                  <button
                    className={`contract-card__add${sharedCheck(result.address) ? ' contract-card__add--added' : ''}`}
                    onClick={() => handleSearchAdd(result)}
                    disabled={sharedCheck(result.address)}
                  >
                    {sharedCheck(result.address) ? <CheckIcon /> : <PlusIcon />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {sharedItems.length > 0 && (
        <div className="win">
          <div className="win__titlebar">
            <div className="win__title">🔔 Alerts ({sharedItems.length})</div>
          </div>
          <div className="win__body">
            <div className="alerts-list">
              {sharedItems.map(item => {
                const live = item.collectionSlug ? enriched[item.collectionSlug] : null;
                return (
                  <div key={item.address} className="alert-item">
                    <div
                      className="alert-item__row alert-item__row--clickable"
                      onClick={() => setDetail({
                        contractAddress: item.address,
                        name: item.name,
                        tokenType: item.tokenType || 'ERC721',
                        totalBalance: 0,
                        image: item.image,
                        floorPrice: item.floorPrice,
                        collectionSlug: item.collectionSlug,
                      })}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="alert-item__img" />
                      ) : (
                        <div className="alert-item__img alert-item__img--empty" />
                      )}
                      <div className="alert-item__info">
                        <div className="alert-item__name">{item.name}</div>
                        <div className="alert-item__addr">{formatAddress(item.address)}</div>
                      </div>
                      <button
                        className="alert-item__remove"
                        onClick={(e) => { e.stopPropagation(); sharedRemove(item.address); }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="alert-item__stats">
                      <div className="alert-item__stat">
                        <span className="alert-item__stat-label">Floor</span>
                        <span className="alert-item__stat-value">
                          {live ? `${live.floorPrice.toFixed(4)} Ξ` : item.floorPrice !== null ? `${item.floorPrice.toFixed(4)} Ξ` : '—'}
                        </span>
                      </div>
                      <div className="alert-item__stat">
                        <span className="alert-item__stat-label">24h Vol</span>
                        <span className="alert-item__stat-value">{live ? `${live.volume24h.toFixed(3)} Ξ` : '—'}</span>
                      </div>
                      <div className="alert-item__stat">
                        <span className="alert-item__stat-label">Sales</span>
                        <span className="alert-item__stat-value">{live ? live.sales24h : '—'}</span>
                      </div>
                      {live && live.volumeChange !== 0 && (
                        <div className="alert-item__stat">
                          <span className="alert-item__stat-label">Δ</span>
                          <span className={`alert-item__stat-value ${live.volumeChange > 0 ? 'stat--up' : 'stat--down'}`}>
                            {live.volumeChange > 0 ? '+' : ''}{live.volumeChange}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Wallet NFTs */}
      <div className="win">
        <div className="win__titlebar">
          <div className="win__title">
            👛 {walletAddress ? formatAddress(walletAddress) : 'Connecting...'}
            {!walletLoading && collections.length > 0 && (
              <span style={{ fontWeight: 400, fontSize: 11 }}> · {collections.length}</span>
            )}
          </div>
        </div>
        <div className="win__body">
          {/* Filter input */}
          {!walletLoading && collections.length > 0 && (
            <div className="input-clearable">
              <input
                type="text"
                className="nft-filter-input"
                placeholder="🔍 Filter by name or address..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
              />
              {filterText && (
                <button className="input-clearable__btn" onClick={() => setFilterText('')} type="button">✕</button>
              )}
            </div>
          )}

          {walletLoading && (
            <div className="mynfts-loading">
              <div className="loading-spinner" />
              <span>Loading your NFTs...</span>
            </div>
          )}
          {walletError && <div className="search-error">{walletError}</div>}

          {!walletLoading && filteredCollections.length > 0 && (
            <>
              <div className="mynfts-grid">
                {filteredCollections.map(c => {
                  const isWatching = sharedCheck(c.contractAddress);
                  return (
                    <div
                      key={c.contractAddress}
                      className={`nft-card${isWatching ? ' nft-card--watching' : ''}`}
                      onClick={() => setDetail(c)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="nft-card__header">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name || ''}
                            className="nft-card__img"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="nft-card__img nft-card__img--empty">?</div>
                        )}
                        <div className="nft-card__info">
                          <div className="nft-card__name">
                            {c.name || formatAddress(c.contractAddress)}
                          </div>
                          <div className="nft-card__meta">
                            <span className="nft-card__type">{c.tokenType}</span>
                            <span className="nft-card__count">×{c.totalBalance}</span>
                          </div>
                          {c.floorPrice !== null && c.floorPrice > 0 && (
                            <div className="nft-card__floor">{c.floorPrice.toFixed(4)} ETH</div>
                          )}
                        </div>
                        <button
                          className={`nft-card__bell${isWatching ? ' nft-card__bell--active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleAlert(c); }}
                          title={isWatching ? 'Stop alerts' : 'Set alert'}
                        >
                          <BellIcon active={isWatching} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filter info */}
              {filterText && filteredCollections.length !== collections.length && (
                <div className="nft-filter-info">
                  {filteredCollections.length} of {collections.length} shown
                </div>
              )}

              {/* Load More */}
              {nextPageKey && !filterText && (
                <button
                  className="btn-bevel mynfts-search-toggle"
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{ marginTop: 8 }}
                >
                  {loadingMore ? 'Loading...' : 'Load More NFTs'}
                </button>
              )}
            </>
          )}

          {!walletLoading && filterText && filteredCollections.length === 0 && collections.length > 0 && (
            <div className="search-error">No NFTs matching &ldquo;{filterText}&rdquo;</div>
          )}
        </div>
      </div>
    </div>
  );
}
