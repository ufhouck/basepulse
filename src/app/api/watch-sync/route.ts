import { NextResponse } from 'next/server';
import {
  saveUserWatchConfig,
  getUserWatchConfig,
  addWebhookFilters,
  removeWebhookFilters,
} from '@/lib/notifications';
import { kv } from '@vercel/kv';

// Save user's watched contracts to KV + sync Alchemy webhook filters
export async function POST(request: Request) {
  try {
    const { fid, contracts } = await request.json();

    if (!fid || !contracts) {
      return NextResponse.json(
        { error: 'fid and contracts required' },
        { status: 400 }
      );
    }

    // Get previous config to diff against
    const prev = await getUserWatchConfig(fid);
    const prevContracts = new Set((prev?.contracts || []).map((c: string) => c.toLowerCase()));
    const newContracts = new Set((contracts as string[]).map((c: string) => c.toLowerCase()));

    // Find added and removed contracts
    const added = [...newContracts].filter(c => !prevContracts.has(c));
    const removed = [...prevContracts].filter(c => !newContracts.has(c));

    // Save new config to KV
    await saveUserWatchConfig(fid, contracts);

    // Update Alchemy webhook filters
    // Only add filters for contracts that are NEW across ALL users
    // Only remove filters for contracts that NO user is watching anymore

    if (added.length > 0) {
      // For newly added contracts, always add to Alchemy filter
      // (idempotent — Alchemy ignores duplicates)
      await addWebhookFilters(added);
      console.log(`Watch-sync: FID ${fid} added ${added.length} contract(s)`);
    }

    if (removed.length > 0) {
      // For removed contracts, check if any other user is still watching
      const contractsToRemoveFromWebhook: string[] = [];
      for (const contract of removed) {
        const watchers = await kv.smembers(`watchers:${contract}`);
        // After saveUserWatchConfig, the current user's FID is already removed from this set
        // If no watchers remain, remove from Alchemy filter
        if (watchers.length === 0) {
          contractsToRemoveFromWebhook.push(contract);
        }
      }
      if (contractsToRemoveFromWebhook.length > 0) {
        await removeWebhookFilters(contractsToRemoveFromWebhook);
        console.log(`Watch-sync: removed ${contractsToRemoveFromWebhook.length} filter(s) with no watchers`);
      }
    }

    return NextResponse.json({ success: true, added: added.length, removed: removed.length });
  } catch (error) {
    console.error('Watch sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's watched contracts from KV
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json(
        { error: 'fid required' },
        { status: 400 }
      );
    }

    const config = await getUserWatchConfig(Number(fid));

    return NextResponse.json(config || { contracts: [], notifyEnabled: false });
  } catch (error) {
    console.error('Watch sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
