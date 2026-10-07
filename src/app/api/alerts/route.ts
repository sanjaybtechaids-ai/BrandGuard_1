import { NextRequest, NextResponse } from 'next/server';
import { getAlerts, markAlertAsRead, markAllAlertsAsRead } from '@/services/alerts.service';

export async function GET() {
  const alerts = await getAlerts();
  return NextResponse.json({
    success: true,
    data: alerts,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.all) {
    await markAllAlertsAsRead();
    return NextResponse.json({ success: true, message: 'All alerts marked as read.' });
  }

  if (body.id) {
    const updated = await markAlertAsRead(body.id);
    return NextResponse.json({ success: true, data: updated });
  }

  return NextResponse.json({ success: false, error: { code: 'INVALID_REQUEST', message: 'ID required.' } }, { status: 400 });
}
