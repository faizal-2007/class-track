import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSignedSessionToken } from '@/lib/tokenSecurity';

export async function POST(request: Request) {
  try {
    const { sessionId, classId } = await request.json();

    if (!sessionId || !classId) {
      return NextResponse.json({ error: 'Session ID and Class ID are required' }, { status: 400 });
    }

    const { token } = generateSignedSessionToken(classId, 5);
    const updated = db.updateSessionToken(sessionId, token);

    return NextResponse.json({
      success: true,
      session: updated,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
}
