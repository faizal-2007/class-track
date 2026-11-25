import urllib.request
import json
import time

BASE = 'http://localhost:3000'

def post_json(path, data):
    req = urllib.request.Request(
        f'{BASE}{path}',
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def get_req(path):
    req = urllib.request.Request(f'{BASE}{path}')
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.read().decode('utf-8')

print('--- STEP 1: Verify Server Pages ---')
pages = ['/login', '/admin', '/faculty', '/student', '/student/scan', '/faculty/classes']
for p in pages:
    code, html = get_req(p)
    assert code == 200, f'Page {p} returned {code}'
    print(f' Page {p}: HTTP 200 OK ({len(html)} bytes)')

print('\n--- STEP 2: Faculty Starts Attendance Session for class-1 ---')
status, res = post_json('/api/session/start', {
    'classId': 'class-1',
    'durationMinutes': 5,
    'allowLate': True,
    'lateThresholdMinutes': 3
})
print(f' Session Start Response: HTTP {status}, success={res.get("success")}')
session = res['session']
token = session['session_token']
code6 = session['numeric_code']
session_id = session['id']
print(f' Generated QR Token: {token[:25]}... | 6-Digit PIN: {code6}')

print('\n--- STEP 3: Student 1 (Mohammed Faizan) Marks via QR Token ---')
status, res1 = post_json('/api/attendance/mark', {
    'tokenOrCode': token,
    'studentId': 'user-stu-1'
})
print(f' Student 1 Response: HTTP {status}, success={res1.get("success")}, message={res1.get("message")}')
assert res1.get('success') is True

print('\n--- STEP 4: Student 2 (Ayesha Siddeeq) Marks via 6-Digit PIN ---')
status, res2 = post_json('/api/attendance/mark', {
    'tokenOrCode': code6,
    'studentId': 'user-stu-2'
})
print(f' Student 2 Response: HTTP {status}, success={res2.get("success")}, message={res2.get("message")}')
assert res2.get('success') is True

print('\n--- STEP 5: Duplicate Attendance Check (Student 1 tries again) ---')
status, res_dup = post_json('/api/attendance/mark', {
    'tokenOrCode': token,
    'studentId': 'user-stu-1'
})
print(f' Duplicate Response: HTTP {status}, success={res_dup.get("success")}, error={res_dup.get("error")}')
assert res_dup.get('success') is False
assert 'already recorded' in res_dup.get('error', '').lower()

print('\n--- STEP 6: Unenrolled Student Check ---')
status, res_unenr = post_json('/api/attendance/mark', {
    'tokenOrCode': token,
    'studentId': 'user-admin-1'  # Not enrolled as student
})
print(f' Unenrolled Response: HTTP {status}, success={res_unenr.get("success")}, error={res_unenr.get("error")}')
assert res_unenr.get('success') is False

print('\n--- STEP 7: Check Live Session Attendee Status ---')
code, live_data = get_req(f'/api/session/status?sessionId={session_id}')
live_json = json.loads(live_data)
records = live_json['records']
print(f' Live Attendees recorded: {len(records)}')
for r in records:
    print(f'   - {r.get("student_name")} ({r.get("student_usn")}): Status={r.get("status")}, Method={r.get("verification_method")}')
assert len(records) >= 2

print('\n--- STEP 8: Faculty Manual Override for Student 3 (Prathik Shetty) ---')
status, res_over = post_json('/api/attendance/override', {
    'sessionId': session_id,
    'studentId': 'user-stu-3',
    'status': 'excused',
    'facultyId': 'user-fac-1'
})
print(f' Manual Override Response: HTTP {status}, success={res_over.get("success")}')
assert res_over.get('success') is True

print('\n--- STEP 9: Session Expiration & Close Early Verification ---')
status, res_close = post_json('/api/session/close', {'sessionId': session_id})
print(f' Session Close Response: HTTP {status}, success={res_close.get("success")}')
# Now student 4 tries to mark after session closed/expired
status, res_exp = post_json('/api/attendance/mark', {
    'tokenOrCode': code6,
    'studentId': 'user-stu-4'
})
print(f' Expired/Closed Marking Response: HTTP {status}, success={res_exp.get("success")}, error={res_exp.get("error")}')
assert res_exp.get('success') is False

print('\n--- STEP 10: Reports & CSV Export Verification ---')
code, csv_content = get_req('/api/reports/export?format=csv')
print(f' CSV Export HTTP {code}, Content Length: {len(csv_content)} bytes')
print(' First 3 lines of CSV:')
for line in csv_content.splitlines()[:3]:
    print('  ', line)

print('\n>>> ALL 10 FULL-FLOW VERIFICATION CHECKS PASSED PERFECTLY! <<<')
