# user-signup Specification

## Purpose
TBD - created by archiving change 2025-12-29-add-user-signup. Update Purpose after archive.
## Requirements
### Requirement: Signup Form (REQ-US-001)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a signup form that allows new users to create an account with username, email, and password.

**Acceptance Criteria:**
- Signup form is accessible via "Sign up" link in login dialog
- Form contains username input field
- Username field has label "Username"
- Username field is required
- Form contains email input field
- Email field has label "Email"
- Email field uses type="email" for validation
- Email field shows helper text "We'll use this to contact you. We will not share your email with anyone else."
- Email field is required
- Form contains password input field
- Password field has label "Password"
- Password field masks input characters
- Password field shows helper text "Must be at least 8 characters long."
- Password field is required
- Form contains confirm password input field
- Confirm password field has label "Confirm Password"
- Confirm password field masks input characters
- Confirm password field shows helper text "Please confirm your password."
- Confirm password field is required
- Form has submit button labeled "Create Account"
- Form includes visual divider with "Or sign up with" text below submit button
- Form includes "Sign up with Google" button with Google logo icon (non-functional placeholder)
- Form includes "Already have an account? Sign in" footer text with clickable link
- Form can be dismissed/closed without submitting
- Form clears all fields when closed
- Form is accessible via keyboard navigation
- Submit button is disabled when any required field is empty
- Form displays as modal dialog
- Dialog shows title "Create an account"
- Dialog shows description "Enter your information below to create your account"
- Username field is auto-focused when dialog opens

#### Scenario: Open Signup Form from Login
**Given** the login dialog is open  
**And** the user is not authenticated  
**When** the user clicks the "Sign up" link  
**Then** the login dialog closes  
**And** the signup dialog opens  
**And** the dialog title reads "Create an account"  
**And** the dialog description reads "Enter your information below to create your account"  
**And** the username field is focused  
**And** all input fields are empty

#### Scenario: Submit Valid Signup Form
**Given** the signup form is open  
**And** the username field contains "testuser"  
**And** the email field contains "testuser@example.com"  
**And** the password field contains "password123"  
**And** the confirm password field contains "password123"  
**When** the user clicks the "Create Account" button  
**Then** the registration process is initiated  
**And** the form displays a loading state  
**And** the button text changes to "Creating account..."  
**And** the account is created successfully  
**And** a success message is displayed  
**And** the signup dialog closes  
**And** the login dialog opens

#### Scenario: Close Signup Form
**Given** the signup form is open  
**When** the user clicks outside the dialog or presses Escape  
**Then** the signup form closes  
**And** all fields are cleared  
**And** any error messages are cleared

#### Scenario: Navigate to Login from Signup
**Given** the signup form is open  
**When** the user clicks the "Sign in" link  
**Then** the signup dialog closes  
**And** the login dialog opens  
**And** all signup form fields are cleared

#### Scenario: Google Sign Up Button Display
**Given** the signup form is open  
**When** the form is rendered  
**Then** a horizontal divider with "Or sign up with" text appears after the Create Account button  
**And** a "Sign up with Google" button appears below the divider  
**And** the button displays the official Google logo with multiple colors  
**And** the button has outline styling (border, no fill)  
**And** the button is non-functional (placeholder for future implementation)

---

### Requirement: Signup Validation (REQ-US-002)
**Priority:** MUST  
**Category:** Functional

The system MUST validate user signup inputs and provide clear error messages for invalid data.

**Acceptance Criteria:**
- Empty username shows validation error "All fields are required"
- Empty email shows validation error "All fields are required"
- Invalid email format uses browser's HTML5 validation
- Empty password shows validation error "All fields are required"
- Password shorter than 8 characters shows error "Password must be at least 8 characters"
- Empty confirm password shows validation error "All fields are required"
- Confirm password not matching password shows error "Passwords do not match"
- Validation runs on form submit, not on field change
- Username must be at least 3 characters long
- Username less than 3 characters shows error "Username must be at least 3 characters"
- Error messages are displayed in a prominent error container
- Error container uses destructive/error styling
- Error container has role="alert" for accessibility
- Error container uses aria-live="polite" for screen readers
- Successful validation clears all error messages

#### Scenario: Submit Form with Empty Fields
**Given** the signup form is open  
**And** all fields are empty  
**When** the user clicks the "Create Account" button  
**Then** an error message "All fields are required" is displayed  
**And** the form is not submitted  
**And** no account is created

#### Scenario: Submit Form with Invalid Email
**Given** the signup form is open  
**And** the username field contains "testuser"  
**And** the email field contains "invalid-email"  
**And** the password field contains "password123"  
**And** the confirm password field contains "password123"  
**When** the user clicks the "Create Account" button  
**Then** the browser's HTML5 email validation error is shown  
**And** the form is not submitted

#### Scenario: Submit Form with Short Password
**Given** the signup form is open  
**And** the username field contains "testuser"  
**And** the email field contains "testuser@example.com"  
**And** the password field contains "pass"  
**And** the confirm password field contains "pass"  
**When** the user clicks the "Create Account" button  
**Then** an error message "Password must be at least 8 characters" is displayed  
**And** the form is not submitted

#### Scenario: Submit Form with Mismatched Passwords
**Given** the signup form is open  
**And** the username field contains "testuser"  
**And** the email field contains "testuser@example.com"  
**And** the password field contains "password123"  
**And** the confirm password field contains "password456"  
**When** the user clicks the "Create Account" button  
**Then** an error message "Passwords do not match" is displayed  
**And** the form is not submitted

#### Scenario: Submit Form with Short Username
**Given** the signup form is open  
**And** the username field contains "ab"  
**And** the email field contains "testuser@example.com"  
**And** the password field contains "password123"  
**And** the confirm password field contains "password123"  
**When** the user clicks the "Create Account" button  
**Then** an error message "Username must be at least 3 characters" is displayed  
**And** the form is not submitted

---

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

### Requirement: Visual Consistency (REQ-US-004)
**Priority:** MUST  
**Category:** Non-Functional

The signup form MUST maintain visual consistency with the existing login dialog and application design system.

**Acceptance Criteria:**
- Dialog uses same width as login dialog (sm:max-w-[425px])
- Form fields use same spacing as login dialog (grid gap-4)
- Labels use same styling as login dialog
- Input fields use same component library (shadcn-vue)
- Button styling matches login dialog submit button
- Error messages use same destructive color scheme as login errors
- Helper text uses muted foreground color
- Google button uses outline variant matching login
- Dialog backdrop uses same overlay as login dialog
- Typography matches application font family and sizes

#### Scenario: Compare Signup and Login Visual Design
**Given** the user views both signup and login dialogs  
**When** comparing visual elements  
**Then** both dialogs have same width  
**And** both dialogs use same color scheme  
**And** both dialogs use same spacing between form elements  
**And** both dialogs use same button styles  
**And** both dialogs use same input field styles

---

### Requirement: Accessibility (REQ-US-005)
**Priority:** MUST  
**Category:** Non-Functional

The signup form MUST be accessible to users with disabilities and support assistive technologies.

**Acceptance Criteria:**
- All form fields have associated labels with for/id attributes
- Error messages use role="alert"
- Error messages use aria-live="polite"
- Submit button has disabled state when form is invalid
- Disabled button is visually distinct
- Form supports keyboard navigation (Tab, Shift+Tab)
- Form can be submitted with Enter key
- Dialog can be closed with Escape key
- Username field receives focus when dialog opens
- Focus returns to trigger element when dialog closes
- Helper text is associated with inputs using aria-describedby
- Password fields use autocomplete="new-password"
- Email field uses autocomplete="email"
- Username field uses autocomplete="username"

#### Scenario: Keyboard Navigation Through Form
**Given** the signup form is open  
**And** the username field has focus  
**When** the user presses Tab repeatedly  
**Then** focus moves in order: username → email → password → confirm password → submit button → Google button → sign in link  
**And** the user can complete the entire form without using a mouse

#### Scenario: Screen Reader Announces Errors
**Given** a screen reader is active  
**And** the signup form is open  
**When** the user submits the form with mismatched passwords  
**Then** the error message "Passwords do not match" is announced  
**And** the error has role="alert" and aria-live="polite"

#### Scenario: Submit Form with Enter Key
**Given** the signup form is open  
**And** all fields are filled with valid data  
**And** focus is on any form field  
**When** the user presses Enter  
**Then** the form is submitted  
**And** the registration process begins

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

