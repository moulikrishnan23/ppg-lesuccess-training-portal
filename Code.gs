/****************************************************
 * PPG TRAINING MANAGEMENT PORTAL
 * GOOGLE APPS SCRIPT BACKEND
 * Built on top of the existing "PPG - 5th Aug 2026"
 * Google Sheet (live backend database).
 ****************************************************/

/***********************
 * CONFIGURATION
 ***********************/

const CONFIG = {
  SPREADSHEET_ID: '1_6qI1gHdf_YuW8pveRpPRH5a_th6Ak3Oy_Obllpf1N4',   // <-- paste the live Google Sheet ID here
  SESSION_TIMEOUT_SECONDS: 21600,                  // 6 hours
  TIMEZONE: 'Asia/Kolkata',
  LOGO_URL: 'PUT_LOGO_URL_HERE',                   // PPG crest logo (see notes at end of file)
  PARTNER_LOGO_URL: 'PUT_PARTNER_LOGO_URL_HERE',   // LeSuccess logo (see notes at end of file)
  APP_NAME: 'PPG Training Management Portal',
  CACHE_TTL: {
    DASHBOARD: 0,
    STUDENTS: 0,
    ATTENDANCE: 0,
    SYLLABUS: 0,
    TESTS: 0,
    POST_TEST: 0,
    MOCK_INTERVIEW: 0,
    PRE_POST: 0,
    ANALYSIS: 0,
    FEEDBACK: 0,
    REPORTS: 0,
    STUDENT_DETAIL: 0
  }
};

/***********************
 * SHEET CONFIGURATION
 ***********************/

const SHEETS = {
  USERS: 'Users',
  DASHBOARD: 'Dashboard',
  SYLLABUS: 'Syllabus_Tracker',
  TESTS: 'PreTest & Regular Test',
  ATTENDANCE: 'Attendance_CSE,IT,AI&ML,AI&DS,E',
  PRE_POST: 'Pre-Post-Comparison',
  POST_TEST: 'PostTest_Report',
  MOCK_INTERVIEW: 'MockInterview',
  ANALYSIS: 'Analysis',
  STUDENTS: 'Student Data',
  PRE_TEST_REPORT: 'Pre-Test-Full Report',
  FEEDBACK: 'Feedback'
};

// Test blocks inside the "PreTest & Regular Test" sheet.
// The sheet packs 4 assessments side by side (see header row 5).
/***********************
 * TEST BLOCKS
 * Pre Test 1 + Test 2 to Test 17
 ***********************/

const TEST_BLOCKS = [

  {
    id: 'PRE_TEST_1',
    label: 'Pre Test 1',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 4,
    cols: ['MCQ', '2 Marks', 'Coding', 'Total', 'Percentage'],
    editableCols: ['MCQ', '2 Marks', 'Coding']
  },

  {
    id: 'TEST_2',
    label: 'Test 2',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 10,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_3',
    label: 'Test 3',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 14,
    cols: ['2 Marks', 'Aptitude', 'Total'],
    editableCols: ['2 Marks', 'Aptitude']
  },

  {
    id: 'TEST_4',
    label: 'Test 4',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 18,
    cols: ['Present/Absent', 'Coding', 'Total'],
    editableCols: ['Present/Absent', 'Coding']
  },

  {
    id: 'TEST_5',
    label: 'Test 5',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 21,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_6',
    label: 'Test 6',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 24,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_7',
    label: 'Test 7',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 27,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_8',
    label: 'Test 8',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 30,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_9',
    label: 'Test 9',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 33,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_10',
    label: 'Test 10',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 36,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_11',
    label: 'Test 11',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 39,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_12',
    label: 'Test 12',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 42,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_13',
    label: 'Test 13',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 45,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_14',
    label: 'Test 14',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 48,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_15',
    label: 'Test 15',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 51,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_16',
    label: 'Test 16',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 54,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  },

  {
    id: 'TEST_17',
    label: 'Test 17',
    headerRow: 1,
    dataStartRow: 6,
    startCol: 57,
    cols: ['2 Marks', 'Coding', 'Total'],
    editableCols: ['2 Marks', 'Coding']
  }

];

const ATTENDANCE_STATUSES = [
  'Present',
  'Absent',
  'Half Day'
];

/***********************
 * APPLICATION ENTRY
 ***********************/

/**
 * HTTP API entry point for the React frontend.
 *
 * React is hosted separately (Vite/Vercel/etc.), so this Apps Script project
 * is now an API-only backend. The old HtmlService doGet() has intentionally
 * been replaced.
 */
function doGet(e) {
  return jsonResponse_({
    success: true,
    appName: CONFIG.APP_NAME,
    message: 'PPG Training Management API is running.'
  });
}

/**
 * React sends JSON using Content-Type: text/plain;charset=utf-8.
 * That avoids the browser preflight request that commonly causes CORS
 * failures with Apps Script web apps. The frontend also follows the Apps
 * Script redirect.
 */
function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};

    const action = normalizeValue_(body.action);
    const args = Array.isArray(body.args) ? body.args : [];

    const publicActions = {
      getAppConfig: getAppConfig,
      login: login,
      logout: logout,
      validateSession: validateSession,
      getDashboardData: getDashboardData,
      getStudents: getStudents,
      getStudentById: getStudentById,
      addStudent: addStudent,
      getAttendance: getAttendance,
      saveAttendance: saveAttendance,
      getSyllabus: getSyllabus,
      saveSyllabusUpdate: saveSyllabusUpdate,
      getTestData: getTestData,
      saveTestMarks: saveTestMarks,
      getPostTestData: getPostTestData,
      savePostTest: savePostTest,
      getMockInterviewData: getMockInterviewData,
      saveMockInterview: saveMockInterview,
      getPrePostComparison: getPrePostComparison,
      getAnalysisData: getAnalysisData,
      getFeedback: getFeedback,
      getReports: getReports,
      getBackendInfo: getBackendInfo
    };

    if (!action || !publicActions[action]) {
      return jsonResponse_({
        success: false,
        message: 'Unknown or unsupported API action.'
      });
    }

    const result = publicActions[action].apply(null, args);
    return jsonResponse_(result);
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);

    return jsonResponse_({
      success: false,
      message: err && err.message ? err.message : 'Server error.',
      error: err && err.message ? err.message : String(err)
    });
  }
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload === undefined ? null : payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getBackendInfo() {
  const ss = getSpreadsheet_();
  return {
    success: true,
    spreadsheetId: CONFIG.SPREADSHEET_ID,
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    scriptTime: new Date().toISOString(),
    sheets: ss.getSheets().map(function(s) { return s.getName(); })
  };
}

function getAppConfig() {
  return {
    appName: CONFIG.APP_NAME,
    logoUrl: CONFIG.LOGO_URL,
    partnerLogoUrl: CONFIG.PARTNER_LOGO_URL
  };
}


/***********************
 * LOGIN / SESSION
 ***********************/

function login(userId, password) {
  userId = normalizeValue_(userId);
  password = String(password || '');

  if (!userId || !password) {
    return { success: false, message: 'Please enter both User ID and Password.' };
  }

  const sheet = getSheet_(SHEETS.USERS);
  const lastRow = findLastNamedRow_(sheet, 2, 1);
  if (lastRow < 2) {
    return { success: false, message: 'No users are configured.' };
  }

  const data = sheet.getRange(1, 1, lastRow, 6).getValues();
  const headers = data[0].map(normalizeValue_);

  const colUserId = findColumn_(headers, 'User ID');
  const colPassword = findColumn_(headers, 'Password');
  const colName = findColumn_(headers, 'Name');
  const colRole = findColumn_(headers, 'Role');
  const colEmpId = findColumn_(headers, 'Employee ID');
  const colStatus = findColumn_(headers, 'Status');

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowUserId = normalizeValue_(row[colUserId]);
    if (rowUserId && rowUserId.toUpperCase() === userId.toUpperCase()) {
      const rowStatus = normalizeValue_(row[colStatus]);
      if (rowStatus.toUpperCase() !== 'ACTIVE') {
        return { success: false, message: 'This account is inactive. Please contact the administrator.' };
      }

      if (String(row[colPassword] ?? '') !== password) {
        return { success: false, message: 'Login failed. Please check User ID and Password.' };
      }

      const user = {
        userId: rowUserId,
        name: normalizeValue_(row[colName]),
        role: normalizeValue_(row[colRole]),
        employeeId: normalizeValue_(row[colEmpId])
      };

      return {
        success: true,
        sessionToken: createSession_(user),
        user: user
      };
    }
  }

  return { success: false, message: 'Login failed. Please check User ID and Password.' };
}

function logout(sessionToken) {
  destroySession_(sessionToken);
  return { success: true };
}

function validateSession(sessionToken) {
  const user = getCurrentUser(sessionToken);
  return {
    valid: !!user,
    user: user
  };
}

/*
 * Session storage
 *
 * IMPORTANT:
 * CacheService is not a reliable source of truth for authentication
 * sessions because cached values may be evicted before their requested
 * expiration time. That was the reason users could unexpectedly receive
 * SESSION_EXPIRED after a refresh or after the cache was cleared.
 *
 * Authentication sessions are therefore stored in Script Properties.
 * The session value contains:
 *   - user: safe user profile only (never the password)
 *   - expiresAt: absolute expiry timestamp
 *
 * The session uses a sliding timeout: an active session is extended when
 * it is close to expiry. This keeps active users logged in while still
 * expiring abandoned sessions.
 */

const SESSION_PROPERTY_PREFIX_ = 'PPG_SESSION_';
const SESSION_REFRESH_WINDOW_MS_ = 30 * 60 * 1000; // refresh when < 30 min remain

function getSessionPropertyKey_(sessionToken) {
  return SESSION_PROPERTY_PREFIX_ + String(sessionToken);
}

function getCurrentUser(sessionToken) {
  if (!sessionToken) return null;

  const key = getSessionPropertyKey_(sessionToken);
  const properties = PropertiesService.getScriptProperties();
  const raw = properties.getProperty(key);

  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    const now = Date.now();

    if (!session || !session.user || !session.expiresAt) {
      properties.deleteProperty(key);
      return null;
    }

    if (Number(session.expiresAt) <= now) {
      properties.deleteProperty(key);
      return null;
    }

    /*
     * Refresh only when the session is close to expiry. This avoids
     * rewriting Script Properties on every API request.
     */
    if (Number(session.expiresAt) - now <= SESSION_REFRESH_WINDOW_MS_) {
      session.expiresAt =
        now + (CONFIG.SESSION_TIMEOUT_SECONDS * 1000);

      properties.setProperty(key, JSON.stringify(session));
    }

    return session.user;
  } catch (e) {
    properties.deleteProperty(key);
    return null;
  }
}

function createSession_(user) {
  const token = Utilities.getUuid();
  const expiresAt =
    Date.now() + (CONFIG.SESSION_TIMEOUT_SECONDS * 1000);

  const session = {
    user: user,
    expiresAt: expiresAt
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      getSessionPropertyKey_(token),
      JSON.stringify(session)
    );

  return token;
}

function destroySession_(sessionToken) {
  if (!sessionToken) return;

  PropertiesService
    .getScriptProperties()
    .deleteProperty(
      getSessionPropertyKey_(sessionToken)
    );
}


/***********************
 * SECURITY
 ***********************/

function requireLogin_(sessionToken) {
  const user = getCurrentUser(sessionToken);
  if (!user) {
    throw new Error('SESSION_EXPIRED');
  }
  return user;
}

function requireTrainer_(sessionToken) {
  const user = requireLogin_(sessionToken);
  if (user.role !== 'Trainer') {
    throw new Error('PERMISSION_DENIED: Only trainers can perform this action.');
  }
  return user;
}


/***********************
 * DASHBOARD
 ***********************/

function getDashboardData(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'dashboard',
    CONFIG.CACHE_TTL.DASHBOARD,
    function() {
      const dash = getSheet_(SHEETS.DASHBOARD);

      const summary = dash.getRangeList([
        'A8', 'D8', 'A11', 'D11', 'A14', 'D14', 'A22', 'C22', 'B18'
      ]).getRanges().map(function(range) {
        return range.getValue();
      });

      const kpis = {
        totalStudents: safeNum_(summary[8]) || countStudentRows_(),
        preTestConducted: safeNum_(summary[0]),
        preTestAverage: toPercent_(summary[1]),
        postTestConducted: safeNum_(summary[2]),
        postTestAverage: toPercent_(summary[3]),
        overallAttendancePct: toPercent_(summary[4]),
        averageImprovement: toPercent_(summary[5]),
        mockInterviewAttended: safeNum_(summary[6]),
        mockInterviewAvgScore: toPercent_(summary[7])
      };

      const deptRange = dash.getRange(25, 1, 6, 2).getValues();
      const departmentSummary = deptRange
        .filter(function(r) { return normalizeValue_(r[0]); })
        .map(function(r) {
          return {
            department: normalizeValue_(r[0]),
            count: safeNum_(r[1])
          };
        });

      const topRange = dash.getRange(15, 10, 10, 4).getValues();
      const topStudents = topRange
        .filter(function(r) { return normalizeValue_(r[1]); })
        .map(function(r) {
          return {
            rank: safeNum_(r[0]),
            name: normalizeValue_(r[1]),
            department: normalizeValue_(r[3])
          };
        });

      return {
        kpis: Object.assign({}, kpis, getAttendanceTodaySummary_()),
        departmentSummary: departmentSummary,
        topStudents: topStudents
      };
    }
  );
}

function getAttendanceTodaySummary_() {
  const sheet = getSheet_(SHEETS.ATTENDANCE);
  const meta = readAttendanceMeta_(sheet);
  const today = new Date();

  const dateCount = Math.max(meta.lastDateCol - meta.firstDateCol + 1, 0);
  const dateValues = dateCount
    ? sheet.getRange(meta.dateRow, meta.firstDateCol, 1, dateCount).getValues()[0]
    : [];

  // Row 12 contains the actual day type generated by the Attendance sheet
  // formula: "Training Day" for training dates and "Off" for non-training dates.
  // The dashboard must count only "Training Day" entries.
  const dayStatusValues = dateCount
    ? sheet.getRange(12, meta.firstDateCol, 1, dateCount).getDisplayValues()[0]
    : [];

  const targetKey = Utilities.formatDate(today, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  let col = null;
  let completed = 0;
  let totalTrainingDays = 0;

  for (let i = 0; i < dateValues.length; i++) {
    const v = dateValues[i];
    if (!(v instanceof Date)) continue;

    const dayStatus = normalizeValue_(dayStatusValues[i]);
    const isTrainingDay = dayStatus === 'Training Day';

    // Count only actual training days. "Off" / non-training days are ignored.
    if (isTrainingDay) {
      totalTrainingDays++;
      if (v <= today) completed++;
    }

    const key = Utilities.formatDate(v, CONFIG.TIMEZONE, 'yyyy-MM-dd');
    if (key === targetKey && isTrainingDay) {
      col = meta.firstDateCol + i;
    }
  }

  const result = {
    presentToday: 0,
    absentToday: 0,
    halfDayToday: 0,
    trainingDay: completed,
    totalTrainingDays: totalTrainingDays,
    completedDays: completed,
    remainingDays: Math.max(totalTrainingDays - completed, 0)
  };

  if (col && meta.totalStrength > 0) {
    const values = sheet.getRange(meta.dataStartRow, col, meta.totalStrength, 1).getValues();
    values.forEach(function(r) {
      const v = normalizeValue_(r[0]);
      if (v === 'Present') result.presentToday++;
      else if (v === 'Absent') result.absentToday++;
      else if (v === 'Half Day') result.halfDayToday++;
    });
  }

  return result;
}

function getStudents(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'students',
    CONFIG.CACHE_TTL.STUDENTS,
    function() {
      const sheet = getSheet_(SHEETS.STUDENTS);
      const lastRow = findLastNamedRow_(sheet, 2, 3);
      if (lastRow < 2) return [];

      const data = sheet.getRange(1, 1, lastRow, 4).getValues();
      const headers = data[0].map(normalizeValue_);

      const colSNo = findColumn_(headers, 'S. NO');
      const regHeaderIndex = findColumn_(headers, 'REGSITER NUMBER');
      const colReg = regHeaderIndex !== -1
        ? regHeaderIndex
        : findColumn_(headers, 'REGISTER NUMBER');
      const colName = findColumn_(headers, 'STUDENTS NAME');
      const colDept = findColumn_(headers, 'DEPARTMENT');

      if (colName < 0 || colReg < 0) {
        throw new Error('Student Data sheet headers are missing.');
      }

      const students = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const name = normalizeValue_(row[colName]);
        if (!name) continue;

        students.push({
          sNo: safeNum_(row[colSNo]),
          registerNumber: canonicalRegisterNumber_(row[colReg]),
          name: name,
          department: normalizeValue_(row[colDept])
        });
      }

      return students;
    }
  );
}

function getStudentById(sessionToken, registerNumber) {
  requireLogin_(sessionToken);
  const key = 'student_' + canonicalRegisterNumber_(registerNumber);

  return cacheGetOrSet_(
    key,
    CONFIG.CACHE_TTL.STUDENT_DETAIL,
    function() {
      const students = getStudents(sessionToken);
      const targetRegisterNumber = canonicalRegisterNumber_(registerNumber);

      const student = students.find(function(s) {
        return canonicalRegisterNumber_(s.registerNumber) === targetRegisterNumber;
      });

      if (!student) return null;

      const testRows = getAllTestRowsForStudent_(student);

      return {
        student: student,
        attendance: getAttendanceSummaryForStudent_(student),
        preTest: testRows.PRE_TEST_1 || {},
        tests: TEST_BLOCKS
          .filter(function(b) { return b.id !== 'PRE_TEST_1'; })
          .map(function(b) {
            return Object.assign(
              { blockId: b.id, blockLabel: b.label },
              testRows[b.id] || {}
            );
          }),
        postTest: getPostTestRowForStudent_(student),
        mockInterview: getMockInterviewRowForStudent_(student),
        feedback: getFeedbackForStudent_(student)
      };
    }
  );
}

function getAllTestRowsForStudent_(student) {
  const sheet = getSheet_(SHEETS.TESTS);
  const dataStartRow = 6;
  const lastRow = findLastNamedRow_(sheet, dataStartRow, 3);
  const numRows = lastRow - dataStartRow + 1;

  if (numRows <= 0) return {};

  const names = sheet.getRange(dataStartRow, 3, numRows, 1).getValues();
  const targetName = normalizeValue_(student && student.name).toUpperCase();

  let studentIndex = -1;
  for (let i = 0; i < names.length; i++) {
    if (normalizeValue_(names[i][0]).toUpperCase() === targetName) {
      studentIndex = i;
      break;
    }
  }

  if (studentIndex < 0) return {};

  const maxCol = Math.max.apply(
    null,
    TEST_BLOCKS.map(function(b) {
      return b.startCol + b.cols.length - 1;
    })
  );

  const row = sheet
    .getRange(dataStartRow + studentIndex, 4, 1, maxCol - 3)
    .getValues()[0];

  const result = {};

  TEST_BLOCKS.forEach(function(block) {
    const resultRow = {};

    block.cols.forEach(function(colName, ci) {
      const absoluteCol = block.startCol + ci;
      resultRow[colName] = row[absoluteCol - 4] !== undefined
        ? row[absoluteCol - 4]
        : '';
    });

    result[block.id] = resultRow;
  });

  return result;
}

function addStudent(sessionToken, data) {
  requireTrainer_(sessionToken);

  data = data || {};
  const name = normalizeValue_(data.name);
  const registerNumber = canonicalRegisterNumber_(data.registerNumber);
  const department = normalizeValue_(data.department);

  if (!name || !registerNumber) {
    return { success: false, message: 'Student Name and Register Number are required.' };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const existing = getStudents(sessionToken).some(function(s) {
      return canonicalRegisterNumber_(s.registerNumber) === registerNumber;
    });

    if (existing) {
      return { success: false, message: 'A student with this Register Number already exists.' };
    }

    const sdSheet = getSheet_(SHEETS.STUDENTS);
    const sdLastRow = findLastNamedRow_(sdSheet, 2, 3);
    const nextSNo = sdLastRow >= 2
      ? safeNum_(sdSheet.getRange(sdLastRow, 1).getValue()) + 1
      : 1;

    sdSheet.getRange(sdLastRow + 1, 1, 1, 4).setValues([
      [nextSNo, registerNumber, name, department]
    ]);

    const attSheet = getSheet_(SHEETS.ATTENDANCE);
    const meta = readAttendanceMeta_(attSheet);
    const attLastDataRow = findLastAttendanceRow_(attSheet, meta);
    const attNextSNo = attLastDataRow >= meta.dataStartRow
      ? safeNum_(attSheet.getRange(attLastDataRow, 1).getValue()) + 1
      : 1;

    attSheet.getRange(attLastDataRow + 1, 1, 1, 3).setValues([
      [attNextSNo, department, name]
    ]);
    attSheet.getRange('M6').setValue(safeNum_(attSheet.getRange('M6').getValue()) + 1);

    const testSheet = getSheet_(SHEETS.TESTS);
    const testLastRow = findLastNamedRow_(testSheet, 6, 3);
    const testNextSNo = testLastRow >= 6
      ? safeNum_(testSheet.getRange(testLastRow, 1).getValue()) + 1
      : 1;

    testSheet.getRange(testLastRow + 1, 1, 1, 3).setValues([
      [testNextSNo, department, name]
    ]);

    SpreadsheetApp.flush();

    invalidateCaches_([
      'students', 'dashboard', 'attendance', 'tests',
      'post_test', 'mock_interview', 'pre_post',
      'analysis', 'feedback', 'reports'
    ]);

    return { success: true, message: 'Student added successfully.' };
  } finally {
    lock.releaseLock();
  }
}

function findLastAttendanceRow_(sheet, meta) {
  const numRows = meta.totalStrength || 200;
  const names = sheet.getRange(meta.dataStartRow, 3, Math.max(numRows, 200), 1).getValues();
  let last = meta.dataStartRow - 1;
  for (let i = 0; i < names.length; i++) {
    if (normalizeValue_(names[i][0])) last = meta.dataStartRow + i;
  }
  return last;
}

function findLastNamedRow_(sheet, dataStartRow, nameCol) {
  const lastRow = Math.max(sheet.getLastRow(), dataStartRow);
  const numRows = lastRow - dataStartRow + 1;
  if (numRows <= 0) return dataStartRow - 1;
  const names = sheet.getRange(dataStartRow, nameCol, numRows, 1).getValues();
  let last = dataStartRow - 1;
  for (let i = 0; i < names.length; i++) {
    if (normalizeValue_(names[i][0])) last = dataStartRow + i;
  }
  return last;
}


/***********************
 * ATTENDANCE
 ***********************/

function readAttendanceMeta_(sheet) {
  const metaValues = sheet.getRangeList(['H4', 'H5', 'M6']).getRanges().map(function(range) {
    return range.getValue();
  });

  const totalTrainingDays = Math.max(safeNum_(metaValues[0]), 0);
  const startDate = metaValues[1];
  const totalStrength = Math.max(safeNum_(metaValues[2]), 0);

  return {
    dateRow: 11,
    dataStartRow: 14,
    firstDateCol: 4,
    lastDateCol: 3 + Math.max(totalTrainingDays, 1),
    totalTrainingDays: totalTrainingDays,
    totalStrength: totalStrength,
    startDate: startDate
  };
}

function findAttendanceDateColumn_(sheet, meta, targetDate) {
  const targetKey = Utilities.formatDate(new Date(targetDate), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const lastCol = Math.min(meta.lastDateCol, sheet.getMaxColumns());
  const numCols = lastCol - meta.firstDateCol + 1;
  if (numCols <= 0) return null;
  const dateValues = sheet.getRange(meta.dateRow, meta.firstDateCol, 1, numCols).getValues()[0];
  for (let i = 0; i < dateValues.length; i++) {
    const v = dateValues[i];
    if (v instanceof Date) {
      const key = Utilities.formatDate(v, CONFIG.TIMEZONE, 'yyyy-MM-dd');
      if (key === targetKey) return meta.firstDateCol + i;
    }
  }
  return null;
}

function getAttendance(sessionToken, dateStr) {
  requireLogin_(sessionToken);

  const targetDate = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  const dateKey = Utilities.formatDate(targetDate, CONFIG.TIMEZONE, 'yyyy-MM-dd');

  return cacheGetOrSet_(
    'attendance_' + dateKey,
    CONFIG.CACHE_TTL.ATTENDANCE,
    function() {
      const sheet = getSheet_(SHEETS.ATTENDANCE);
      const meta = readAttendanceMeta_(sheet);
      const col = findAttendanceDateColumn_(sheet, meta, targetDate);

      const strength = meta.totalStrength;
      if (!strength) {
        return {
          date: Utilities.formatDate(targetDate, CONFIG.TIMEZONE, 'dd MMM yyyy'),
          dateKey: dateKey,
          withinTrainingPeriod: !!col,
          records: []
        };
      }

      const baseRange = sheet.getRange(meta.dataStartRow, 1, strength, 3).getValues();
      const statusValues = col
        ? sheet.getRange(meta.dataStartRow, col, strength, 1).getValues()
        : [];

      const records = [];
      for (let i = 0; i < baseRange.length; i++) {
        const name = normalizeValue_(baseRange[i][2]);
        if (!name) continue;

        records.push({
          row: meta.dataStartRow + i,
          sNo: safeNum_(baseRange[i][0]),
          department: normalizeValue_(baseRange[i][1]),
          name: name,
          status: col ? normalizeValue_(statusValues[i][0]) : ''
        });
      }

      return {
        date: Utilities.formatDate(targetDate, CONFIG.TIMEZONE, 'dd MMM yyyy'),
        dateKey: dateKey,
        withinTrainingPeriod: !!col,
        records: records
      };
    }
  );
}

function saveAttendance(sessionToken, payload) {
  requireTrainer_(sessionToken);

  payload = payload || {};
  const sheet = getSheet_(SHEETS.ATTENDANCE);
  const meta = readAttendanceMeta_(sheet);
  const targetDate = new Date(String(payload.date || '') + 'T00:00:00');
  const col = findAttendanceDateColumn_(sheet, meta, targetDate);

  if (!col) {
    return { success: false, message: 'Selected date is outside the training period for this batch.' };
  }

  const records = Array.isArray(payload.records) ? payload.records : [];
  if (!records.length) {
    return { success: false, message: 'No attendance records to save.' };
  }

  const current = sheet.getRange(meta.dataStartRow, col, meta.totalStrength, 1).getValues();

  records.forEach(function(rec) {
    const row = safeNum_(rec.row);
    const index = row - meta.dataStartRow;
    if (
      index >= 0 &&
      index < current.length &&
      ATTENDANCE_STATUSES.indexOf(rec.status) !== -1
    ) {
      current[index][0] = rec.status;
    }
  });

  sheet.getRange(meta.dataStartRow, col, meta.totalStrength, 1).setValues(current);
  SpreadsheetApp.flush();

  invalidateCaches_([
    'attendance',
    'dashboard',
    'pre_post',
    'reports',
    'student_'
  ]);

  return {
    success: true,
    message: 'Attendance saved successfully.',
    saved: records.length
  };
}

function getAttendanceSummaryForStudent_(student) {
  const sheet = getSheet_(SHEETS.ATTENDANCE);
  const meta = readAttendanceMeta_(sheet);

  if (meta.totalStrength <= 0) {
    return { present: 0, absent: 0, halfDay: 0, attendancePct: 0 };
  }

  const baseRange = sheet.getRange(
    meta.dataStartRow,
    1,
    meta.totalStrength,
    3
  ).getValues();

  let rowIndex = -1;
  const targetName = normalizeValue_(student.name).toUpperCase();

  for (let i = 0; i < baseRange.length; i++) {
    if (normalizeValue_(baseRange[i][2]).toUpperCase() === targetName) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex === -1) {
    return { present: 0, absent: 0, halfDay: 0, attendancePct: 0 };
  }

  const width = meta.lastDateCol - meta.firstDateCol + 1;
  const rowRange = width > 0
    ? sheet.getRange(
        meta.dataStartRow + rowIndex,
        meta.firstDateCol,
        1,
        width
      ).getValues()[0]
    : [];

  let present = 0;
  let absent = 0;
  let halfDay = 0;

  rowRange.forEach(function(v) {
    const val = normalizeValue_(v);
    if (val === 'Present') present++;
    else if (val === 'Absent') absent++;
    else if (val === 'Half Day') halfDay++;
  });

  const totalMarked = present + absent + halfDay;

  return {
    present: present,
    absent: absent,
    halfDay: halfDay,
    attendancePct: totalMarked
      ? Math.round(((present + halfDay * 0.5) / totalMarked) * 1000) / 10
      : 0
  };
}

function getSyllabusBlocks_() {
  const sheet = getSheet_(SHEETS.SYLLABUS);
  const scanRows = Math.min(sheet.getLastRow(), 3000);
  const colA = sheet.getRange(1, 1, scanRows, 1).getValues();
  const blocks = [];
  for (let i = 0; i < colA.length; i++) {
    const v = normalizeValue_(colA[i][0]);
    if (/^Department\s*\d+/i.test(v)) {
      blocks.push({ department: v, headerRow: i + 2, dataStartRow: i + 3 });
    }
  }
  return blocks;
}

function getSyllabus(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'syllabus',
    CONFIG.CACHE_TTL.SYLLABUS,
    function() {
      const sheet = getSheet_(SHEETS.SYLLABUS);
      const blocks = getSyllabusBlocks_();
      const result = [];
      const sheetLastRow = sheet.getLastRow();
      const now = new Date();

      blocks.forEach(function(block, idx) {
        const nextBlockRow = idx + 1 < blocks.length
          ? blocks[idx + 1].headerRow - 1
          : Math.min(block.dataStartRow + 150, sheetLastRow);

        const maxRows = Math.min(
          nextBlockRow - block.dataStartRow + 1,
          sheetLastRow - block.dataStartRow + 1
        );

        if (maxRows <= 0) return;

        const values = sheet.getRange(block.dataStartRow, 1, maxRows, 4).getValues();
        const days = [];

        for (let i = 0; i < values.length; i++) {
          const day = normalizeValue_(values[i][0]);
          if (!day) continue;

          const topic = normalizeValue_(values[i][2]);
          const dateVal = values[i][1];
          const dateObj = dateVal instanceof Date ? dateVal : null;

          let status = 'Upcoming';
          if (topic && dateObj && dateObj <= now) status = 'Completed';
          else if (topic) status = 'Planned';

          days.push({
            row: block.dataStartRow + i,
            day: day,
            date: dateObj
              ? Utilities.formatDate(dateObj, CONFIG.TIMEZONE, 'dd MMM yyyy')
              : '',
            topic: topic,
            trainer: normalizeValue_(values[i][3]),
            status: status
          });
        }

        result.push({
          department: block.department,
          days: days
        });
      });

      return result;
    }
  );
}

function saveSyllabusUpdate(sessionToken, data) {
  requireTrainer_(sessionToken);

  data = data || {};
  const sheet = getSheet_(SHEETS.SYLLABUS);
  const row = safeNum_(data.row);

  if (!row) {
    return { success: false, message: 'Invalid row reference.' };
  }

  const current = sheet.getRange(row, 2, 1, 3).getValues()[0];

  if (data.date) current[0] = new Date(data.date);
  if (typeof data.topic === 'string') current[1] = data.topic;
  if (typeof data.trainer === 'string') current[2] = data.trainer;

  sheet.getRange(row, 2, 1, 3).setValues([current]);
  SpreadsheetApp.flush();
  invalidateCaches_(['syllabus']);

  return { success: true, message: 'Syllabus updated successfully.' };
}

function getTestBlockMeta_(blockId) {
  const block = TEST_BLOCKS.find(function(b) {
    return b.id === blockId;
  });

  if (!block) {
    throw new Error('Unknown assessment block: ' + blockId);
  }

  return block;
}


/***********************
 * GET TEST DATA
 ***********************/

function getTestData(sessionToken, blockId) {
  requireLogin_(sessionToken);

  const block = getTestBlockMeta_(blockId);

  return cacheGetOrSet_(
    'test_' + block.id,
    CONFIG.CACHE_TTL.TESTS,
    function() {
      const sheet = getSheet_(SHEETS.TESTS);
      const lastRow = findLastNamedRow_(sheet, block.dataStartRow, 3);
      const numRows = lastRow - block.dataStartRow + 1;

      const responseBlock = {
        id: block.id,
        label: block.label,
        cols: block.cols,
        editableCols: block.editableCols
      };

      if (numRows < 1) {
        return { block: responseBlock, dateInfo: {}, records: [] };
      }

      const base = sheet.getRange(block.dataStartRow, 1, numRows, 3).getValues();
      const scores = block.cols.length
        ? sheet.getRange(
            block.dataStartRow,
            block.startCol,
            numRows,
            block.cols.length
          ).getValues()
        : [];

      const dateInfo = {
        date: safeDateLabel_(sheet.getRange(2, block.startCol).getValue()),
        totalMark: safeNum_(sheet.getRange(3, block.startCol).getValue())
      };

      const records = [];

      for (let i = 0; i < base.length; i++) {
        const name = normalizeValue_(base[i][2]);
        if (!name) continue;

        const rec = {
          row: block.dataStartRow + i,
          sNo: safeNum_(base[i][0]),
          department: normalizeValue_(base[i][1]),
          name: name,
          scores: {}
        };

        block.cols.forEach(function(colName, ci) {
          rec.scores[colName] = scores[i] && scores[i][ci] !== undefined
            ? scores[i][ci]
            : '';
        });

        records.push(rec);
      }

      return {
        block: responseBlock,
        dateInfo: dateInfo,
        records: records
      };
    }
  );
}

function saveTestMarks(sessionToken, blockId, data) {
  requireTrainer_(sessionToken);

  const block = getTestBlockMeta_(blockId);
  const sheet = getSheet_(SHEETS.TESTS);
  data = data || {};

  const row = safeNum_(data.row);
  if (!row) {
    return { success: false, message: 'Invalid row reference.' };
  }

  const existing = sheet.getRange(row, block.startCol, 1, block.cols.length).getValues()[0];

  block.editableCols.forEach(function(colName) {
    if (!Object.prototype.hasOwnProperty.call(data.scores || {}, colName)) return;

    const colOffset = block.cols.indexOf(colName);
    if (colOffset < 0) return;

    const val = data.scores[colName];
    if (val === '') {
      existing[colOffset] = '';
      return;
    }

    const num = Number(val);
    if (!isNaN(num)) {
      existing[colOffset] = num;
    }
  });

  sheet.getRange(row, block.startCol, 1, block.cols.length).setValues([existing]);
  SpreadsheetApp.flush();

  invalidateCaches_([
    'test_' + block.id,
    'dashboard',
    'pre_post',
    'reports',
    'student_'
  ]);

  return {
    success: true,
    message: 'Marks saved successfully.'
  };
}

function getTestRowForStudent_(
  blockId,
  student
) {

  const block =
    getTestBlockMeta_(blockId);


  const sheet =
    getSheet_(SHEETS.TESTS);


  const lastRow =
    sheet.getLastRow();


  const numRows =
    lastRow - block.dataStartRow + 1;


  if (numRows < 1) {
    return {};
  }


  /*
   * Student names are always in Column C.
   */
  const names =
    sheet
      .getRange(
        block.dataStartRow,
        3,
        numRows,
        1
      )
      .getValues();


  const targetName =
    normalizeValue_(
      student && student.name
        ? student.name
        : ''
    );


  if (!targetName) {
    return {};
  }


  for (
    let i = 0;
    i < names.length;
    i++
  ) {

    const currentName =
      normalizeValue_(names[i][0]);


    if (
      currentName.toUpperCase() ===
      targetName.toUpperCase()
    ) {

      let scores = [];


      if (block.cols.length > 0) {

        scores =
          sheet
            .getRange(
              block.dataStartRow + i,
              block.startCol,
              1,
              block.cols.length
            )
            .getValues()[0];

      }


      const result = {};


      block.cols.forEach(
        function(colName, ci) {

          result[colName] =
            scores[ci] !== undefined
              ? scores[ci]
              : '';

        }
      );


      return result;
    }

  }


  return {};
}


/***********************
 * POST TEST
 ***********************/

function getPostTestData(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'post_test',
    CONFIG.CACHE_TTL.POST_TEST,
    function() {
      const sheet = getSheet_(SHEETS.POST_TEST);
      const headerRow = 5;
      const dataStartRow = 6;
      const lastRow = findLastNamedRow_(sheet, dataStartRow, 3);
      const numRows = lastRow - dataStartRow + 1;

      if (numRows <= 0) return { records: [], dateInfo: {} };

      const headers = sheet
        .getRange(headerRow, 1, 1, 8)
        .getValues()[0]
        .map(normalizeValue_);

      const values = sheet
        .getRange(dataStartRow, 1, numRows, 8)
        .getValues();

      const dateInfo = {
        date: safeDateLabel_(sheet.getRange(2, 8).getValue()),
        totalMark: safeNum_(sheet.getRange(3, 8).getValue())
      };

      const records = [];

      for (let i = 0; i < values.length; i++) {
        const name = normalizeValue_(values[i][2]);
        if (!name) continue;

        records.push({
          row: dataStartRow + i,
          sNo: safeNum_(values[i][0]),
          regNo: canonicalRegisterNumber_(values[i][1]),
          name: name,
          mcq: values[i][3],
          twoMarks: values[i][4],
          coding: values[i][5],
          total: values[i][6],
          percentage: toPercent_(values[i][7])
        });
      }

      return {
        headers: headers,
        dateInfo: dateInfo,
        records: records
      };
    }
  );
}

function savePostTest(sessionToken, data) {
  requireTrainer_(sessionToken);

  data = data || {};
  const sheet = getSheet_(SHEETS.POST_TEST);
  const row = safeNum_(data.row);

  if (!row) {
    return { success: false, message: 'Invalid row reference.' };
  }

  const current = sheet.getRange(row, 4, 1, 3).getValues()[0];
  const keys = ['mcq', 'twoMarks', 'coding'];

  keys.forEach(function(key, idx) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) return;

    if (data[key] === '') {
      current[idx] = '';
      return;
    }

    const num = Number(data[key]);
    if (!isNaN(num)) current[idx] = num;
  });

  sheet.getRange(row, 4, 1, 3).setValues([current]);
  SpreadsheetApp.flush();

  invalidateCaches_([
    'post_test',
    'dashboard',
    'pre_post',
    'reports',
    'student_'
  ]);

  return { success: true, message: 'Post-test marks saved successfully.' };
}

function getPostTestRowForStudent_(student) {
  const sheet = getSheet_(SHEETS.POST_TEST);
  const dataStartRow = 6;
  const lastRow = findLastNamedRow_(sheet, dataStartRow, 3);
  const numRows = lastRow - dataStartRow + 1;

  if (numRows <= 0) return {};

  const names = sheet.getRange(dataStartRow, 3, numRows, 1).getValues();
  const targetName = normalizeValue_(student.name).toUpperCase();

  for (let i = 0; i < names.length; i++) {
    if (normalizeValue_(names[i][0]).toUpperCase() === targetName) {
      const row = sheet.getRange(dataStartRow + i, 4, 1, 5).getValues()[0];

      return {
        mcq: row[0],
        twoMarks: row[1],
        coding: row[2],
        total: row[3],
        percentage: toPercent_(row[4])
      };
    }
  }

  return {};
}

function getMockInterviewData(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'mock_interview',
    CONFIG.CACHE_TTL.MOCK_INTERVIEW,
    function() {
      const sheet = getSheet_(SHEETS.MOCK_INTERVIEW);
      const dataStartRow = 6;
      const lastRow = findLastNamedRow_(sheet, dataStartRow, 3);
      const numRows = lastRow - dataStartRow + 1;

      if (numRows <= 0) {
        return { records: [], totalMark: 0, average: 0 };
      }

      const values = sheet.getRange(dataStartRow, 1, numRows, 5).getValues();
      const totalMark = safeNum_(sheet.getRange(2, 4).getValue());
      const average = toPercent_(sheet.getRange(3, 5).getValue());

      const records = [];

      for (let i = 0; i < values.length; i++) {
        const name = normalizeValue_(values[i][2]);
        if (!name) continue;

        records.push({
          row: dataStartRow + i,
          sNo: safeNum_(values[i][0]),
          regNo: canonicalRegisterNumber_(values[i][1]),
          name: name,
          score: values[i][3],
          percentage: toPercent_(values[i][4])
        });
      }

      return {
        records: records,
        totalMark: totalMark,
        average: average
      };
    }
  );
}

function saveMockInterview(sessionToken, data) {
  requireTrainer_(sessionToken);

  data = data || {};
  const sheet = getSheet_(SHEETS.MOCK_INTERVIEW);
  const row = safeNum_(data.row);

  if (!row) {
    return { success: false, message: 'Invalid row reference.' };
  }

  if (data.score === '') {
    sheet.getRange(row, 4).clearContent();
  } else {
    const num = Number(data.score);
    if (isNaN(num)) {
      return { success: false, message: 'Score must be a number.' };
    }
    sheet.getRange(row, 4).setValue(num);
  }
  SpreadsheetApp.flush();

  invalidateCaches_([
    'mock_interview',
    'analysis',
    'dashboard',
    'student_'
  ]);

  return { success: true, message: 'Mock interview score saved successfully.' };
}

function getMockInterviewRowForStudent_(student) {
  const sheet = getSheet_(SHEETS.MOCK_INTERVIEW);
  const dataStartRow = 6;
  const lastRow = findLastNamedRow_(sheet, dataStartRow, 3);
  const numRows = lastRow - dataStartRow + 1;

  if (numRows <= 0) return {};

  const names = sheet.getRange(dataStartRow, 3, numRows, 1).getValues();
  const targetName = normalizeValue_(student.name).toUpperCase();

  for (let i = 0; i < names.length; i++) {
    if (normalizeValue_(names[i][0]).toUpperCase() === targetName) {
      const row = sheet.getRange(dataStartRow + i, 4, 1, 2).getValues()[0];
      return {
        score: row[0],
        percentage: toPercent_(row[1])
      };
    }
  }

  return {};
}

function getPrePostComparison(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'pre_post',
    CONFIG.CACHE_TTL.PRE_POST,
    function() {
      const sheet = getSheet_(SHEETS.PRE_POST);
      const numRows = Math.max(sheet.getLastRow() - 3, 0);
      if (numRows <= 0) return [];

      const values = sheet.getRange(4, 1, numRows, 6).getValues();

      return values
        .filter(function(r) { return normalizeValue_(r[0]); })
        .map(function(r) {
          return {
            department: normalizeValue_(r[0]),
            preTestAverage: toPercent_(r[1]),
            postTestAverage: toPercent_(r[2]),
            improvement: toPercent_(r[3]),
            averageAttendance: toPercent_(r[4]),
            studentsCompared: safeNum_(r[5])
          };
        });
    }
  );
}

function getAnalysisData(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'analysis',
    CONFIG.CACHE_TTL.ANALYSIS,
    function() {
      const sheet = getSheet_(SHEETS.ANALYSIS);
      const lastRow = findLastNamedRow_(sheet, 2, 2);
      const numRows = lastRow - 1;

      if (numRows <= 0) return [];

      const values = sheet.getRange(2, 1, numRows, 7).getValues();

      return values
        .filter(function(r) { return normalizeValue_(r[1]); })
        .map(function(r) {
          return {
            sNo: safeNum_(r[0]),
            name: normalizeValue_(r[1]),
            department: normalizeValue_(r[2]),
            location: normalizeValue_(r[3]),
            communication: r[4],
            confidence: r[5],
            technical: r[6]
          };
        });
    }
  );
}

function getFeedback(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'feedback',
    CONFIG.CACHE_TTL.FEEDBACK,
    function() {
      const sheet = getSheet_(SHEETS.FEEDBACK);
      const lastRow = Math.max(sheet.getLastRow(), 1);
      const numRows = lastRow - 1;

      if (numRows <= 0) return [];

      const values = sheet.getRange(2, 1, numRows, 10).getValues();

      return values
        .filter(function(r) { return normalizeValue_(r[2]); })
        .map(function(r) {
          return {
            date: r[0] instanceof Date
              ? Utilities.formatDate(r[0], CONFIG.TIMEZONE, 'dd MMM yyyy')
              : normalizeValue_(r[0]),
            studentName: normalizeValue_(r[2]),
            registerNumber: canonicalRegisterNumber_(r[3]),
            department: normalizeValue_(r[6]),
            faculty: normalizeValue_(r[7]),
            rating: r[8],
            suggestion: normalizeValue_(r[9])
          };
        });
    }
  );
}

function getFeedbackForStudent_(student) {
  // This is an internal helper called after getStudentById() has already
  // validated the user's session. Do not call getFeedback(null) here because
  // getFeedback() intentionally requires a session token.
  const sheet = getSheet_(SHEETS.FEEDBACK);
  const numRows = Math.max(sheet.getLastRow() - 1, 0);
  if (numRows <= 0) return [];

  const values = sheet.getRange(2, 1, numRows, 10).getValues();
  const targetReg = canonicalRegisterNumber_(student.registerNumber);
  const targetName = normalizeValue_(student.name).toUpperCase();

  return values
    .filter(function(r) {
      const rowReg = canonicalRegisterNumber_(r[3]);
      const rowName = normalizeValue_(r[2]).toUpperCase();
      return (targetReg && rowReg === targetReg) ||
             (!targetReg && targetName && rowName === targetName);
    })
    .map(function(r) {
      return {
        date: r[0] instanceof Date
          ? Utilities.formatDate(r[0], CONFIG.TIMEZONE, 'dd MMM yyyy')
          : normalizeValue_(r[0]),
        studentName: normalizeValue_(r[2]),
        registerNumber: normalizeValue_(r[3]),
        department: normalizeValue_(r[6]),
        faculty: normalizeValue_(r[7]),
        rating: r[8],
        suggestion: normalizeValue_(r[9])
      };
    });
}

function canonicalRegisterNumber_(value) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (!isNaN(n)) return String(Math.trunc(n));
  return String(value).trim().replace(/\.0+$/, '');
}


/***********************
 * REPORTS
 ***********************/

function getReports(sessionToken, filters) {
  requireLogin_(sessionToken);

  filters = filters || {};
  const dept = normalizeValue_(filters.department);
  const key = 'reports_' + (dept ? dept.toUpperCase() : 'ALL');

  return cacheGetOrSet_(
    key,
    CONFIG.CACHE_TTL.REPORTS,
    function() {
      return {
        preTestFull: getPreTestFullReport_(filters),
        prePost: getPrePostComparison(sessionToken)
      };
    }
  );
}

function getPreTestFullReport_(filters) {
  const sheet = getSheet_(SHEETS.PRE_TEST_REPORT);
  const dataStartRow = 2;
  const lastRow = findLastNamedRow_(sheet, dataStartRow, 2);
  const numRows = lastRow - dataStartRow + 1;

  if (numRows <= 0) return [];

  const values = sheet.getRange(dataStartRow, 1, numRows, 16).getValues();

  let rows = values
    .filter(function(r) { return normalizeValue_(r[1]); })
    .map(function(r) {
      return {
        name: normalizeValue_(r[1]),
        department: normalizeValue_(r[2]),
        deptCode: normalizeValue_(r[3]),
        regNo: canonicalRegisterNumber_(r[4]),
        email: normalizeValue_(r[5]),
        java: r[6],
        sql: r[7],
        dsa: r[8],
        frontEnd: r[9],
        aptitude: r[10],
        coding: r[11],
        total: r[12],
        percentage: toPercent_(r[13]),
        communication: r[14],
        confidence: r[15]
      };
    });

  if (filters && filters.department) {
    const target = String(filters.department).toUpperCase();
    rows = rows.filter(function(r) {
      return r.deptCode.toUpperCase() === target;
    });
  }

  return rows;
}


/***********************
 * CACHE HELPERS
 ***********************/

function cacheVersion_() {
  return CacheService.getScriptCache().get('ppg_v2_cache_version') || '0';
}

function cacheGetOrSet_(key, ttlSeconds, producer) {
  if (!ttlSeconds || ttlSeconds <= 0) return producer();
  const cache = CacheService.getScriptCache();
  const safeKey = 'ppg_v2_' + cacheVersion_() + '_' + key;
  const cached = cache.get(safeKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      cache.remove(safeKey);
    }
  }

  const value = producer();

  try {
    const serialized = JSON.stringify(value);
    if (serialized.length <= 95000) {
      cache.put(safeKey, serialized, ttlSeconds);
    }
  } catch (e) {
    console.warn('Cache write skipped:', e);
  }

  return value;
}

function invalidateCaches_(keys) {
  if (!Array.isArray(keys) || !keys.length) return;
  CacheService.getScriptCache().put(
    'ppg_v2_cache_version',
    String(Date.now()),
    21600
  );
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function getSheet_(sheetName) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);
  return sheet;
}

function getHeaders_(sheet, headerRow) {
  const lastCol = sheet.getLastColumn();
  return sheet.getRange(headerRow || 1, 1, 1, lastCol).getValues()[0].map(normalizeValue_);
}

function findColumn_(headers, columnName) {
  const target = normalizeValue_(columnName).toUpperCase();
  for (let i = 0; i < headers.length; i++) {
    if (normalizeValue_(headers[i]).toUpperCase() === target) return i;
  }
  return -1;
}

function normalizeValue_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function safeNum_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function toPercent_(value) {
  const n = Number(value);
  if (isNaN(n)) return 0;
  // Ratios stored as 0-1 in the sheet (e.g. percentage formulas) are converted to 0-100 for display.
  const pct = n > 0 && n <= 1 ? n * 100 : n;
  return Math.round(pct * 100) / 100;
}

function safeDateLabel_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, CONFIG.TIMEZONE, 'dd MMM yyyy');
  return normalizeValue_(value);
}

function countStudentRows_() {
  const sheet = getSheet_(SHEETS.STUDENTS);
  const lastRow = findLastNamedRow_(sheet, 2, 3);
  return lastRow >= 2 ? lastRow - 1 : 0;
}

