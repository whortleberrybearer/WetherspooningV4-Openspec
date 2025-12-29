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

The system MUST validate pub data retrieved from Firestore against expected schema and handle invalid data gracefully.

**Acceptance Criteria:**
- Pub documents are validated for required fields: id, name, lat, lng
- Optional fields are type-checked if present
- Invalid documents are logged with document ID
- Invalid documents are skipped without throwing errors
- Valid documents from the same query are still returned

#### Scenario: Skip Invalid Pub Missing Required Field
**Given** a Firestore pub document is missing the `name` field  
**When** `getAllPubs()` processes the query results  
**Then** a warning is logged: "Invalid pub document {docId}: missing required field 'name'"  
**And** the invalid document is excluded from results  
**And** other valid pubs are returned

#### Scenario: Handle Invalid Data Type
**Given** a Firestore pub document has `lat` as a string instead of number  
**When** `getAllPubs()` processes the document  
**Then** a warning is logged with the document ID and field name  
**And** the document is skipped  
**And** the application does not crash

---

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

The system MUST provide methods to retrieve user visit data from Firestore with proper error handling and data validation.

**Acceptance Criteria:**
- `getUserVisits(userId: string)` method retrieves all visit documents for a specific user
- Method returns properly typed Visit objects matching Visit interface
- Query filters visits where `userId` field equals provided parameter
- Invalid or missing fields in visit documents are handled gracefully
- Network errors are caught and logged
- Empty results return empty array (not error)
- Query results are validated against Visit interface schema
- Queries have 10-second timeout
- Method is exported from firebaseDataService

#### Scenario: Retrieve User Visits Successfully
**Given** the Firestore `visits` collection contains 5 visit documents for user "uid-123"  
**And** all documents have valid required fields (id, userId, pubId)  
**When** `getUserVisits("uid-123")` is called  
**Then** a Promise resolves with an array of 5 Visit objects  
**And** each Visit object has required fields: id, userId, pubId  
**And** the operation completes within 2 seconds

#### Scenario: Filter Visits by User ID
**Given** the Firestore `visits` collection contains:
- 5 visits for user "uid-123"
- 3 visits for user "uid-456"  
**When** `getUserVisits("uid-123")` is called  
**Then** only the 5 visits for "uid-123" are returned  
**And** visits for "uid-456" are not included

#### Scenario: Handle User with No Visits
**Given** the Firestore `visits` collection contains no documents for user "uid-999"  
**When** `getUserVisits("uid-999")` is called  
**Then** a Promise resolves with an empty array  
**And** no error is thrown or logged

#### Scenario: Handle Invalid Visit Data
**Given** a Firestore visit document is missing required field `pubId`:
```json
{
  "id": 1,
  "userId": "uid-123"
}
```
**When** `getUserVisits("uid-123")` is called  
**Then** the invalid document is skipped  
**And** a warning is logged to console  
**And** other valid visits are still returned

#### Scenario: Handle Network Timeout
**Given** the Firestore query takes longer than 10 seconds  
**When** `getUserVisits("uid-123")` is called  
**Then** the operation times out  
**And** an error is thrown with message "Firestore operation timed out: getUserVisits"  
**And** the error is logged to console

---

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

