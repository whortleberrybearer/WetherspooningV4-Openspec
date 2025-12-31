# Implementation Tasks: Add Account Deletion

## Overview
Implement account deletion functionality following the spec deltas in this change proposal.

## Prerequisites
- [ ] Proposal approved by reviewer
- [ ] Design.md reviewed and understood
- [ ] All spec deltas reviewed

## Implementation Tasks

### Phase 1: Backend - Firebase Data Service
- [ ] Add `deleteUserData(userId: string)` method to firebaseDataService.ts
- [ ] Implement Firestore query to find all visits for userId
- [ ] Implement batch deletion logic with 500-operation limit
- [ ] Add error handling for network failures and invalid parameters
- [ ] Add user-friendly error messages
- [ ] Test deleteUserData with various scenarios (0 visits, many visits, >500 visits)

### Phase 2: Authentication - Re-authentication Support
- [ ] Import `EmailAuthProvider`, `reauthenticateWithCredential`, `deleteUser` from firebase/auth in useAuth.ts
- [ ] Add `reauthenticate(password: string)` method to useAuth composable
- [ ] Implement re-authentication using Firebase reauthenticateWithCredential
- [ ] Add error handling and mapping for re-auth failures
- [ ] Add validation to check user is authenticated before re-auth
- [ ] Test reauthenticate with correct/incorrect passwords

### Phase 3: Authentication - Account Deletion Support
- [ ] Add `deleteAccount()` method to useAuth composable
- [ ] Call firebaseDataService.deleteUserData(userId) first
- [ ] Call Firebase deleteUser() after Firestore deletion succeeds
- [ ] Clear authentication state (user, isAuthenticated) after deletion
- [ ] Add error handling for Firestore and Auth deletion failures
- [ ] Add error state clearing to logout() method
- [ ] Test deleteAccount with various failure scenarios

### Phase 4: UI Components - Re-authentication Dialog
- [ ] Create ReauthDialog.vue component in src/components/
- [ ] Use shadcn/vue Dialog component
- [ ] Add dialog title "Confirm Your Identity"
- [ ] Add description text about password confirmation
- [ ] Add password input field (masked) with placeholder
- [ ] Add "Cancel" and "Confirm" buttons (destructive styling on Confirm)
- [ ] Disable Confirm button when password field is empty
- [ ] Implement password submission on Enter key
- [ ] Call useAuth.reauthenticate(password) on confirm
- [ ] Display error message for incorrect password
- [ ] Clear password field after error
- [ ] Show loading state during re-authentication
- [ ] Emit success event when re-auth succeeds
- [ ] Test keyboard navigation (Tab, Enter, Escape)

### Phase 5: UI Components - Delete Confirmation Dialog
- [ ] Create DeleteAccountConfirmDialog.vue component in src/components/
- [ ] Use shadcn/vue Dialog component
- [ ] Add dialog title "Delete Account?"
- [ ] Add warning message about permanent, non-recoverable deletion
- [ ] Add "Cancel" and "Delete Account" buttons (destructive styling)
- [ ] Emit confirm event when Delete Account is clicked
- [ ] Emit cancel event when Cancel is clicked or dialog dismissed
- [ ] Test keyboard navigation

### Phase 6: UI Components - Account Settings Dialog
- [ ] Create AccountSettingsDialog.vue component in src/components/
- [ ] Use shadcn/vue Dialog component
- [ ] Add dialog title "Account Settings"
- [ ] Display current username from useAuth.user
- [ ] Display current email from useAuth.user
- [ ] Add "Delete Account" button with destructive (red) styling
- [ ] Add "Close" button
- [ ] Integrate DeleteAccountConfirmDialog component
- [ ] Integrate ReauthDialog component
- [ ] Implement deletion flow: Delete Account → Confirmation → Re-auth → Execute
- [ ] Show loading overlay "Deleting account..." during deletion
- [ ] Call useAuth.deleteAccount() after successful re-auth
- [ ] Show success message "Account deleted" for 2 seconds
- [ ] Close all dialogs after successful deletion
- [ ] Display error messages from deletion failures
- [ ] Test complete deletion flow

### Phase 7: UI Integration - Sidebar Footer
- [ ] Open AppSidebar.vue
- [ ] Locate SidebarFooter section
- [ ] Add "Account Settings" button above the user dropdown menu (when authenticated)
- [ ] Add settings/gear icon to the button
- [ ] Add click handler to open AccountSettingsDialog
- [ ] Import AccountSettingsDialog component
- [ ] Add v-model binding for dialog open/close state
- [ ] Ensure button is only visible when authenticated
- [ ] Test button placement and visibility

### Phase 8: Testing & Validation
- [ ] Test complete flow with test user account
- [ ] Verify all visits are deleted from Firestore
- [ ] Verify Firebase Auth account is deleted
- [ ] Verify user is logged out after deletion
- [ ] Test cancellation at each step (confirmation, re-auth)
- [ ] Test with incorrect password
- [ ] Test with network disconnected (error handling)
- [ ] Test keyboard navigation through all dialogs
- [ ] Test on mobile viewport (responsive design)
- [ ] Verify accessibility with screen reader (if available)
- [ ] Test loading states display correctly
- [ ] Test error messages are clear and actionable

### Phase 9: Code Quality & Documentation
- [ ] Add JSDoc comments to new methods in useAuth
- [ ] Add JSDoc comments to deleteUserData method
- [ ] Ensure TypeScript types are correct
- [ ] Run type checking: `npm run type-check`
- [ ] Run linter if configured
- [ ] Remove any console.log debugging statements
- [ ] Ensure all imports are used and necessary

### Phase 10: Finalization
- [ ] Review all changes against spec deltas
- [ ] Ensure all acceptance criteria are met
- [ ] Create feature branch (e.g., `add-account-deletion`)
- [ ] Commit changes with descriptive messages (commit after each phase)
- [ ] Create pull request using template from .github/PULL_REQUEST_TEMPLATE/pull_request_template.md
- [ ] Update pull request title using Conventional Commits format
- [ ] Link pull request to this proposal
- [ ] Request code review

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
