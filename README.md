# PPG Training Management Portal — React + Apps Script API

Fast React/Vite frontend backed by Google Apps Script + Google Sheets.

## Architecture

```text
React + Vite
   ↓ HTTPS POST
Google Apps Script Web App
   ↓
Google Sheets
```

The React app does **not** use `google.script.run`. It calls the Apps Script Web App through `fetch()`.

## Performance improvements included

- Removed the unused startup `getAppConfig()` API request.
- Client-side read caching with request de-duplication.
- Apps Script server-side `CacheService` caching.
- Batch spreadsheet reads/writes instead of cell-by-cell writes.
- Attendance saves now use one read + one write.
- Test/Post-Test saves use one range write.
- Dashboard date calculations use one date-row read instead of one request per day.
- Actual student rows are detected instead of reading all formatted rows.
- Student Performance loads all test blocks from one test-row read instead of 17 separate scans.
- Cache invalidation happens automatically after writes.
- Login data reads only the populated Users rows.
- Session is stored in `sessionStorage`, so browser refresh does not force a new login.
- API timeout and retry/error states prevent pages from staying on infinite Loading.

## Project structure

```text
PPG-Training-Portal-React/
├── public/
│   └── ppg-logo.jpg
├── src/
│   ├── components/
│   │   ├── Common.jsx
│   │   ├── Layout.jsx
│   │   └── Login.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Attendance.jsx
│   │   ├── Syllabus.jsx
│   │   ├── Tests.jsx
│   │   ├── PostTest.jsx
│   │   ├── MockInterview.jsx
│   │   ├── Performance.jsx
│   │   └── SimpleTables.jsx
│   ├── services/
│   │   └── appsScript.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── Code(1).gs
├── .env.example
├── package.json
└── index.html
```

## 1. Google Sheet

The supplied workbook is:

```text
PPG - 5th Aug 2026 (with Users sheet) (1).xlsx
```

Upload it to Google Drive and open it with Google Sheets.

The expected tabs are:

```text
Users
Syllabus_Tracker
Dashboard
PreTest & Regular Test
Attendance_CSE,IT,AI&ML,AI&DS,E
Pre-Post-Comparison
PostTest_Report
MockInterview
Analysis
Student Data
Pre-Test-Full Report
Feedback
```

The tab names must match `SHEETS` in `Code(1).gs`.

## 2. Apps Script configuration

Open `Code(1).gs` and set:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_GOOGLE_SHEET_ID',
  ...
};
```

Use the Spreadsheet ID from the Google Sheet URL.

Example:

```text
https://docs.google.com/spreadsheets/d/1ABC123XYZ/edit
                                      ^^^^^^^^^^^
                                      Spreadsheet ID
```

Do not put the `.xlsx` filename here.

## 3. Deploy Apps Script

Create/open an Apps Script project and paste the complete contents of:

```text
Code(1).gs
```

Then:

```text
Deploy
→ New deployment
→ Web app
```

Use the access setting required by your organization.

Copy the `/exec` URL.

## 4. React environment

Create `.env.local`:

```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Do not commit `.env.local`.

## 5. Install and run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## 6. User sheet

The `Users` tab expects:

```text
User ID
Password
Name
Role
Employee ID
Status
```

Example roles currently supported:

```text
Trainer
Management
```

Only:

```text
Status = Active
```

can log in.

### Security note

The current project keeps the existing plain-text password contract so it remains compatible with the supplied spreadsheet. For production internet-facing deployment, password hashing/authentication should be moved to a proper backend.

## 7. Functional modules

### Trainer

- Dashboard
- Attendance
- Add Student
- Syllabus update
- Pre-Test / Tests
- Post-Test
- Mock Interview
- Student Performance
- Pre vs Post
- Feedback
- Analysis
- Reports

### Management

The UI is read-only for trainer-controlled write actions.

## 8. Important sheet structures

### Student Data

```text
S. NO
REGSITER NUMBER
STUDENTS NAME
DEPARTMENT
```

The backend also accepts the corrected header:

```text
REGISTER NUMBER
```

### Attendance

The backend uses:

```text
H4 = Total Training Days
H5 = Training Start Date
M6 = Total Strength
Row 11 = Training dates
Row 14+ = Students
A = S.No
B = Department
C = Student Name
D+ = Attendance
```

### PreTest & Regular Test

Student columns:

```text
A = S.No
B = Department
C = Student Name
```

Assessment blocks are configured in `TEST_BLOCKS` inside `Code(1).gs`.

### Post-Test

```text
Row 5 = headers
Row 6+ = students
A = S.No
B = Reg. No
C = Student Name
D = MCQ
E = 2 Marks
F = Coding
G = Total
H = Percentage
```

### Mock Interview

```text
Row 6+ = students
A = S.No
B = Reg. No
C = Student Name
D = Score
E = Percentage
```

## 9. Why this version is faster

The original implementation repeatedly accessed Google Sheets in loops.

For example, saving attendance could perform one spreadsheet write per student.

The optimized implementation builds the complete attendance column in memory and writes it once:

```text
React
  ↓
1 API request
  ↓
Apps Script
  ↓
1 read + 1 write
  ↓
Google Sheet
```

Student Performance was also optimized from approximately:

```text
17 test scans + additional sheet scans
```

to:

```text
1 test sheet scan + required result reads
```

The frontend also prevents duplicate requests when React development mode mounts an effect twice.

## 10. Cache behavior

Read data is cached briefly.

Typical client/server cache periods:

```text
Dashboard       15 sec
Attendance      10 sec
Tests           15 sec
Post-Test       15 sec
Mock Interview  15 sec
Students        120 sec
Syllabus        60 sec
Reports         60 sec
Feedback        60 sec
Analysis        60 sec
```

A successful write invalidates the cache namespace so the next read gets fresh spreadsheet data.

## 11. If a page shows Loading

Every major page now exposes an API error and Retry button.

Check:

1. Apps Script deployment is the latest version.
2. `VITE_APPS_SCRIPT_URL` points to `/exec`.
3. Spreadsheet ID is correct.
4. Sheet tab names match `SHEETS`.
5. Apps Script deployment access allows the intended users.
6. Browser console for API errors.

After changing `Code(1).gs`, create/update the Apps Script deployment version before testing the React site.

## 12. Final request flow

```text
index.html
   ↓
main.jsx
   ↓
App.jsx
   ↓
Page Component
   ↓
src/services/appsScript.js
   ↓
fetch()
   ↓
Apps Script doPost()
   ↓
Google Sheets
```

The `.xlsx` workbook is supplied as the source data template. The live portal should use the converted Google Spreadsheet.
