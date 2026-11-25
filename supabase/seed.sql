-- Seed Demo Data for Yenepoya School of Engineering & Technology
-- 1 Admin, 2 Faculty, 10 Students, Departments, Courses, Sections, Academic Calendar, Classes

-- 1. Departments
INSERT INTO departments (id, code, name) VALUES
('11111111-1111-1111-1111-111111111101', 'CSE', 'Computer Science & Engineering'),
('11111111-1111-1111-1111-111111111102', 'ISE', 'Information Science & Engineering'),
('11111111-1111-1111-1111-111111111103', 'ECE', 'Electronics & Communication Engineering'),
('11111111-1111-1111-1111-111111111104', 'AIML', 'Artificial Intelligence & Machine Learning')
ON CONFLICT (id) DO NOTHING;

-- 2. Profiles
-- Admin
INSERT INTO profiles (id, email, full_name, role, usn_faculty_id, department_id, phone) VALUES
('22222222-2222-2222-2222-222222222001', 'admin@yenepoya.edu.in', 'Dr. Gangadhara Rao (Principal / Admin)', 'admin', 'YSET-ADM-01', '11111111-1111-1111-1111-111111111101', '+91 9845012345'),

-- Faculty (2)
('22222222-2222-2222-2222-222222222002', 'dr.kavitha@yenepoya.edu.in', 'Dr. Kavitha Mahesh (Prof. CSE)', 'faculty', 'YSET-FAC-042', '11111111-1111-1111-1111-111111111101', '+91 9845023456'),
('22222222-2222-2222-2222-222222222003', 'prof.rohit@yenepoya.edu.in', 'Prof. Rohit Shenoy (Asst. Prof. ISE)', 'faculty', 'YSET-FAC-078', '11111111-1111-1111-1111-111111111102', '+91 9845034567'),

-- Students (10)
('33333333-3333-3333-3333-333333333001', 'mohammed.faizan@yenepoya.edu.in', 'Mohammed Faizan', 'student', '4YE21CS045', '11111111-1111-1111-1111-111111111101', '+91 9845000001'),
('33333333-3333-3333-3333-333333333002', 'ayesha.siddeeq@yenepoya.edu.in', 'Ayesha Siddeeq', 'student', '4YE21CS012', '11111111-1111-1111-1111-111111111101', '+91 9845000002'),
('33333333-3333-3333-3333-333333333003', 'prathik.shetty@yenepoya.edu.in', 'Prathik Shetty', 'student', '4YE21CS062', '11111111-1111-1111-1111-111111111101', '+91 9845000003'),
('33333333-3333-3333-3333-333333333004', 'ananya.rao@yenepoya.edu.in', 'Ananya Rao', 'student', '4YE21CS008', '11111111-1111-1111-1111-111111111101', '+91 9845000004'),
('33333333-3333-3333-3333-333333333005', 'nihal.sheikh@yenepoya.edu.in', 'Nihal Sheikh', 'student', '4YE21CS054', '11111111-1111-1111-1111-111111111101', '+91 9845000005'),
('33333333-3333-3333-3333-333333333006', 'deeksha.kulal@yenepoya.edu.in', 'Deeksha Kulal', 'student', '4YE21CS028', '11111111-1111-1111-1111-111111111101', '+91 9845000006'),
('33333333-3333-3333-3333-333333333007', 'abdul.hadi@yenepoya.edu.in', 'Abdul Hadi', 'student', '4YE21CS002', '11111111-1111-1111-1111-111111111101', '+91 9845000007'),
('33333333-3333-3333-3333-333333333008', 'sneha.kamath@yenepoya.edu.in', 'Sneha Kamath', 'student', '4YE21CS075', '11111111-1111-1111-1111-111111111101', '+91 9845000008'),
('33333333-3333-3333-3333-333333333009', 'karthik.poojary@yenepoya.edu.in', 'Karthik Poojary', 'student', '4YE21CS039', '11111111-1111-1111-1111-111111111101', '+91 9845000009'),
('33333333-3333-3333-3333-333333333010', 'fathima.zahra@yenepoya.edu.in', 'Fathima Zahra', 'student', '4YE21CS031', '11111111-1111-1111-1111-111111111101', '+91 9845000010')
ON CONFLICT (id) DO NOTHING;

-- 3. Courses
INSERT INTO courses (id, code, name, department_id, credits) VALUES
('44444444-4444-4444-4444-444444444001', '21CS51', 'Software Engineering & Agile Methodologies', '11111111-1111-1111-1111-111111111101', 4),
('44444444-4444-4444-4444-444444444002', '21CS52', 'Computer Networks & Protocols', '11111111-1111-1111-1111-111111111101', 4),
('44444444-4444-4444-4444-444444444003', '21CS53', 'Database Management Systems & Cloud', '11111111-1111-1111-1111-111111111101', 4),
('44444444-4444-4444-4444-444444444004', '21IS54', 'Full-Stack Web Development', '11111111-1111-1111-1111-111111111102', 3)
ON CONFLICT (id) DO NOTHING;

-- 4. Sections
INSERT INTO sections (id, course_id, name, semester, academic_year) VALUES
('55555555-5555-5555-5555-555555555001', '44444444-4444-4444-4444-444444444001', '5th Sem CSE - Section A', 5, '2024-2025'),
('55555555-5555-5555-5555-555555555002', '44444444-4444-4444-4444-444444444002', '5th Sem CSE - Section A', 5, '2024-2025'),
('55555555-5555-5555-5555-555555555003', '44444444-4444-4444-4444-444444444003', '5th Sem CSE - Section A', 5, '2024-2025'),
('55555555-5555-5555-5555-555555555004', '44444444-4444-4444-4444-444444444004', '5th Sem ISE - Section B', 5, '2024-2025')
ON CONFLICT (id) DO NOTHING;

-- 5. Enrollments (All 10 students enrolled in 5th Sem CSE Section A)
INSERT INTO enrollments (student_id, section_id) VALUES
('33333333-3333-3333-3333-333333333001', '55555555-5555-5555-5555-555555555001'),
('33333333-3333-3333-3333-333333333002', '55555555-5555-5555-5555-555555555001'),
('33333333-3333-3333-3333-333333333003', '55555555-5555-5555-5555-555555555001'),
('33333333-3333-3333-3333-333333333004', '55555555-5555-5555-5555-555555555001'),
('33333333-3333-3333-3333-333333333005', '55555555-5555-5555-5555-555555555001'),
('33333333-3333-3333-3333-333333333006', '55555555-5555-5555-5555-555555555001'),
('33333333-3333-3333-3333-333333333007', '55555555-5555-5555-5555-555555555001'),
('33333333-3333-3333-3333-333333333008', '55555555-5555-5555-5555-555555555001'),
('33333333-3333-3333-3333-333333333009', '55555555-5555-5555-5555-555555555001'),
('33333333-3333-3333-3333-333333333010', '55555555-5555-5555-5555-555555555001')
ON CONFLICT DO NOTHING;

-- 6. Academic Calendar
INSERT INTO academic_calendar (title, type, start_date, end_date, description) VALUES
('Odd Semester 2024-25 Commencement', 'semester_boundary', '2024-09-02', '2024-09-02', 'Official commencement of classes for 3rd, 5th, and 7th semester.'),
('Gandhi Jayanti Holiday', 'holiday', '2024-10-02', '2024-10-02', 'National Holiday on account of Gandhi Jayanti.'),
('Internal Assessment I (IA-1)', 'exam', '2024-10-21', '2024-10-26', 'First continuous internal evaluation test for all engineering branches.'),
('Deepavali Vacations', 'holiday', '2024-10-31', '2024-11-02', 'Institution closed for Deepavali celebrations.'),
('Yenepoya Tech Fest (INVICTUS 2024)', 'event', '2024-11-15', '2024-11-16', 'Annual inter-college technological and coding symposium.'),
('Internal Assessment II (IA-2)', 'exam', '2024-12-09', '2024-12-14', 'Second internal evaluation and lab assessments.');

-- 7. Classes for Today & Weekly Timetable
INSERT INTO classes (id, section_id, faculty_id, room, class_date, start_time, end_time, is_recurring, day_of_week, topic) VALUES
('66666666-6666-6666-6666-666666666001', '55555555-5555-5555-5555-555555555001', '22222222-2222-2222-2222-222222222002', 'LH-302', CURRENT_DATE, '09:30:00', '10:30:00', TRUE, EXTRACT(DOW FROM CURRENT_DATE), 'Software Requirements Specification & Agile Epics'),
('66666666-6666-6666-6666-666666666002', '55555555-5555-5555-5555-555555555001', '22222222-2222-2222-2222-222222222002', 'LH-302', CURRENT_DATE, '11:00:00', '12:00:00', TRUE, EXTRACT(DOW FROM CURRENT_DATE), 'Design Patterns and MVC Architecture in Web Apps'),
('66666666-6666-6666-6666-666666666003', '55555555-5555-5555-5555-555555555004', '22222222-2222-2222-2222-222222222003', 'LAB-104', CURRENT_DATE, '14:00:00', '16:00:00', TRUE, EXTRACT(DOW FROM CURRENT_DATE), 'Full-Stack REST APIs and Supabase Postgres Integrations')
ON CONFLICT (id) DO NOTHING;
