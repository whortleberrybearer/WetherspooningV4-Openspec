# Change Proposal: Add Password Reset

## Change ID
`2026-01-02-add-password-reset`

## Summary
Add password reset functionality to allow users to recover their accounts when they forget their password, using Firebase Authentication's built-in password reset flow.

## Motivation
Users who forget their password currently have no way to regain access to their accounts. This is a critical usability gap in the authentication system that prevents legitimate users from accessing the application.

## Affected Capabilities
- `user-authentication` - Adding password reset flow

## Dependencies
- Requires existing Firebase Authentication setup
- Requires email configuration in Firebase Console

## Risk Assessment
**Risk Level:** Low

**Risks:**
- Email delivery may fail if Firebase email settings are not configured
- Users may not receive reset emails due to spam filters

**Mitigations:**
- Provide clear feedback when reset email is sent
- Include troubleshooting information in UI
- Firebase handles email template and delivery

## Implementation Notes
- Use Firebase Auth `sendPasswordResetEmail()` method
- Add "Forgot your password?" link to login form (already present in UI)
- Create password reset dialog/form
- Display success message after email sent
- Handle Firebase errors gracefully

## Acceptance Criteria
- [ ] User can click "Forgot your password?" link in login form
- [ ] Password reset dialog opens with email input
- [ ] User can submit email to receive reset link
- [ ] Success message displays after email sent
- [ ] Error messages display for invalid emails or Firebase errors
- [ ] User can return to login form from reset form
- [ ] Email field validation works correctly
- [ ] Firebase reset email is sent successfully
