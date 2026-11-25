export type UserRole = 'admin' | 'faculty' | 'student';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  usn_faculty_id?: string;
  department_id?: string;
  department_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  created_at?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department_id: string;
  department_code?: string;
  credits: number;
  created_at?: string;
}

export interface Section {
  id: string;
  course_id: string;
  course_code?: string;
  course_name?: string;
  name: string;
  semester: number;
  academic_year: string;
  created_at?: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  section_id: string;
  student_name?: string;
  student_usn?: string;
  enrolled_at?: string;
}

export type CalendarEventType = 'holiday' | 'exam' | 'event' | 'semester_boundary';

export interface AcademicCalendarItem {
  id: string;
  title: string;
  type: CalendarEventType;
  start_date: string;
  end_date: string;
  description?: string;
  department_id?: string;
  department_name?: string;
}

export interface ClassSession {
  id: string;
  section_id: string;
  section_name?: string;
  course_code?: string;
  course_name?: string;
  faculty_id: string;
  faculty_name?: string;
  room: string;
  class_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  is_recurring: boolean;
  day_of_week?: number; // 0=Sun, 1=Mon, ..., 6=Sat
  topic?: string;
}

export interface AttendanceSession {
  id: string;
  class_id: string;
  session_token: string;
  numeric_code: string; // 6-digit code e.g. "849201"
  expires_at: string;   // ISO string
  is_active: boolean;
  allow_late: boolean;
  late_threshold_minutes: number;
  refresh_interval_seconds?: number;
  created_at: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type VerificationMethod = 'qr_scan' | 'numeric_code' | 'manual_faculty';

export interface AttendanceRecord {
  id: string;
  session_id: string;
  class_id?: string;
  student_id: string;
  student_name?: string;
  student_usn?: string;
  status: AttendanceStatus;
  verification_method: VerificationMethod;
  ip_address?: string;
  user_agent?: string;
  marked_at: string;
}

export interface MarkAttendancePayload {
  tokenOrCode: string;
  studentId: string;
  classId?: string;
  deviceInfo?: string;
}

export interface AttendanceStats {
  totalClasses: number;
  attended: number;
  percentage: number;
  isLowAttendance: boolean; // < 75%
  courseBreakdown: {
    courseId: string;
    courseCode: string;
    courseName: string;
    total: number;
    attended: number;
    percentage: number;
    isLow: boolean;
  }[];
}
