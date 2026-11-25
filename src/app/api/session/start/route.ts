import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSignedSessionToken } from '@/lib/tokenSecurity';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { classId, durationMinutes = 5, allowLate = true, lateThresholdMinutes = 5, refreshInterval = 15 } = body;

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required.' }, { status: 400 });
    }

    const classItem = db.getClassById(classId);
    if (!classItem) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
    }

    const { token, numericCode, expiresAt } = generateSignedSessionToken(classId, Number(durationMinutes));

    const session = db.createAttendanceSession({
      class_id: classId,
      session_token: token,
      numeric_code: numericCode,
      expires_at: expiresAt,
      allow_late: allowLate,
      late_threshold_minutes: Number(lateThresholdMinutes),
      refresh_interval_seconds: Number(refreshInterval),
    });

    return NextResponse.json({
      success: true,
      session,
      classItem,
    });
  } catch (error: unknown) {
    console.error('Session start error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
