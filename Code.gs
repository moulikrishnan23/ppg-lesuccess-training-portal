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
  SPREADSHEET_ID: '1o7aOn7b7HKwDufTEyDTh4TG-bLP_WqnK2LTTcKYsjAM',   // Live PPG Google Sheet
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
      getAvailableTests: getAvailableTests,
      createNextTest: createNextTest,
      getTestAnalytics: getTestAnalytics,
      createNextPreTest: createNextPreTest,
      getPreTestAnalytics: getPreTestAnalytics,
      getPostTestData: getPostTestData,
      savePostTest: savePostTest,
      getMockInterviewData: getMockInterviewData,
      saveMockInterview: saveMockInterview,
      getPrePostComparison: getPrePostComparison,
      getAnalysisData: getAnalysisData,
      getFeedback: getFeedback,
      getReports: getReports,
      getBackendInfo: getBackendInfo,
      getDashboardDepartmentAnalytics: getDashboardDepartmentAnalytics,
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
    sheets: ss.getSheets().map(function (s) { return s.getName(); })
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
    function () {
      const dash = getSheet_(SHEETS.DASHBOARD);

      const summary = dash.getRangeList([
        'A8', 'D8', 'A11', 'D11', 'A14', 'D14', 'A22', 'C22', 'B18'
      ]).getRanges().map(function (range) {
        return range.getValue();
      });

      // Avg Overall Test / Avg Improvement - Daily: computed live by
      // combining every department's test results (requirement
      // 1.1/1.2), instead of the static, manually-entered Dashboard
      // sheet cells. Falls back to the sheet cell if no test data is
      // available yet, so nothing regresses to blank.
      const testAnalytics = computeDashboardTestAnalyticsRaw_();

      const kpis = {
        totalStudents: safeNum_(summary[8]) || countStudentRows_(),
        preTestConducted: safeNum_(summary[0]),
        preTestAverage:
          testAnalytics.overallTestAverage !== null
            ? testAnalytics.overallTestAverage
            : toPercent_(summary[1]),
        postTestConducted: safeNum_(summary[2]),
        postTestAverage: toPercent_(summary[3]),
        overallAttendancePct: toPercent_(summary[4]),
        averageImprovement:
          testAnalytics.overallImprovement !== null
            ? testAnalytics.overallImprovement
            : toPercent_(summary[5]),
        mockInterviewAttended: safeNum_(summary[6]),
        mockInterviewAvgScore: toPercent_(summary[7])
      };

      const deptRange = dash.getRange(25, 1, 6, 2).getValues();
      const departmentSummary = deptRange
        .filter(function (r) { return normalizeValue_(r[0]); })
        .map(function (r) {
          return {
            department: normalizeValue_(r[0]),
            count: safeNum_(r[1])
          };
        });

      const allRanked = computeOverallStudentRankings_(sessionToken);

      const topStudents = allRanked.slice().sort(function (a, b) {
        if (b.compositeScore !== a.compositeScore) {
          return b.compositeScore - a.compositeScore;
        }
        if (b.latestPercentage !== a.latestPercentage) {
          return b.latestPercentage - a.latestPercentage;
        }
        return a.name.localeCompare(b.name);
      }).slice(0, 10).map(function (s, i) {
        return Object.assign({}, s, { rank: i + 1 });
      });

      const leastStudents = allRanked.slice().sort(function (a, b) {
        if (a.compositeScore !== b.compositeScore) {
          return a.compositeScore - b.compositeScore;
        }
        if (a.latestPercentage !== a.latestPercentage) {
          return a.latestPercentage - b.latestPercentage;
        }
        return a.name.localeCompare(b.name);
      }).slice(0, 10).map(function (s, i) {
        return Object.assign({}, s, { rank: i + 1 });
      });

      return {
        kpis: Object.assign({}, kpis, getAttendanceTodaySummary_()),
        departmentSummary: departmentSummary,
        topStudents: topStudents,
        leastStudents: leastStudents
      };
    }
  );
}

/**
 * Shared raw computation behind the department-wise dashboard
 * analytics AND the overall (all-department) Avg Overall Test /
 * Avg Improvement - Daily KPI cards, so both stay consistent and
 * department name variants (e.g. "B.E CSE" vs "B.E. CSE" vs
 * "B.E IT" / "B.Tech IT") are merged into one canonical bucket via
 * normalizeDepartment_() instead of silently splitting into
 * multiple partial groups (which was causing empty/incorrect
 * percentages in the department-wise popups).
 */
function computeDashboardTestAnalyticsRaw_() {

  return cacheGetOrSet_(
    'dashboard_test_analytics_raw_v4',
    0,
    function () {

      const departments = {};

      // Flattened, ungrouped scores across every department - used
      // to compute the single "combining all departments" overall
      // figure shown on the main KPI cards (requirement 1.1 / 1.2).
      const overallTestScores = [];
      const overallImprovementScores = [];

      function getDept(department) {
        const key =
          normalizeDepartment_(department);

        if (!departments[key]) {
          departments[key] = {
            department: key,
            attendance: [],
            testAverages: [],
            improvements: [],
            communication: [],
            confidence: [],
            technical: []
          };
        }

        return departments[key];
      }

      function addNumber(arr, value) {
        if (
          value === '' ||
          value === null ||
          value === undefined
        ) {
          return;
        }

        const n = Number(value);

        if (isFinite(n)) {
          arr.push(n);
        }
      }

      function average(arr) {
        if (!arr || !arr.length) {
          return null;
        }

        const total = arr.reduce(
          function (sum, value) {
            return sum + Number(value);
          },
          0
        );

        return Math.round(
          (total / arr.length) * 100
        ) / 100;
      }


      /* ============================================================
       * A. ATTENDANCE
       * ============================================================ */

      const attendanceSheet =
        getSheet_(SHEETS.ATTENDANCE);

      const attendanceMeta =
        readAttendanceMeta_(attendanceSheet);

      if (attendanceMeta.totalStrength > 0) {

        const base =
          attendanceSheet
            .getRange(
              attendanceMeta.dataStartRow,
              1,
              attendanceMeta.totalStrength,
              3
            )
            .getValues();

        const width =
          attendanceMeta.lastDateCol -
          attendanceMeta.firstDateCol +
          1;

        const attendanceValues =
          width > 0
            ? attendanceSheet
              .getRange(
                attendanceMeta.dataStartRow,
                attendanceMeta.firstDateCol,
                attendanceMeta.totalStrength,
                width
              )
              .getValues()
            : [];

        for (let i = 0; i < base.length; i++) {

          const department =
            normalizeValue_(base[i][1]) ||
            'Unassigned';

          const entry =
            getDept(department);

          const row =
            attendanceValues[i] || [];

          let present = 0;
          let absent = 0;
          let halfDay = 0;

          row.forEach(function (value) {

            const status =
              normalizeValue_(value);

            if (status === 'Present') {
              present++;
            } else if (status === 'Absent') {
              absent++;
            } else if (status === 'Half Day') {
              halfDay++;
            }
          });

          const marked =
            present +
            absent +
            halfDay;

          if (marked > 0) {

            const percentage =
              (
                (present + (halfDay * 0.5)) /
                marked
              ) * 100;

            addNumber(
              entry.attendance,
              percentage
            );
          }
        }
      }


      /* ============================================================
       * B. PRE TEST 1 + ALL DYNAMIC REGULAR TESTS
       * ============================================================ */

      const testSheet =
        getSheet_(SHEETS.TESTS);

      const blocks = [];

      /*
       * Pre Test 1 is fixed.
       */
      const preTestBlock =
        TEST_BLOCKS.find(function (block) {
          return block.id === 'PRE_TEST_1';
        });

      if (preTestBlock) {
        blocks.push(preTestBlock);
      }

      /*
       * Test 2, Test 3, Test 4...
       *
       * IMPORTANT:
       * Read only tests which actually exist
       * in Google Sheet.
       */
      const regularBlocks =
        getRegularTestBlocksFromSheet_();

      regularBlocks.forEach(function (block) {
        blocks.push(block);
      });

      /*
       * Sort by actual sheet position.
       */
      blocks.sort(function (a, b) {
        return a.startCol - b.startCol;
      });


      const lastRow =
        findLastNamedRow_(
          testSheet,
          6,
          3
        );

      const numRows =
        lastRow - 6 + 1;

      if (
        numRows > 0 &&
        blocks.length > 0
      ) {

        const base =
          testSheet
            .getRange(
              6,
              1,
              numRows,
              3
            )
            .getValues();

        /*
         * Find the last column actually needed.
         */
        const maxCol =
          Math.max.apply(
            null,
            blocks.map(function (block) {
              return (
                block.startCol +
                block.cols.length -
                1
              );
            })
          );

        const matrix =
          testSheet
            .getRange(
              6,
              4,
              numRows,
              maxCol - 3
            )
            .getValues();


        /*
         * Row 3 contains each Test's Total Mark.
         */
        const totalMarkRow =
          testSheet
            .getRange(
              3,
              1,
              1,
              maxCol
            )
            .getValues()[0];


        for (let i = 0; i < base.length; i++) {

          const department =
            normalizeValue_(base[i][1]) ||
            'Unassigned';

          const entry =
            getDept(department);

          const scores = [];


          /* --------------------------------------------------------
           * Read every available Test for this student
           * -------------------------------------------------------- */

          blocks.forEach(function (block) {

            /*
             * ------------------------------------------------------
             * PRE TEST 1
             * ------------------------------------------------------
             *
             * Pre Test 1 already has a Percentage column.
             *
             * D = MCQ
             * E = 2 Marks
             * F = Coding
             * G = Total
             * H = Percentage
             */
            const percentageIndex =
              block.cols.indexOf('Percentage');

            if (percentageIndex >= 0) {

              const percentageAbsoluteCol =
                block.startCol +
                percentageIndex;

              const rawPercentage =
                matrix[i][
                percentageAbsoluteCol - 4
                ];

              if (
                rawPercentage !== '' &&
                rawPercentage !== null &&
                rawPercentage !== undefined
              ) {

                let percentage =
                  Number(rawPercentage);

                if (isFinite(percentage)) {

                  /*
                   * If Google Sheet stores it as
                   * 0.27 convert to 27.
                   *
                   * If already 27, keep 27.
                   */
                  if (
                    percentage >= 0 &&
                    percentage <= 1
                  ) {
                    percentage *= 100;
                  }

                  scores.push({
                    percentage: percentage,
                    order: block.startCol
                  });

                  return;
                }
              }
            }


            /*
             * ------------------------------------------------------
             * REGULAR TESTS
             * ------------------------------------------------------
             *
             * Find the actual Total column.
             *
             * Example:
             *
             * Test 2:
             * J = 2 Marks
             * K = Coding
             * L = Total
             *
             * Therefore Total Mark is L3.
             */
            const totalIndex =
              block.cols.indexOf('Total');

            if (totalIndex < 0) {
              return;
            }

            const absoluteTotalCol =
              block.startCol +
              totalIndex;

            const matrixIndex =
              absoluteTotalCol - 4;

            const rawScore =
              matrix[i][matrixIndex];

            if (
              rawScore === '' ||
              rawScore === null ||
              rawScore === undefined
            ) {
              return;
            }

            const score =
              Number(rawScore);

            if (!isFinite(score)) {
              return;
            }


            /*
             * IMPORTANT FIX:
             *
             * Read Total Mark from the ACTUAL
             * Total column, not block.startCol.
             *
             * Test 2 -> L3
             * Test 3 -> O3
             * Test 4 -> S3
             * etc.
             */
            const totalMark =
              Number(
                totalMarkRow[
                absoluteTotalCol - 1
                ]
              );

            if (
              !isFinite(totalMark) ||
              totalMark <= 0
            ) {
              return;
            }

            const percentage =
              (score / totalMark) * 100;

            if (
              isFinite(percentage)
            ) {

              scores.push({
                percentage: percentage,
                order: block.startCol
              });
            }
          });


          /* --------------------------------------------------------
           * Student Average Across ALL Available Tests
           * -------------------------------------------------------- */

          if (scores.length > 0) {

            const studentAverage =
              scores.reduce(
                function (sum, item) {
                  return sum + item.percentage;
                },
                0
              ) / scores.length;

            addNumber(
              entry.testAverages,
              studentAverage
            );

            overallTestScores.push(studentAverage);
          }


          /* --------------------------------------------------------
           * Improvement
           *
           * Pre Test 1 → Test 2
           * Test 2 → Test 3
           * Test 3 → Test 4
           * ...
           * -------------------------------------------------------- */

          if (scores.length >= 2) {

            scores.sort(function (a, b) {
              return a.order - b.order;
            });

            let improvementTotal = 0;
            let improvementCount = 0;

            for (
              let j = 1;
              j < scores.length;
              j++
            ) {

              const previous =
                scores[j - 1].percentage;

              const current =
                scores[j].percentage;

              /*
               * Improvement is percentage growth:
               * ((current - previous) / previous) * 100
               *
               * Example:
               * 50% -> 60% = 20% growth.
               */
              if (
                isFinite(previous) &&
                isFinite(current) &&
                previous !== 0
              ) {
                improvementTotal +=
                  ((current - previous) / Math.abs(previous)) * 100;

                improvementCount++;
              }
            }

            if (improvementCount > 0) {

              const studentImprovement =
                improvementTotal /
                improvementCount;

              addNumber(
                entry.improvements,
                studentImprovement
              );

              overallImprovementScores.push(studentImprovement);
            }
          }
        }
      }


      /* ============================================================
       * C. ANALYSIS
       *
       * Communication
       * Confidence
       * Technical
       * ============================================================ */

      const analysisSheet =
        getSheet_(SHEETS.ANALYSIS);

      const analysisLastRow =
        findLastNamedRow_(
          analysisSheet,
          2,
          2
        );

      const analysisRows =
        analysisLastRow - 1;

      if (analysisRows > 0) {

        const values =
          analysisSheet
            .getRange(
              2,
              1,
              analysisRows,
              7
            )
            .getValues();

        values.forEach(function (row) {

          const department =
            normalizeValue_(row[2]) ||
            'Unassigned';

          const entry =
            getDept(department);

          addNumber(
            entry.communication,
            row[4]
          );

          addNumber(
            entry.confidence,
            row[5]
          );

          addNumber(
            entry.technical,
            row[6]
          );
        });
      }


      /* ============================================================
       * D. FINAL DEPARTMENT-WISE RESULT
       * ============================================================ */

      const departmentRows = Object.keys(departments)
        .map(function (key) {

          const d =
            departments[key];

          const communication =
            average(d.communication);

          const confidence =
            average(d.confidence);

          const technical =
            average(d.technical);

          const analysisValues = [
            communication,
            confidence,
            technical
          ].filter(function (value) {
            return value !== null;
          });

          return {
            department: d.department,

            attendancePct:
              average(d.attendance),

            testAverage:
              average(d.testAverages),

            improvement:
              average(d.improvements),

            communication:
              communication,

            confidence:
              confidence,

            technical:
              technical,

            mockAverage:
              analysisValues.length
                ? average(analysisValues)
                : null
          };
        })
        .sort(function (a, b) {
          return a.department.localeCompare(
            b.department
          );
        });

      return {
        departments: departmentRows,

        // Overall = combining test results from ALL departments,
        // computed directly from every student's score (not an
        // average-of-department-averages), per requirement 1.1/1.2.
        overallTestAverage: average(overallTestScores),
        overallImprovement: average(overallImprovementScores)
      };
    }
  );
}

/**
 * Department-wise dashboard analytics (Avg Overall Test, Avg
 * Improvement - Daily, Overall Attendance, Mock Interview popups).
 * Kept as its own cheap wrapper so the external contract (a plain
 * array of department rows) that Dashboard.jsx already expects is
 * unchanged.
 */
function getDashboardDepartmentAnalytics(sessionToken) {
  requireLogin_(sessionToken);
  return computeDashboardTestAnalyticsRaw_().departments;
}

function getOverallTestScoresByName_() {
  const sheet = getSheet_(SHEETS.TESTS);
  const blocks = [];
  const pre = TEST_BLOCKS.find(function (b) { return b.id === 'PRE_TEST_1'; });
  if (pre) blocks.push(pre);
  getRegularTestBlocksFromSheet_().forEach(function (b) { blocks.push(b); });
  const result = {};
  if (!blocks.length) return result;

  const lastRow = findLastNamedRow_(sheet, 6, 3);
  const numRows = lastRow - 5;
  if (numRows <= 0) return result;

  const maxCol = Math.max.apply(null, blocks.map(function (b) { return b.startCol + b.cols.length - 1; }));
  const base = sheet.getRange(6, 1, numRows, 3).getValues();
  const values = sheet.getRange(6, 4, numRows, maxCol - 3).getValues();
  const totalMarks = sheet.getRange(3, 4, 1, maxCol - 3).getValues()[0];

  for (let i = 0; i < base.length; i++) {
    const name = normalizeValue_(base[i][2]);
    if (!name) continue;
    const key = nameKey_(name);
    const scores = [];

    blocks.forEach(function (block) {
      const totalIndex = block.cols.indexOf('Total');
      if (totalIndex < 0) return;
      const totalCol = block.startCol + totalIndex;
      const rawTotal = values[i][totalCol - 4];
      if (rawTotal === '' || rawTotal === null || rawTotal === undefined) return;
      const total = Number(rawTotal);
      if (!isFinite(total)) return;

      let percentage = null;
      const pctIndex = block.cols.indexOf('Percentage');
      if (pctIndex >= 0) {
        const rawPct = values[i][block.startCol + pctIndex - 4];
        const pct = Number(rawPct);
        if (isFinite(pct)) percentage = pct <= 1 ? pct * 100 : pct;
      }

      if (percentage === null) {
        let totalMark = 0;
        if (block.id === 'PRE_TEST_1') {
          totalMark = safeNum_(totalMarks[4]);
          if (!totalMark) totalMark = 100;
        } else {
          totalMark = safeNum_(totalMarks[totalCol - 4]);
        }
        if (totalMark > 0) percentage = (total / totalMark) * 100;
      }

      if (percentage !== null && isFinite(percentage)) {
        scores.push({
          blockId: block.id,
          label: block.label,
          percentage: percentage,
          order: block.startCol
        });
      }
    });

    if (scores.length) result[key] = scores;
  }
  return result;
}

/**
 * OVERALL STUDENT RANKINGS
 * ------------------------------------------------------------
 * Ranked by each student's overall performance across every
 * available assessment in "PreTest & Regular Test" (Pre Test 1 +
 * Test 2..Test 6), i.e. their average percentage across whichever
 * tests have actually been conducted so far.
 *
 * Each record includes:
 *   - latestPercentage: percentage on the latest conducted test
 *   - previousPercentage: percentage on the preceding test
 *   - improvementGrowth: % growth from previous to latest test
 *   - compositeScore: overall average test percentage across all tests
 */
function computeOverallStudentRankings_(sessionToken) {
  const students = getStudents(sessionToken);
  const scoresByName = getOverallTestScoresByName_();

  let latestOrder = null;
  let latestLabel = '';

  Object.keys(scoresByName).forEach(function (key) {
    (scoresByName[key] || []).forEach(function (score) {
      if (
        latestOrder === null ||
        score.order > latestOrder
      ) {
        latestOrder = score.order;
        latestLabel = score.label;
      }
    });
  });

  const ranked = [];
  students.forEach(function (student) {
    const scores = (scoresByName[nameKey_(student.name)] || [])
      .slice()
      .sort(function (a, b) {
        return a.order - b.order;
      });

    if (!scores.length) return;

    const latest = scores[scores.length - 1];
    const previous = scores.length > 1
      ? scores[scores.length - 2]
      : null;

    let improvementGrowth = 0;
    if (
      previous &&
      isFinite(previous.percentage) &&
      isFinite(latest.percentage) &&
      previous.percentage > 0
    ) {
      improvementGrowth =
        ((latest.percentage - previous.percentage) /
          Math.abs(previous.percentage)) * 100;
    }

    const sumPct = scores.reduce(function (sum, item) {
      return sum + item.percentage;
    }, 0);
    const overallAvg = sumPct / scores.length;

    ranked.push({
      rank: 0,
      name: student.name,
      department: normalizeDepartment_(student.department),
      registerNumber: student.registerNumber,
      currentDay: latest ? latest.label : latestLabel,
      latestPercentage: latest ? Math.round(latest.percentage * 100) / 100 : null,
      previousPercentage: previous
        ? Math.round(previous.percentage * 100) / 100
        : null,
      improvementGrowth: Math.round(improvementGrowth * 100) / 100,
      compositeScore: Math.round(overallAvg * 100) / 100
    });
  });

  return ranked;
}

function computeOverallTopStudents_(sessionToken, limit) {
  limit = limit || 10;
  const ranked = computeOverallStudentRankings_(sessionToken);

  ranked.sort(function (a, b) {
    if (b.compositeScore !== a.compositeScore) {
      return b.compositeScore - a.compositeScore;
    }
    if (b.latestPercentage !== a.latestPercentage) {
      return b.latestPercentage - a.latestPercentage;
    }
    return a.name.localeCompare(b.name);
  });

  return ranked.slice(0, limit).map(function (s, i) {
    s.rank = i + 1;
    return s;
  });
}

function getAnalysisForStudent_(student) {
  const sheet = getSheet_(SHEETS.ANALYSIS);
  const lastRow = findLastNamedRow_(sheet, 2, 2);
  const numRows = lastRow - 1;
  if (numRows <= 0) return {};

  /*
   * Analysis:
   * A = S.No
   * B = Name
   * C = Department
   * D = Location
   * E = Communication
   * F = Confidence
   * G = Technical
   * H = Total
   * I = Percentage
   *
   * Analysis does not contain Register Number, so nameKey_ is the
   * fallback identity for this sheet. The student roster remains
   * register-number based everywhere a register number exists.
   */
  const values = sheet.getRange(2, 1, numRows, 9).getValues();
  const target = nameKey_(student && student.name);

  for (let i = 0; i < values.length; i++) {
    if (nameKey_(values[i][1]) !== target) continue;

    return {
      communication: values[i][4],
      confidence: values[i][5],
      technical: values[i][6],
      total: values[i][7],
      percentage: toPercent_(values[i][8]),
      location: normalizeValue_(values[i][3])
    };
  }

  return {};
}

/**
 * LEAST 10 STUDENTS
 * ------------------------------------------------------------
 * The "TOP 10" list on the Dashboard sheet (J15:M24) is pasted in
 * manually / by an external process - there is no ranking formula
 * behind it that Apps Script can reuse in reverse to find the
 * bottom performers.
 *
 * This function computes a composite performance score for every
 * student instead, using whatever data is already available:
 *
 *   - Overall attendance %              (Attendance sheet)
 *   - Average % across all graded tests (PreTest & Regular Test sheet,
 *     Pre Test 1 + Test 2..Test 17, each normalized against that
 *     test's own total mark)
 *   - Post-test %                       (PostTest_Report sheet)
 *   - Mock interview %                  (MockInterview sheet)
 *
 * A student's composite score is the average of whichever of the
 * above are actually available for them (missing/ungraded items are
 * skipped rather than treated as zero, so a student who simply
 * hasn't had a mock interview yet isn't unfairly penalised). Students
 * with no data at all are excluded from the ranking entirely.
 *
 * Adjust the four getBulk...ByName_ helpers below if you'd rather
 * weight these components differently.
 */
function computeLeastStudents_(sessionToken, limit) {
  limit = limit || 10;
  const ranked = computeOverallStudentRankings_(sessionToken);

  ranked.sort(function (a, b) {
    if (a.compositeScore !== b.compositeScore) {
      return a.compositeScore - b.compositeScore;
    }
    if (a.latestPercentage !== b.latestPercentage) {
      return a.latestPercentage - b.latestPercentage;
    }
    return a.name.localeCompare(b.name);
  });

  return ranked.slice(0, limit).map(function (s, i) {
    s.rank = i + 1;
    return s;
  });
}

function getBulkAttendancePercentagesByName_() {
  const sheet = getSheet_(SHEETS.ATTENDANCE);
  const meta = readAttendanceMeta_(sheet);
  const result = {};

  if (meta.totalStrength <= 0) return result;

  const baseRange = sheet.getRange(meta.dataStartRow, 1, meta.totalStrength, 3).getValues();
  const width = meta.lastDateCol - meta.firstDateCol + 1;
  const statusMatrix = width > 0
    ? sheet.getRange(meta.dataStartRow, meta.firstDateCol, meta.totalStrength, width).getValues()
    : [];

  for (let i = 0; i < baseRange.length; i++) {
    const name = normalizeValue_(baseRange[i][2]);
    if (!name) continue;

    let present = 0, absent = 0, halfDay = 0;
    const row = statusMatrix[i] || [];

    for (let c = 0; c < row.length; c++) {
      const val = normalizeValue_(row[c]);
      if (val === 'Present') present++;
      else if (val === 'Absent') absent++;
      else if (val === 'Half Day') halfDay++;
    }

    const totalMarked = present + absent + halfDay;
    if (totalMarked > 0) {
      result[name.toUpperCase()] =
        Math.round(((present + halfDay * 0.5) / totalMarked) * 1000) / 10;
    }
  }

  return result;
}

function getBulkTestPercentagesByName_() {
  const sheet = getSheet_(SHEETS.TESTS);
  const dataStartRow = 6;
  const lastRow = findLastNamedRow_(sheet, dataStartRow, 3);
  const numRows = lastRow - dataStartRow + 1;
  const result = {};

  if (numRows <= 0) return result;

  const maxCol = Math.max.apply(null, TEST_BLOCKS.map(function (b) {
    return b.startCol + b.cols.length - 1;
  }));

  const names = sheet.getRange(dataStartRow, 3, numRows, 1).getValues();
  const dataMatrix = sheet.getRange(dataStartRow, 4, numRows, maxCol - 3).getValues();
  const totalMarkRow = sheet.getRange(3, 4, 1, maxCol - 3).getValues()[0];

  for (let i = 0; i < names.length; i++) {
    const name = normalizeValue_(names[i][0]);
    if (!name) continue;

    let sum = 0;
    let count = 0;

    TEST_BLOCKS.forEach(function (block) {
      const totalColIndex = block.cols.indexOf('Total');
      if (totalColIndex === -1) return;

      const absoluteCol = block.startCol + totalColIndex;
      const blockTotalMark = safeNum_(totalMarkRow[block.startCol - 4]);
      const scoreValue = dataMatrix[i][absoluteCol - 4];

      if (
        blockTotalMark > 0 &&
        scoreValue !== '' &&
        scoreValue !== null &&
        !isNaN(Number(scoreValue))
      ) {
        sum += (Number(scoreValue) / blockTotalMark) * 100;
        count++;
      }
    });

    if (count > 0) {
      result[name.toUpperCase()] = Math.round((sum / count) * 100) / 100;
    }
  }

  return result;
}

function getBulkPostTestPercentagesByName_() {
  const sheet = getSheet_(SHEETS.POST_TEST);
  const dataStartRow = 6;
  const lastRow = findLastNamedRow_(sheet, dataStartRow, 3);
  const numRows = lastRow - dataStartRow + 1;
  const result = {};

  if (numRows <= 0) return result;

  const values = sheet.getRange(dataStartRow, 1, numRows, 8).getValues();

  for (let i = 0; i < values.length; i++) {
    const name = normalizeValue_(values[i][2]);
    if (!name) continue;

    const pct = values[i][7];
    if (pct !== '' && pct !== null) {
      result[name.toUpperCase()] = toPercent_(pct);
    }
  }

  return result;
}

function getBulkMockInterviewPercentagesByName_() {
  const sheet = getSheet_(SHEETS.MOCK_INTERVIEW);
  const dataStartRow = 6;
  const lastRow = findLastNamedRow_(sheet, dataStartRow, 3);
  const numRows = lastRow - dataStartRow + 1;
  const result = {};

  if (numRows <= 0) return result;

  const values = sheet.getRange(dataStartRow, 1, numRows, 5).getValues();

  for (let i = 0; i < values.length; i++) {
    const name = normalizeValue_(values[i][2]);
    if (!name) continue;

    const score = values[i][3];
    const pct = values[i][4];

    if (score !== '' && score !== null && pct !== '' && pct !== null) {
      result[name.toUpperCase()] = toPercent_(pct);
    }
  }

  return result;
}

function getAttendanceTodaySummary_() {
  const sheet = getSheet_(SHEETS.ATTENDANCE);
  const meta = readAttendanceMeta_(sheet);
  const today = new Date();

  const todayKey = Utilities.formatDate(
    today,
    CONFIG.TIMEZONE,
    'yyyy-MM-dd'
  );

  // ------------------------------------------------------------
  // Total configured training days
  // ------------------------------------------------------------
  const totalTrainingDays =
    Number(sheet.getRange('H4').getValue()) || 0;

  // ------------------------------------------------------------
  // Read attendance date columns
  // ------------------------------------------------------------
  const dateCount = Math.max(
    meta.lastDateCol - meta.firstDateCol + 1,
    0
  );

  const dateValues = dateCount
    ? sheet
      .getRange(
        meta.dateRow,
        meta.firstDateCol,
        1,
        dateCount
      )
      .getValues()[0]
    : [];

  // Row 12 = Training Day / Non-Training Day
  const dayStatusValues = dateCount
    ? sheet
      .getRange(
        12,
        meta.firstDateCol,
        1,
        dateCount
      )
      .getDisplayValues()[0]
    : [];

  // Row 13 = Training Day number
  const dayNumberValues = dateCount
    ? sheet
      .getRange(
        13,
        meta.firstDateCol,
        1,
        dateCount
      )
      .getValues()[0]
    : [];

  // ------------------------------------------------------------
  // Find completed training days
  // AND find the latest date having attendance data
  // ------------------------------------------------------------
  let completed = 0;

  let attendanceCol = null;
  let attendanceColIndex = null;
  let attendanceDateKey = null;

  const attendanceMatrix = (meta.totalStrength > 0 && dateCount > 0)
    ? sheet.getRange(meta.dataStartRow, meta.firstDateCol, meta.totalStrength, dateCount).getValues()
    : [];

  for (let i = 0; i < dateValues.length; i++) {
    const dateValue = dateValues[i];

    if (!(dateValue instanceof Date)) {
      continue;
    }

    const dateKey = Utilities.formatDate(
      dateValue,
      CONFIG.TIMEZONE,
      'yyyy-MM-dd'
    );

    // Do not process future dates
    if (dateKey > todayKey) {
      continue;
    }

    const status = normalizeValue_(
      dayStatusValues[i]
    );

    const dayNumber =
      Number(dayNumberValues[i]) || 0;

    // Ignore dates beyond configured training days
    if (dayNumber > totalTrainingDays) {
      continue;
    }

    // Only Training Day counts as a completed training day
    if (status === 'Training Day') {
      completed++;
    }

    // ----------------------------------------------------------
    // Check whether this date actually contains attendance data
    // ----------------------------------------------------------
    const col = meta.firstDateCol + i;

    if (attendanceMatrix.length > 0) {
      let hasAttendanceData = false;
      for (let r = 0; r < attendanceMatrix.length; r++) {
        const val = normalizeValue_(attendanceMatrix[r][i]);
        if (val === 'Present' || val === 'Absent' || val === 'Half Day') {
          hasAttendanceData = true;
          break;
        }
      }

      if (hasAttendanceData) {
        attendanceCol = col;
        attendanceColIndex = i;
        attendanceDateKey = dateKey;
      }
    }
  }

  // Never exceed configured training days
  completed = Math.min(
    completed,
    totalTrainingDays
  );

  // ------------------------------------------------------------
  // Dashboard attendance result
  // ------------------------------------------------------------
  const result = {
    presentToday: 0,
    absentToday: 0,
    halfDayToday: 0,

    trainingDay: completed,
    totalTrainingDays: totalTrainingDays,
    completedDays: completed,
    remainingDays: Math.max(
      totalTrainingDays - completed,
      0
    ),

    // Important:
    // This tells React which date is actually being displayed.
    attendanceDateKey: attendanceDateKey,
    attendanceDateLabel: attendanceDateKey
      ? Utilities.formatDate(
        new Date(attendanceDateKey + 'T00:00:00'),
        CONFIG.TIMEZONE,
        'dd MMM yyyy'
      )
      : null
  };

  // ------------------------------------------------------------
  // Read latest available attendance from in-memory matrix
  // ------------------------------------------------------------
  if (
    attendanceColIndex !== null &&
    attendanceMatrix.length > 0
  ) {
    for (let r = 0; r < attendanceMatrix.length; r++) {
      const value = normalizeValue_(attendanceMatrix[r][attendanceColIndex]);

      if (value === 'Present') {
        result.presentToday++;
      } else if (value === 'Absent') {
        result.absentToday++;
      } else if (value === 'Half Day') {
        result.halfDayToday++;
      }
    }
  }

  return result;
}

function getStudents(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'students',
    CONFIG.CACHE_TTL.STUDENTS,
    function () {
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
    function () {
      const students = getStudents(sessionToken);
      const targetRegisterNumber = canonicalRegisterNumber_(registerNumber);

      const student = students.find(function (s) {
        return canonicalRegisterNumber_(s.registerNumber) === targetRegisterNumber;
      });

      if (!student) return null;

      const testRows = getAllTestRowsForStudent_(student);

      return {
        student: student,
        attendance: getAttendanceSummaryForStudent_(student),
        preTest: testRows.PRE_TEST_1 || {},
        tests: getRegularTestBlocksFromSheet_().map(function (b) {
          return Object.assign(
            {
              blockId: b.id,
              blockLabel: b.label
            },
            testRows[b.id] || {}
          );
        }),
        postTest: getPostTestRowForStudent_(student),
        mockInterview: getAnalysisForStudent_(student),
        feedback: getFeedbackForStudent_(student)
      };
    }
  );
}

function getAnalysisRowForStudent_(student) {
  const sheet = getSheet_(SHEETS.ANALYSIS);
  const lastRow = findLastNamedRow_(sheet, 2, 2);
  const numRows = lastRow - 1;

  if (numRows <= 0) return {};

  const values = sheet.getRange(2, 1, numRows, 9).getValues();
  const targetName = nameKey_(student && student.name);

  for (let i = 0; i < values.length; i++) {
    if (nameKey_(values[i][1]) !== targetName) continue;

    return {
      communication: values[i][4],
      confidence: values[i][5],
      technical: values[i][6],
      total: values[i][7],
      percentage: toPercent_(values[i][8]),
      location: normalizeValue_(values[i][3])
    };
  }

  return {};
}

function getAllTestRowsForStudent_(student) {
  const sheet = getSheet_(SHEETS.TESTS);
  const dataStartRow = 6;
  const lastRow = findLastNamedRow_(sheet, dataStartRow, 3);
  const numRows = lastRow - dataStartRow + 1;
  if (numRows <= 0) return {};

  const blocks = [];
  const pre = TEST_BLOCKS.find(function (b) { return b.id === 'PRE_TEST_1'; });
  if (pre) blocks.push(pre);
  getRegularTestBlocksFromSheet_().forEach(function (b) { blocks.push(b); });
  if (!blocks.length) return {};

  const names = sheet.getRange(dataStartRow, 3, numRows, 1).getValues();
  const targetName = nameKey_(student && student.name);
  let studentIndex = -1;
  for (let i = 0; i < names.length; i++) {
    if (nameKey_(names[i][0]) === targetName) { studentIndex = i; break; }
  }
  if (studentIndex < 0) return {};

  const maxCol = Math.max.apply(null, blocks.map(function (b) { return b.startCol + b.cols.length - 1; }));
  const row = sheet.getRange(dataStartRow + studentIndex, 4, 1, maxCol - 3).getValues()[0];
  const result = {};

  blocks.forEach(function (block) {
    const resultRow = {};
    block.cols.forEach(function (colName, ci) {
      resultRow[colName] = row[block.startCol + ci - 4] !== undefined ? row[block.startCol + ci - 4] : '';
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
    const existing = getStudents(sessionToken).some(function (s) {
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
  const metaValues = sheet.getRangeList(['H4', 'H5', 'M6']).getRanges().map(function (range) {
    return range.getValue();
  });

  const totalTrainingDays = Math.max(safeNum_(metaValues[0]), 0);
  const startDate = metaValues[1];
  const totalStrength = Math.max(safeNum_(metaValues[2]), 0);

  // Dynamically find the last date column across row 10 and 11
  let lastDateCol = 4;
  const maxCol = sheet.getLastColumn();
  if (maxCol >= 4) {
    const headerRows = sheet.getRange(10, 4, 2, maxCol - 3).getValues();
    const dayLabels = headerRows[0];
    const dateValues = headerRows[1];
    for (let c = 0; c < dayLabels.length; c++) {
      const dayLabel = normalizeValue_(dayLabels[c]).toUpperCase();
      const dateVal = dateValues[c];
      const isDate = dateVal instanceof Date;
      const isDayOrOff = dayLabel.indexOf('DAY') === 0 || dayLabel === 'OFF';
      if (isDate || isDayOrOff) {
        lastDateCol = 4 + c;
      }
    }
  }

  return {
    dateRow: 11,
    dataStartRow: 14,
    firstDateCol: 4,
    lastDateCol: lastDateCol,
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
    function () {
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
          department: normalizeDepartment_(baseRange[i][1]),
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

  records.forEach(function (rec) {
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
    return {
      present: 0,
      absent: 0,
      halfDay: 0,
      attendancePct: 0
    };
  }

  /*
   * Attendance sheet:
   *
   * Column A = S.No
   * Column B = Department
   * Column C = Student Name
   *
   * We also try to identify Register Number if
   * it exists in the attendance sheet.
   */

  const lastCol = sheet.getLastColumn();

  const headers = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (value) {
      return normalizeValue_(value).toUpperCase();
    });

  const registerHeaders = [
    'REGISTER NUMBER',
    'REGISTER NO',
    'REGISTER NO.',
    'REGISTRATION NUMBER',
    'REG NO',
    'REG.NO',
    'REG NUMBER',
    'REGISTRATION NO'
  ];

  let registerCol = -1;

  for (let i = 0; i < registerHeaders.length; i++) {
    const index = headers.indexOf(registerHeaders[i]);

    if (index !== -1) {
      registerCol = index + 1;
      break;
    }
  }


  /*
   * Read student base information.
   *
   * A = S.No
   * B = Department
   * C = Student Name
   */

  const baseRange = sheet
    .getRange(
      meta.dataStartRow,
      1,
      meta.totalStrength,
      Math.max(3, registerCol || 3)
    )
    .getValues();


  /*
   * Name normalization.
   *
   * Example:
   *
   * ATHIRA S
   * Athira S
   * ATHIRA  S
   * ATHIRA-S
   *
   * will become the same key.
   */

  function nameKey_(value) {
    return normalizeValue_(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }


  /*
   * Register number normalization.
   */

  function regKey_(value) {
    return canonicalRegisterNumber_(value)
      .toString()
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '');
  }


  const targetName =
    nameKey_(student && student.name);

  const targetReg =
    regKey_(student && student.registerNumber);


  let rowIndex = -1;


  /*
   * ================================================================
   * 1. FIRST TRY REGISTER NUMBER
   * ================================================================
   */

  if (
    registerCol > 0 &&
    targetReg
  ) {

    const registerIndex =
      registerCol - 1;

    for (
      let i = 0;
      i < baseRange.length;
      i++
    ) {

      const attendanceReg =
        regKey_(baseRange[i][registerIndex]);

      if (
        attendanceReg &&
        attendanceReg === targetReg
      ) {
        rowIndex = i;
        break;
      }
    }
  }


  /*
   * ================================================================
   * 2. IF REGISTER NUMBER IS NOT AVAILABLE,
   *    MATCH STUDENT NAME
   * ================================================================
   */

  if (rowIndex === -1 && targetName) {

    for (
      let i = 0;
      i < baseRange.length;
      i++
    ) {

      const attendanceName =
        nameKey_(baseRange[i][2]);

      if (
        attendanceName &&
        attendanceName === targetName
      ) {
        rowIndex = i;
        break;
      }
    }
  }


  /*
   * ================================================================
   * 3. STILL NOT FOUND?
   *
   * Try a safer partial-name comparison.
   *
   * This handles cases such as:
   *
   * "ATHIRA S"
   * "ATHIRA S."
   * "ATHIRA  S"
   * ================================================================
   */

  if (rowIndex === -1 && targetName) {

    for (
      let i = 0;
      i < baseRange.length;
      i++
    ) {

      const attendanceName =
        nameKey_(baseRange[i][2]);

      if (!attendanceName) continue;

      if (
        attendanceName.indexOf(targetName) !== -1 ||
        targetName.indexOf(attendanceName) !== -1
      ) {
        rowIndex = i;
        break;
      }
    }
  }


  /*
   * Student doesn't exist in Attendance sheet.
   */

  if (rowIndex === -1) {

    return {
      present: 0,
      absent: 0,
      halfDay: 0,
      attendancePct: 0
    };
  }


  /*
   * ================================================================
   * READ ALL TRAINING-DAY ATTENDANCE
   * ================================================================
   */

  const width =
    meta.lastDateCol -
    meta.firstDateCol +
    1;

  const rowRange =
    width > 0
      ? sheet
          .getRange(
            meta.dataStartRow + rowIndex,
            meta.firstDateCol,
            1,
            width
          )
          .getValues()[0]
      : [];


  let present = 0;
  let absent = 0;
  let halfDay = 0;


  rowRange.forEach(function (value) {

    const status =
      normalizeValue_(value)
        .trim()
        .toUpperCase();


    /*
     * Accept the normal values:
     *
     * Present
     * Absent
     * Half Day
     *
     * Also accept:
     *
     * P
     * A
     * HD
     * H
     */

    if (
      status === 'PRESENT' ||
      status === 'P'
    ) {

      present++;

    } else if (
      status === 'ABSENT' ||
      status === 'A'
    ) {

      absent++;

    } else if (
      status === 'HALF DAY' ||
      status === 'HALFDAY' ||
      status === 'HALF-DAY' ||
      status === 'HD' ||
      status === 'H'
    ) {

      halfDay++;
    }
  });


  /*
   * ================================================================
   * ATTENDANCE PERCENTAGE
   * ================================================================
   *
   * Half Day = 0.5
   */

  const totalMarked =
    present +
    absent +
    halfDay;


  const attendancePct =
    totalMarked > 0
      ? Math.round(
          (
            (
              present +
              halfDay * 0.5
            ) /
            totalMarked
          ) *
          1000
        ) / 10
      : 0;


  return {
    present: present,
    absent: absent,
    halfDay: halfDay,
    attendancePct: attendancePct
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

function classifySyllabusTopic_(topic) {
  const text = normalizeValue_(topic).toLowerCase();

  /*
   * Automatic classification because Syllabus_Tracker currently has
   * no separate Category column.
   */
  const softSkillKeywords = [
    'communication', 'confidence', 'soft skill', 'soft skills',
    'interview', 'personality', 'leadership', 'teamwork',
    'time management', 'presentation', 'group discussion',
    'gd ', 'resume', 'aptitude interview'
  ];

  const aptitudeKeywords = [
    'aptitude', 'quantitative', 'logical reasoning', 'reasoning',
    'verbal ability', 'verbal', 'number series', 'percentage',
    'profit and loss', 'time and work', 'time & work',
    'probability', 'permutation', 'combination', 'data interpretation'
  ];

  if (softSkillKeywords.some(function (keyword) {
    return text.indexOf(keyword) !== -1;
  })) {
    return 'Soft Skill';
  }

  if (aptitudeKeywords.some(function (keyword) {
    return text.indexOf(keyword) !== -1;
  })) {
    return 'Aptitude';
  }

  return 'Technical';
}

function getSyllabus(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'syllabus',
    CONFIG.CACHE_TTL.SYLLABUS,
    function () {
      const sheet = getSheet_(SHEETS.SYLLABUS);
      const blocks = getSyllabusBlocks_();
      const result = [];
      const sheetLastRow = sheet.getLastRow();
      const now = new Date();

      blocks.forEach(function (block, idx) {
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
            category: classifySyllabusTopic_(topic),
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




/***********************
 * GET TEST DATA
 ***********************/

function getTestData(sessionToken, blockId) {
  requireLogin_(sessionToken);

  const block = getTestBlockMeta_(blockId);

  return cacheGetOrSet_(
    'test_' + block.id,
    CONFIG.CACHE_TTL.TESTS,
    function () {
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

        block.cols.forEach(function (colName, ci) {
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

  block.editableCols.forEach(function (colName) {
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

function createNextPreTest(sessionToken, data) {
  requireTrainer_(sessionToken);

  data = data || {};

  const sheet = getSheet_(SHEETS.TESTS);

  const nextNumber = getNextPreTestNumber_();
  const nextId = 'PRE_TEST_' + nextNumber;
  const nextLabel = 'Pre Test ' + nextNumber;

  const startCol = getNextPreTestStartColumn_();

  const cols = [
    'MCQ',
    '2 Marks',
    'Coding',
    'Total',
    'Percentage'
  ];

  const editableCols = [
    'MCQ',
    '2 Marks',
    'Coding'
  ];

  const dateValue = data.date || '';
  const totalMark = Number(data.totalMark);

  if (!dateValue) {
    return {
      success: false,
      message: 'Please select the Pre-Test date.'
    };
  }

  if (!isFinite(totalMark) || totalMark <= 0) {
    return {
      success: false,
      message: 'Please enter a valid total mark.'
    };
  }

  // ----------------------------------------------------------
  // Prevent duplicate creation
  // ----------------------------------------------------------
  const existing = TEST_BLOCKS.some(function (block) {
    return block.id === nextId;
  });

  if (existing) {
    return {
      success: false,
      message: nextLabel + ' already exists.'
    };
  }

  // ----------------------------------------------------------
  // Make sure the sheet has enough columns
  // ----------------------------------------------------------
  const requiredLastColumn =
    startCol + cols.length - 1;

  const currentMaxColumns =
    sheet.getMaxColumns();

  if (currentMaxColumns < requiredLastColumn) {
    sheet.insertColumnsAfter(
      currentMaxColumns,
      requiredLastColumn - currentMaxColumns
    );
  }

  // ----------------------------------------------------------
  // Header
  // ----------------------------------------------------------
  sheet
    .getRange(1, startCol, 1, cols.length)
    .setValues([[
      nextLabel,
      '',
      '',
      '',
      ''
    ]]);

  // ----------------------------------------------------------
  // Date
  // ----------------------------------------------------------
  const parsedDate = new Date(dateValue);

  sheet
    .getRange(2, startCol)
    .setValue(parsedDate);

  sheet
    .getRange(2, startCol)
    .setNumberFormat('dd MMM yyyy');

  // ----------------------------------------------------------
  // Total Mark
  // ----------------------------------------------------------
  sheet
    .getRange(3, startCol)
    .setValue(totalMark);

  // ----------------------------------------------------------
  // Column names
  // ----------------------------------------------------------
  sheet
    .getRange(5, startCol, 1, cols.length)
    .setValues([cols]);

  // ----------------------------------------------------------
  // Formula for every existing student row
  // ----------------------------------------------------------
  const lastRow = findLastNamedRow_(
    sheet,
    6,
    3
  );

  if (lastRow >= 6) {
    const rowCount = lastRow - 5;

    const formulas = [];

    for (let i = 0; i < rowCount; i++) {
      const rowNumber = 6 + i;

      formulas.push([
        `=IF(COUNTA(${columnLetter_(startCol)}${rowNumber}:${columnLetter_(startCol + 2)}${rowNumber})=0,"",SUM(${columnLetter_(startCol)}${rowNumber}:${columnLetter_(startCol + 2)}${rowNumber}))`,
        `=IF(${columnLetter_(startCol + 3)}${rowNumber}="","",IFERROR(${columnLetter_(startCol + 3)}${rowNumber}/${columnLetter_(startCol)}$3,0))`
      ]);
    }

    sheet
      .getRange(
        6,
        startCol + 3,
        rowCount,
        2
      )
      .setFormulas(
        formulas.map(function (row) {
          return [
            row[0],
            row[1]
          ];
        })
      );

    sheet
      .getRange(
        6,
        startCol + 4,
        rowCount,
        1
      )
      .setNumberFormat('0%');
  }

  SpreadsheetApp.flush();

  // ----------------------------------------------------------
  // Add the new block to the runtime configuration
  // ----------------------------------------------------------
  TEST_BLOCKS.push({
    id: nextId,
    label: nextLabel,
    headerRow: 1,
    dataStartRow: 6,
    startCol: startCol,
    cols: cols,
    editableCols: editableCols
  });

  invalidateCaches_([
    'tests',
    'dashboard',
    'pre_post',
    'analysis',
    'reports'
  ]);

  return {
    success: true,
    message: nextLabel + ' created successfully.',
    block: {
      id: nextId,
      label: nextLabel,
      headerRow: 1,
      dataStartRow: 6,
      startCol: startCol,
      cols: cols,
      editableCols: editableCols
    }
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
        function (colName, ci) {

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

function getTestBlockMeta_(blockId) {

  blockId =
    normalizeValue_(blockId);

  if (!blockId) {
    throw new Error(
      'Assessment block is required.'
    );
  }

  /*
   * ----------------------------------------------------------
   * Pre Test blocks
   * ----------------------------------------------------------
   */

  if (/^PRE_TEST_\d+$/.test(blockId)) {

    const match =
      blockId.match(
        /^PRE_TEST_(\d+)$/
      );

    const number =
      Number(match[1]);

    const expectedLabel =
      'Pre Test ' + number;

    const sheet =
      getSheet_(SHEETS.TESTS);

    const lastColumn =
      sheet.getLastColumn();

    const headers =
      sheet
        .getRange(
          1,
          1,
          1,
          lastColumn
        )
        .getDisplayValues()[0];

    for (
      let i = 0;
      i < headers.length;
      i++
    ) {

      if (
        normalizeValue_(headers[i]) ===
        expectedLabel
      ) {

        return {
          id: blockId,

          label: expectedLabel,

          headerRow: 1,

          dataStartRow: 6,

          startCol: i + 1,

          cols: [
            'MCQ',
            '2 Marks',
            'Coding',
            'Total',
            'Percentage'
          ],

          editableCols: [
            'MCQ',
            '2 Marks',
            'Coding'
          ]
        };
      }
    }

    throw new Error(
      expectedLabel +
      ' has not been created yet.'
    );
  }

  /*
   * ----------------------------------------------------------
   * Regular Tests
   *
   * ALWAYS read from the actual Sheet.
   * ----------------------------------------------------------
   */

  if (/^TEST_\d+$/.test(blockId)) {

    const blocks =
      getRegularTestBlocksFromSheet_();

    const block =
      blocks.find(function (item) {
        return item.id === blockId;
      });

    if (block) {
      return block;
    }

    throw new Error(
      'Test does not exist in Google Sheet: ' +
      blockId
    );
  }

  throw new Error(
    'Unknown assessment block: ' +
    blockId
  );
}

function getNextPreTestNumber_() {
  const preTests = getPreTestBlocks_();

  let maxNumber = 0;

  preTests.forEach(function (block) {
    const match = block.id.match(/^PRE_TEST_(\d+)$/);

    if (match) {
      maxNumber = Math.max(
        maxNumber,
        Number(match[1])
      );
    }
  });

  return maxNumber + 1;
}


function getNextPreTestStartColumn_() {
  let maxEndColumn = 3;

  TEST_BLOCKS.forEach(function (block) {
    const endColumn =
      block.startCol + block.cols.length - 1;

    maxEndColumn = Math.max(
      maxEndColumn,
      endColumn
    );
  });

  return maxEndColumn + 1;
}

function columnLetter_(columnNumber) {
  let result = '';
  let number = Number(columnNumber);

  while (number > 0) {
    const remainder = (number - 1) % 26;

    result =
      String.fromCharCode(65 + remainder) +
      result;

    number =
      Math.floor((number - 1) / 26);
  }

  return result;
}

function getPreTestAnalytics(sessionToken, blockId) {
  requireLogin_(sessionToken);

  blockId = normalizeValue_(blockId);

  if (!/^PRE_TEST_\d+$/.test(blockId)) {
    throw new Error('Invalid Pre-Test block.');
  }

  const block = getTestBlockMeta_(blockId);

  const sheet = getSheet_(SHEETS.TESTS);

  const lastRow = findLastNamedRow_(
    sheet,
    block.dataStartRow,
    3
  );

  const numRows =
    lastRow - block.dataStartRow + 1;

  if (numRows <= 0) {
    return {
      block: {
        id: block.id,
        label: block.label,
        cols: block.cols
      },
      dateInfo: {},
      attendedCount: 0,
      top10: [],
      least10: []
    };
  }

  const base = sheet
    .getRange(
      block.dataStartRow,
      1,
      numRows,
      3
    )
    .getValues();

  const scores = sheet
    .getRange(
      block.dataStartRow,
      block.startCol,
      numRows,
      block.cols.length
    )
    .getValues();

  const totalMark = safeNum_(
    sheet
      .getRange(3, block.startCol + 4)
      .getValue()
  );

  const students = [];

  for (let i = 0; i < base.length; i++) {
    const name = normalizeValue_(base[i][2]);

    if (!name) continue;

    const scoreRow = scores[i] || [];

    const mcq =
      scoreRow[block.cols.indexOf('MCQ')] ?? '';

    const twoMarks =
      scoreRow[block.cols.indexOf('2 Marks')] ?? '';

    const coding =
      scoreRow[block.cols.indexOf('Coding')] ?? '';

    const totalIndex =
      block.cols.indexOf('Total');

    const percentageIndex =
      block.cols.indexOf('Percentage');

    const total =
      totalIndex >= 0
        ? scoreRow[totalIndex]
        : '';

    const percentage =
      percentageIndex >= 0
        ? scoreRow[percentageIndex]
        : (
          totalMark > 0 && total !== ''
            ? Number(total) / totalMark
            : ''
        );

    // A student is considered attended when
    // at least one Pre-Test score has been entered.
    const attended =
      mcq !== '' ||
      twoMarks !== '' ||
      coding !== '' ||
      total !== '';

    if (!attended) continue;

    let percentageValue =
      Number(percentage);

    if (!isFinite(percentageValue)) {
      percentageValue = 0;
    }

    // Convert 0.27 -> 27
    if (
      percentageValue > 0 &&
      percentageValue <= 1
    ) {
      percentageValue *= 100;
    }

    students.push({
      row: block.dataStartRow + i,
      sNo: safeNum_(base[i][0]),
      department: normalizeValue_(base[i][1]),
      name: name,

      mcq: mcq,
      twoMarks: twoMarks,
      coding: coding,
      total: total,

      percentage:
        Math.round(percentageValue * 100) / 100
    });
  }

  students.sort(function (a, b) {
    return b.percentage - a.percentage;
  });

  const top10 = students
    .slice(0, 10)
    .map(function (student, index) {
      return Object.assign(
        {
          rank: index + 1
        },
        student
      );
    });

  const least10 = students
    .slice()
    .sort(function (a, b) {
      return a.percentage - b.percentage;
    })
    .slice(0, 10)
    .map(function (student, index) {
      return Object.assign(
        {
          rank: index + 1
        },
        student
      );
    });

  return {
    block: {
      id: block.id,
      label: block.label,
      cols: block.cols
    },

    dateInfo: {
      date: safeDateLabel_(
        sheet.getRange(2, block.startCol).getValue()
      ),
      totalMark: totalMark
    },

    attendedCount: students.length,

    top10: top10,

    least10: least10
  };
}

function getTestAnalytics(sessionToken, blockId) {
  requireLogin_(sessionToken);

  blockId = normalizeValue_(blockId);

  if (!/^TEST_\d+$/.test(blockId)) {
    throw new Error('Invalid Test block.');
  }

  /*
   * IMPORTANT:
   * Regular Tests are dynamic.
   * Always read the actual Test position from the Sheet.
   *
   * Example:
   * Test 2 = J:L
   * Test 3 = N:P
   * Test 4 = R:T
   */
  const regularBlocks =
    getRegularTestBlocksFromSheet_();

  const block =
    regularBlocks.find(function (item) {
      return item.id === blockId;
    });

  if (!block) {
    throw new Error(
      blockId +
      ' was not found in the Google Sheet.'
    );
  }

  const sheet =
    getSheet_(SHEETS.TESTS);

  const lastRow =
    findLastNamedRow_(
      sheet,
      block.dataStartRow,
      3
    );

  const numRows =
    lastRow -
    block.dataStartRow +
    1;

  if (numRows <= 0) {
    return {
      block: {
        id: block.id,
        label: block.label,
        cols: block.cols
      },

      dateInfo: {},

      attendedCount: 0,

      top10: [],

      least10: []
    };
  }

  /*
   * ----------------------------------------------------------
   * Student base data
   *
   * A = S.No
   * B = Department
   * C = Student Name
   * ----------------------------------------------------------
   */

  const base =
    sheet
      .getRange(
        block.dataStartRow,
        1,
        numRows,
        3
      )
      .getValues();

  /*
   * ----------------------------------------------------------
   * Test scores
   * ----------------------------------------------------------
   */

  const scores =
    sheet
      .getRange(
        block.dataStartRow,
        block.startCol,
        numRows,
        block.cols.length
      )
      .getValues();

  /*
   * ----------------------------------------------------------
   * Total mark
   *
   * For dynamically created Test:
   * row 3 contains Total Mark.
   * ----------------------------------------------------------
   */

  const totalMark =
    safeNum_(
      sheet
        .getRange(
          3,
          block.startCol + 2
        )
        .getValue()
    );

  /*
   * ----------------------------------------------------------
   * Column indexes
   * ----------------------------------------------------------
   */

  const twoMarksIndex =
    block.cols.indexOf('2 Marks');

  const codingIndex =
    block.cols.indexOf('Coding');

  const totalIndex =
    block.cols.indexOf('Total');

  const students = [];

  /*
   * ----------------------------------------------------------
   * Build attended students
   *
   * EXACTLY follows your Sheet formula:
   *
   * =COUNTIFS(
   *   TotalRange,"<>",
   *   TotalRange,"<>A",
   *   TotalRange,"<>0"
   * )
   *
   * Therefore:
   * - blank = not attended
   * - A     = not attended
   * - 0     = not attended
   * - any other Total = attended
   * ----------------------------------------------------------
   */

  for (
    let i = 0;
    i < base.length;
    i++
  ) {

    const name =
      normalizeValue_(base[i][2]);

    if (!name) {
      continue;
    }

    const scoreRow =
      scores[i] || [];

    const twoMarks =
      twoMarksIndex >= 0
        ? scoreRow[twoMarksIndex]
        : '';

    const coding =
      codingIndex >= 0
        ? scoreRow[codingIndex]
        : '';

    const total =
      totalIndex >= 0
        ? scoreRow[totalIndex]
        : '';

    /*
     * Same attendance rule as Google Sheets COUNTIFS.
     */
    const totalText =
      normalizeValue_(total).toUpperCase();

    const isAttended =
      total !== '' &&
      total !== null &&
      total !== undefined &&
      totalText !== 'A' &&
      Number(total) !== 0;

    if (!isAttended) {
      continue;
    }

    const totalValue =
      Number(total);

    if (!isFinite(totalValue)) {
      continue;
    }

    /*
     * Percentage:
     *
     * 18 / 20 = 0.90 = 90%
     */
    let percentage = 0;

    if (totalMark > 0) {
      percentage =
        (totalValue / totalMark) * 100;
    }

    students.push({

      row:
        block.dataStartRow + i,

      sNo:
        safeNum_(base[i][0]),

      department:
        normalizeValue_(base[i][1]),

      name:
        name,

      twoMarks:
        twoMarks,

      coding:
        coding,

      total:
        totalValue,

      percentage:
        Math.round(
          percentage * 100
        ) / 100
    });
  }

  /*
   * ----------------------------------------------------------
   * TOP 10
   * Highest percentage first.
   * ----------------------------------------------------------
   */

  const top10 =
    students
      .slice()
      .sort(function (a, b) {

        if (
          b.percentage !==
          a.percentage
        ) {
          return (
            b.percentage -
            a.percentage
          );
        }

        return a.name.localeCompare(
          b.name
        );
      })
      .slice(0, 10)
      .map(function (
        student,
        index
      ) {

        return Object.assign(
          {
            rank: index + 1
          },
          student
        );
      });

  /*
   * ----------------------------------------------------------
   * LEAST 10
   * Lowest percentage first.
   * ----------------------------------------------------------
   */

  const least10 =
    students
      .slice()
      .sort(function (a, b) {

        if (
          a.percentage !==
          b.percentage
        ) {
          return (
            a.percentage -
            b.percentage
          );
        }

        return a.name.localeCompare(
          b.name
        );
      })
      .slice(0, 10)
      .map(function (
        student,
        index
      ) {

        return Object.assign(
          {
            rank: index + 1
          },
          student
        );
      });

  /*
   * ----------------------------------------------------------
   * RESPONSE
   * ----------------------------------------------------------
   */

  return {

    block: {
      id: block.id,
      label: block.label,
      cols: block.cols
    },

    dateInfo: {

      date:
        safeDateLabel_(
          sheet
            .getRange(
              2,
              block.startCol + 2
            )
            .getValue()
        ),

      totalMark:
        totalMark
    },

    attendedCount:
      students.length,

    top10:
      top10,

    least10:
      least10
  };
}

function getRegularTestBlocksFromSheet_() {

  const sheet =
    getSheet_(SHEETS.TESTS);

  const lastColumn =
    sheet.getLastColumn();

  if (lastColumn < 1) {
    return [];
  }

  const headers =
    sheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getDisplayValues()[0];

  const row5 =
    sheet
      .getRange(
        5,
        1,
        1,
        lastColumn
      )
      .getDisplayValues()[0];

  const blocks = [];

  for (
    let index = 0;
    index < headers.length;
    index++
  ) {

    const label =
      normalizeValue_(headers[index]);

    const match =
      label.match(/^Test\s+(\d+)$/i);

    if (!match) {
      continue;
    }

    const testNumber =
      Number(match[1]);

    if (
      !isFinite(testNumber) ||
      testNumber < 2
    ) {
      continue;
    }

    const startCol =
      index + 1;

    /*
     * Read the actual column names from row 5.
     *
     * Normal regular-test structure:
     *
     * M = 2 Marks
     * N = Coding
     * O = Total
     */
    const cols = [];

    for (
      let c = startCol;
      c < startCol + 3;
      c++
    ) {

      const columnName =
        normalizeValue_(row5[c - 1]);

      cols.push(
        columnName || (
          c === startCol + 2
            ? 'Total'
            : c === startCol
              ? '2 Marks'
              : 'Coding'
        )
      );
    }

    /*
     * Editable columns are everything except Total.
     */
    const editableCols =
      cols.filter(function (col) {
        return col !== 'Total';
      });

    blocks.push({
      id: 'TEST_' + testNumber,

      label:
        'Test ' + testNumber,

      headerRow: 1,

      dataStartRow: 6,

      startCol: startCol,

      cols: cols,

      editableCols: editableCols
    });
  }

  blocks.sort(function (a, b) {

    const aNumber =
      Number(
        a.id.replace('TEST_', '')
      );

    const bNumber =
      Number(
        b.id.replace('TEST_', '')
      );

    return aNumber - bNumber;
  });

  return blocks;
}

function getAvailableTests(sessionToken) {
  requireLogin_(sessionToken);

  // Pre Test 1 is fixed.
  const result = [
    {
      id: 'PRE_TEST_1',
      label: 'Pre Test 1'
    }
  ];

  const fixedBlocks = TEST_BLOCKS.filter(function (block) {
    return block.id === 'PRE_TEST_1';
  });

  const sheetBlocks =
    getRegularTestBlocksFromSheet_();

  // Regular Tests come ONLY from the actual Google Sheet.
  const sheetTests =
    getRegularTestBlocksFromSheet_();

  sheetTests.forEach(function (block) {
    result.push({
      id: block.id,
      label: block.label
    });
  });

  // Sort: Pre Test 1 first, then Test 2, Test 3, Test 4...
  result.sort(function (a, b) {

    if (a.id === 'PRE_TEST_1') {
      return -1;
    }

    if (b.id === 'PRE_TEST_1') {
      return 1;
    }

    const aNumber =
      Number(a.id.replace('TEST_', ''));

    const bNumber =
      Number(b.id.replace('TEST_', ''));

    return aNumber - bNumber;
  });

  return result;
}

function createNextTest(sessionToken, data) {
  requireTrainer_(sessionToken);

  data = data || {};

  const sheet = getSheet_(SHEETS.TESTS);

  /*
   * ==========================================================
   * 1. FIND EXISTING TESTS
   * ==========================================================
   */

  const existingTests =
    getRegularTestBlocksFromSheet_();

  let highestTestNumber = 1;

  existingTests.forEach(function (block) {
    const number = Number(
      block.id.replace('TEST_', '')
    );

    if (isFinite(number)) {
      highestTestNumber = Math.max(
        highestTestNumber,
        number
      );
    }
  });

  const nextTestNumber =
    highestTestNumber + 1;

  const nextId =
    'TEST_' + nextTestNumber;

  const nextLabel =
    'Test ' + nextTestNumber;


  /*
   * ==========================================================
   * 2. FIND NEXT TEST POSITION
   *
   * Test 2 = J:L
   * M     = SPACE
   *
   * Test 3 = N:P
   * Q     = SPACE
   *
   * Test 4 = R:T
   * ==========================================================
   */

  /*
 * Test 2  -> J:L   + M blank
 * Test 3  -> N:P   + Q blank
 * Test 4  -> R:T   + U blank
 * Test 5  -> V:X   + Y blank
 *
 * J = column 10
 *
 * Every next Test moves 4 columns.
 */
  const startCol =
    10 + ((nextTestNumber - 2) * 4);

  const totalCol =
    startCol + 2;


  /*
   * ==========================================================
   * 3. CHECK DATE
   * ==========================================================
   */

  if (!data.date) {
    return {
      success: false,
      message: 'Please provide the Test date.'
    };
  }

  const parsedDate =
    new Date(data.date);

  if (isNaN(parsedDate.getTime())) {
    return {
      success: false,
      message: 'Invalid Test date.'
    };
  }


  /*
   * ==========================================================
   * 4. CHECK TOTAL MARK
   * ==========================================================
   */

  const totalMark =
    Number(data.totalMark);

  if (
    !isFinite(totalMark) ||
    totalMark <= 0
  ) {
    return {
      success: false,
      message: 'Please provide a valid total mark.'
    };
  }


  /*
   * ==========================================================
   * 5. MAKE SURE COLUMNS EXIST
   *
   * Need:
   *
   * startCol     = Test column
   * startCol + 1 = Label column
   * startCol + 2 = Value column
   * startCol + 3 = blank space
   * ==========================================================
   */

  const requiredLastColumn =
    startCol + 3;

  const maxColumns =
    sheet.getMaxColumns();

  if (
    maxColumns <
    requiredLastColumn
  ) {
    sheet.insertColumnsAfter(
      maxColumns,
      requiredLastColumn - maxColumns
    );
  }


  /*
   * ==========================================================
   * 6. PREVENT DUPLICATE TEST
   * ==========================================================
   */

  const currentTests =
    getRegularTestBlocksFromSheet_();

  const alreadyExists =
    currentTests.some(function (block) {
      return block.id === nextId;
    });

  if (alreadyExists) {
    return {
      success: false,
      message:
        nextLabel +
        ' already exists in Google Sheet.'
    };
  }


  /*
   * ==========================================================
   * 7. COPY TEST 2 AS TEMPLATE
   *
   * Test 2 = J:L
   *
   * We copy:
   * - formatting
   * - borders
   * - alignment
   * - number formats
   * - data validation
   * - column widths
   *
   * We DO NOT copy the values.
   * ==========================================================
   */

  const templateStartCol = 10; // J
  const templateWidth = 3;

  const templateRange =
    sheet.getRange(
      1,
      templateStartCol,
      sheet.getMaxRows(),
      templateWidth
    );

  const newRange =
    sheet.getRange(
      1,
      startCol,
      sheet.getMaxRows(),
      templateWidth
    );


  /*
   * Copy formatting
   */
  templateRange.copyTo(
    newRange,
    SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
    false
  );


  /*
   * Copy data validation
   */
  templateRange.copyTo(
    newRange,
    SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,
    false
  );


  /*
   * Copy column widths from Test 2.
   */
  for (let i = 0; i < 3; i++) {

    const sourceWidth =
      sheet.getColumnWidth(
        templateStartCol + i
      );

    sheet.setColumnWidth(
      startCol + i,
      sourceWidth
    );
  }


  /*
   * ==========================================================
   * 8. COPY MERGED CELLS FROM TEST 2
   *
   * Test 2 has Test 2 merged vertically.
   * We recreate that merge for Test 3/Test 4/etc.
   * ==========================================================
   */

  const mergedRanges =
    templateRange.getMergedRanges();

  mergedRanges.forEach(function (merged) {

    const relativeRow =
      merged.getRow() -
      templateRange.getRow();

    const relativeCol =
      merged.getColumn() -
      templateRange.getColumn();

    const targetRow =
      1 + relativeRow;

    const targetCol =
      startCol + relativeCol;

    const targetRange =
      sheet.getRange(
        targetRow,
        targetCol,
        merged.getNumRows(),
        merged.getNumColumns()
      );

    targetRange.merge();
  });


  /*
   * ==========================================================
   * 9. WRITE TEST HEADER
   *
   * Example Test 3:
   *
   * N1:N3 = Test 3
   * O1    = Total number of students
   * P1    = 64
   *
   * O2    = Date
   * P2    = 08/08/2026
   *
   * O3    = Total Mark
   * P3    = 100
   * ==========================================================
   */

  sheet
    .getRange(
      1,
      startCol
    )
    .setValue(nextLabel);


  /*
   * Labels
   */

  sheet
    .getRange(
      1,
      startCol + 1,
      3,
      1
    )
    .setValues([
      ['Total number of students'],
      ['Date'],
      ['Total Mark']
    ]);


  /*
   * Total number of students
   */

  const totalColumnLetter =
    columnLetter_(totalCol);

  const totalStudentsFormula =
    '=COUNTIFS(' +
    '$' + totalColumnLetter + '$6:' +
    totalColumnLetter + '70,"<>",' +
    '$' + totalColumnLetter + '$6:' +
    totalColumnLetter + '70,"<>A",' +
    '$' + totalColumnLetter + '$6:' +
    totalColumnLetter + '70,"<>0")';

  sheet
    .getRange(1, totalCol)
    .setFormula(totalStudentsFormula);

  /*
   * Date
   */

  sheet
    .getRange(
      2,
      startCol + 2
    )
    .setValue(parsedDate)
    .setNumberFormat(
      'dd/MM/yyyy'
    );


  /*
   * Total Mark
   */

  sheet
    .getRange(
      3,
      startCol + 2
    )
    .setValue(totalMark);


  /*
   * ==========================================================
   * 10. TEST MARK HEADERS
   * ==========================================================
   */

  sheet
    .getRange(
      5,
      startCol,
      1,
      3
    )
    .setValues([
      [
        '2 Marks',
        'Coding',
        'Total'
      ]
    ]);


  /*
   * ==========================================================
   * 11. FIND LAST STUDENT
   * ==========================================================
   */

  const lastStudentRow =
    findLastNamedRow_(
      sheet,
      6,
      3
    );


  /*
   * ==========================================================
   * 12. TOTAL FORMULAS
   * ==========================================================
   */

  if (lastStudentRow >= 6) {

    const rowCount =
      lastStudentRow - 5;

    const totalFormulas = [];

    for (
      let i = 0;
      i < rowCount;
      i++
    ) {

      const row =
        6 + i;

      totalFormulas.push([
        '=IF(COUNTA(' +
        columnLetter_(startCol) +
        row +
        ':' +
        columnLetter_(startCol + 1) +
        row +
        ')=0,"",SUM(' +
        columnLetter_(startCol) +
        row +
        ':' +
        columnLetter_(startCol + 1) +
        row +
        '))'
      ]);
    }

    sheet
      .getRange(
        6,
        startCol + 2,
        rowCount,
        1
      )
      .setFormulas(
        totalFormulas
      );
  }


  /*
   * ==========================================================
   * 13. CLEAR THE SPACE COLUMN
   *
   * Example:
   *
   * M = blank after Test 2
   * Q = blank after Test 3
   * U = blank after Test 4
   * ==========================================================
   */

  const spaceCol =
    startCol + 3;

  sheet
    .getRange(
      1,
      spaceCol,
      sheet.getMaxRows(),
      1
    )
    .clearContent();

  /*
   * Keep the separator column visually blank.
   */
  sheet
    .getRange(
      1,
      spaceCol,
      sheet.getMaxRows(),
      1
    )
    .clearFormat();


  /*
   * ==========================================================
   * 14. FLUSH
   * ==========================================================
   */

  SpreadsheetApp.flush();


  /*
   * ==========================================================
   * 15. CLEAR CACHE
   * ==========================================================
   */

  invalidateCaches_([
    'tests',
    'dashboard',
    'pre_post',
    'analysis',
    'reports'
  ]);

  /*
 * ==========================================================
 * AVERAGE OF ALL STUDENTS
 * ==========================================================
 */

  const averageRow = lastStudentRow + 1;

  const averageFormula =
    '=AVERAGE(' +
    totalColumnLetter +
    '6:' +
    totalColumnLetter +
    lastStudentRow +
    ')/100';

  sheet
    .getRange(
      averageRow,
      startCol + 2
    )
    .setFormula(averageFormula)
    .setNumberFormat('0.00%');


  /*
   * Average label
   */
  sheet
    .getRange(
      averageRow,
      startCol
    )
    .setValue('Average');

  sheet
    .getRange(
      averageRow,
      startCol + 1
    )
    .clearContent();


  /*
   * ==========================================================
   * 16. RETURN CREATED BLOCK
   * ==========================================================
   */

  return {

    success: true,

    message:
      nextLabel +
      ' created successfully.',

    block: {

      id: nextId,

      label: nextLabel,

      headerRow: 1,

      dataStartRow: 6,

      startCol: startCol,

      cols: [
        '2 Marks',
        'Coding',
        'Total'
      ],

      editableCols: [
        '2 Marks',
        'Coding'
      ]
    }
  };


}

/***********************
 * POST TEST
 ***********************/

function getPostTestData(sessionToken) {
  requireLogin_(sessionToken);

  return cacheGetOrSet_(
    'post_test',
    CONFIG.CACHE_TTL.POST_TEST,
    function () {
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

  keys.forEach(function (key, idx) {
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
  const targetName = nameKey_(student && student.name);

  for (let i = 0; i < names.length; i++) {
    if (nameKey_(names[i][0]) === targetName) {
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
    function () {
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
          department: normalizeDepartment_(values[i][1]),
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
  const targetName = nameKey_(student && student.name);

  for (let i = 0; i < names.length; i++) {
    if (nameKey_(names[i][0]) === targetName) {
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
    function () {
      const sheet = getSheet_(SHEETS.PRE_POST);
      const numRows = Math.max(sheet.getLastRow() - 3, 0);
      if (numRows <= 0) return [];

      const values = sheet.getRange(4, 1, numRows, 6).getValues();

      return values
        .filter(function (r) { return normalizeValue_(r[0]); })
        .map(function (r) {
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
    function () {
      const sheet = getSheet_(SHEETS.ANALYSIS);
      const lastRow = findLastNamedRow_(sheet, 2, 2);
      const numRows = lastRow - 1;

      if (numRows <= 0) return [];

      const values = sheet.getRange(2, 1, numRows, 9).getValues();

      /*
       * Analysis has no register number column. Build a nameKey -> roster
       * map so the UI still receives the reliable Register Number wherever
       * Student Data contains it.
       */
      const students = getStudents(sessionToken);
      const rosterByName = {};
      students.forEach(function (student) {
        rosterByName[nameKey_(student.name)] = student;
      });

      return values
        .filter(function (r) {
          return normalizeValue_(r[1]);
        })
        .map(function (r) {
          const name = normalizeValue_(r[1]);
          const roster = rosterByName[nameKey_(name)] || {};

          return {
            sNo: safeNum_(r[0]),
            name: name,
            registerNumber: canonicalRegisterNumber_(roster.registerNumber),
            department: normalizeDepartment_(r[2]),
            location: normalizeValue_(r[3]),
            communication: r[4],
            confidence: r[5],
            technical: r[6],
            total: r[7],
            percentage: toPercent_(r[8])
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
    function () {
      const sheet = getSheet_(SHEETS.FEEDBACK);
      const lastRow = Math.max(sheet.getLastRow(), 1);
      const numRows = lastRow - 1;

      if (numRows <= 0) return [];

      const values = sheet.getRange(2, 1, numRows, 10).getValues();

      return values
        .filter(function (r) { return normalizeValue_(r[2]); })
        .map(function (r) {
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
    .filter(function (r) {
      const rowReg = canonicalRegisterNumber_(r[3]);
      const rowName = normalizeValue_(r[2]).toUpperCase();
      return (targetReg && rowReg === targetReg) ||
        (!targetReg && targetName && rowName === targetName);
    })
    .map(function (r) {
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

function departmentCode_(department) {
  const value = normalizeDepartment_(department).toUpperCase();

  if (value.indexOf('AI & ML') !== -1 || value.indexOf('AIML') !== -1) {
    return 'AIML';
  }
  if (value.indexOf('AI & DS') !== -1 || value.indexOf('AIDS') !== -1) {
    return 'AIDS';
  }
  if (value.indexOf('ECE') !== -1) {
    return 'ECE';
  }
  if (value.indexOf('CSE') !== -1) {
    return 'CSE';
  }
  if (value.indexOf('IT') !== -1) {
    return 'IT';
  }

  return value.replace(/[^A-Z0-9]/g, '');
}

function departmentMatches_(actualDepartment, requestedDepartment) {
  if (!requestedDepartment) return true;

  const actual = normalizeDepartment_(actualDepartment);
  const requested = normalizeDepartment_(requestedDepartment);

  return (
    actual === requested ||
    departmentCode_(actual) === departmentCode_(requested)
  );
}

function getReports(sessionToken, filters) {
  requireLogin_(sessionToken);

  filters = filters || {};
  const dept = normalizeValue_(filters.department);
  const key = 'reports_' + (dept ? departmentCode_(dept) : 'ALL');

  return cacheGetOrSet_(
    key,
    CONFIG.CACHE_TTL.REPORTS,
    function () {
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
    .filter(function (r) {
      return normalizeValue_(r[1]);
    })
    .map(function (r) {
      return {
        sNo: safeNum_(r[0]),
        name: normalizeValue_(r[1]),
        department: normalizeDepartment_(r[2]),
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
    rows = rows.filter(function (r) {
      return departmentMatches_(r.department, filters.department) ||
        departmentMatches_(r.deptCode, filters.department);
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

/**
 * Canonicalizes a department string so variants entered across
 * different sheets (e.g. "B.E CSE" vs "B.E. CSE", "B.E IT" vs
 * "B.Tech IT", short codes like "AIML"/"AIDS" in the Student Data
 * sheet) are all treated as the same department for filtering,
 * grouping, and analytics - instead of silently splitting into
 * separate partial buckets.
 *
 * Output matches the canonical labels already used in the
 * Dashboard sheet's own department summary table (rows 25-29).
 */
function normalizeDepartment_(raw) {
  const value = normalizeValue_(raw)
    .toUpperCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!value) return 'Unassigned';

  const hasAI = value.indexOf('AI') !== -1;
  const hasML = value.indexOf('ML') !== -1;
  const hasDS = value.indexOf('DS') !== -1;
  const hasECE = value.indexOf('ECE') !== -1;
  const hasCSE = value.indexOf('CSE') !== -1;
  const hasIT = value.indexOf('IT') !== -1;

  if (hasAI && hasML) return 'B.E CSE (AI & ML)';
  if (hasAI && hasDS) return 'B.Tech (AI & DS)';
  if (hasECE) return 'B.E ECE';
  if (hasCSE) return 'B.E CSE';
  if (hasIT) return 'B.Tech IT';

  // Unknown/unmapped department - keep the original text rather
  // than losing data, but still trimmed/whitespace-normalized.
  return normalizeValue_(raw);
}

/**
 * Strips a name down to just its letters/digits so formatting
 * differences between sheets (e.g. "Ewans Angel L.S" vs
 * "EWANS ANGEL L S") are treated as the same student for matching
 * purposes. Sheets without a shared Register Number column (e.g.
 * "PreTest & Regular Test") rely on this for reliable lookups.
 */
function nameKey_(value) {
  return normalizeValue_(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
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

