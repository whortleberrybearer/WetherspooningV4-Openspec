# Implementation Tasks

## Overview
Add password change functionality to the Account Settings dialog with re-authentication and validation.

## Tasks

### 1. Add changePassword Method to useAuth Composable
**File:** `Wetherspooning/src/composables/useAuth.ts`

- [ ] Import `updatePassword` from 'firebase/auth'
- [ ] Add `changePassword(currentPassword: string, newPassword: string): Promise<void>` method
- [ ] Validate user is authenticated (throw error if not)
- [ ] Call existing `reauthenticate(currentPassword)` method
- [ ] If re-auth succeeds, call Firebase `updatePassword(auth.currentUser, newPassword)`
- [ ] Map Firebase errors to user-friendly messages using existing `mapFirebaseError` function
- [ ] Return Promise that resolves on success or rejects with error
- [ ] Export `changePassword` from the composable return object

**Validation:**
- Test with correct current password and valid new password - should succeed
- Test with incorrect current password - should reject with "Incorrect password" error
- Test when not authenticated - should reject immediately
- Test with network error - should reject with user-friendly error

---

### 2. Add Password Change Form to AccountSettingsDialog
**File:** `Wetherspooning/src/components/AccountSettingsDialog.vue`

- [ ] Add reactive refs for password form: `currentPassword`, `newPassword`, `confirmPassword`
- [ ] Add reactive refs for state: `isChangingPassword`, `passwordError`, `passwordSuccess`
- [ ] Add computed property `isPasswordFormValid` that checks:
  - All three fields are not empty
  - newPassword length >= 8
  - newPassword === confirmPassword
- [ ] Add password change section in template after account information section
- [ ] Add section heading "Change Password"
- [ ] Add three password input fields with labels
- [ ] Add "Change Password" button disabled when form is invalid
- [ ] Add error message display below relevant fields
- [ ] Add success message display
- [ ] Style section with border separator (similar to delete account section)

**Validation:**
- Verify section appears between account info and delete account sections
- Verify button is disabled when fields are empty or invalid
- Verify all fields are password type (masked input)
- Verify layout is mobile-responsive

---

### 3. Implement Password Change Logic
**File:** `Wetherspooning/src/components/AccountSettingsDialog.vue`

- [ ] Add `handlePasswordChange` async method
- [ ] Validate new password length (>= 8 characters)
- [ ] Set `isChangingPassword = true` to show loading state
- [ ] Clear previous errors
- [ ] Call `changePassword(currentPassword, newPassword)` from useAuth
- [ ] On success:
  - Show success message "Password changed successfully"
  - Clear all password fields
  - Hide success message after 2 seconds
- [ ] On error:
  - Display error message below appropriate field
  - Clear current password field if re-auth failed
  - Keep new password fields if only update failed
- [ ] Set `isChangingPassword = false` in finally block

**Validation:**
- Test successful password change flow
- Test incorrect current password error handling
- Test new password validation error
- Test network error handling
- Verify loading state disables inputs and button
- Verify success message appears and disappears
- Verify fields are cleared after success

---

### 4. Add Keyboard Accessibility
**File:** `Wetherspooning/src/components/AccountSettingsDialog.vue`

- [ ] Add @keydown.enter handler to password input fields
- [ ] Handler should call `handlePasswordChange` if form is valid
- [ ] Ensure Tab navigation works correctly through all fields
- [ ] Ensure error messages have proper aria attributes (aria-describedby)
- [ ] Ensure success/error announcements use aria-live regions

**Validation:**
- Press Enter in any password field when form is valid - should submit
- Press Tab to navigate through all fields in correct order
- Verify screen reader announces errors and success messages

---

### 5. Add Loading and Success States UI
**File:** `Wetherspooning/src/components/AccountSettingsDialog.vue`

- [ ] Disable all password inputs when `isChangingPassword` is true
- [ ] Show spinner on "Change Password" button when loading
- [ ] Disable button when loading
- [ ] Display success message with green checkmark icon
- [ ] Auto-hide success message after 2 seconds using setTimeout
- [ ] Style error messages with destructive/red color
- [ ] Ensure loading states match existing patterns in the component

**Validation:**
- Verify loading spinner appears on button during submission
- Verify all inputs are disabled during submission
- Verify success message displays with checkmark
- Verify success message auto-dismisses after 2 seconds
- Verify error messages are styled consistently

---

### 6. Clean Up Form State on Dialog Close
**File:** `Wetherspooning/src/components/AccountSettingsDialog.vue`

- [ ] Update existing watch on `props.isOpen`
- [ ] When dialog closes (`newValue === false`), clear:
  - `currentPassword`
  - `newPassword`
  - `confirmPassword`
  - `passwordError`
  - `passwordSuccess`
  - `isChangingPassword`

**Validation:**
- Open dialog, fill password form, close dialog
- Reopen dialog - all password fields should be empty
- Verify no leftover error or success messages

---

### 7. Type Check and Lint
- [ ] Run `npm run type-check` from Wetherspooning directory
- [ ] Fix any TypeScript errors
- [ ] Ensure no console errors in browser
- [ ] Test in Firefox emulator with test user accounts

**Validation:**
- TypeScript type-check passes with no errors
- No lint warnings or errors
- Application runs without console errors

---

### 8. Manual Testing
- [ ] Test complete flow: open settings, change password, verify new password works
- [ ] Test with incorrect current password
- [ ] Test with weak new password (< 8 chars)
- [ ] Test with non-matching passwords
- [ ] Test keyboard navigation and Enter key submission
- [ ] Test loading states and error messages
- [ ] Test success message display and auto-dismiss
- [ ] Test form clearing on dialog close
- [ ] Test on mobile viewport

**Validation:**
- All scenarios from spec requirements pass manual testing
- UI is responsive and accessible
- No unexpected errors or edge cases

---

## Completion Criteria
- All tasks marked as complete
- TypeScript type-check passes
- Manual testing confirms all requirements are met
- Password can be successfully changed
- Error handling works correctly
- UI is accessible and responsive

## Dependencies
- Existing `useAuth` composable with `reauthenticate` method
- Firebase Auth SDK (already installed)
- AccountSettingsDialog.vue component

## Rollback Plan
If issues arise, the change is purely additive and can be rolled back by:
1. Removing the password change section from AccountSettingsDialog.vue
2. Removing the `changePassword` method from useAuth.ts
3. Reverting the imports
