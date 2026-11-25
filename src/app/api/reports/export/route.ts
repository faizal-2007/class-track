import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const classId = searchParams.get('classId');

    const records = classId ? db.getRecordsForClass(classId) : db.getAllRecords();

    if (format === 'csv') {
      const header = 'Record ID,Student Name,USN,Status,Method,Marked At,IP Address\n';
      const rows = records.map(r => 
        `"${r.id}","${r.student_name || ''}","${r.student_usn || ''}","${r.status}","${r.verification_method}","${r.marked_at}","${r.ip_address || ''}"`
      ).join('\n');

      const csvContent = header + rows;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="attendance-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, records });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
