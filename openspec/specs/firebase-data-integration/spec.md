# firebase-data-integration Specification

## Purpose
TBD - created by archiving change add-firebase-backend. Update Purpose after archive.
## Requirements
### Requirement: Firebase SDK Initialization (REQ-FDI-001)
**Priority:** MUST  
**Category:** Functional

The system MUST initialize the Firebase SDK with proper configuration and make Firestore service available to the application.

**Acceptance Criteria:**
- Firebase SDK is initialized on application startup
- Configuration is loaded from environment variables (VITE_FIREBASE_*)
- Firestore database instance is created and exported
- Invalid or missing configuration is detected and logged
- Initialization errors are caught and handled gracefully
- Firebase initialization does not block application rendering

#### Scenario: Successful Firebase Initialization
**Given** all required Firebase environment variables are set  
**When** the application starts  
**Then** Firebase SDK initializes successfully  
**And** Firestore database instance is available  
**And** no errors are logged

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

