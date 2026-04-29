import { NextResponse } from 'next/server';
import {
  getWatchersForContract,
  getNotificationToken,
  sendNotification,
} from '@/lib/notifications';

const WHALE_THRESHOLD_ETH = 0.1;

interface AlchemyWebhookEvent {
  webhookId: string;
  type: string;
  event: {
    network: string;
    activity: Array<{
      fromAddress: string;
      toAddress: string;
      value: number;
      asset: string;
      category: string;
      rawContract: {
        address: string;
      };
      log?: {
        address: string;
      };
    }>;
  };
}

export async function POST(request: Request) {
  try {
    const body: AlchemyWebhookEvent = await request.json();

    // Process each activity in the webhook
    const activities = body.event?.activity || [];

    for (const activity of activities) {
      const contractAddress =
        activity.rawContract?.address ||
        activity.log?.address ||
        '';

      if (!contractAddress) continue;

      const valueEth = activity.value || 0;

      // Only notify for significant transactions (whale threshold)
      if (valueEth < WHALE_THRESHOLD_ETH) continue;

      // Find all users watching this contract
      const watcherFids = await getWatchersForContract(contractAddress);

      if (watcherFids.length === 0) continue;

      // Send notification to each watcher
      const category = activity.category || 'transfer';
      const displayValue = valueEth.toFixed(4);

      for (const fid of watcherFids) {
        const tokenData = await getNotificationToken(fid);
        if (!tokenData) continue;

        await sendNotification(fid, {
          title: '🐋 Whale Alert — Base Pulse',
          body: `${displayValue} ETH ${category} detected on watched contract`,
          targetUrl: 'https://basepulse-alpha.vercel.app',
          notificationId: `whale-${contractAddress}-${Date.now()}`,
        });
      }
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
