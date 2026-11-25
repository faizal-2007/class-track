import { 
  Profile, 
  Department, 
  Course, 
  Section, 
  Enrollment, 
  AcademicCalendarItem, 
  ClassSession, 
  AttendanceSession, 
  AttendanceRecord,
  AttendanceStats
} from '@/types';
import { 
  INITIAL_PROFILES, 
  INITIAL_DEPARTMENTS, 
  INITIAL_COURSES, 
  INITIAL_SECTIONS, 
  INITIAL_ENROLLMENTS, 
  INITIAL_CALENDAR, 
  INITIAL_CLASSES, 
  INITIAL_ATTENDANCE_RECORDS 
} from './mockData';

// Storage keys for browser persistence
const STORAGE_PREFIX = 'classtrack_';

class DataStore {
  private profiles: Profile[] = [...INITIAL_PROFILES];
  private departments: Department[] = [...INITIAL_DEPARTMENTS];
  private courses: Course[] = [...INITIAL_COURSES];
  private sections: Section[] = [...INITIAL_SECTIONS];
  private enrollments: Enrollment[] = [...INITIAL_ENROLLMENTS];
  private calendar: AcademicCalendarItem[] = [...INITIAL_CALENDAR];
  private classes: ClassSession[] = [...INITIAL_CLASSES];
  private sessions: AttendanceSession[] = [];
  private records: AttendanceRecord[] = [...INITIAL_ATTENDANCE_RECORDS];

  constructor() {
    this.loadFromStorage();
  }

  private isClient() {
    return typeof window !== 'undefined';
  }

  private loadFromStorage() {
    if (!this.isClient()) return;
    try {
      const getStored = (key: string) => {
        const item = localStorage.getItem(STORAGE_PREFIX + key);
        return item ? JSON.parse(item) : null;
      };

      this.profiles = getStored('profiles') || this.profiles;
      this.departments = getStored('departments') || this.departments;
      this.courses = getStored('courses') || this.courses;
      this.sections = getStored('sections') || this.sections;
      this.enrollments = getStored('enrollments') || this.enrollments;
      this.calendar = getStored('calendar') || this.calendar;
      this.classes = getStored('classes') || this.classes;
      this.sessions = getStored('sessions') || this.sessions;
      this.records = getStored('records') || this.records;
    } catch (e) {
      console.warn('LocalStorage access issue:', e);
    }
  }

  private saveToStorage(key: string, data: unknown) {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // --- Profiles ---
  getProfiles() {
    return [...this.profiles];
  }

  getProfileById(id: string) {
    return this.profiles.find(p => p.id === id) || null;
  }

  getProfileByEmail(email: string) {
    return this.profiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  addProfile(profile: Omit<Profile, 'id' | 'created_at'>): Profile {
    const newProfile: Profile = {
      ...profile,
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.profiles.push(newProfile);
    this.saveToStorage('profiles', this.profiles);
    return newProfile;
  }

  bulkAddStudents(students: Array<{ full_name: string; email: string; usn_faculty_id: string; department_id: string; phone?: string; section_id?: string }>) {
    const added: Profile[] = [];
    for (const stu of students) {
      if (this.profiles.some(p => p.email.toLowerCase() === stu.email.toLowerCase() || p.usn_faculty_id === stu.usn_faculty_id)) {
        continue;
      }
      const dept = this.departments.find(d => d.id === stu.department_id);
      const newStu: Profile = {
        id: `user-stu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        full_name: stu.full_name,
        email: stu.email,
        role: 'student',
        usn_faculty_id: stu.usn_faculty_id,
        department_id: stu.department_id,
        department_name: dept?.name,
        phone: stu.phone || '',
        created_at: new Date().toISOString(),
      };
      this.profiles.push(newStu);
      added.push(newStu);

      if (stu.section_id) {
        this.enrollStudent(newStu.id, stu.section_id);
      }
    }
    this.saveToStorage('profiles', this.profiles);
    return added;
  }

  // --- Departments, Courses, Sections ---
  getDepartments() {
    return [...this.departments];
  }

  addDepartment(code: string, name: string): Department {
    const dept: Department = {
      id: `dept-${Date.now()}`,
      code: code.toUpperCase(),
      name,
      created_at: new Date().toISOString(),
    };
    this.departments.push(dept);
    this.saveToStorage('departments', this.departments);
    return dept;
  }

  getCourses() {
    return this.courses.map(c => {
      const dept = this.departments.find(d => d.id === c.department_id);
      return { ...c, department_code: dept?.code };
    });
  }

  addCourse(code: string, name: string, department_id: string, credits: number): Course {
    const course: Course = {
      id: `course-${Date.now()}`,
      code: code.toUpperCase(),
      name,
      department_id,
      credits,
      created_at: new Date().toISOString(),
    };
    this.courses.push(course);
    this.saveToStorage('courses', this.courses);
    return course;
  }

  getSections() {
    return this.sections.map(s => {
      const course = this.courses.find(c => c.id === s.course_id);
      return { ...s, course_code: course?.code, course_name: course?.name };
    });
  }

  addSection(course_id: string, name: string, semester: number, academic_year: string): Section {
    const sec: Section = {
      id: `sec-${Date.now()}`,
      course_id,
      name,
      semester,
      academic_year,
      created_at: new Date().toISOString(),
    };
    this.sections.push(sec);
    this.saveToStorage('sections', this.sections);
    return sec;
  }

  // --- Enrollments ---
  getEnrollments(section_id?: string) {
    let list = this.enrollments;
    if (section_id) {
      list = list.filter(e => e.section_id === section_id);
    }
    return list.map(e => {
      const stu = this.profiles.find(p => p.id === e.student_id);
      return {
        ...e,
        student_name: stu?.full_name,
        student_usn: stu?.usn_faculty_id,
      };
    });
  }

  enrollStudent(student_id: string, section_id: string): Enrollment {
    const exists = this.enrollments.find(e => e.student_id === student_id && e.section_id === section_id);
    if (exists) return exists;

    const stu = this.profiles.find(p => p.id === student_id);
    const enr: Enrollment = {
      id: `enr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      student_id,
      section_id,
      student_name: stu?.full_name,
      student_usn: stu?.usn_faculty_id,
      enrolled_at: new Date().toISOString(),
    };
    this.enrollments.push(enr);
    this.saveToStorage('enrollments', this.enrollments);
    return enr;
  }

  // --- Calendar ---
  getCalendar() {
    return [...this.calendar].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  }

  addCalendarEvent(event: Omit<AcademicCalendarItem, 'id'>): AcademicCalendarItem {
    const item: AcademicCalendarItem = {
      ...event,
      id: `cal-${Date.now()}`,
    };
    this.calendar.push(item);
    this.saveToStorage('calendar', this.calendar);
    return item;
  }

  deleteCalendarEvent(id: string) {
    this.calendar = this.calendar.filter(c => c.id !== id);
    this.saveToStorage('calendar', this.calendar);
  }

  // --- Classes ---
  getClasses(faculty_id?: string, student_id?: string) {
    let list = this.classes;

    if (faculty_id) {
      list = list.filter(c => c.faculty_id === faculty_id);
    }

    if (student_id) {
      // Find sections student is enrolled in
      const enrolledSectionIds = this.enrollments
        .filter(e => e.student_id === student_id)
        .map(e => e.section_id);
      list = list.filter(c => enrolledSectionIds.includes(c.section_id));
    }

    return list.map(c => {
      const sec = this.sections.find(s => s.id === c.section_id);
      const course = this.courses.find(cr => cr.id === sec?.course_id);
      const fac = this.profiles.find(p => p.id === c.faculty_id);
      return {
        ...c,
        section_name: sec?.name,
        course_code: course?.code,
        course_name: course?.name,
        faculty_name: fac?.full_name,
      };
    });
  }

  getClassById(id: string) {
    const c = this.classes.find(cls => cls.id === id);
    if (!c) return null;
    const sec = this.sections.find(s => s.id === c.section_id);
    const course = this.courses.find(cr => cr.id === sec?.course_id);
    const fac = this.profiles.find(p => p.id === c.faculty_id);
    return {
      ...c,
      section_name: sec?.name,
      course_code: course?.code,
      course_name: course?.name,
      faculty_name: fac?.full_name,
    };
  }

  addClass(classData: Omit<ClassSession, 'id'>): ClassSession {
    const newClass: ClassSession = {
      ...classData,
      id: `class-${Date.now()}`,
    };
    this.classes.push(newClass);
    this.saveToStorage('classes', this.classes);
    return newClass;
  }

  // --- Attendance Sessions ---
  createAttendanceSession(data: {
    class_id: string;
    session_token: string;
    numeric_code: string;
    expires_at: string;
    allow_late?: boolean;
    late_threshold_minutes?: number;
    refresh_interval_seconds?: number;
  }): AttendanceSession {
    // Close any prior active session for this class
    this.sessions.forEach(s => {
      if (s.class_id === data.class_id) {
        s.is_active = false;
      }
    });

    const session: AttendanceSession = {
      id: `session-${Date.now()}`,
      class_id: data.class_id,
      session_token: data.session_token,
      numeric_code: data.numeric_code,
      expires_at: data.expires_at,
      is_active: true,
      allow_late: data.allow_late ?? true,
      late_threshold_minutes: data.late_threshold_minutes ?? 5,
      refresh_interval_seconds: data.refresh_interval_seconds ?? 15,
      created_at: new Date().toISOString(),
    };

    this.sessions.push(session);
    this.saveToStorage('sessions', this.sessions);
    return session;
  }

  getActiveSessionForClass(classId: string): AttendanceSession | null {
    const session = this.sessions.find(s => s.class_id === classId && s.is_active);
    if (!session) return null;

    // Check if expired
    if (new Date().getTime() > new Date(session.expires_at).getTime()) {
      session.is_active = false;
      this.saveToStorage('sessions', this.sessions);
      return null;
    }
    return session;
  }

  closeAttendanceSession(sessionId: string) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.is_active = false;
      this.saveToStorage('sessions', this.sessions);
    }
    return session;
  }

  updateSessionToken(sessionId: string, newToken: string) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.session_token = newToken;
      this.saveToStorage('sessions', this.sessions);
    }
    return session;
  }

  // --- Attendance Marking & Validation ---
  markAttendance(params: {
    tokenOrCode: string;
    studentId: string;
    ipAddress?: string;
    userAgent?: string;
  }): { success: boolean; message: string; record?: AttendanceRecord } {
    const { tokenOrCode, studentId, ipAddress, userAgent } = params;
    const now = new Date();

    const student = this.profiles.find(p => p.id === studentId);
    if (!student) {
      return { success: false, message: 'Student profile not found.' };
    }

    // Find session by token or numeric 6-digit code
    const session = this.sessions.find(s => 
      s.is_active && (s.session_token === tokenOrCode || s.numeric_code === tokenOrCode)
    );

    if (!session) {
      return { success: false, message: 'Invalid or inactive attendance session code.' };
    }

    // Server-side expiry check
    if (now.getTime() > new Date(session.expires_at).getTime()) {
      session.is_active = false;
      this.saveToStorage('sessions', this.sessions);
      return { success: false, message: 'This attendance session has already expired.' };
    }

    // Check enrollment in the class's section
    const classItem = this.classes.find(c => c.id === session.class_id);
    if (!classItem) {
      return { success: false, message: 'Class for this session not found.' };
    }

    const isEnrolled = this.enrollments.some(
      e => e.student_id === studentId && e.section_id === classItem.section_id
    );
    if (!isEnrolled) {
      return { success: false, message: 'You are not enrolled in this section/class.' };
    }

    // Check duplicate
    const alreadyMarked = this.records.some(
      r => r.session_id === session.id && r.student_id === studentId
    );
    if (alreadyMarked) {
      return { success: false, message: 'Attendance already recorded for this session.' };
    }

    // Determine present or late
    const sessionStart = new Date(session.created_at).getTime();
    const elapsedMinutes = (now.getTime() - sessionStart) / (1000 * 60);
    const status = (session.allow_late && elapsedMinutes > session.late_threshold_minutes) ? 'late' : 'present';
    const method = tokenOrCode.length === 6 ? 'numeric_code' : 'qr_scan';

    const record: AttendanceRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      session_id: session.id,
      class_id: session.class_id,
      student_id: studentId,
      student_name: student.full_name,
      student_usn: student.usn_faculty_id,
      status,
      verification_method: method,
      ip_address: ipAddress || '127.0.0.1',
      user_agent: userAgent || 'Browser Mobile',
      marked_at: now.toISOString(),
    };

    this.records.unshift(record);
    this.saveToStorage('records', this.records);

    return { 
      success: true, 
      message: status === 'late' ? 'Marked attendance successfully (marked as Late).' : 'Attendance marked successfully!',
      record 
    };
  }

  manualOverrideAttendance(params: {
    sessionId: string;
    studentId: string;
    status: 'present' | 'late' | 'absent' | 'excused';
    facultyId: string;
  }) {
    const { sessionId, studentId, status } = params;
    const student = this.profiles.find(p => p.id === studentId);
    const session = this.sessions.find(s => s.id === sessionId);

    const existingIndex = this.records.findIndex(
      r => r.session_id === sessionId && r.student_id === studentId
    );

    if (existingIndex >= 0) {
      this.records[existingIndex].status = status;
      this.records[existingIndex].verification_method = 'manual_faculty';
      this.saveToStorage('records', this.records);
      return this.records[existingIndex];
    } else {
      const newRec: AttendanceRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        session_id: sessionId,
        class_id: session?.class_id,
        student_id: studentId,
        student_name: student?.full_name,
        student_usn: student?.usn_faculty_id,
        status,
        verification_method: 'manual_faculty',
        marked_at: new Date().toISOString(),
      };
      this.records.unshift(newRec);
      this.saveToStorage('records', this.records);
      return newRec;
    }
  }

  getRecordsForSession(sessionId: string): AttendanceRecord[] {
    return this.records.filter(r => r.session_id === sessionId);
  }

  getRecordsForClass(classId: string): AttendanceRecord[] {
    return this.records.filter(r => r.class_id === classId);
  }

  getRecordsForStudent(studentId: string): AttendanceRecord[] {
    return this.records.filter(r => r.student_id === studentId);
  }

  getAllRecords(): AttendanceRecord[] {
    return [...this.records];
  }

  // --- Student Attendance Statistics ---
  getStudentStats(studentId: string): AttendanceStats {
    const studentEnrollments = this.enrollments.filter(e => e.student_id === studentId);
    const enrolledSectionIds = studentEnrollments.map(e => e.section_id);

    const relevantClasses = this.classes.filter(c => enrolledSectionIds.includes(c.section_id));
    const studentRecords = this.records.filter(r => r.student_id === studentId && (r.status === 'present' || r.status === 'late'));

    const totalClasses = relevantClasses.length || 1; // avoid division by 0
    const attended = studentRecords.length;
    const percentage = Math.round((attended / totalClasses) * 100);

    // Subject breakdown
    const courseMap = new Map<string, { total: number; attended: number; courseCode: string; courseName: string }>();

    relevantClasses.forEach(cls => {
      const sec = this.sections.find(s => s.id === cls.section_id);
      const course = this.courses.find(c => c.id === sec?.course_id);
      if (course) {
        if (!courseMap.has(course.id)) {
          courseMap.set(course.id, {
            total: 0,
            attended: 0,
            courseCode: course.code,
            courseName: course.name,
          });
        }
        courseMap.get(course.id)!.total += 1;
      }
    });

    studentRecords.forEach(rec => {
      const cls = this.classes.find(c => c.id === rec.class_id);
      if (cls) {
        const sec = this.sections.find(s => s.id === cls.section_id);
        const course = this.courses.find(c => c.id === sec?.course_id);
        if (course && courseMap.has(course.id)) {
          courseMap.get(course.id)!.attended += 1;
        }
      }
    });

    const courseBreakdown = Array.from(courseMap.entries()).map(([courseId, data]) => {
      const pct = data.total > 0 ? Math.round((data.attended / data.total) * 100) : 100;
      return {
        courseId,
        courseCode: data.courseCode,
        courseName: data.courseName,
        total: data.total,
        attended: data.attended,
        percentage: pct,
        isLow: pct < 75,
      };
    });

    return {
      totalClasses,
      attended,
      percentage,
      isLowAttendance: percentage < 75,
      courseBreakdown,
    };
  }

  // Reset to initial demo seed
  resetToDemoSeed() {
    this.profiles = [...INITIAL_PROFILES];
    this.departments = [...INITIAL_DEPARTMENTS];
    this.courses = [...INITIAL_COURSES];
    this.sections = [...INITIAL_SECTIONS];
    this.enrollments = [...INITIAL_ENROLLMENTS];
    this.calendar = [...INITIAL_CALENDAR];
    this.classes = [...INITIAL_CLASSES];
    this.sessions = [];
    this.records = [...INITIAL_ATTENDANCE_RECORDS];

    if (this.isClient()) {
      localStorage.clear();
    }
  }
}

// Global singleton instance
export const db = new DataStore();
