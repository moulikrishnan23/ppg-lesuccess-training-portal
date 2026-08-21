# PPG React Conversion — Fast API Version

This project keeps the existing Google Sheet structure and Apps Script business logic while optimizing the React/API boundary.

## Backend

`Code(1).gs`

- Apps Script Web App API
- `doPost()` action router
- Session authentication
- Trainer-only write permissions
- Google Sheets reads/writes
- Server-side CacheService
- Batch writes
- Cache invalidation

## Frontend

`src/services/appsScript.js`

- `fetch()` API bridge
- Client cache
- In-flight request de-duplication
- Timeout handling
- Automatic cache clear after mutations

## Main performance changes

1. No unused startup API request.
2. Actual populated rows are used instead of the workbook's formatted row limit.
3. Attendance date calculations use a single date-row read.
4. Attendance writes use one `setValues()`.
5. Test writes use one contiguous range write.
6. Post-Test writes use one contiguous range write.
7. Student Performance reads the entire test row once.
8. Read endpoints use short-lived server/client caches.
9. React StrictMode duplicate development requests are de-duplicated by the API service.
10. Page errors no longer leave an infinite Loading state.

## Deployment

1. Deploy `Code(1).gs` as an Apps Script Web App.
2. Put the `/exec` URL in `.env.local`.
3. Run `npm run build`.
4. Host the React `dist` output on your chosen static host.

The Apps Script project is API-only; React is hosted separately.
