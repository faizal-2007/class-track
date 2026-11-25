import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const closed = db.closeAttendanceSession(sessionId);

    return NextResponse.json({
      success: true,
      session: closed,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to close session' }, { status: 500 });
  }
}
