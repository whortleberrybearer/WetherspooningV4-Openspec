# Implementation Tasks: Add Account Deletion

## Overview
Implement account deletion functionality following the spec deltas in this change proposal.

## Prerequisites
- [x] Proposal approved by reviewer
- [x] Design.md reviewed and understood
- [x] All spec deltas reviewed

## Implementation Tasks

### Phase 1: Backend - Firebase Data Service
- [x] Add `deleteUserData(userId: string)` method to firebaseDataService.ts
- [x] Implement Firestore query to find all visits for userId
- [x] Implement batch deletion logic with 500-operation limit
- [x] Add error handling for network failures and invalid parameters
- [x] Add user-friendly error messages
- [ ] Test deleteUserData with various scenarios (0 visits, many visits, >500 visits)

### Phase 2: Authentication - Re-authentication Support
- [x] Import `EmailAuthProvider`, `reauthenticateWithCredential`, `deleteUser` from firebase/auth in useAuth.ts
- [x] Add `reauthenticate(password: string)` method to useAuth composable
- [x] Implement re-authentication using Firebase reauthenticateWithCredential
- [x] Add error handling and mapping for re-auth failures
- [x] Add validation to check user is authenticated before re-auth
- [ ] Test reauthenticate with correct/incorrect passwords

### Phase 3: Authentication - Account Deletion Support
- [x] Add `deleteAccount()` method to useAuth composable
- [x] Call firebaseDataService.deleteUserData(userId) first
- [x] Call Firebase deleteUser() after Firestore deletion succeeds
- [x] Clear authentication state (user, isAuthenticated) after deletion
- [x] Add error handling for Firestore and Auth deletion failures
- [x] Add error state clearing to logout() method
- [ ] Test deleteAccount with various failure scenarios

### Phase 4: UI Components - Combined Confirmation and Re-auth Dialog
- [x] Update DeleteAccountConfirmDialog.vue to include password field
- [x] Use shadcn/vue Dialog component
- [x] Add dialog title "Delete Account?"
- [x] Add warning message about permanent, non-recoverable deletion
- [x] Add password input field with label "Enter your password to confirm"
- [x] Add "Cancel" and "Delete Account" buttons (destructive styling)
- [x] Disable Delete Account button when password field is empty
- [x] Implement password submission on Enter key
- [x] Call useAuth.reauthenticate(password) on submit
- [x] Display error message for incorrect password below field
- [x] Clear password field after error
- [x] Show loading state during re-authentication
- [x] Emit success event when re-auth succeeds
- [x] Delete obsolete ReauthDialog.vue component
- [x] Test keyboard navigation (Tab, Enter, Escape)

### Phase 5: UI Components - Account Settings Dialog
- [x] Create AccountSettingsDialog.vue component in src/components/
- [x] Use shadcn/vue Dialog component
- [x] Add dialog title "Account Settings"
- [x] Display current username from useAuth.user
- [x] Display current email from useAuth.user
- [x] Add "Delete Account" button with destructive (red) styling
- [x] Make Delete Account button right-aligned (not full-width)
- [x] Remove "Danger Zone" heading
- [x] Remove "Close" button (dialog dismissible via Escape/click-outside)
- [x] Integrate combined DeleteAccountConfirmDialog component
- [x] Show loading overlay "Deleting account..." during deletion
- [x] Call useAuth.deleteAccount() after successful re-auth
- [x] Show success message "Account deleted" for 2 seconds
- [x] Close all dialogs after successful deletion
- [x] Display error messages from deletion failures
- [x] Test complete deletion flow

### Phase 6: UI Integration - Sidebar Footer

### Phase 7: UI Integration - Sidebar Footer
- [x] Open AppSidebar.vue
- [x] Locate SidebarFooter section
- [x] Add "Account Settings" button above the user dropdown menu (when authenticated)
- [x] Add settings/gear icon to the button
- [x] Add click handler to open AccountSettingsDialog
- [x] Import AccountSettingsDialog component
- [x] Add v-model binding for dialog open/close state
- [x] Ensure button is only visible when authenticated
- [x] Test button placement and visibility

### Phase 7: Testing & Validation
- [x] Test complete flow with test user account
- [x] Verify all visits are deleted from Firestore
- [x] Verify Firebase Auth account is deleted
- [x] Verify user is logged out after deletion
- [x] Test cancellation (cancel button, Escape key)
- [x] Test with incorrect password
- [x] Test keyboard navigation through dialog
- [x] Test loading states display correctly
- [x] Run type checking: `npm run type-check`

### Phase 8: Code Quality & Documentation
- [x] Add JSDoc comments to new methods in useAuth
- [x] Add JSDoc comments to deleteUserData method
- [x] Ensure TypeScript types are correct
- [x] Run type checking: `npm run type-check`
- [x] Ensure all imports are used and necessary
- [x] Remove obsolete ReauthDialog.vue component

### Phase 9: Finalization
- [x] Review all changes against spec deltas
- [x] Ensure all acceptance criteria are met
- [x] Update tasks.md to reflect simplified implementation

## Notes
- Implement tasks sequentially in the order listed
- Commit after completing each phase for better tracking
- Test each component independently before integration
- Pay special attention to error handling and user feedback
- Ensure re-authentication is required for security
- Verify Firebase Firestore rules allow users to delete their own visits

## Dependencies
- Firebase Auth SDK (already installed)
- Firebase Firestore SDK (already installed)
- shadcn/vue Dialog component (already available)
- Existing useAuth composable
- Existing firebaseDataService

## Estimated Effort
- Backend: 2-3 hours
- Authentication: 2-3 hours
- UI Components: 4-5 hours
- Integration: 1-2 hours
- Testing: 2-3 hours
- Total: ~12-16 hours
