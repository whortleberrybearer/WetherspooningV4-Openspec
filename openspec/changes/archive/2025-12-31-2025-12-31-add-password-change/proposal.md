# Proposal: Add Password Change to Account Settings

## Change ID
`2025-12-31-add-password-change`

## Status
Proposed

## Summary
Add password change functionality to the Account Settings dialog, allowing authenticated users to update their password with re-authentication for security.

## Motivation
Users need the ability to change their password for security maintenance and account control. This is a standard account management feature that complements the existing account deletion functionality.

### User Story
**As a** registered user  
**I want** to change my password from the account settings  
**So that** I can maintain my account security and update my credentials when needed

## Scope
This change modifies the existing **account-settings** capability by adding password change functionality.

### In Scope
- Password change form in Account Settings dialog
- Current password validation via re-authentication
- New password validation (minimum 8 characters)
- Confirmation password field
- Success/error feedback
- Integration with Firebase Auth updatePassword API

### Out of Scope
- Password reset via email (forgot password)
- Password strength meter
- Password history checking
- Two-factor authentication

## Affected Capabilities
- **account-settings** (MODIFIED) - Add password change form and functionality

## Design Decisions

### UI Placement
The password change form will be added to the existing Account Settings dialog as a separate section, positioned between the account information and the delete account section.

### Security Approach
- Require current password re-authentication before allowing password change (using existing `reauthenticate` method from useAuth)
- Validate new password meets minimum requirements (8+ characters, matching Firebase Auth requirements)
- Require confirmation password to prevent typos
- Clear all password fields after successful change
- Show clear success/error feedback

### Implementation Approach
- Add password change section to AccountSettingsDialog.vue
- Use Firebase Auth `updatePassword` API
- Reuse existing `reauthenticate` method from useAuth composable
- Add new `changePassword` method to useAuth composable
- Follow existing patterns from account deletion flow

## Dependencies
- Existing `useAuth` composable with `reauthenticate` method
- Firebase Auth SDK (already installed)
- Account Settings dialog (already implemented)

## Migration Strategy
No migration needed - this is purely additive functionality with no data model changes.

## Testing Considerations
- Test successful password change with valid current password
- Test rejection with incorrect current password
- Test validation of new password requirements
- Test confirmation password matching
- Test error handling for network failures
- Test success message display
- Test form clearing after success
- Test keyboard accessibility (Enter to submit, Escape to cancel)

## Rollout Plan
1. Implement changes following tasks.md
2. Test locally with Firebase emulator
3. Deploy to production after validation
4. Archive change after successful deployment

## Open Questions
None - requirements are clear and follow existing patterns.

## References
- [Firebase Auth updatePassword Documentation](https://firebase.google.com/docs/auth/web/manage-users#set_a_users_password)
- Existing implementation: `openspec/specs/account-settings/spec.md`
- Related composable: `Wetherspooning/src/composables/useAuth.ts`
