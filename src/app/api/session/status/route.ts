import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const classId = searchParams.get('classId');

    if (sessionId) {
      const records = db.getRecordsForSession(sessionId);
      return NextResponse.json({ success: true, records });
    }

    if (classId) {
      const activeSession = db.getActiveSessionForClass(classId);
      const records = activeSession ? db.getRecordsForSession(activeSession.id) : [];
      return NextResponse.json({ success: true, session: activeSession, records });
    }

    return NextResponse.json({ error: 'sessionId or classId parameter required' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch session status' }, { status: 500 });
  }
}
