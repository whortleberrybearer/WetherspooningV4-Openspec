# Implementation Tasks

## Prerequisites
- [ ] Ensure Firebase Functions SDK supports `onCall` (v2) - already in use
- [ ] Confirm `ADMIN_USER_ID` environment variable naming convention

## Core Implementation

### 1. Create Callable Function
- [ ] Create new file `functions/src/callable/syncPubsOnDemand.ts`
- [ ] Import `onCall` from `firebase-functions/v2/https`
- [ ] Import `HttpsError` from `firebase-functions/v2/https`
- [ ] Import existing sync functions `runFullSync` and `runUpdateSync` from `../scheduled/syncPubs`
- [ ] Define TypeScript request/response interfaces:
  - `FullSyncRequest`: `{ mode: 'full'; count?: number; start?: number }`
  - `UpdateSyncRequest`: `{ mode: 'update'; since: string }`
  - `SyncRequest`: `FullSyncRequest | UpdateSyncRequest`
  - `SyncResponse`: `{ mode: string; successCount: number; failureCount: number; parameters?: object }`
- [ ] Implement `syncPubsOnDemand` callable function with configuration:
  - Region: `europe-west2`
  - Memory: `256MiB`
  - Timeout: `600` seconds
- [ ] Add function to `functions/src/index.ts` exports

### 2. Implement Authorization
- [ ] Read `ADMIN_USER_ID` from `process.env.ADMIN_USER_ID`
- [ ] Check if environment variable is set, throw `internal` error if missing with message "Server configuration error: ADMIN_USER_ID not set"
- [ ] Check if `context.auth` exists, throw `permission-denied` if null with message "Unauthorized: Admin access required"
- [ ] Compare `context.auth.uid` with `ADMIN_USER_ID`
- [ ] Throw `permission-denied` error if UIDs don't match with message "Unauthorized: Admin access required"
- [ ] Log authorization attempts (success and failure) with caller UID

### 3. Implement Parameter Validation
- [ ] Check if `data.mode` exists, throw `invalid-argument` if missing: "Missing required parameter: mode"
- [ ] Validate `mode` is either `'full'` or `'update'`, throw `invalid-argument` if invalid: "Invalid mode. Must be 'full' or 'update'"
- [ ] For full sync mode:
  - [ ] Validate `count` is undefined or non-negative number, throw `invalid-argument` if negative: "Invalid count. Must be a non-negative number"
  - [ ] Validate `start` is undefined or non-negative number, throw `invalid-argument` if negative: "Invalid start. Must be a non-negative number"
  - [ ] Default `start` to 0 if not provided
- [ ] For update sync mode:
  - [ ] Check if `since` parameter exists, throw `invalid-argument` if missing: "Missing required parameter for update mode: since"
  - [ ] Parse `since` as ISO 8601 date string, throw `invalid-argument` if invalid: "Invalid since date. Must be a valid ISO 8601 date string"
- [ ] Log validated parameters

### 4. Implement Sync Execution
- [ ] Wrap sync logic in try-catch block
- [ ] For `mode: 'full'`:
  - [ ] Call `runFullSync(count, start)` with validated parameters
  - [ ] Capture returned `{ successCount, failureCount }`
- [ ] For `mode: 'update'`:
  - [ ] Convert `since` string to Date object
  - [ ] Call `runUpdateSync(new Date(since))`
  - [ ] Capture returned `{ successCount, failureCount }`
- [ ] Catch sync errors, log with full stack trace, and throw `internal` error: "Sync execution failed. Check logs for details"
- [ ] Log sync invocation with mode, parameters, and caller UID

### 5. Implement Response Formatting
- [ ] Create response object with `mode`, `successCount`, `failureCount`
- [ ] Add `parameters` object to response based on mode:
  - Full sync: `{ count?, start? }`
  - Update sync: `{ since }`
- [ ] Return response object from callable function
- [ ] Log successful completion with counts

## Environment Configuration

### 6. Development Environment Setup
- [ ] Add `ADMIN_USER_ID` to `.env.example` file with placeholder value
- [ ] Document in `functions/README.md` how to set `ADMIN_USER_ID` locally
- [ ] Update `.gitignore` to ensure `.env` is not committed (should already be ignored)

### 7. Production Environment Setup
- [ ] Document in main `README.md` how to set production config: `firebase functions:config:set admin.user_id=<your-uid>`
- [ ] Note that config takes effect after deployment

## Testing

### 8. Unit Tests (Optional but Recommended)
- [ ] Create test file `functions/test/callable/syncPubsOnDemand.test.ts`
- [ ] Test authorization logic:
  - [ ] Test with missing `context.auth` (should reject)
  - [ ] Test with wrong UID (should reject)
  - [ ] Test with matching UID (should pass authorization)
  - [ ] Test with missing `ADMIN_USER_ID` env var (should error)
- [ ] Test parameter validation:
  - [ ] Test missing `mode` parameter
  - [ ] Test invalid `mode` value
  - [ ] Test negative `count` and `start`
  - [ ] Test invalid `since` date string
  - [ ] Test valid full sync parameters
  - [ ] Test valid update sync parameters
- [ ] Mock `runFullSync` and `runUpdateSync` to verify they're called with correct arguments

### 9. Manual Testing
- [ ] Deploy function to Firebase (or run in emulator)
- [ ] Set `ADMIN_USER_ID` environment variable to test user UID
- [ ] Test via Firebase CLI:
  - [ ] `firebase functions:call syncPubsOnDemand --data '{"mode":"full","count":2}'`
  - [ ] `firebase functions:call syncPubsOnDemand --data '{"mode":"update","since":"2026-01-01T00:00:00Z"}'`
- [ ] Verify sync executes and returns expected response
- [ ] Test unauthorized access (with different user or no auth)
- [ ] Verify error messages are appropriate
- [ ] Check Cloud Logging for authorization logs and sync execution logs

### 10. Integration Testing (Optional)
- [ ] Create simple test script or frontend page to invoke function via Firebase SDK
- [ ] Test full sync with various `count`/`start` values
- [ ] Test update sync with various `since` dates
- [ ] Verify Firestore data is updated correctly
- [ ] Test concurrent scheduled + manual sync (ensure no conflicts)

## Documentation

### 11. Update Documentation
- [ ] Add section to `README.md` explaining on-demand sync feature
- [ ] Document how to get Firebase Auth UID for admin user
- [ ] Document how to call function from Firebase CLI
- [ ] Document how to call function from client code (if applicable)
- [ ] Add troubleshooting section for common errors:
  - "ADMIN_USER_ID not set"
  - "permission-denied" errors
  - Parameter validation errors
- [ ] Update `RUN_PUB_SYNC.md` to mention on-demand callable function as alternative to local script

### 12. Code Review & Cleanup
- [ ] Review code for TypeScript best practices
- [ ] Ensure error messages don't leak sensitive information
- [ ] Verify all logs include relevant context (UID, parameters)
- [ ] Check that function configuration matches design (region, memory, timeout)
- [ ] Ensure imports are clean and unused imports removed

## Deployment

### 13. Pre-Deployment
- [ ] Set `ADMIN_USER_ID` in production Firebase config
- [ ] Verify `.env` file is in `.gitignore`
- [ ] Run `npm run build` in functions directory to check for TypeScript errors
- [ ] Commit all changes with descriptive commit message

### 14. Deployment
- [ ] Deploy function: `firebase deploy --only functions:syncPubsOnDemand`
- [ ] Verify deployment success in Firebase Console
- [ ] Check function appears in Cloud Functions list
- [ ] Verify function configuration (region, memory, timeout)

### 15. Post-Deployment Verification
- [ ] Test function invocation from Firebase CLI in production
- [ ] Verify authorization works correctly
- [ ] Check Cloud Logging for any errors
- [ ] Perform test sync with small `count` value to validate end-to-end flow
- [ ] Document admin UID in secure location (password manager, team wiki)

## Notes
- Each task should be completed sequentially within its section
- Mark tasks complete as they are finished
- If a task reveals issues with the design, update proposal/design docs accordingly
- Sync execution reuses existing logic - no changes needed to `syncPubs.ts`
- Scheduled sync continues to work independently
