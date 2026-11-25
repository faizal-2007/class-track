# Class Track: QR-Based Attendance Management System
**Yenepoya School of Engineering & Technology (YSET)**

Class Track is an institutional full-stack attendance management system engineered for Yenepoya School of Engineering & Technology. It replaces manual roll calls and paper registers with cryptographic time-bound QR codes, fallback 6-digit PIN verification, live countdown timers, anti-screenshot QR rotation, and automated 75% university eligibility enforcement.

---

## Brand Identity & Exact Logo Colors
Extracted directly from the official Yenepoya emblem & wordmark:
- **`--brand-green`**: `#92D40E` / `#8DC63F` (Shield crest top)
- **`--brand-teal`**: `#1B9AAA` / `#68C4E9` (Shield middle segment)
- **`--brand-navy`**: `#1E3A8A` / `#2B6CA3` (Shield anchor / typography)
- **`--text-dark`**: `#1F1F1F` (Charcoal text of "YENEPOYA")
- **`--bg-white`**: `#FFFFFF` (Clean white academic backdrop)
- **`--border-grey`**: `#E2E8F0` (Silver-grey dividers)

---

## Tech Stack & Architecture
- **Framework**: Next.js 15+ (App Router) with TypeScript & React Server/Client Components
- **Styling**: Tailwind CSS configured with Yenepoya academic theme variables
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security policies) + Local resilient fallback store
- **QR Generation**: `qrcode` (Dynamic cryptographic generation)
- **Student Scanning**: `html5-qrcode` (Mobile camera QR barcode engine)
- **Audit Reports**: `jspdf` for official printable PDFs and dynamic CSV data streams
- **UI & Micro-interactions**: `lucide-react` icons and `canvas-confetti`

---

## Role Features

### 1. Administrator (`/admin`)
- **Institution Overview**: Total active students, faculty, departments, and logged attendance counts.
- **Faculty Onboarding**: Add faculty members, allocate departments, and configure credentials.
- **Student Roster & Bulk CSV Import**: Upload entire student cohorts via CSV with one click (sample template included).
- **Academic Hierarchy**: Configure departments, courses, credits, and section cohorts.
- **Institution Reports**: Audit attendance across branches, download official printable PDF reports and CSV registers.

### 2. Faculty (`/faculty`)
- **Teaching Schedule**: Real-time view of daily assigned lectures and section allocations.
- **Academic Calendar**: Manage term dates, continuous internal evaluations (IA-1 / IA-2), tech symposiums (INVICTUS), and holidays.
- **Timetable Management**: Schedule new lectures with recurring weekly timetable repetition.
- **Live Attendance Engine (`/faculty/classes/[id]/session`)**:
  - Start time-bound attendance with customizable countdowns (2, 5, 10, 15 min).
  - High-res QR code with center branding and 6-digit fallback PIN.
  - Optional anti-screenshot dynamic QR refresh (every 15s).
  - Live real-time stream of students marking present.
  - Manual override dialog to grant Present, Late, or Excused status.
  - Fullscreen Projector Mode for smart classroom projection.
- **Faculty Reports**: Course-wise matrix identifying students below 75% attendance.

### 3. Student (`/student`)
- **Student Dashboard**: Today's timetable, overall attendance %, subject-wise progress bars.
- **75% University Alert Banner**: Prominent warning triggered whenever cumulative or subject attendance falls below the mandatory 75% threshold.
- **Mobile QR Scanner (`/student/scan`)**: Camera barcode scanning + 6-digit fallback code input with instant confetti confirmation.
- **Attendance History (`/student/history`)**: Chronological audit trail of marked sessions with timestamps, method (QR / PIN / Faculty Override), and network IP.

---

## Security & Verification Logic
- **Server-Side Validation Only**: Client clocks are never trusted. All checks compare against server timestamps and DB session `expires_at`.
- **HMAC Signatures**: QR tokens contain cryptographically signed SHA-256 HMAC tokens.
- **Strict Enrollment Check**: Rejects any student attempting to mark attendance for a class section they are not officially enrolled in.
- **Duplicate Prevention**: Database unique constraints (`session_id`, `student_id`) prevent duplicate marking.
- **Rate-Limiting**: Limits scan attempts per IP and student ID to thwart brute-force attempts.
- **Late Marking Logic**: Configurable late threshold automatically flags submissions past the grace period.

---

## Setup & Local Development

### 1. Clone & Install
```bash
git clone <repo-url>
cd "Class Track"
npm install
```

### 2. Environment Configuration
Copy the example environment configuration:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-key-here
TOKEN_SIGNING_SECRET=yenepoya-set-class-track-secret-2024
```
*(Note: If Supabase credentials are not provided, Class Track automatically falls back to an integrated, persistent demo database pre-seeded with 1 Admin, 2 Faculty, and 10 Students so all functionality works out of the box).*

### 3. Database Migration (Supabase)
Run the migration script in your Supabase SQL Editor:
- Schema & RLS: [`supabase/migrations/001_initial_schema.sql`](file:///c:/Class%20Track/supabase/migrations/001_initial_schema.sql)
- Seed Data: [`supabase/seed.sql`](file:///c:/Class%20Track/supabase/seed.sql)

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials (1-Click Login available on `/login`)
- **Administrator**: `admin@yenepoya.edu.in` (Dr. Gangadhara Rao - Principal)
- **Faculty 1**: `dr.kavitha@yenepoya.edu.in` (Dr. Kavitha Mahesh - Prof. CSE)
- **Faculty 2**: `prof.rohit@yenepoya.edu.in` (Prof. Rohit Shenoy - Asst. Prof. ISE)
- **Student 1**: `mohammed.faizan@yenepoya.edu.in` (Mohammed Faizan - 4YE21CS045)
- **Student 2**: `ayesha.siddeeq@yenepoya.edu.in` (Ayesha Siddeeq - 4YE21CS012)
- *(Plus 8 additional enrolled student profiles)*

---

## Deploy to Vercel
1. Push repository to GitHub or GitLab.
2. Import project in [Vercel](https://vercel.com).
3. Set the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TOKEN_SIGNING_SECRET`).
4. Click **Deploy**.
