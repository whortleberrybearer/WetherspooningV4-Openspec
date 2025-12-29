# Tasks: Integrate Firebase Authentication

## Implementation Tasks

1. **Add Firebase Auth SDK initialization**
   - Import getAuth from firebase/auth in firebase.ts
   - Initialize and export auth instance
   - Connect to Auth emulator in development mode
   - Verify Firebase Auth config variables are documented in .env.example

2. **Update useAuth composable for Firebase integration**
   - Import Firebase Auth methods (signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged)
   - Remove TEST_ACCOUNTS array and related code
   - Replace login() implementation with signInWithEmailAndPassword
   - Replace register() implementation with createUserWithEmailAndPassword
   - Replace logout() implementation with signOut
   - Add auth state observer (onAuthStateChanged) to persist sessions
   - Update error handling to map Firebase Auth error codes to user-friendly messages
   - Ensure user state includes uid from Firebase User object

3. **Test authentication flows**
   - Verify new user registration creates Firebase Auth user
   - Verify login with registered credentials succeeds
   - Verify login with invalid credentials shows proper error
   - Verify logout clears auth state
   - Verify session persists across page refresh
   - Verify Firebase Auth emulator connection in development

4. **Update error messages**
   - Map Firebase error codes to user-friendly messages:
     - auth/email-already-in-use → "Email already registered. Please log in."
     - auth/invalid-email → "Invalid email address format."
     - auth/weak-password → "Password must be at least 8 characters long."
     - auth/user-not-found → "Invalid email or password"
     - auth/wrong-password → "Invalid email or password"
     - auth/invalid-credential → "Invalid email or password"

5. **Documentation**
   - Update code comments in useAuth.ts to reflect Firebase Auth usage
   - Verify .env.example includes Firebase Auth variables
   - Remove references to test credentials in comments

## Validation Tasks

1. **Manual testing**
   - Test signup with valid email/password
   - Test signup with existing email (should fail)
   - Test login with correct credentials
   - Test login with wrong password
   - Test logout functionality
   - Test session persistence (refresh page while logged in)

2. **Code validation**
   - Run `npx openspec validate 2025-12-29-integrate-firebase-authentication --strict`
   - Ensure no TypeScript errors
   - Verify no console errors during auth operations

## Dependencies
- Requires Firebase project with Authentication enabled
- Requires Firebase Auth emulator for local development
- Build on existing firebase-data-integration implementation

## Parallelizable Work
- Tasks 1-2 can be done sequentially but are the core implementation
- Tasks 4-5 (error messages and documentation) can be done after task 2

## Notes
- Visit data remains file-based (unchanged)
- No UI component changes required
- Google sign-in button remains non-functional (future work)
