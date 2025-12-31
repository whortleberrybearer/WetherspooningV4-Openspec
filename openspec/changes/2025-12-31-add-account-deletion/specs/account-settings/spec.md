# account-settings Specification

## Purpose
Enable users to manage their account settings and permanently delete their account with all associated data.

## ADDED Requirements

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
- Dialog includes a "Close" button
- Dialog can be dismissed by clicking outside or pressing Escape
- Dialog is mobile-responsive
- All interactive elements are keyboard accessible

#### Scenario: View Account Settings Dialog
**Given** the user is authenticated with username "testuser" and email "testuser@example.com"  
**When** the Account Settings dialog is opened  
**Then** the dialog title is "Account Settings"  
**And** the username "testuser" is displayed  
**And** the email "testuser@example.com" is displayed  
**And** a "Delete Account" button is visible with destructive styling  
**And** a "Close" button is visible

#### Scenario: Close Account Settings Dialog
**Given** the Account Settings dialog is open  
**When** the user clicks the "Close" button  
**Then** the dialog closes  
**And** the user returns to the main view

---

### Requirement: Delete Account Confirmation (REQ-AS-003)
**Priority:** MUST  
**Category:** Functional

The system MUST require explicit confirmation before proceeding with account deletion.

**Acceptance Criteria:**
- Clicking "Delete Account" opens a confirmation dialog
- Confirmation dialog warns that deletion is permanent and non-recoverable
- Warning message states: "This action is permanent and cannot be undone. All your visit data will be permanently deleted."
- Confirmation dialog provides "Cancel" button
- Confirmation dialog provides "Delete Account" button with destructive styling
- Clicking "Cancel" closes confirmation and returns to Account Settings
- Confirmation dialog can be dismissed with Escape key
- Dialog uses clear, non-technical language

#### Scenario: Display Delete Confirmation Dialog
**Given** the Account Settings dialog is open  
**When** the user clicks "Delete Account"  
**Then** a confirmation dialog opens  
**And** the dialog title is "Delete Account?"  
**And** the warning message "This action is permanent and cannot be undone. All your visit data will be permanently deleted." is displayed  
**And** a "Cancel" button is visible  
**And** a "Delete Account" button is visible with destructive styling

#### Scenario: Cancel Account Deletion
**Given** the delete confirmation dialog is open  
**When** the user clicks "Cancel"  
**Then** the confirmation dialog closes  
**And** the Account Settings dialog remains open  
**And** the user account is not deleted

---

### Requirement: Re-authentication Before Deletion (REQ-AS-004)
**Priority:** MUST  
**Category:** Security

The system MUST require users to re-authenticate with their password before completing account deletion.

**Acceptance Criteria:**
- Confirming deletion opens a re-authentication dialog
- Re-authentication dialog title is "Confirm Your Identity"
- Dialog description states: "Please enter your password to confirm account deletion"
- Dialog contains a password input field (masked)
- Password field has placeholder "Enter your password"
- Dialog provides "Cancel" button
- Dialog provides "Confirm" button with destructive styling
- Submit button is disabled when password field is empty
- Incorrect password displays error message
- Error message states: "Incorrect password. Please try again."
- Successful re-authentication proceeds to account deletion
- Re-authentication uses Firebase reauthenticateWithCredential API
- Dialog is keyboard accessible (Enter to submit, Escape to cancel)

#### Scenario: Display Re-authentication Dialog
**Given** the delete confirmation dialog is open  
**When** the user clicks "Delete Account"  
**Then** the re-authentication dialog opens  
**And** the dialog title is "Confirm Your Identity"  
**And** the description "Please enter your password to confirm account deletion" is displayed  
**And** a password input field is visible  
**And** the password field is masked  
**And** "Cancel" and "Confirm" buttons are visible  
**And** the "Confirm" button is disabled

#### Scenario: Cancel Re-authentication
**Given** the re-authentication dialog is open  
**When** the user clicks "Cancel"  
**Then** the re-authentication dialog closes  
**And** the delete confirmation dialog closes  
**And** the Account Settings dialog remains open  
**And** the user account is not deleted

#### Scenario: Re-authenticate with Correct Password
**Given** the re-authentication dialog is open  
**And** the user's password is "correctpassword123"  
**When** the user enters "correctpassword123"  
**And** clicks "Confirm"  
**Then** Firebase reauthenticateWithCredential is called  
**And** re-authentication succeeds  
**And** the account deletion process proceeds

#### Scenario: Re-authenticate with Incorrect Password
**Given** the re-authentication dialog is open  
**And** the user's password is "correctpassword123"  
**When** the user enters "wrongpassword"  
**And** clicks "Confirm"  
**Then** Firebase reauthenticateWithCredential is called  
**And** re-authentication fails  
**And** an error message "Incorrect password. Please try again." is displayed  
**And** the re-authentication dialog remains open  
**And** the password field is cleared  
**And** the account is not deleted

#### Scenario: Enable Confirm Button When Password Entered
**Given** the re-authentication dialog is open  
**And** the password field is empty  
**And** the "Confirm" button is disabled  
**When** the user types any characters in the password field  
**Then** the "Confirm" button becomes enabled

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

