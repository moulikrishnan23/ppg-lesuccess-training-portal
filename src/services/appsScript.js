/**
 * React -> Google Apps Script Web App API bridge.
 *
 * Performance features:
 * - In-flight request de-duplication
 * - Short client-side caching for read-only API calls
 * - Automatic cache invalidation after writes
 * - Request timeout with useful errors
 */

const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

const READ_TTL = {
  getDashboardData: 15_000,
  getStudents: 120_000,
  getStudentById: 20_000,
  getAttendance: 10_000,
  getSyllabus: 60_000,
  getTestData: 15_000,
  getPostTestData: 15_000,
  getMockInterviewData: 15_000,
  getPrePostComparison: 60_000,
  getAnalysisData: 60_000,
  getFeedback: 60_000,
  getReports: 60_000,
};

const readCache = new Map();
const inFlight = new Map();

function isReadAction(action) {
  return Object.prototype.hasOwnProperty.call(READ_TTL, action);
}

function cacheKey(action, args) {
  // Session tokens are intentionally excluded from the data-cache key.
  // All authenticated portal users read the same spreadsheet data.
  return `${action}:${JSON.stringify(args.slice(1))}`;
}

function clearReadCache() {
  readCache.clear();
}

function getCached(key) {
  const item = readCache.get(key);
  if (!item) return undefined;

  if (item.expiresAt <= Date.now()) {
    readCache.delete(key);
    return undefined;
  }

  return item.value;
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
  // Google Sheet is the live source of truth. Never cache read responses.
  const useCache = false;

  const key = useCache ? cacheKey(action, requestArgs) : null;

  if (useCache) {
    const cached = getCached(key);
    if (cached !== undefined) return cached;

    if (inFlight.has(key)) {
      return inFlight.get(key);
    }
  }

  const request = (async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25_000);

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

      if (useCache) {
        readCache.set(key, {
          value: result,
          expiresAt: Date.now() + READ_TTL[action],
        });
      } else if (action !== "validateSession" && action !== "logout") {
        clearReadCache();
      }

      return result;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }

      console.error(`Apps Script API error [${action}]`, error);
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  })();

  if (useCache) {
    inFlight.set(key, request);
  }

  try {
    return await request;
  } finally {
    if (useCache) inFlight.delete(key);
  }
}

export function clearServerCache() {
  clearReadCache();
}
