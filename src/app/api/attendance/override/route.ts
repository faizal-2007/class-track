import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { sessionId, studentId, status, facultyId } = await request.json();

    if (!sessionId || !studentId || !status || !facultyId) {
      return NextResponse.json({ 
        success: false, 
        error: 'sessionId, studentId, status, and facultyId are required' 
      }, { status: 400 });
    }

    const updated = db.manualOverrideAttendance({
      sessionId,
      studentId,
      status,
      facultyId,
    });

    return NextResponse.json({
      success: true,
      record: updated,
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: 'Failed to update record' }, { status: 500 });
  }
}
