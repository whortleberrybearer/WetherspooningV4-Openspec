# user-authentication Spec Delta

## MODIFIED Requirements

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
