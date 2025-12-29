# firebase-data-integration Specification Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
