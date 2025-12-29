# user-signup Specification Delta

## MODIFIED Requirements

### Requirement: Test Account Registration (REQ-US-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- REMOVE: In-memory test accounts array
- ADD: Firebase Authentication user creation
- UPDATE: Use Firebase createUserWithEmailAndPassword
- UPDATE: Email uniqueness validated by Firebase

The system MUST support registration of user accounts using Firebase Authentication.

**Updated Acceptance Criteria:**
- **REMOVED:** System maintains array of test accounts in memory
- **REMOVED:** Default test account exists: username "test", email "test@example.com", password "password123"
- **REMOVED:** New signups add account to test accounts array
- **REMOVED:** Test accounts are lost on page reload
- **ADDED:** New signups create Firebase Auth user account
- **ADDED:** Firebase handles password hashing and secure storage
- **ADDED:** User accounts persist in Firebase (not lost on reload)
- Successful registration stores email in Firebase (username handling deferred to future user profile feature)
- **MODIFIED:** Registration validates email uniqueness via Firebase (auth/email-already-in-use error)
- Email already registered shows error "Email already registered. Please log in."
- Successful registration automatically logs user in via Firebase session
- **MODIFIED:** After successful registration, user is logged in automatically (no need to open login dialog)

#### Scenario: Register New Account with Firebase
**MODIFIED:**
**Given** the signup form is open  
**And** no Firebase Auth account exists with email "newuser@example.com"  
**When** the user submits valid signup data:  
  - username: "newuser"  
  - email: "newuser@example.com"  
  - password: "password123"  
  - confirm password: "password123"  
**Then** Firebase createUserWithEmailAndPassword is called  
**And** a new Firebase Auth user is created  
**And** the user is automatically logged in  
**And** a success message is displayed  
**And** the signup dialog closes  
**And** the user sees authenticated UI  
**And** the user does not need to log in separately

#### Scenario: Attempt to Register with Existing Email
**MODIFIED:**
**Given** the signup form is open  
**And** a Firebase Auth account already exists with email "test@example.com"  
**When** the user submits signup data with email "test@example.com"  
**Then** Firebase returns error code "auth/email-already-in-use"  
**And** an error message "Email already registered. Please log in." is displayed  
**And** the form is not submitted  
**And** no new account is created

#### Scenario: Login with Newly Registered Account
**REMOVED** (User is automatically logged in after registration)

#### Scenario: Firebase Weak Password Rejection
**ADDED:**
**Given** the signup form is open  
**And** the user submits signup data with password "weak"  
**When** Firebase validates the password  
**Then** Firebase returns error code "auth/weak-password"  
**And** an error message "Password must be at least 8 characters long." is displayed  
**And** the form is not submitted

---

## ADDED Requirements

### Requirement: Firebase User Creation (REQ-US-006)
**Priority:** MUST  
**Category:** Technical

The system MUST use Firebase createUserWithEmailAndPassword to create new user accounts.

**Acceptance Criteria:**
- Signup uses Firebase Auth createUserWithEmailAndPassword method
- Method is called with email and password from form
- Firebase automatically hashes and stores password securely
- Successful creation returns Firebase User object
- User object includes uid, email
- Firebase error codes are mapped to user-friendly messages
- On success, user is automatically logged in via Firebase session
- Username field is not stored in Firebase Auth (deferred to future user profile feature)

#### Scenario: Successful Firebase User Creation
**Given** the signup form is submitted with valid data  
**And** no Firebase user exists with the provided email  
**When** createUserWithEmailAndPassword is called  
**Then** a new Firebase Auth user is created  
**And** the method resolves with UserCredential object  
**And** the UserCredential contains user with uid and email  
**And** the user is automatically signed in  
**And** onAuthStateChanged fires with the new user

#### Scenario: Firebase Error Handling
**Given** the signup form is submitted  
**When** Firebase createUserWithEmailAndPassword rejects with error  
**Then** the error code is mapped to user-friendly message  
**And** the error is displayed in the signup form  
**And** the form remains open for correction

---

### Requirement: Signup Error Mapping (REQ-US-007)
**Priority:** MUST  
**Category:** Functional

The system MUST map Firebase signup error codes to user-friendly error messages.

**Acceptance Criteria:**
- Error code "auth/email-already-in-use" → "Email already registered. Please log in."
- Error code "auth/invalid-email" → "Invalid email address format."
- Error code "auth/weak-password" → "Password must be at least 8 characters long."
- Error code "auth/operation-not-allowed" → "Email/password accounts are not enabled. Please contact support."
- Default unknown errors → "An error occurred. Please try again."
- Error messages are displayed in the error container
- Error messages replace any previous errors
- Error messages clear when form is successfully submitted

#### Scenario: Display Email Already in Use Error
**Given** the signup form is submitted  
**And** Firebase returns error code "auth/email-already-in-use"  
**When** the error is processed  
**Then** the error message "Email already registered. Please log in." is displayed  
**And** the error container is visible  
**And** the form remains open

#### Scenario: Display Weak Password Error
**Given** the signup form is submitted with password "short"  
**And** Firebase returns error code "auth/weak-password"  
**When** the error is processed  
**Then** the error message "Password must be at least 8 characters long." is displayed  
**And** the form remains open
