# firebase-data-integration Specification

## Purpose
TBD - created by archiving change add-firebase-backend. Update Purpose after archive.
## Requirements
### Requirement: Firebase SDK Initialization (REQ-FDI-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Firebase Auth SDK initialization
- UPDATE: Export auth instance alongside db instance

The system MUST initialize the Firebase SDK including Authentication and Firestore services.

**Updated Acceptance Criteria:**
- Firebase SDK is initialized on application startup
- Configuration is loaded from environment variables (VITE_FIREBASE_*)
- Firestore database instance is created and exported
- **ADDED:** Firebase Auth instance is created and exported
- **ADDED:** Auth instance uses getAuth(app)
- Invalid or missing configuration is detected and logged
- Initialization errors are caught and handled gracefully
- Firebase initialization does not block application rendering
- **ADDED:** In development mode, Auth connects to emulator on localhost:9099
- **ADDED:** Auth emulator connection is logged to console

#### Scenario: Successful Firebase Initialization
**MODIFIED:**
**Given** all required Firebase environment variables are set  
**When** the application starts  
**Then** Firebase SDK initializes successfully  
**And** Firestore database instance is available  
**And** Firebase Auth instance is available  
**And** both instances are exported from firebase.ts  
**And** no errors are logged

#### Scenario: Auth Emulator Connection in Development
**ADDED:**
**Given** the application is running in development mode (import.meta.env.DEV)  
**When** Firebase is initialized  
**Then** Firestore connects to emulator at localhost:8080  
**And** Auth connects to emulator at localhost:9099  
**And** console logs "🔥 Connected to Firestore Emulator"  
**And** console logs "🔥 Connected to Auth Emulator"

#### Scenario: Missing Firebase Configuration
**Given** one or more required Firebase environment variables are missing  
**When** the application attempts to initialize Firebase  
**Then** an error is caught and logged to console  
**And** a user-friendly error message is displayed  
**And** the application falls back to offline mode or displays setup instructions

#### Scenario: Invalid Firebase Configuration
**Given** Firebase environment variables contain invalid values  
**When** the application attempts to initialize Firebase  
**Then** Firebase SDK throws a configuration error  
**And** the error is caught and logged with details  
**And** the application handles the error gracefully

---

### Requirement: Firestore Pub Data Operations (REQ-FDI-002)
**Priority:** MUST  
**Category:** Functional

The system MUST provide methods to retrieve pub data from Firestore with proper error handling and data validation.

**Acceptance Criteria:**
- `getAllPubs()` method retrieves all pub documents from `pubs` collection
- `getPubById(pubId: number)` method retrieves a single pub by ID
- All methods return properly typed Pub objects
- Invalid or missing fields in Firestore documents are handled gracefully
- Network errors are caught and logged
- Empty results return empty array or null (not error)
- Query results are validated against Pub interface schema
- Queries have 10-second timeout

#### Scenario: Retrieve All Pubs Successfully
**Given** the Firestore `pubs` collection contains 20 pub documents  
**And** all documents have valid required fields  
**When** `getAllPubs()` is called  
**Then** a Promise resolves with an array of 20 Pub objects  
**And** each Pub object has required fields: id, name, lat, lng  
**And** the operation completes within 2 seconds

#### Scenario: Retrieve Single Pub by ID
**Given** the Firestore `pubs` collection contains a pub with id 5  
**When** `getPubById(5)` is called  
**Then** a Promise resolves with the Pub object for id 5  
**And** the Pub object contains all available fields from Firestore

#### Scenario: Handle Missing Pub
**Given** the Firestore `pubs` collection does not contain a pub with id 999  
**When** `getPubById(999)` is called  
**Then** a Promise resolves with null  
**And** no error is thrown or logged

#### Scenario: Handle Invalid Pub Data
**Given** a Firestore pub document is missing required field `lat`  
**When** `getAllPubs()` processes this document  
**Then** a warning is logged to console with the document ID  
**And** the invalid document is skipped  
**And** other valid pubs are still returned

#### Scenario: Handle Network Error
**Given** the user has no internet connection  
**When** `getAllPubs()` is called  
**Then** the operation fails after timeout (10 seconds)  
**And** the Promise rejects with a network error  
**And** the error is logged to console  
**And** the calling component receives the error

---

### Requirement: Data Schema Validation (REQ-FDI-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFY: Make `country` and `region` optional in pub validation
- MODIFY: Update required fields list to exclude country and region

The system SHALL validate pub data with optional country and region fields, treating them as valid when null, undefined, or omitted while still enforcing type checking when values are provided.

**Updated Acceptance Criteria:**
- Pub documents SHALL be validated for required fields: id, name, townCity, address, county
- **REMOVED:** country and region from required fields list
- **ADDED:** country and region SHALL be optional fields
- **ADDED:** Optional fields SHALL be allowed as null, undefined, or omitted
- Optional fields SHALL be type-checked if present (must be string if provided)
- Invalid documents SHALL be logged with document ID
- Invalid documents SHALL be skipped without throwing errors
- Valid documents from the same query SHALL still be returned

#### Scenario: Accept Pub Without Country
**ADDED:**
**Given** a Firestore pub document with all required fields except country
**And** the document structure is:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "TestCity",
  "address": "123 Test St",
  "county": "TestCounty",
  "region": "Test Region",
  "position": {"lat": 51.5, "lng": -0.1}
}
```
**When** `getAllPubs()` processes the document
**Then** the pub is validated successfully
**And** no warning is logged
**And** the pub is included in results
**And** pub.country is undefined

#### Scenario: Accept Pub Without Region
**ADDED:**
**Given** a Firestore pub document with all required fields except region
**And** the document structure is:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "TestCity",
  "address": "123 Test St",
  "county": "TestCounty",
  "country": "England",
  "position": {"lat": 51.5, "lng": -0.1}
}
```
**When** `getAllPubs()` processes the document
**Then** the pub is validated successfully
**And** no warning is logged
**And** the pub is included in results
**And** pub.region is undefined

#### Scenario: Accept Pub Without Both Country and Region
**ADDED:**
**Given** a Firestore pub document with all required fields but no country or region
**And** the document structure is:
```json
{
  "id": "abc-123",
  "name": "The Test Pub",
  "townCity": "TestCity",
  "address": "123 Test St",
  "county": "TestCounty",
  "position": {"lat": 51.5, "lng": -0.1}
}
```
**When** `getAllPubs()` processes the document
**Then** the pub is validated successfully
**And** no warning is logged
**And** the pub is included in results
**And** pub.country is undefined
**And** pub.region is undefined

#### Scenario: Reject Pub with Invalid Country Type
**ADDED:**
**Given** a Firestore pub document with country as a number instead of string
**And** the document has `"country": 123`
**When** `getAllPubs()` processes the document
**Then** a warning is logged with the document ID and field name
**And** the document is skipped
**And** the application does not crash

### Requirement: Error Handling and Logging (REQ-FDI-004)
**Priority:** MUST  
**Category:** Functional

The system MUST handle Firebase errors appropriately and provide meaningful logging for debugging.

**Acceptance Criteria:**
- Network errors are caught and logged with error type
- Permission errors are caught and logged with user context
- Timeout errors are caught and logged with operation details
- All errors include timestamp and operation name
- Errors are logged to console with appropriate severity (error, warn)
- User-facing components receive structured error objects
- Sensitive information (API keys, tokens) is never logged

#### Scenario: Handle Network Timeout
**Given** the user's network is slow  
**When** `getAllPubs()` exceeds 10-second timeout  
**Then** the operation is cancelled  
**And** an error is logged: "Firestore operation timed out: getAllPubs"  
**And** the Promise rejects with a timeout error

#### Scenario: Handle Permission Denied Error
**Given** Firestore security rules deny read access  
**When** `getAllPubs()` attempts to read pubs  
**Then** the error is caught  
**And** a console error is logged with sanitized details  
**And** the Promise rejects with a permissions error

---

### Requirement: Environment Configuration (REQ-FDI-005)
**Priority:** MUST  
**Category:** Functional

The system MUST load Firebase configuration from environment variables and validate completeness.

**Acceptance Criteria:**
- Configuration requires all 6 Firebase environment variables:
  - VITE_FIREBASE_API_KEY
  - VITE_FIREBASE_AUTH_DOMAIN
  - VITE_FIREBASE_PROJECT_ID
  - VITE_FIREBASE_STORAGE_BUCKET
  - VITE_FIREBASE_MESSAGING_SENDER_ID
  - VITE_FIREBASE_APP_ID
- Missing variables are detected before initialization
- `.env.example` file documents all required variables
- `.env.local` is added to `.gitignore`
- Configuration validation happens on application startup

#### Scenario: Load Complete Configuration
**Given** all 6 Firebase environment variables are set in `.env.local`  
**When** the application loads the configuration  
**Then** Firebase SDK is initialized with the provided values  
**And** no configuration errors are logged

#### Scenario: Detect Missing Environment Variable
**Given** `VITE_FIREBASE_API_KEY` is not set  
**When** the application attempts to load Firebase configuration  
**Then** an error is logged: "Missing required Firebase environment variable: VITE_FIREBASE_API_KEY"  
**And** Firebase initialization is skipped  
**And** the application displays a setup error message

---

### Requirement: Firestore Security Rules (REQ-FDI-006)
**Priority:** MUST  
**Category:** Security

The system MUST implement Firestore security rules to protect pub data access.

**Acceptance Criteria:**
- Pubs collection is publicly readable (no authentication required)
- Pubs collection cannot be modified via client SDK
- Security rules are deployed to Firestore before going live

#### Scenario: Any User Reads Pubs
**Given** any user (authenticated or not)  
**When** the user queries the `pubs` collection  
**Then** Firestore security rules allow the read  
**And** all pub documents are returned

#### Scenario: User Cannot Modify Pubs
**Given** any user attempts to update a document in the `pubs` collection  
**When** the write operation is attempted  
**Then** Firestore security rules deny the write  
**And** a permissions error is returned

### Requirement: Firebase Auth Export (REQ-FDI-007)
**Priority:** MUST  
**Category:** Technical

The system MUST export Firebase Auth instance for use by authentication composables.

**Acceptance Criteria:**
- firebase.ts exports named export `auth`
- `auth` is created using getAuth(app)
- `auth` instance is available for import by useAuth and other composables
- `auth` uses same Firebase app instance as Firestore
- In development, `auth` is connected to emulator before export

#### Scenario: Import Auth Instance in Composable
**Given** firebase.ts has initialized and exported auth  
**When** a composable imports { auth } from '@/lib/firebase'  
**Then** the import succeeds  
**And** auth is a valid Firebase Auth instance  
**And** auth can be used with Firebase Auth SDK methods

---

### Requirement: Auth Emulator Configuration (REQ-FDI-008)
**Priority:** MUST  
**Category:** Technical

The system MUST connect Firebase Auth to emulator in development mode for local testing.

**Acceptance Criteria:**
- In development mode (import.meta.env.DEV), connectAuthEmulator is called
- Emulator connection uses localhost:9099
- Emulator connection happens before auth instance is used
- Emulator connection is logged to console
- In production mode, no emulator connection is attempted
- Emulator connection errors are caught and logged

#### Scenario: Connect to Auth Emulator
**Given** the application is in development mode  
**When** Firebase Auth is initialized  
**Then** connectAuthEmulator(auth, 'http://localhost:9099') is called  
**And** subsequent auth operations use the emulator  
**And** console logs "🔥 Connected to Auth Emulator"

#### Scenario: Skip Emulator in Production
**Given** the application is in production mode  
**When** Firebase Auth is initialized  
**Then** no emulator connection is attempted  
**And** auth operations use production Firebase project

### Requirement: Firestore Visit Data Operations (REQ-FDI-004)
**Priority:** MUST
**Category:** Functional

**Changes:**
- ADD: Write operations in addition to read operations
- UPDATE: Expanded scope to include create, update, delete methods

The system MUST provide methods to read and write visit documents in Firestore.

**Updated Acceptance Criteria:**
- **EXISTING:** `getUserVisits(userId: string)` returns array of Visit objects for user
- **NEW:** `createVisit(visit)` creates new visit and returns Visit with generated ID
- **NEW:** `updateVisit(visitId, updates)` updates existing visit fields
- **NEW:** `deleteVisit(visitId)` deletes visit document
- All operations use appropriate timeout handling
- All operations validate inputs before Firestore calls
- All operations log errors and handle failures gracefully

#### Scenario: Complete Lifecycle of a Visit
**ADDED:**
**Given** user is authenticated with UID "user123"
**When** `createVisit({ userId: 'user123', pubId: 42, visitedAt: '2025-12-15' })` is called
**Then** a visit is created with id 1
**When** `updateVisit(1, { notes: 'Great pub!' })` is called
**Then** the visit is updated with notes
**When** `getUserVisits('user123')` is called
**Then** the returned array includes the updated visit
**When** `deleteVisit(1)` is called
**Then** the visit is deleted
**When** `getUserVisits('user123')` is called again
**Then** the returned array is empty

### Requirement: Visit Data Validation (REQ-FDI-005)
**Priority:** MUST  
**Category:** Functional

The system MUST validate visit document structure and required fields before returning visit objects.

**Acceptance Criteria:**
- Visit validator function checks for required fields: id, userId, pubId
- `userId` must be a non-empty string
- `pubId` must be a positive number
- `id` must be a positive number
- Optional fields (visitedAt, rating, notes) are type-checked if present
- `rating` must be between 1 and 5 if provided
- `visitedAt` must be a valid ISO 8601 date string if provided
- Invalid documents trigger console warning with document details
- Validation does not throw errors (returns false for invalid)

#### Scenario: Validate Complete Visit Document
**Given** a visit document with all required and optional fields:
```json
{
  "id": 1,
  "userId": "uid-123",
  "pubId": 5,
  "visitedAt": "2025-12-15T14:30:00Z",
  "rating": 4,
  "notes": "Great atmosphere!"
}
```
**When** the document is validated  
**Then** validation returns true  
**And** the document is included in results

#### Scenario: Reject Visit Missing Required Field
**Given** a visit document missing `userId`:
```json
{
  "id": 1,
  "pubId": 5
}
```
**When** the document is validated  
**Then** validation returns false  
**And** a warning is logged: "Invalid visit document: missing required field 'userId'"

#### Scenario: Reject Visit with Invalid Rating
**Given** a visit document with rating outside 1-5 range:
```json
{
  "id": 1,
  "userId": "uid-123",
  "pubId": 5,
  "rating": 6
}
```
**When** the document is validated  
**Then** validation returns false  
**And** a warning is logged: "Invalid visit document: rating must be between 1 and 5"

#### Scenario: Accept Visit with Minimal Fields
**Given** a visit document with only required fields:
```json
{
  "id": 1,
  "userId": "uid-123",
  "pubId": 5
}
```
**When** the document is validated  
**Then** validation returns true  
**And** the document is included in results

---

### Requirement: Visit Collection Structure (REQ-FDI-006)
**Priority:** MUST  
**Category:** Functional

The system MUST define and document the Firestore schema for the visits collection.

**Acceptance Criteria:**
- Visits stored in top-level `visits` collection (not subcollection)
- Each document represents a single pub visit
- Document ID is auto-generated by Firestore
- Required fields: `id` (number), `userId` (string), `pubId` (number)
- Optional fields: `visitedAt` (string), `rating` (number), `notes` (string)
- `createdAt` server timestamp field for audit trail
- Collection supports composite index on (userId, pubId)
- Schema documented in service file comments

#### Scenario: Visit Document Structure
**Given** a user marks pub 5 as visited  
**When** the visit is stored in Firestore  
**Then** the document is created in `visits` collection  
**And** the document has auto-generated ID  
**And** the document contains userId, pubId, and createdAt timestamp  
**And** optional fields are included if provided

#### Scenario: Query Visits by User
**Given** visits collection has index on (userId, pubId)  
**When** querying `visits.where('userId', '==', 'uid-123')`  
**Then** the query uses the composite index  
**And** results are returned efficiently (no full collection scan)

#### Scenario: Prevent Duplicate Visits
**Given** a user has already visited pub 5  
**When** checking if visit exists before creating new one  
**Then** query `visits.where('userId', '==', uid).where('pubId', '==', 5)`  
**And** existing visit is found  
**And** duplicate creation is prevented (application logic, not Firestore constraint)

### Requirement: Firestore Visit Write Operations (REQ-FDI-009)
**Priority:** MUST
**Category:** Functional

The system MUST provide methods to create, update, and delete visit documents in Firestore.

**Acceptance Criteria:**
- `createVisit(visit: Omit<Visit, 'id'>) => Promise<Visit>` creates new visit with generated ID
- `updateVisit(visitId: number, updates: Partial<Visit>) => Promise<void>` updates existing visit
- `deleteVisit(visitId: number) => Promise<void>` deletes visit document
- Operations use Firestore SDK methods: `addDoc`, `setDoc`, `updateDoc`, `deleteDoc`
- All operations respect 10-second timeout
- All operations log errors and throw on failure
- Created visits return complete Visit object including generated ID
- Updated visits merge changes with existing data
- Delete operations use document ID for direct deletion

#### Scenario: Create New Visit
**Given** user is authenticated with UID "user123"
**When** `createVisit({ userId: 'user123', pubId: 42, visitedAt: '2025-12-15' })` is called
**Then** a new document is created in `visits` collection
**And** the document has a unique numeric ID
**And** the document contains all provided fields
**And** the method returns a Visit object with the generated ID

#### Scenario: Update Existing Visit Date
**Given** a visit with id 100 exists with `visitedAt: '2025-11-01'`
**When** `updateVisit(100, { visitedAt: '2025-12-15' })` is called
**Then** the Firestore document is updated
**And** only the `visitedAt` field is modified
**And** other fields remain unchanged

#### Scenario: Delete Visit by ID
**Given** a visit with id 100 exists
**When** `deleteVisit(100)` is called
**Then** the document is deleted from Firestore
**And** subsequent reads for visit 100 return nothing

#### Scenario: Handle Create Timeout
**Given** the Firestore create operation takes longer than 10 seconds
**When** `createVisit(...)` is called
**Then** the operation times out
**And** an error is thrown: "Firestore operation timed out: createVisit"

---

### Requirement: Visit ID Generation (REQ-FDI-010)
**Priority:** MUST
**Category:** Functional

The system MUST generate unique numeric IDs for new visit documents.

**Acceptance Criteria:**
- Query existing visits to find maximum ID
- Generate new ID as `maxId + 1`
- Use generated ID as Firestore document ID (string representation)
- Handle case when no visits exist (start at 1)
- Retry with incremented ID if document already exists
- Maximum 3 retry attempts before throwing error

#### Scenario: Generate First Visit ID
**Given** the visits collection is empty
**When** `createVisit(...)` is called
**Then** the new visit is assigned id 1
**And** the Firestore document ID is "1"

#### Scenario: Generate Sequential ID
**Given** the visits collection has 150 documents
**And** the maximum id is 150
**When** `createVisit(...)` is called
**Then** the new visit is assigned id 151

#### Scenario: Handle ID Collision with Retry
**Given** the maximum id is 150
**When** `createVisit(...)` attempts to use id 151
**And** document "151" already exists
**Then** the operation retries with id 152
**And** succeeds if id 152 is available

#### Scenario: Fail After Maximum Retries
**Given** id collision occurs 3 times consecutively
**When** `createVisit(...)` retries 3 times
**Then** an error is thrown: "Failed to generate unique visit ID"

---

### Requirement: Visit Mutation Validation (REQ-FDI-011)
**Priority:** MUST
**Category:** Functional

The system MUST validate visit data before persisting mutations to Firestore.

**Acceptance Criteria:**
- `userId` must be non-empty string
- `pubId` must be positive number
- `visitedAt` must be valid ISO 8601 string if provided
- `visitedAt` can be undefined/null
- `rating` must be 1-5 if provided
- `notes` must be string if provided
- Validation errors throw descriptive messages
- Invalid data is not written to Firestore

#### Scenario: Reject Create with Invalid userId
**Given** `createVisit({ userId: '', pubId: 42 })` is called
**When** validation occurs
**Then** an error is thrown: "userId must be a non-empty string"
**And** no Firestore write occurs

#### Scenario: Reject Update with Invalid Rating
**Given** a visit exists with id 100
**When** `updateVisit(100, { rating: 10 })` is called
**Then** an error is thrown: "rating must be between 1 and 5"
**And** no Firestore write occurs

#### Scenario: Accept Update with Undefined visitedAt
**Given** a visit exists with id 100
**When** `updateVisit(100, { visitedAt: undefined })` is called
**Then** validation passes
**And** the `visitedAt` field is removed from the document

---

### Requirement: User Data Deletion (REQ-FDI-015)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a method to delete all user-specific data from Firestore.

**Acceptance Criteria:**
- `deleteUserData(userId: string)` method is available in firebaseDataService
- Method deletes all visits documents where userId matches
- Method uses Firestore batch operations for atomic deletion
- Method commits batch operation
- Successful deletion resolves Promise without error
- Failed deletion rejects Promise with error message
- Method handles case where user has no visits (succeeds without error)
- Method validates userId parameter is provided and non-empty
- Network errors are caught and returned as error messages
- Error messages are user-friendly

#### Scenario: Delete All User Visits
**Given** a user with userId "user123" has 5 visit documents in Firestore  
**When** `deleteUserData("user123")` is called  
**Then** a Firestore query finds all visits where userId equals "user123"  
**And** all 5 visit documents are added to a batch delete operation  
**And** the batch is committed  
**And** all 5 visits are deleted from Firestore  
**And** the Promise resolves successfully

#### Scenario: Delete User Data When No Visits Exist
**Given** a user with userId "user456" has no visit documents in Firestore  
**When** `deleteUserData("user456")` is called  
**Then** a Firestore query finds no visits where userId equals "user456"  
**And** an empty batch operation is created  
**And** the batch is committed (no-op)  
**And** the Promise resolves successfully

#### Scenario: Handle Invalid UserId Parameter
**Given** the deleteUserData method is called  
**When** the userId parameter is empty string ""  
**Then** the Promise rejects immediately with error message "Invalid user ID provided."  
**And** no Firestore operations are performed

#### Scenario: Handle Network Error During Deletion
**Given** a user with userId "user123" has visits in Firestore  
**And** the network is unavailable  
**When** `deleteUserData("user123")` is called  
**Then** the Firestore query or batch commit fails  
**And** the Promise rejects with error message "Failed to delete user data. Please check your connection and try again."  
**And** no visits are deleted (batch ensures atomicity)

#### Scenario: Handle Partial Query Failure
**Given** a user with userId "user123" has visits in Firestore  
**And** the Firestore query fails due to permissions or network error  
**When** `deleteUserData("user123")` is called  
**Then** the query operation fails  
**And** the Promise rejects with error message "Failed to retrieve user data for deletion. Please try again."  
**And** no visits are deleted

---

### Requirement: Batch Deletion Atomicity (REQ-FDI-016)
**Priority:** MUST  
**Category:** Functional

The system MUST ensure user data deletion is atomic using Firestore batch operations.

**Acceptance Criteria:**
- All visit deletions for a user happen in a single batch
- Batch size does not exceed Firestore limit (500 operations)
- If batch commit fails, no visits are deleted
- If batch commit succeeds, all visits are deleted
- Partial deletions do not occur
- Method handles large numbers of visits (>500) by splitting into multiple batches
- All batches must succeed for Promise to resolve
- If any batch fails, method returns error and stops processing

#### Scenario: Delete User with Many Visits Using Multiple Batches
**Given** a user with userId "user123" has 750 visit documents in Firestore  
**When** `deleteUserData("user123")` is called  
**Then** the first batch contains 500 delete operations  
**And** the first batch is committed  
**And** the second batch contains 250 delete operations  
**And** the second batch is committed  
**And** all 750 visits are deleted from Firestore  
**And** the Promise resolves successfully

#### Scenario: Handle Multi-Batch Failure
**Given** a user with userId "user123" has 750 visit documents  
**And** the first batch of 500 deletions succeeds  
**And** the second batch of 250 deletions fails due to network error  
**When** `deleteUserData("user123")` is called  
**Then** the first 500 visits are deleted  
**And** the second batch fails  
**And** the Promise rejects with error message "Failed to delete all user data. Some data may remain. Please try again."  
**And** 250 visits remain in Firestore

#### Scenario: Ensure Single Batch Atomicity
**Given** a user with userId "user123" has 50 visit documents  
**And** a network error occurs during batch commit  
**When** `deleteUserData("user123")` is called  
**Then** the batch commit fails  
**And** no visits are deleted from Firestore  
**And** the Promise rejects with error message "Failed to delete user data. Please check your connection and try again."

