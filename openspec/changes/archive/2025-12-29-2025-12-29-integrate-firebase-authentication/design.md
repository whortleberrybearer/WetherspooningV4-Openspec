# Design: Integrate Firebase Authentication

## Context
The application currently uses in-memory test accounts for authentication, which is suitable for initial development but unsuitable for production. Firebase is already integrated for pub data storage via Firestore, making Firebase Authentication a natural extension.

## Goals
1. Replace test credential validation with production-ready Firebase Authentication
2. Enable persistent user sessions across page refreshes
3. Maintain existing UI/UX without breaking changes
4. Provide foundation for future authentication features (OAuth, password reset)

## Architecture

### Current State
```
┌─────────────┐         ┌──────────────┐
│ LoginDialog │────────>│   useAuth    │
└─────────────┘         │              │
                        │ TEST_ACCOUNTS│ (in-memory array)
┌──────────────┐        │   - test@... │
│ SignupDialog │───────>│   - pwd123   │
└──────────────┘        └──────────────┘
```

### Proposed State
```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│ LoginDialog │────────>│   useAuth    │────────>│ Firebase Auth  │
└─────────────┘         │              │         │                │
                        │  - login()   │         │ - signIn...    │
┌──────────────┐        │  - register()│         │ - createUser...│
│ SignupDialog │───────>│  - logout()  │         │ - signOut      │
└──────────────┘        │              │         │ - onAuthState..│
                        └──────────────┘         └────────────────┘
                               │
                               │ Auth State Observer
                               ↓
                        ┌──────────────┐
                        │  authState   │
                        │  - user      │
                        │  - isAuth... │
                        └──────────────┘
```

## Key Design Decisions

### 1. Firebase Auth SDK Integration
**Decision:** Use Firebase Auth modular SDK (v9+) with tree-shakable imports

**Rationale:**
- Already using Firebase for Firestore (same SDK version)
- Modular SDK reduces bundle size
- Consistent with existing firebase.ts pattern
- TypeScript support out-of-the-box

**Implementation:**
```typescript
// firebase.ts
import { getAuth, connectAuthEmulator } from 'firebase/auth'

export const auth = getAuth(app)

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099')
}
```

### 2. Auth State Management
**Decision:** Use Firebase onAuthStateChanged observer for session persistence

**Rationale:**
- Firebase automatically handles token refresh and session validation
- Eliminates need for manual localStorage management
- Provides single source of truth for auth state
- Works across tabs/windows

**Implementation:**
```typescript
// useAuth.ts - initialization
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    authState.user = {
      username: firebaseUser.email?.split('@')[0] || 'user',
      email: firebaseUser.email || undefined
    }
    authState.isAuthenticated = true
  } else {
    authState.user = null
    authState.isAuthenticated = false
  }
})
```

### 3. Error Handling Strategy
**Decision:** Map Firebase error codes to user-friendly messages in useAuth

**Rationale:**
- Keeps error handling logic centralized
- UI components remain agnostic to Firebase
- Easy to update error messages in one place
- Consistent error UX across login/signup

**Implementation:**
```typescript
function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email already registered. Please log in.'
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password'
    case 'auth/weak-password':
      return 'Password must be at least 8 characters long.'
    default:
      return 'An error occurred. Please try again.'
  }
}
```

### 4. Username Field Handling
**Decision:** Store username in future Firestore user profile (not in this change)

**Rationale:**
- Firebase Auth only stores email, no username field
- Current implementation derives username from email (split on @)
- Full user profile storage is out of scope for this change
- Maintains existing User interface without breaking changes

**Trade-offs:**
- Short-term: Username = email prefix (e.g., "john" from "john@example.com")
- Long-term: Will migrate to Firestore user profiles when implemented

### 5. Emulator Support
**Decision:** Connect to Firebase Auth emulator in development mode

**Rationale:**
- Matches existing Firestore emulator pattern
- Enables offline development
- Avoids polluting production Firebase project
- Free and fast for testing

## Non-Goals (Deferred)
- **User Profiles in Firestore:** Username, display name, avatar stored separately
- **Email Verification:** Send verification emails on signup
- **Password Reset:** Forgot password flow
- **OAuth/Social Login:** Google sign-in button remains placeholder
- **Visit Data in Firestore:** Still loads from static file

## Migration Path
This change is backwards-compatible at the UI level:
1. No changes to LoginDialog.vue or SignupDialog.vue
2. Test accounts are removed (users must register)
3. All existing authenticated features continue to work

## Security Considerations
- Firebase Auth handles password hashing (bcrypt-based)
- Session tokens stored in Firebase-managed storage (not localStorage directly)
- Auth state observer prevents stale authentication states
- Firebase Security Rules can restrict Firestore access to authenticated users (future)

## Performance Implications
- Auth state observer adds one listener on app initialization
- Firebase Auth tokens refresh automatically (minimal overhead)
- No additional network calls beyond Firebase SDK defaults
- Bundle size increases by ~40KB (Firebase Auth modular SDK)

## Testing Strategy
- Manual testing with Firebase Auth emulator
- Test all authentication flows (signup, login, logout, session persistence)
- Verify error messages for various failure scenarios
- No automated tests in this phase (future enhancement)
