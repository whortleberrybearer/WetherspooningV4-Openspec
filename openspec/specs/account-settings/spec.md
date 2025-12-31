# account-settings Specification

## Purpose
TBD - created by archiving change 2025-12-31-add-account-deletion. Update Purpose after archive.
## Requirements
### Requirement: Account Settings Access (REQ-AS-001)
**Priority:** MUST  
**Category:** Functional

The system MUST provide an Account Settings option in the sidebar footer accessible to authenticated users.

**Acceptance Criteria:**
- Account Settings button appears in sidebar footer when user is authenticated
- Button is positioned at the bottom of the footer, similar to settings placement in shadcn-vue dashboard-01
- Button is not visible when user is not authenticated
- Button displays a settings/gear icon
- Button label reads "Account Settings"
- Clicking the button opens the Account Settings dialog
- Button follows application styling conventions
- Button is keyboard accessible

#### Scenario: Display Account Settings Button When Authenticated
**Given** the user is authenticated  
**When** the sidebar is displayed  
**Then** the Account Settings button is visible in the sidebar footer  
**And** the button is positioned at the bottom of the footer section  
**And** the button displays a settings icon  
**And** the button label reads "Account Settings"

#### Scenario: Hide Account Settings When Not Authenticated
**Given** the user is not authenticated  
**When** the sidebar is displayed  
**Then** the Account Settings button is not visible  
**And** only the Login button is shown in the footer

#### Scenario: Open Account Settings Dialog
**Given** the user is authenticated  
**And** the sidebar footer displays the Account Settings button  
**When** the user clicks the Account Settings button  
**Then** the Account Settings dialog opens  
**And** the dialog displays account information

---

### Requirement: Account Settings Dialog (REQ-AS-002)
**Priority:** MUST  
**Category:** UI/UX

The system MUST display an Account Settings dialog that shows account information and management options.

**Acceptance Criteria:**
- Dialog uses shadcn/vue Dialog component
- Dialog title is "Account Settings"
- Dialog displays current username
- Dialog displays current email address
- Dialog includes a "Delete Account" button with destructive (red) styling
- "Delete Account" button is right-aligned (not full-width)
- Dialog can be dismissed by clicking outside or pressing Escape
- Dialog does not include a Close button (dismissible via Escape or click-outside)
- Dialog is mobile-responsive
- All interactive elements are keyboard accessible

#### Scenario: View Account Settings Dialog
**Given** the user is authenticated with username "testuser" and email "testuser@example.com"  
**When** the Account Settings dialog is opened  
**Then** the dialog title is "Account Settings"  
**And** the username "testuser" is displayed  
**And** the email "testuser@example.com" is displayed  
**And** a "Delete Account" button is visible with destructive styling  
**And** the button is right-aligned

#### Scenario: Dismiss Account Settings Dialog
**Given** the Account Settings dialog is open  
**When** the user presses Escape or clicks outside the dialog  
**Then** the dialog closes  
**And** the user returns to the main view

---

### Requirement: Delete Account Confirmation and Re-authentication (REQ-AS-003)
**Priority:** MUST  
**Category:** Security

The system MUST display a combined confirmation and re-authentication dialog when user initiates account deletion.

**Acceptance Criteria:**
- Clicking "Delete Account" opens a single dialog for confirmation and re-authentication
- Dialog title is "Delete Account?"
- Dialog warns that deletion is permanent and non-recoverable
- Warning message states: "This action is permanent and cannot be undone. All your visit data will be permanently deleted."
- Dialog includes password input field for re-authentication
- Password field has label "Enter your password to confirm"
- Password field is masked
- Dialog provides "Cancel" button
- Dialog provides "Delete Account" button with destructive styling
- "Delete Account" button is disabled when password field is empty
- Clicking "Cancel" closes dialog and returns to Account Settings
- Dialog can be dismissed with Escape key
- Dialog uses clear, non-technical language

#### Scenario: Display Combined Confirmation and Re-auth Dialog
**Given** the Account Settings dialog is open  
**When** the user clicks "Delete Account"  
**Then** a combined confirmation and re-auth dialog opens  
**And** the dialog title is "Delete Account?"  
**And** the warning message "This action is permanent and cannot be undone. All your visit data will be permanently deleted." is displayed  
**And** a password input field is visible with label "Enter your password to confirm"  
**And** the password field is masked  
**And** a "Cancel" button is visible  
**And** a "Delete Account" button is visible with destructive styling  
**And** the "Delete Account" button is disabled

#### Scenario: Cancel Account Deletion from Combined Dialog
**Given** the combined confirmation and re-auth dialog is open  
**When** the user clicks "Cancel"  
**Then** the dialog closes  
**And** the Account Settings dialog remains open  
**And** the user account is not deleted

#### Scenario: Enable Delete Button When Password Entered
**Given** the combined confirmation and re-auth dialog is open  
**And** the password field is empty  
**And** the "Delete Account" button is disabled  
**When** the user types any characters in the password field  
**Then** the "Delete Account" button becomes enabled

---

### Requirement: Re-authentication and Deletion Execution (REQ-AS-004)
**Priority:** MUST  
**Category:** Security

The system MUST validate the user's password and execute account deletion from the combined confirmation dialog.

**Acceptance Criteria:**
- Clicking "Delete Account" in the combined dialog triggers re-authentication
- Re-authentication uses Firebase reauthenticateWithCredential API
- Incorrect password displays error message below password field
- Error message states: "Incorrect password. Please try again."
- Successful re-authentication proceeds to account deletion
- Dialog is keyboard accessible (Enter to submit, Escape to cancel)
- Password field is cleared after incorrect password attempt

#### Scenario: Submit with Correct Password
**Given** the combined confirmation and re-auth dialog is open  
**And** the user's password is "correctpassword123"  
**When** the user enters "correctpassword123"  
**And** clicks "Delete Account"  
**Then** Firebase reauthenticateWithCredential is called  
**And** re-authentication succeeds  
**And** the account deletion process proceeds

#### Scenario: Submit with Incorrect Password
**Given** the combined confirmation and re-auth dialog is open  
**And** the user's password is "correctpassword123"  
**When** the user enters "wrongpassword"  
**And** clicks "Delete Account"  
**Then** Firebase reauthenticateWithCredential is called  
**And** re-authentication fails  
**And** an error message "Incorrect password. Please try again." is displayed below the password field  
**And** the dialog remains open  
**And** the password field is cleared  
**And** the account is not deleted

#### Scenario: Submit with Enter Key
**Given** the combined confirmation and re-auth dialog is open  
**And** the user has entered their password  
**And** focus is in the password field  
**When** the user presses Enter  
**Then** the deletion process begins  
**And** re-authentication is attempted

---

### Requirement: Account Deletion Execution (REQ-AS-005)
**Priority:** MUST  
**Category:** Functional

The system MUST permanently delete all user data and the user account after successful re-authentication.

**Acceptance Criteria:**
- Successful re-authentication triggers data deletion
- All user visits in Firestore are deleted via batch operation
- Firebase Auth user account is deleted using deleteUser()
- Deletion shows loading indicator with message "Deleting account..."
- All dialogs close after successful deletion
- User is logged out after deletion
- User state is cleared after deletion
- UI returns to unauthenticated state after deletion
- Brief success message "Account deleted" is shown before logout
- Network errors during deletion display error message
- Error message allows user to retry deletion
- Firestore deletion uses atomic batch operations

#### Scenario: Successfully Delete Account
**Given** the user is authenticated with userId "user123"  
**And** the user has successfully re-authenticated  
**When** the deletion process begins  
**Then** a loading indicator displays "Deleting account..."  
**And** all visits with userId "user123" are deleted from Firestore  
**And** the Firestore batch operation commits  
**And** the Firebase Auth user account is deleted  
**And** the user state is cleared  
**And** a success message "Account deleted" is briefly displayed  
**And** all dialogs close  
**And** the user is logged out  
**And** the UI displays the Login button

#### Scenario: Handle Firestore Deletion Error
**Given** the user is deleting their account  
**And** a network error occurs during Firestore deletion  
**When** the batch commit fails  
**Then** the deletion process stops  
**And** an error message "Failed to delete account data. Please check your connection and try again." is displayed  
**And** the re-authentication dialog remains open  
**And** the user can retry or cancel  
**And** the Firebase Auth account is not deleted

#### Scenario: Handle Auth Deletion Error
**Given** the user is deleting their account  
**And** Firestore deletion succeeds  
**And** a network error occurs during Auth deletion  
**When** Firebase deleteUser() fails  
**Then** an error message "Failed to delete account. Please try again or contact support." is displayed  
**And** the user can retry  
**And** the user remains logged in

---

### Requirement: Loading and Error States (REQ-AS-006)
**Priority:** MUST  
**Category:** UI/UX

The system MUST provide clear feedback during the deletion process and handle errors gracefully.

**Acceptance Criteria:**
- Re-authentication shows loading state (disabled button, spinner)
- Deletion process shows loading overlay with "Deleting account..." message
- Success shows brief "Account deleted" message before logout
- Network errors show user-friendly messages
- Error messages include retry option when applicable
- All loading states disable user interaction with buttons
- Loading indicators are accessible to screen readers
- Error messages are announced to screen readers

#### Scenario: Display Loading During Re-authentication
**Given** the re-authentication dialog is open  
**And** the user has entered their password  
**When** the user clicks "Confirm"  
**Then** the "Confirm" button is disabled  
**And** a loading spinner appears on the button  
**And** the password field is disabled  
**And** the user cannot close the dialog until re-authentication completes or fails

#### Scenario: Display Loading During Deletion
**Given** re-authentication has succeeded  
**When** the deletion process begins  
**Then** an overlay appears with message "Deleting account..."  
**And** a loading spinner is displayed  
**And** all other UI elements are disabled  
**And** the user cannot interact with dialogs

#### Scenario: Display Success Message
**Given** account deletion has completed successfully  
**When** all data is deleted  
**Then** a success message "Account deleted" is displayed for 2 seconds  
**And** after 2 seconds the user is logged out  
**And** all dialogs close

---

### Requirement: Accessibility (REQ-AS-007)
**Priority:** MUST  
**Category:** Accessibility

The system MUST ensure all account settings and deletion features are accessible to users with disabilities.

**Acceptance Criteria:**
- All dialogs are keyboard navigable (Tab, Shift+Tab)
- Dialogs can be dismissed with Escape key
- Password field in re-authentication dialog can be submitted with Enter key
- All buttons have clear, descriptive labels
- Destructive actions (Delete Account) are clearly marked
- Warning messages are announced to screen readers
- Error messages are associated with form fields
- Loading states are announced to screen readers
- Focus is managed appropriately when dialogs open/close
- Color is not the only indicator of destructive actions

#### Scenario: Navigate Dialogs with Keyboard
**Given** the Account Settings dialog is open  
**When** the user presses Tab  
**Then** focus moves to the first interactive element  
**And** subsequent Tab presses cycle through all interactive elements  
**And** Shift+Tab moves focus backwards  
**And** pressing Escape closes the dialog

#### Scenario: Submit Re-authentication with Enter Key
**Given** the re-authentication dialog is open  
**And** the user has entered their password  
**And** focus is in the password field  
**When** the user presses Enter  
**Then** the re-authentication process begins  
**And** the form is submitted

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

