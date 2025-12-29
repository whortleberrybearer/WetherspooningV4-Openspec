# Proposal: Integrate Firebase Authentication

## What
Replace test credentials with Firebase Authentication to enable real user registration, login, and logout. Remove hardcoded test accounts and integrate Firebase Auth SDK for production-ready user authentication.

## Why
The current authentication system uses dummy test accounts (test@example.com / password123) stored in-memory, which:
- Cannot persist users between page refreshes
- Does not support real user registration
- Is insecure and unsuitable for production
- Prevents proper user management and account features

Firebase Authentication provides:
- Secure user credential storage and validation
- Email/password authentication out-of-the-box
- Session persistence across page refreshes
- Foundation for future OAuth/social login
- Free tier suitable for development and small-scale deployment
- Seamless integration with existing Firebase Firestore backend

## How
- Add Firebase Auth SDK to existing Firebase configuration
- Replace test account validation with Firebase createUserWithEmailAndPassword
- Replace login logic with Firebase signInWithEmailAndPassword
- Add session persistence with Firebase Auth state observer
- Update logout to use Firebase signOut
- Maintain all existing UI components (LoginDialog, SignupDialog, UserMenu)
- Keep visit data loading from static file (unchanged)
- Remove TEST_ACCOUNTS array from useAuth composable

## What Changes

### Modified Capabilities
- **user-authentication**: Update to use Firebase Auth instead of test credentials
- **user-signup**: Update to use Firebase Auth instead of in-memory account creation
- **firebase-data-integration**: Extend to include Firebase Auth initialization

## Scope
- Initialize Firebase Auth in firebase.ts
- Update useAuth.ts to use Firebase Auth SDK methods
- Replace login() with signInWithEmailAndPassword
- Replace register() with createUserWithEmailAndPassword  
- Replace logout() with signOut
- Add auth state observer for session persistence
- Update error handling to use Firebase Auth error codes
- Maintain existing UI components without changes
- Update environment variable documentation for Firebase Auth

## Non-Goals
- Changing visit data source (remains static file)
- Adding OAuth/Google sign-in functionality (UI exists but remains non-functional)
- Password reset functionality (will be future enhancement)
- Email verification (will be future enhancement)
- User profile data in Firestore (future work)
- Multi-factor authentication (future consideration)

## Related Changes
- Extends `add-firebase-backend` (uses same Firebase project and config)
- Modifies `add-user-authentication` (replaces test credential logic)
- Modifies `add-user-signup` (replaces in-memory registration)

## Implementation Notes
- Firebase Auth config already exists in firebase.ts, only need to add getAuth
- Existing environment variables (.env.example) already include necessary Firebase Auth fields
- No changes needed to LoginDialog.vue or SignupDialog.vue (only composable logic changes)
- Firebase Auth emulator should be used during development (already configured)
