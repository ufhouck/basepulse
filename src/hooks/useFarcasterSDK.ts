'use client';

import { useEffect, useState, useCallback } from 'react';
import sdk from '@farcaster/miniapp-sdk';

interface FarcasterContext {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  walletAddress?: string;
}

export function useFarcasterSDK() {
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isInFrame, setIsInFrame] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // Get context from the Farcaster client
        const ctx = await sdk.context;
        if (ctx?.user) {
          let walletAddress: string | undefined;

          // Get wallet address via EIP-1193 provider
          try {
            const provider = sdk.wallet.ethProvider;
            if (provider) {
              const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
              if (accounts && accounts.length > 0) {
                walletAddress = accounts[0];
              }
            }
          } catch (e) {
            console.log('Wallet provider not available:', e);
          }

          setContext({
            fid: ctx.user.fid,
            username: ctx.user.username,
            displayName: ctx.user.displayName,
            pfpUrl: ctx.user.pfpUrl,
            walletAddress,
          });
          setIsInFrame(true);
        }
      } catch {
        // Not in a Farcaster client — running standalone
        setIsInFrame(false);
      }

      // Signal ready
      try {
        await sdk.actions.ready();
      } catch {
        // Ignore if not in frame context
      }

      setIsReady(true);
    }

    init();
  }, []);

  const close = useCallback(() => {
    try {
      sdk.actions.close();
    } catch {
      // Not in frame
    }
  }, []);

  const openUrl = useCallback((url: string) => {
    try {
      sdk.actions.openUrl(url);
    } catch {
      window.open(url, '_blank');
    }
  }, []);

  return { isReady, context, isInFrame, close, openUrl };
}
