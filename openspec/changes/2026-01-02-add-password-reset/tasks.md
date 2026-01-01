# Tasks: Add Password Reset

## Implementation Tasks

### Frontend Components
- [x] Create PasswordResetDialog component with email input
- [x] Add dialog trigger to "Forgot your password?" link in login form
- [x] Implement form validation for email field
- [x] Add success message display
- [x] Add error message display
- [x] Add "Back to Login" functionality

### State Management
- [x] Add password reset state to auth composable
- [x] Add `sendPasswordResetEmail` function
- [x] Add error handling for Firebase password reset errors
- [x] Add loading state during reset email sending

### Firebase Integration
- [x] Implement Firebase `sendPasswordResetEmail()` call
- [x] Map Firebase error codes to user-friendly messages
- [x] Handle network errors gracefully

### Testing
- [ ] Test successful password reset email sending
- [ ] Test invalid email handling
- [ ] Test non-existent user handling
- [ ] Test UI state transitions
- [ ] Test error message display
- [ ] Verify email receipt in Firebase Auth emulator
