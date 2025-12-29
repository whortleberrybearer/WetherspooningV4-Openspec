# Proposal: Add User Signup

## Change ID
`2025-12-29-add-user-signup`

## Overview
Enable users to create new accounts through a signup form. This complements the existing login functionality (`user-authentication` spec) by providing a registration flow. The initial implementation uses dummy/test data and does not integrate with a backend yet.

## Why
Currently, users can only log in with pre-existing test credentials. To support real user onboarding workflows in the future, we need a signup interface. This change provides:

- A clear user pathway from signup to login
- UI consistency with the existing login dialog
- Foundation for future backend integration (Firebase Authentication)
- Validation patterns for user inputs (username, email, password)

## Scope
### In Scope
- Signup form component based on shadcn-vue signup-01 template
- Form fields: username, email, password, confirm password
- Client-side validation (required fields, password match, email format, minimum password length)
- Test/dummy credential storage for successful signup
- Error state handling for validation failures
- Visual integration with existing auth UI patterns
- Link from login dialog to signup dialog and vice versa

### Out of Scope
- Backend API integration or Firebase Authentication
- Persistent storage of user accounts
- Email verification workflows
- Password strength indicators beyond minimum length
- OAuth signup (Google sign-in)
- Username uniqueness validation against a database

## User Impact
**Affected Users:** All users of the application

**Benefit:** Users will be able to create accounts through the UI, establishing a complete authentication flow (signup → login → access application).

**Migration Required:** None (new feature, no breaking changes)

## Dependencies
- **Specification:** `user-authentication` (existing) - signup dialog will link to login dialog
- **Component:** LoginDialog.vue - will add link to trigger signup dialog
- **Component:** shadcn-vue Dialog, Form components - already in use
- **Composable:** useAuth - will extend to support registration

## Success Criteria
- [ ] User can open signup form from login dialog
- [ ] User can submit valid signup credentials (test user: username "testuser", email "testuser@example.com", password "password123")
- [ ] User can see validation errors for invalid inputs (e.g., mismatched passwords, invalid email format)
- [ ] Successful signup shows confirmation and redirects/links to login
- [ ] Signup form maintains visual consistency with login dialog
- [ ] Form is keyboard navigable and accessible

## Related Changes
- `2025-12-27-add-user-authentication` (archived) - established login UI and useAuth patterns
