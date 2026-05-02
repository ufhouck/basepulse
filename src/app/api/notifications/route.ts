import { NextResponse } from 'next/server';
import { saveNotificationToken, removeNotificationToken } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid, token, url } = body;

    if (!fid || !token || !url) {
      return NextResponse.json({ error: 'Missing fid, token, or url' }, { status: 400 });
    }

    await saveNotificationToken(Number(fid), token, url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save notification token error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { fid } = body;

    if (!fid) {
      return NextResponse.json({ error: 'Missing fid' }, { status: 400 });
    }

    await removeNotificationToken(Number(fid));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove notification token error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
