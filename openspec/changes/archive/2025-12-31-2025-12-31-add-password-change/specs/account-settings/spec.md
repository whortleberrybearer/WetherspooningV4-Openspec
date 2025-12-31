# account-settings Spec Delta

## ADDED Requirements

### Requirement: Password Change Form (REQ-AS-008)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a password change form in the Account Settings dialog.

**Acceptance Criteria:**
- Password change section appears in Account Settings dialog
- Section is positioned between account information and delete account section
- Section has heading "Change Password"
- Section includes three password input fields:
  - Current Password (label: "Current Password")
  - New Password (label: "New Password")
  - Confirm New Password (label: "Confirm New Password")
- All password fields mask input characters
- Section includes "Change Password" submit button
- Submit button is disabled when any field is empty
- Submit button is disabled when new password and confirm password don't match
- Form is keyboard accessible
- All fields are cleared after successful password change
- Section is separated from other sections with border/divider

#### Scenario: Display Password Change Form
**Given** the user is authenticated  
**When** the Account Settings dialog is opened  
**Then** a "Change Password" section is visible  
**And** the section is positioned between account information and delete account sections  
**And** three password input fields are displayed: "Current Password", "New Password", "Confirm New Password"  
**And** all password fields are masked  
**And** a "Change Password" button is visible  
**And** the button is disabled by default

#### Scenario: Enable Submit Button When Valid
**Given** the password change form is displayed  
**And** all fields are empty  
**When** the user enters "oldpassword123" in Current Password  
**And** enters "newpassword456" in New Password  
**And** enters "newpassword456" in Confirm New Password  
**Then** the "Change Password" button becomes enabled

#### Scenario: Keep Submit Button Disabled When Passwords Don't Match
**Given** the password change form is displayed  
**When** the user enters "oldpassword123" in Current Password  
**And** enters "newpassword456" in New Password  
**And** enters "differentpassword" in Confirm New Password  
**Then** the "Change Password" button remains disabled

---

### Requirement: Password Validation (REQ-AS-009)
**Priority:** MUST  
**Category:** Functional

The system MUST validate password requirements before attempting password change.

**Acceptance Criteria:**
- New password must be at least 8 characters long
- Validation error displays if new password is too short: "Password must be at least 8 characters long."
- New password and confirm password must match
- Validation error displays if passwords don't match: "Passwords do not match."
- Validation occurs when user clicks submit button
- Validation errors are displayed inline below the relevant field
- Validation errors are cleared when user modifies the field
- Empty fields prevent form submission (button remains disabled)

#### Scenario: Validate Minimum Password Length
**Given** the password change form is displayed  
**And** the user enters "oldpassword123" in Current Password  
**And** enters "short" in New Password (less than 8 characters)  
**And** enters "short" in Confirm New Password  
**When** the button becomes enabled and user clicks "Change Password"  
**Then** a validation error "Password must be at least 8 characters long." displays below New Password field  
**And** no password change is attempted  
**And** the form remains open

#### Scenario: Validate Password Match
**Given** the password change form is displayed  
**And** the user enters "oldpassword123" in Current Password  
**And** enters "newpassword456" in New Password  
**And** enters "differentpassword" in Confirm New Password  
**Then** the "Change Password" button is disabled  
**And** a validation hint "Passwords do not match." may be shown inline

---

### Requirement: Password Re-authentication (REQ-AS-010)
**Priority:** MUST  
**Category:** Security

The system MUST re-authenticate the user with their current password before allowing password change.

**Acceptance Criteria:**
- Clicking "Change Password" triggers re-authentication with current password
- Re-authentication uses existing `reauthenticate` method from useAuth composable
- Incorrect current password displays error message: "Incorrect password. Please try again."
- Error message is displayed inline below Current Password field
- Current Password field is cleared after incorrect password
- Successful re-authentication proceeds to password update
- Loading state is shown during re-authentication (disabled button, spinner)
- Network errors display user-friendly message

#### Scenario: Re-authenticate with Correct Current Password
**Given** the password change form is displayed  
**And** the user's current password is "oldpassword123"  
**When** the user enters "oldpassword123" in Current Password  
**And** enters "newpassword456" in New Password  
**And** enters "newpassword456" in Confirm New Password  
**And** clicks "Change Password"  
**Then** the reauthenticate method is called with "oldpassword123"  
**And** re-authentication succeeds  
**And** the password update process continues

#### Scenario: Re-authenticate with Incorrect Current Password
**Given** the password change form is displayed  
**And** the user's current password is "oldpassword123"  
**When** the user enters "wrongpassword" in Current Password  
**And** enters "newpassword456" in New Password  
**And** enters "newpassword456" in Confirm New Password  
**And** clicks "Change Password"  
**Then** the reauthenticate method is called with "wrongpassword"  
**And** re-authentication fails  
**And** error message "Incorrect password. Please try again." displays below Current Password field  
**And** the Current Password field is cleared  
**And** the form remains open  
**And** no password update is attempted

#### Scenario: Display Loading During Re-authentication
**Given** the password change form is displayed  
**And** the user has filled all fields correctly  
**When** the user clicks "Change Password"  
**Then** the button is disabled  
**And** a loading spinner appears on the button  
**And** all input fields are disabled  
**And** the user cannot close the dialog

---

### Requirement: Password Update Execution (REQ-AS-011)
**Priority:** MUST  
**Category:** Functional

The system MUST update the user's password using Firebase Auth after successful re-authentication.

**Acceptance Criteria:**
- Successful re-authentication triggers password update
- Password update uses Firebase Auth `updatePassword` API
- Password update is called with the new password value
- Success displays message: "Password changed successfully"
- Success message is shown for 2 seconds
- All password fields are cleared after successful update
- Form returns to initial state after success
- Network errors during update display error message: "Failed to update password. Please try again."
- Firebase Auth errors are mapped to user-friendly messages
- Password change does not log user out

#### Scenario: Successfully Update Password
**Given** the user has successfully re-authenticated  
**When** Firebase Auth updatePassword is called with "newpassword456"  
**Then** the password update succeeds  
**And** a success message "Password changed successfully" is displayed  
**And** the message is shown for 2 seconds  
**And** all password fields are cleared  
**And** the form returns to initial state  
**And** the user remains logged in  
**And** the Account Settings dialog remains open

#### Scenario: Handle Password Update Network Error
**Given** the user has successfully re-authenticated  
**And** a network error occurs  
**When** Firebase Auth updatePassword is called  
**Then** the update fails  
**And** error message "Failed to update password. Please try again." displays  
**And** the form remains open with values intact  
**And** the user can retry

#### Scenario: Handle Firebase Auth Error During Update
**Given** the user has successfully re-authenticated  
**And** a Firebase Auth error occurs (e.g., weak-password)  
**When** Firebase Auth updatePassword is called  
**Then** the update fails  
**And** a user-friendly error message is displayed based on the Firebase error code  
**And** the form remains open

---

### Requirement: Password Change Method in useAuth (REQ-AS-012)
**Priority:** MUST  
**Category:** Technical

The system MUST provide a `changePassword` method in the useAuth composable.

**Acceptance Criteria:**
- Method signature: `changePassword(currentPassword: string, newPassword: string): Promise<void>`
- Method first calls `reauthenticate(currentPassword)`
- Method then calls Firebase Auth `updatePassword` with newPassword
- Method uses `auth.currentUser` to get current user
- Method validates user is authenticated before proceeding
- Method returns Promise that resolves on success or rejects with error
- Method maps Firebase error codes to user-friendly messages
- Method does not modify authentication state (user stays logged in)

#### Scenario: Change Password Method Success
**Given** the user is authenticated  
**And** the current password is "oldpassword123"  
**When** `changePassword("oldpassword123", "newpassword456")` is called  
**Then** `reauthenticate("oldpassword123")` is called internally  
**And** re-authentication succeeds  
**And** Firebase Auth `updatePassword` is called with "newpassword456"  
**And** the password update succeeds  
**And** the Promise resolves successfully  
**And** the user remains authenticated with the new password

#### Scenario: Change Password Method Re-auth Failure
**Given** the user is authenticated  
**And** the current password is "oldpassword123"  
**When** `changePassword("wrongpassword", "newpassword456")` is called  
**Then** `reauthenticate("wrongpassword")` is called internally  
**And** re-authentication fails  
**And** the Promise rejects with error "Incorrect password. Please try again."  
**And** no password update is attempted

#### Scenario: Change Password When Not Authenticated
**Given** no user is authenticated  
**When** `changePassword("anypassword", "newpassword")` is called  
**Then** the Promise rejects immediately with error "No user is currently logged in."  
**And** no Firebase operations are performed

---

### Requirement: Accessibility for Password Change (REQ-AS-013)
**Priority:** MUST  
**Category:** Accessibility

The system MUST ensure password change functionality is accessible to users with disabilities.

**Acceptance Criteria:**
- All password fields are keyboard navigable (Tab, Shift+Tab)
- Password change form can be submitted with Enter key when focused on any field
- Error messages are announced to screen readers
- Success message is announced to screen readers
- Loading states are announced to screen readers
- All form labels are properly associated with inputs
- Error messages are associated with their fields using aria-describedby
- Submit button has clear label and state

#### Scenario: Submit Form with Enter Key
**Given** the password change form is displayed  
**And** the user has filled all fields correctly  
**And** focus is in any password field  
**When** the user presses Enter  
**Then** the password change process begins  
**And** the form is submitted

#### Scenario: Announce Errors to Screen Readers
**Given** the password change form is displayed  
**When** a validation error or re-authentication error occurs  
**Then** the error message is announced to screen readers  
**And** the error is associated with the relevant field using aria-describedby

#### Scenario: Navigate Form with Keyboard
**Given** the password change form is displayed  
**When** the user presses Tab  
**Then** focus moves through: Current Password → New Password → Confirm New Password → Change Password button  
**And** Shift+Tab moves focus backwards
