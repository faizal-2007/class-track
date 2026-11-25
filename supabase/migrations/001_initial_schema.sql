-- Migration 001: Initial Schema for Class Track
-- Institution: Yenepoya School of Engineering & Technology (YSET)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles (Admin, Faculty, Student)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    usn_faculty_id VARCHAR(50) UNIQUE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    credits INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Sections / Batches
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, section_id)
);

-- 6. Academic Calendar
CREATE TABLE IF NOT EXISTS academic_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('holiday', 'exam', 'event', 'semester_boundary')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Classes (Daily / Weekly Timetable)
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    room VARCHAR(50) NOT NULL,
    class_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    topic VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Attendance Sessions (Active QR / 6-digit Codes)
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    numeric_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    allow_late BOOLEAN DEFAULT FALSE,
    late_threshold_minutes INTEGER DEFAULT 5,
    refresh_interval_seconds INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'late', 'absent', 'excused')),
    verification_method VARCHAR(30) NOT NULL CHECK (verification_method IN ('qr_scan', 'numeric_code', 'manual_faculty')),
    ip_address VARCHAR(50),
    user_agent TEXT,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles: Anyone authenticated can read profiles; Admins can update/insert any; users can update their own
CREATE POLICY "Public profiles read" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage profiles" ON profiles
    FOR ALL TO authenticated
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Departments & Courses & Sections: Read by all authenticated; Managed by admin
CREATE POLICY "All read departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage departments" ON departments FOR ALL TO authenticated
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "All read courses" ON courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage courses" ON courses FOR ALL TO authenticated
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "All read sections" ON sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage sections" ON sections FOR ALL TO authenticated
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Enrollments: Read by enrolled student or assigned faculty or admin
CREATE POLICY "Read enrollments" ON enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage enrollments" ON enrollments FOR ALL TO authenticated
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Academic Calendar: Read by all authenticated; Managed by faculty and admin
CREATE POLICY "Read calendar" ON academic_calendar FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faculty and admin manage calendar" ON academic_calendar FOR ALL TO authenticated
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('faculty', 'admin'));

-- Classes: Read by all authenticated; Faculty manages their own classes; Admin can manage all
CREATE POLICY "Read classes" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Faculty manage own classes" ON classes FOR ALL TO authenticated
    USING (faculty_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Attendance Sessions:
-- Faculty who owns class can create/update session; Students enrolled in the class's section can read active session
CREATE POLICY "Faculty manage attendance sessions" ON attendance_sessions FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = attendance_sessions.class_id 
            AND (classes.faculty_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
        )
    );

CREATE POLICY "Students read active attendance sessions" ON attendance_sessions FOR SELECT TO authenticated
    USING (is_active = true);

-- Attendance Records:
-- Students can read their own records; Faculty can read/manage records for their classes; Admins can read all
CREATE POLICY "Students read own attendance" ON attendance_records FOR SELECT TO authenticated
    USING (student_id = auth.uid());

CREATE POLICY "Students insert own attendance via verified token" ON attendance_records FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty and admin view and manage attendance" ON attendance_records FOR ALL TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'faculty')
    );
