# user-authentication Delta

## ADDED Requirements

### Requirement: Password Reset Request (REQ-UA-004)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a password reset flow that allows users to request a password reset email via Firebase Authentication.

**Acceptance Criteria:**
- "Forgot your password?" link in login form is clickable
- Clicking the link opens a password reset dialog
- Password reset dialog contains email input field
- Email field uses placeholder "m@example.com"
- Dialog has a submit button labeled "Send Reset Email"
- Dialog has a "Back to Login" link/button
- Form validates email format before submission
- Submit button is disabled when email field is empty or invalid
- Dialog shows title "Reset Password"
- Dialog shows description "Enter your email and we'll send you a link to reset your password"

#### Scenario: Open Password Reset Dialog
**Given** the login form is open  
**When** the user clicks the "Forgot your password?" link  
**Then** the login dialog closes  
**And** the password reset dialog opens  
**And** the email field is empty and focused

#### Scenario: Return to Login from Reset
**Given** the password reset dialog is open  
**When** the user clicks "Back to Login"  
**Then** the password reset dialog closes  
**And** the login dialog opens  
**And** the reset form fields are cleared

---

### Requirement: Password Reset Email Sending (REQ-UA-005)
**Priority:** MUST  
**Category:** Functional

The system MUST send password reset emails via Firebase Authentication and provide appropriate feedback to users.

**Acceptance Criteria:**
- Reset email is sent using Firebase Auth `sendPasswordResetEmail()` method
- Success message displays after email sent: "Password reset email sent! Check your inbox."
- Error messages display for invalid email format
- Error messages display for Firebase errors (network, etc.)
- Loading state is shown while sending email
- Email field is cleared after successful send
- Dialog remains open showing success message
- Firebase error codes are mapped to user-friendly messages

#### Scenario: Successful Password Reset Email
**Given** the password reset dialog is open  
**And** the user enters a valid email "user@example.com"  
**When** the user clicks "Send Reset Email"  
**Then** Firebase `sendPasswordResetEmail()` is called with the email  
**And** a loading indicator displays  
**And** Firebase sends the reset email  
**And** a success message displays "Password reset email sent! Check your inbox."  
**And** the email field is cleared  
**And** the dialog remains open

#### Scenario: Invalid Email Format
**Given** the password reset dialog is open  
**And** the user enters an invalid email "notanemail"  
**When** the user attempts to submit the form  
**Then** the submit button remains disabled  
**And** no Firebase call is made

#### Scenario: Network Error During Reset
**Given** the password reset dialog is open  
**And** the user enters a valid email "user@example.com"  
**And** the network is unavailable  
**When** the user clicks "Send Reset Email"  
**Then** Firebase `sendPasswordResetEmail()` is called  
**And** Firebase returns a network error  
**And** an error message displays "Network error. Please check your connection and try again."  
**And** the form remains in ready state

#### Scenario: User Not Found
**Given** the password reset dialog is open  
**And** the user enters an email "nonexistent@example.com" that doesn't exist in Firebase  
**When** the user clicks "Send Reset Email"  
**Then** Firebase `sendPasswordResetEmail()` is called  
**And** Firebase processes the request (for security, no error is shown)  
**And** a success message displays "Password reset email sent! Check your inbox."  
**And** no email is actually sent (Firebase behavior for non-existent users)

---

### Requirement: Password Reset Error Handling (REQ-UA-006)
**Priority:** MUST  
**Category:** Functional

The system MUST handle all Firebase password reset errors gracefully and provide clear feedback to users.

**Acceptance Criteria:**
- Firebase error code "auth/invalid-email" shows "Invalid email address"
- Firebase error code "auth/network-request-failed" shows "Network error. Please check your connection and try again."
- Firebase error code "auth/too-many-requests" shows "Too many requests. Please try again later."
- Unknown Firebase errors show "An error occurred. Please try again."
- Error messages are displayed prominently in the dialog
- Error state is cleared when user modifies email field
- Error state is cleared when dialog is closed

#### Scenario: Too Many Requests Error
**Given** the password reset dialog is open  
**And** the user has requested too many password resets  
**And** the user enters a valid email "user@example.com"  
**When** the user clicks "Send Reset Email"  
**Then** Firebase returns "auth/too-many-requests" error  
**And** an error message displays "Too many requests. Please try again later."  
**And** the form remains in ready state
