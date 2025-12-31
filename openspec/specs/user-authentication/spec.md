# user-authentication Specification

## Purpose
TBD - created by archiving change add-user-authentication. Update Purpose after archive.
## Requirements
### Requirement: Login Form (REQ-UA-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: "Sign up" link in footer must trigger signup dialog and close login dialog
- UPDATE: Footer "Sign up" link behavior defined

The system MUST provide a login form that accepts email and password credentials.

**Updated Acceptance Criteria:**
- Login form is accessible via a "Login" button
- Form contains email input field
- Email field uses placeholder "m@example.com"
- Form contains password input field
- Password field masks input characters
- Password label includes "Forgot your password?" link aligned to the right
- Form has a submit button labeled "Login"
- Form includes visual divider with "Or continue with" text below submit button
- Form includes "Login with Google" button with Google logo icon
- Form includes "Don't have an account? Sign up" footer text with clickable link
- **CHANGED:** "Sign up" link triggers signup dialog opening and login dialog closing
- Form can be dismissed/closed without submitting
- Form clears both email and password fields when closed
- Form is accessible via keyboard navigation
- Submit button is disabled when either field is empty
- Form displays as modal dialog
- Dialog shows title "Login to your account"
- Dialog shows description "Enter your email below to login to your account"

#### Scenario: Navigate to Signup from Login
**ADDED:**
**Given** the login form is open  
**When** the user clicks the "Sign up" link  
**Then** the login dialog closes  
**And** the signup dialog opens  
**And** the login form fields are cleared

### Requirement: Authentication Validation (REQ-UA-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- REMOVE: Test credentials validation (test@example.com / password123)
- ADD: Firebase Authentication integration for credential validation
- UPDATE: Use Firebase Auth SDK for login validation
- UPDATE: Error messages map Firebase error codes to user-friendly text

The system MUST validate user credentials using Firebase Authentication and update authentication state accordingly.

**Updated Acceptance Criteria:**
- **REMOVED:** Test email is "test@example.com"
- **REMOVED:** Test password is "password123"
- **REMOVED:** Validation is case-sensitive for both email and password
- **ADDED:** Credentials are validated against Firebase Authentication
- **ADDED:** Firebase Auth errors are mapped to user-friendly messages
- Successful login sets authenticated state to true
- Successful login stores user information (username, email, uid)
- Failed login sets error state
- Failed login keeps authenticated state as false
- Empty email or password shows validation error
- Validation happens on form submit only, not on field change

#### Scenario: Successful Login with Firebase
**MODIFIED:**
**Given** the login form is open  
**And** a user account exists in Firebase Auth with email "user@example.com"  
**And** the user enters email "user@example.com"  
**And** the user enters the correct password  
**When** the user submits the form  
**Then** Firebase Authentication validates the credentials  
**And** the user is authenticated  
**And** the user state contains email "user@example.com"  
**And** the user state contains uid from Firebase  
**And** the login form closes  
**And** the authenticated state is true

#### Scenario: Invalid Credentials with Firebase
**MODIFIED:**
**Given** the login form is open  
**And** the user enters email "user@example.com"  
**And** the user enters an incorrect password  
**When** the user submits the form  
**Then** Firebase Authentication rejects the credentials  
**And** an error message displays "Invalid email or password"  
**And** the user is not authenticated  
**And** the login form remains open  
**And** the password field is cleared

#### Scenario: Non-existent User
**ADDED:**
**Given** the login form is open  
**And** no user account exists with email "nonexistent@example.com"  
**And** the user enters email "nonexistent@example.com"  
**And** the user enters any password  
**When** the user submits the form  
**Then** Firebase Authentication rejects the credentials  
**And** an error message displays "Invalid email or password"  
**And** the user is not authenticated

#### Scenario: Empty Fields
**Given** the login form is open  
**And** the email field is empty  
**Or** the password field is empty  
**When** the user attempts to submit the form  
**Then** the submit button remains disabled  
**And** no validation occurs

#### Scenario: Case Sensitivity
**REMOVED** (Firebase Auth handles email normalization)

---

### Requirement: Logout Functionality (REQ-UA-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Clear error state on logout

The system MUST provide logout functionality that clears authentication state, Firebase session, and any error messages.

**Updated Acceptance Criteria:**
- Logout action is accessible to authenticated users
- Logout calls Firebase Auth signOut method
- Logout clears user state
- Logout sets authenticated state to false
- **ADDED:** Logout clears error state
- Logout action is immediate (no confirmation required)
- After logout, UI returns to unauthenticated state
- Firebase session is terminated on logout

#### Scenario: Logout
**MODIFIED:**
**Given** the user is authenticated via Firebase  
**When** the user clicks the "Logout" button  
**Then** Firebase signOut is called  
**And** the Firebase session is terminated  
**And** the authentication state is cleared  
**And** the user state is set to null  
**And** the authenticated state is false  
**And** the error state is cleared  
**And** the UI displays the "Login" button again  
**And** the user menu is hidden

### Requirement: Authentication State Management (REQ-UA-004)
**Priority:** MUST  
**Category:** Technical

**Changes:**
- ADD: Firebase Auth state observer (onAuthStateChanged)
- UPDATE: Session persists across page refreshes
- ADD: User object includes uid from Firebase

The system MUST manage authentication state reactively using Vue composables with Firebase Auth state synchronization.

**Updated Acceptance Criteria:**
- Authentication state is managed in a composable (e.g., `useAuth`)
- State includes: user object, isAuthenticated boolean, error string
- **ADDED:** User object includes uid from Firebase User
- State is reactive and updates all consuming components
- State is accessible from any component
- User object is read-only outside the composable
- **REMOVED:** State does not persist across page refreshes
- **ADDED:** State persists across page refreshes via Firebase Auth session
- **ADDED:** Auth state is synchronized with Firebase via onAuthStateChanged observer

#### Scenario: Reactive State Updates
**Given** multiple components use the auth state  
**When** the user logs in  
**Then** all components reactively receive the updated auth state  
**And** all components display the authenticated view

#### Scenario: Session Persistence
**MODIFIED:**
**Given** the user is authenticated via Firebase  
**When** the user refreshes the page  
**Then** Firebase Auth session is restored automatically  
**And** the authentication state is rehydrated  
**And** the user remains logged in  
**And** the user does not need to log in again

#### Scenario: Auth State Observer
**ADDED:**
**Given** Firebase Auth is initialized  
**When** the auth state changes (login, logout, session restore)  
**Then** the onAuthStateChanged observer fires  
**And** the Vue reactive auth state is updated  
**And** all consuming components re-render

---

### Requirement: Error Display (REQ-UA-005)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Map Firebase error codes to user-friendly messages
- UPDATE: Error messages cover Firebase-specific scenarios

The system MUST display clear error messages for authentication failures using Firebase error codes.

**Updated Acceptance Criteria:**
- Error messages are displayed inline in the login form
- Error messages are user-friendly (no technical details)
- Error messages are styled to be clearly visible
- **REMOVED:** Error message for invalid credentials: "Invalid username or password"
- **ADDED:** Error messages map Firebase error codes:
  - auth/invalid-credential → "Invalid email or password"
  - auth/user-not-found → "Invalid email or password"
  - auth/wrong-password → "Invalid email or password"
  - auth/invalid-email → "Invalid email address format."
  - auth/too-many-requests → "Too many failed attempts. Please try again later."
  - Default → "An error occurred. Please try again."
- Error messages clear when form is closed
- Error messages clear when user starts typing (optional)
- Errors are displayed in an accessible way (aria-live region)

#### Scenario: Display Firebase Error Message
**MODIFIED:**
**Given** the login form is open  
**And** the user submits invalid credentials  
**When** Firebase Authentication rejects with error code "auth/invalid-credential"  
**Then** an error message appears: "Invalid email or password"  
**And** the error message is styled with error/danger color  
**And** the error message is announced to screen readers

#### Scenario: Clear Error on Close
**Given** the login form displays an error message  
**When** the user closes the form  
**Then** the error message is cleared  
**And** reopening the form shows no error

---

### Requirement: Keyboard Accessibility (REQ-UA-006)
**Priority:** MUST  
**Category:** Accessibility

The system MUST support keyboard navigation for all authentication interactions.

**Acceptance Criteria:**
- Tab key moves focus through form fields
- Enter key submits the form when focused on any field
- Escape key closes the login dialog
- Focus is trapped within dialog when open
- First field receives focus when dialog opens
- Focus returns to trigger element when dialog closes

#### Scenario: Keyboard Navigation
**Given** the login form is open  
**When** the user presses Tab  
**Then** focus moves from username to password to submit button  
**And** pressing Tab from submit button cycles to username (focus trap)

#### Scenario: Enter to Submit
**Given** the login form is open  
**And** the user has entered credentials  
**When** the user presses Enter while focused on any field  
**Then** the form is submitted

#### Scenario: Escape to Close
**Given** the login form is open  
**When** the user presses Escape  
**Then** the dialog closes  
**And** the password field is cleared

### Requirement: Firebase Auth SDK Integration (REQ-UA-007)
**Priority:** MUST  
**Category:** Technical

The system MUST initialize Firebase Authentication SDK and provide it to the useAuth composable.

**Acceptance Criteria:**
- Firebase Auth is initialized in firebase.ts
- Auth instance is created using getAuth(app)
- Auth instance is exported for use in composables
- In development mode, Auth connects to Firebase Auth emulator on localhost:9099
- Initialization logs emulator connection in development
- Auth initialization does not block application rendering

#### Scenario: Firebase Auth Initialization
**Given** the application starts  
**And** Firebase app is initialized  
**When** the auth module is imported  
**Then** Firebase Auth instance is created  
**And** the auth instance is available for import

#### Scenario: Auth Emulator Connection in Development
**Given** the application is running in development mode (import.meta.env.DEV)  
**When** Firebase Auth is initialized  
**Then** the Auth SDK connects to emulator at localhost:9099  
**And** a console message logs "🔥 Connected to Auth Emulator"  
**And** all auth operations use the emulator instead of production

#### Scenario: Production Auth Configuration
**Given** the application is running in production mode  
**When** Firebase Auth is initialized  
**Then** the Auth SDK connects to production Firebase project  
**And** no emulator connection is attempted

---

### Requirement: Auth State Observer (REQ-UA-008)
**Priority:** MUST  
**Category:** Technical

The system MUST use Firebase onAuthStateChanged observer to synchronize auth state with Firebase session.

**Acceptance Criteria:**
- onAuthStateChanged listener is set up in useAuth composable
- Listener fires on initial app load to restore session
- Listener fires when user logs in
- Listener fires when user logs out
- Listener updates Vue reactive state when Firebase auth state changes
- User object is extracted from Firebase User object
- Username is derived from email (prefix before @)

#### Scenario: Auth State Observer Setup
**Given** the useAuth composable is initialized  
**When** the application starts  
**Then** onAuthStateChanged listener is registered  
**And** the listener checks for existing Firebase session

#### Scenario: Session Restoration
**Given** the user previously logged in  
**And** a valid Firebase session exists  
**When** the page loads  
**Then** onAuthStateChanged fires with Firebase User object  
**And** authState.user is populated with email and uid  
**And** authState.isAuthenticated is set to true  
**And** the user sees authenticated UI immediately

#### Scenario: No Session Available
**Given** no Firebase session exists  
**When** the page loads  
**Then** onAuthStateChanged fires with null user  
**And** authState.user remains null  
**And** authState.isAuthenticated remains false  
**And** the user sees unauthenticated UI

### Requirement: Re-authentication (REQ-UA-004)
**Priority:** MUST  
**Category:** Security

The system MUST provide a method to re-authenticate users before performing sensitive operations.

**Acceptance Criteria:**
- `reauthenticate(password: string)` method is available in useAuth composable
- Method uses Firebase reauthenticateWithCredential API
- Method requires current user's email and provided password
- Method creates EmailAuthProvider credential
- Successful re-authentication resolves Promise without error
- Failed re-authentication rejects Promise with error message
- Error messages are user-friendly
- Network errors are caught and returned as error messages
- Method validates that user is currently authenticated before attempting re-auth

#### Scenario: Successfully Re-authenticate User
**Given** the user is authenticated with email "user@example.com"  
**And** the user's password is "correctpassword123"  
**When** `reauthenticate("correctpassword123")` is called  
**Then** Firebase reauthenticateWithCredential is invoked with correct credentials  
**And** the Promise resolves successfully  
**And** no error is thrown  
**And** the user remains authenticated

#### Scenario: Re-authenticate with Incorrect Password
**Given** the user is authenticated with email "user@example.com"  
**And** the user's password is "correctpassword123"  
**When** `reauthenticate("wrongpassword")` is called  
**Then** Firebase reauthenticateWithCredential is invoked  
**And** the Promise rejects with error message "Incorrect password. Please try again."  
**And** the user remains authenticated

#### Scenario: Attempt Re-authentication When Not Authenticated
**Given** the user is not authenticated  
**When** `reauthenticate("anypassword")` is called  
**Then** the Promise rejects immediately with error message "No user is currently logged in."  
**And** no Firebase API calls are made

#### Scenario: Handle Network Error During Re-authentication
**Given** the user is authenticated  
**And** the network is unavailable  
**When** `reauthenticate("correctpassword123")` is called  
**Then** Firebase reauthenticateWithCredential fails with network error  
**And** the Promise rejects with error message "Network error. Please check your connection and try again."

---

### Requirement: Account Deletion (REQ-UA-005)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a method to permanently delete the current user's account and all associated data.

**Acceptance Criteria:**
- `deleteAccount()` method is available in useAuth composable
- Method deletes all user data from Firestore before deleting Auth account
- Method calls firebaseDataService.deleteUserData(userId) first
- Method calls Firebase deleteUser() after Firestore deletion succeeds
- Method clears authentication state after successful deletion
- Method sets user to null after deletion
- Method sets isAuthenticated to false after deletion
- Method validates user is authenticated before attempting deletion
- Failed Firestore deletion stops process before Auth deletion
- Failed Auth deletion logs error and reports to user
- Method returns Promise that resolves on success or rejects with error
- Error messages are user-friendly

#### Scenario: Successfully Delete User Account
**Given** the user is authenticated with userId "user123"  
**And** the user has 5 visits in Firestore  
**When** `deleteAccount()` is called  
**Then** firebaseDataService.deleteUserData("user123") is called  
**And** all 5 visits are deleted from Firestore  
**And** Firebase deleteUser() is called  
**And** the Firebase Auth account is deleted  
**And** the authentication state is cleared  
**And** user is set to null  
**And** isAuthenticated is set to false  
**And** the Promise resolves successfully

#### Scenario: Handle Firestore Deletion Failure
**Given** the user is authenticated with userId "user123"  
**And** a network error occurs during Firestore operations  
**When** `deleteAccount()` is called  
**Then** firebaseDataService.deleteUserData("user123") is called  
**And** the Firestore operation fails  
**And** Firebase deleteUser() is NOT called  
**And** the authentication state remains unchanged  
**And** the user remains authenticated  
**And** the Promise rejects with error message "Failed to delete account data. Please check your connection and try again."

#### Scenario: Handle Auth Deletion Failure
**Given** the user is authenticated with userId "user123"  
**And** Firestore deletion succeeds  
**And** a network error occurs during Auth deletion  
**When** `deleteAccount()` is called  
**Then** firebaseDataService.deleteUserData("user123") succeeds  
**And** Firebase deleteUser() is called  
**And** the Auth deletion fails  
**And** the Promise rejects with error message "Failed to delete account. Please try again or contact support."  
**And** the authentication state remains unchanged

#### Scenario: Attempt Deletion When Not Authenticated
**Given** the user is not authenticated  
**When** `deleteAccount()` is called  
**Then** the Promise rejects immediately with error message "No user is currently logged in."  
**And** no Firebase or Firestore operations are performed

---

