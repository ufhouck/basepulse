import { NextResponse } from 'next/server';
import {
  getWatchersForContract,
  getNotificationToken,
  sendNotification,
} from '@/lib/notifications';

// Real Alchemy NFT_ACTIVITY webhook payload format
interface AlchemyNFTActivityEvent {
  createdAt: string;
  event: {
    category: string; // "erc721", "erc1155", "erc20"
    fromAddress: string;
    toAddress: string;
    erc721TokenId?: string;
    erc1155Metadata?: Array<{
      tokenId: string;
      value: string;
    }>;
    log: {
      address: string; // contract address
      blockNumber: string;
      transactionHash: string;
      blockHash: string;
      logIndex: string;
      data: string;
      topics: string[];
      removed: boolean;
      transactionIndex: string;
    };
  };
  id: string;
  type: string; // "NFT_ACTIVITY"
  webhookId: string;
}

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export async function POST(request: Request) {
  try {
    const body: AlchemyNFTActivityEvent = await request.json();

    console.log(`Alchemy webhook: type=${body.type}, category=${body.event?.category}`);

    if (body.type !== 'NFT_ACTIVITY' || !body.event) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const { event } = body;
    const contractAddress = event.log?.address;

    if (!contractAddress) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Find all users watching this contract
    const watcherFids = await getWatchersForContract(contractAddress);

    if (watcherFids.length === 0) {
      console.log(`No watchers for contract ${contractAddress}`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Build notification content
    const category = event.category?.toUpperCase() || 'NFT';
    const from = formatAddress(event.fromAddress);
    const to = formatAddress(event.toAddress);
    const txHash = event.log.transactionHash;
    const shortTx = formatAddress(txHash);

    // Determine if this is a mint (from = 0x0)
    const isMint = event.fromAddress === '0x0000000000000000000000000000000000000000';
    const actionText = isMint ? '🟢 Mint' : '🔄 Transfer';

    let tokenInfo = '';
    if (event.erc721TokenId) {
      tokenInfo = ` #${parseInt(event.erc721TokenId, 16)}`;
    } else if (event.erc1155Metadata && event.erc1155Metadata.length > 0) {
      const qty = parseInt(event.erc1155Metadata[0].value, 16);
      tokenInfo = ` (${qty}x)`;
    }

    // Send notification to each watcher
    for (const fid of watcherFids) {
      const tokenData = await getNotificationToken(fid);
      if (!tokenData) continue;

      await sendNotification(fid, {
        title: `${actionText} — Base Pulse`,
        body: `${category}${tokenInfo}: ${from} → ${to} [${shortTx}]`,
        targetUrl: `https://basepulse-alpha.vercel.app`,
        notificationId: `nft-${txHash}-${contractAddress}`,
      });

      console.log(`Sent notification to FID ${fid} for ${contractAddress}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Alchemy webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
