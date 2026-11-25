import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/tokenSecurity';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Browser';

    const body = await request.json();
    const { tokenOrCode, studentId } = body;

    if (!tokenOrCode || !studentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters (token/code and student ID).' 
      }, { status: 400 });
    }

    // Rate-limit by student ID and IP (max 6 attempts per minute)
    const rateCheck = checkRateLimit(`mark_${studentId}_${ip}`, 6, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: `Too many attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.`
      }, { status: 429 });
    }

    // Process attendance via data store with full server-side validations
    const result = db.markAttendance({
      tokenOrCode: tokenOrCode.trim(),
      studentId,
      ipAddress: ip,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      record: result.record,
    });
  } catch (error: unknown) {
    console.error('Mark attendance API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
