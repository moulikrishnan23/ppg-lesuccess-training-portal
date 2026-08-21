# PPG Training Portal - Session Fix

This reconstructed version keeps the existing React + Google Apps Script portal and fixes the session-expiration flow.

## Changes

1. React authentication is persisted in `localStorage` instead of `sessionStorage`.
2. On browser refresh, the saved token is restored and checked with `validateSession`.
3. Apps Script authentication sessions are stored in `PropertiesService` instead of `CacheService`.
4. Sessions use the existing 6-hour timeout from `CONFIG.SESSION_TIMEOUT_SECONDS`.
5. The server uses a sliding timeout and refreshes a session only when it is within 30 minutes of expiry.
6. Logout removes the server-side session and the browser-side saved session.
7. `SESSION_EXPIRED` is still returned when a session genuinely expires or is invalid.

## Deployment

### React

```bash
npm install
npm run dev
```

The supplied archive's `node_modules` folder was intentionally excluded from this reconstructed source archive. Run `npm install` to recreate dependencies.

### Apps Script

1. Open the Apps Script project.
2. Replace the existing `Code.gs` with the reconstructed `Code.gs`.
3. Confirm `CONFIG.SPREADSHEET_ID` is your live Spreadsheet ID.
4. Deploy a new Web App version.
5. Use the Web App `/exec` URL in `.env.local` as `VITE_APPS_SCRIPT_URL`.
6. Log in again once after deployment.

## Important

Old sessions created by the previous `CacheService` implementation are not reused. Users should log in again after the new Apps Script deployment.

The Google Sheet remains the live source of truth; this change only changes authentication-session persistence.
