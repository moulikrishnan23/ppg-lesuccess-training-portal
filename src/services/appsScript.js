/**
 * React -> Google Apps Script Web App API bridge.
 *
 * Performance features:
 * - In-flight request de-duplication for read actions (prevents duplicate simultaneous calls)
 * - Automatic retry on transient timeout/network blips for idempotent read actions
 * - Safe request timeout with clear error messaging
 * - Direct live Google Sheets sync (no stale client caching)
 */

const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

const READ_ACTIONS = new Set([
  "getDashboardData",
  "getStudents",
  "getStudentById",
  "getAttendance",
  "getSyllabus",
  "getTestData",
  "getPostTestData",
  "getMockInterviewData",
  "getPrePostComparison",
  "getAnalysisData",
  "getFeedback",
  "getReports",
]);

const inFlight = new Map();

function isReadAction(action) {
  return READ_ACTIONS.has(action);
}

function requestKey(action, args) {
  return `${action}:${JSON.stringify(args)}`;
}

export async function callServer(action, ...args) {
  if (!API_URL) {
    throw new Error(
      "Apps Script API URL is missing. Create .env.local and set VITE_APPS_SCRIPT_URL."
    );
  }

  const options = args[args.length - 1];
  const control =
    options &&
    typeof options === "object" &&
    !Array.isArray(options) &&
    Object.prototype.hasOwnProperty.call(options, "cache");

  const requestArgs = control ? args.slice(0, -1) : args;

  const key = isReadAction(action) ? requestKey(action, requestArgs) : null;

  // Deduplicate in-flight read requests: if another component/hook is already fetching this exact query, reuse the Promise
  if (key && inFlight.has(key)) {
    return inFlight.get(key);
  }

  const executeRequest = async (attempt = 1) => {
    const controller = new AbortController();
    // 40 seconds timeout gives enough headroom for Google Apps Script cold starts
    const timeout = window.setTimeout(() => controller.abort(), 40_000);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action,
          args: requestArgs,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API request failed (${response.status}).`);
      }

      const result = await response.json();

      if (result?.success === false && result?.message) {
        if (action === "login") return result;

        const error = new Error(result.message);
        error.code = result.message === "SESSION_EXPIRED"
          ? "SESSION_EXPIRED"
          : undefined;
        throw error;
      }

      return result;
    } catch (error) {
      const isTimeout = error?.name === "AbortError";
      // Auto-retry once for idempotent read actions if cold-start timed out or network blip occurred
      if (attempt === 1 && isReadAction(action) && isTimeout) {
        console.warn(`Apps Script request [${action}] timed out. Retrying once...`);
        return executeRequest(2);
      }

      if (isTimeout) {
        throw new Error("Request timed out. Please try again.");
      }

      console.error(`Apps Script API error [${action}]`, error);
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const reqPromise = executeRequest();

  if (key) {
    inFlight.set(key, reqPromise);
  }

  try {
    return await reqPromise;
  } finally {
    if (key) {
      inFlight.delete(key);
    }
  }
}

export function clearServerCache() {
  inFlight.clear();
}
