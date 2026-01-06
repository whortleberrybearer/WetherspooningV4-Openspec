# scheduled-data-sync Spec Delta

## ADDED Requirements

### Requirement: On-Demand Sync Invocation (REQ-SDS-015)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a Firebase Callable Function that allows authorized administrators to trigger pub syncs on-demand.

**Acceptance Criteria:**
- Function is exposed as `syncPubsOnDemand` using Firebase `onCall` trigger
- Function is deployed to the same region as scheduled sync (europe-west2)
- Function has the same memory allocation as scheduled sync (256MiB)
- Function has the same timeout as scheduled sync (600 seconds)
- Function requires authentication (caller must be signed in with Firebase Auth)
- Function execution is logged with caller UID and parameters
- Function returns success/failure counts to caller
- Function can be invoked via Firebase SDK, CLI, or other Firebase functions
- Deployment includes the function in Firebase Functions export

#### Scenario: Successful On-Demand Full Sync
**Given** an authenticated admin user with matching UID  
**And** a valid request with `{ mode: 'full', count: 10 }`  
**When** the callable function is invoked  
**Then** the function executes `runFullSync(10, 0)`  
**And** the function returns `{ mode: 'full', successCount: X, failureCount: Y, parameters: { count: 10, start: 0 } }`  
**And** the invocation is logged with caller UID and parameters  
**And** pub data is synced to Firestore

#### Scenario: Successful On-Demand Update Sync
**Given** an authenticated admin user with matching UID  
**And** a valid request with `{ mode: 'update', since: '2026-01-05T00:00:00Z' }`  
**When** the callable function is invoked  
**Then** the function parses the ISO 8601 date string to a Date object  
**And** the function executes `runUpdateSync(new Date('2026-01-05T00:00:00Z'))`  
**And** the function returns `{ mode: 'update', successCount: X, failureCount: Y, parameters: { since: '2026-01-05T00:00:00Z' } }`  
**And** the invocation is logged with caller UID and parameters  
**And** pub data is synced to Firestore

#### Scenario: Invocation from Firebase CLI
**Given** the function is deployed  
**And** the admin user is authenticated with Firebase CLI  
**When** `firebase functions:call syncPubsOnDemand --data '{"mode":"full","count":5}'` is executed  
**Then** the function executes successfully  
**And** the CLI displays the returned success/failure counts  
**And** 5 pubs are processed

---

### Requirement: Administrator Authorization (REQ-SDS-016)
**Priority:** MUST  
**Category:** Security

The on-demand sync function MUST restrict access to authorized administrator user IDs.

**Acceptance Criteria:**
- Function reads admin user ID from environment variable `ADMIN_USER_ID`
- Function verifies `context.auth.uid` matches the configured admin user ID
- Unauthenticated requests are rejected with `permission-denied` error
- Requests from non-admin authenticated users are rejected with `permission-denied` error
- Error message does not reveal admin user ID
- Authorization check occurs before any sync logic executes
- Authorization failure is logged with attempted caller UID
- Environment variable can be configured separately for dev/prod environments

#### Scenario: Unauthorized Access - Not Authenticated
**Given** a request is made without Firebase Auth credentials  
**When** the callable function is invoked  
**Then** the function throws a `permission-denied` error  
**And** the error message is "Unauthorized: Admin access required"  
**And** no sync operations are performed  
**And** the attempt is logged

#### Scenario: Unauthorized Access - Wrong User
**Given** an authenticated user with UID "user123"  
**And** the environment variable `ADMIN_USER_ID` is set to "admin456"  
**When** the callable function is invoked  
**Then** the function compares "user123" with "admin456"  
**And** the function throws a `permission-denied` error  
**And** the error message is "Unauthorized: Admin access required"  
**And** no sync operations are performed  
**And** the attempt is logged with UID "user123"

#### Scenario: Authorized Access
**Given** an authenticated user with UID "admin456"  
**And** the environment variable `ADMIN_USER_ID` is set to "admin456"  
**When** the callable function is invoked  
**Then** the function compares "admin456" with "admin456"  
**And** authorization succeeds  
**And** the function proceeds to parameter validation and sync execution  
**And** the authorized invocation is logged with UID "admin456"

---

### Requirement: Sync Mode Parameter Handling (REQ-SDS-017)
**Priority:** MUST  
**Category:** Functional

The on-demand sync function MUST accept and validate parameters for both full sync and update sync modes.

**Acceptance Criteria:**
- Function accepts a `mode` parameter with values `'full'` or `'update'`
- For `mode: 'full'`, function accepts optional `count` (number) and `start` (number) parameters
- For `mode: 'update'`, function accepts required `since` (ISO 8601 date string) parameter
- Missing `mode` parameter throws `invalid-argument` error
- Invalid `mode` value throws `invalid-argument` error
- Negative `count` value throws `invalid-argument` error
- Negative `start` value throws `invalid-argument` error
- Invalid `since` date string throws `invalid-argument` error
- Missing `since` parameter for update mode throws `invalid-argument` error
- Default `start` value is 0 when omitted in full sync mode
- Parameters are passed to corresponding sync functions (`runFullSync` or `runUpdateSync`)
- Returned response includes the mode and parameters used

#### Scenario: Full Sync with Count and Start
**Given** an authorized admin user  
**And** a request with `{ mode: 'full', count: 20, start: 10 }`  
**When** the function validates parameters  
**Then** validation succeeds  
**And** the function calls `runFullSync(20, 10)`  
**And** the response includes `{ mode: 'full', parameters: { count: 20, start: 10 }, ... }`

#### Scenario: Full Sync with Count Only (Default Start)
**Given** an authorized admin user  
**And** a request with `{ mode: 'full', count: 15 }`  
**When** the function validates parameters  
**Then** validation succeeds  
**And** `start` defaults to 0  
**And** the function calls `runFullSync(15, 0)`  
**And** the response includes `{ mode: 'full', parameters: { count: 15, start: 0 }, ... }`

#### Scenario: Full Sync with No Parameters (Complete Sync)
**Given** an authorized admin user  
**And** a request with `{ mode: 'full' }`  
**When** the function validates parameters  
**Then** validation succeeds  
**And** the function calls `runFullSync(undefined, 0)`  
**And** all pubs in the sitemap are processed  
**And** the response includes `{ mode: 'full', parameters: {}, ... }`

#### Scenario: Update Sync with Valid Date
**Given** an authorized admin user  
**And** a request with `{ mode: 'update', since: '2026-01-01T00:00:00Z' }`  
**When** the function validates parameters  
**Then** validation succeeds  
**And** the ISO string is parsed to a Date object  
**And** the function calls `runUpdateSync(new Date('2026-01-01T00:00:00Z'))`  
**And** the response includes `{ mode: 'update', parameters: { since: '2026-01-01T00:00:00Z' }, ... }`

#### Scenario: Invalid Mode Parameter
**Given** an authorized admin user  
**And** a request with `{ mode: 'partial' }`  
**When** the function validates parameters  
**Then** validation fails  
**And** the function throws an `invalid-argument` error  
**And** the error message is "Invalid mode. Must be 'full' or 'update'"

#### Scenario: Missing Mode Parameter
**Given** an authorized admin user  
**And** a request with `{ count: 10 }`  
**When** the function validates parameters  
**Then** validation fails  
**And** the function throws an `invalid-argument` error  
**And** the error message is "Missing required parameter: mode"

#### Scenario: Negative Count Parameter
**Given** an authorized admin user  
**And** a request with `{ mode: 'full', count: -5 }`  
**When** the function validates parameters  
**Then** validation fails  
**And** the function throws an `invalid-argument` error  
**And** the error message is "Invalid count. Must be a non-negative number"

#### Scenario: Invalid Date String
**Given** an authorized admin user  
**And** a request with `{ mode: 'update', since: 'not-a-date' }`  
**When** the function validates parameters  
**Then** validation fails  
**And** the function throws an `invalid-argument` error  
**And** the error message is "Invalid since date. Must be a valid ISO 8601 date string"

#### Scenario: Missing Since Parameter for Update Mode
**Given** an authorized admin user  
**And** a request with `{ mode: 'update' }`  
**When** the function validates parameters  
**Then** validation fails  
**And** the function throws an `invalid-argument` error  
**And** the error message is "Missing required parameter for update mode: since"

---

### Requirement: Error Handling and Response (REQ-SDS-018)
**Priority:** MUST  
**Category:** Functional

The on-demand sync function MUST handle errors gracefully and return structured responses.

**Acceptance Criteria:**
- Authorization errors throw `HttpsError` with code `permission-denied`
- Parameter validation errors throw `HttpsError` with code `invalid-argument`
- Sync execution errors are caught, logged, and thrown as `HttpsError` with code `internal`
- Success responses include `mode`, `successCount`, `failureCount`, and `parameters` fields
- All errors include descriptive messages
- Errors do not expose sensitive information (e.g., admin UIDs, internal file paths)
- Sync function errors from `runFullSync`/`runUpdateSync` are propagated to caller

#### Scenario: Sync Execution Error
**Given** an authorized admin user with valid parameters  
**And** the `runFullSync` function throws an error  
**When** the callable function catches the error  
**Then** the error is logged with full stack trace  
**And** an `internal` error is thrown to the caller  
**And** the error message is "Sync execution failed. Check logs for details"  
**And** no sensitive information is included in the error message

#### Scenario: Successful Response Format
**Given** an authorized admin user  
**And** a request with `{ mode: 'full', count: 5 }`  
**And** the sync completes with 5 successes and 0 failures  
**When** the function returns  
**Then** the response is `{ mode: 'full', successCount: 5, failureCount: 0, parameters: { count: 5, start: 0 } }`  
**And** the response is JSON-serializable  
**And** the caller receives the response via the callable SDK

---

### Requirement: Environment Configuration (REQ-SDS-019)
**Priority:** MUST  
**Category:** Configuration

The system MUST support configuring the admin user ID via environment variables for different environments.

**Acceptance Criteria:**
- Admin user ID is read from environment variable `ADMIN_USER_ID`
- Variable can be set in `.env` file for local development
- Variable can be set via `firebase functions:config:set` for production
- Missing environment variable is handled gracefully (function fails fast with clear error)
- Different values can be configured for development, staging, and production
- Environment variable is not committed to version control
- Documentation includes instructions for setting the variable

#### Scenario: Development Environment Configuration
**Given** a local development environment  
**And** a `.env` file with `ADMIN_USER_ID=dev-admin-uid`  
**When** the function runs locally or in emulator  
**Then** the function reads "dev-admin-uid" as the admin user ID  
**And** requests from users with UID "dev-admin-uid" are authorized

#### Scenario: Production Environment Configuration
**Given** a production Firebase environment  
**And** the config is set via `firebase functions:config:set admin.user_id=prod-admin-uid`  
**When** the function is deployed to production  
**Then** the function reads "prod-admin-uid" from `process.env.ADMIN_USER_ID`  
**And** requests from users with UID "prod-admin-uid" are authorized

#### Scenario: Missing Environment Variable
**Given** the environment variable `ADMIN_USER_ID` is not set  
**When** an authenticated user calls the function  
**Then** the function checks for the environment variable  
**And** the function throws an `internal` error  
**And** the error message is "Server configuration error: ADMIN_USER_ID not set"  
**And** the error is logged for administrators to fix

---

## MODIFIED Requirements

None - all existing requirements remain unchanged. The scheduled sync continues to operate independently.
