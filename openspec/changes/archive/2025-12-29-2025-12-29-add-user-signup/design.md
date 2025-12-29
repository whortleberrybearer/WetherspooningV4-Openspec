# Design: Add User Signup

## Architecture

### Component Structure
The signup feature will follow the same architectural pattern as the existing login functionality:

```
SignupDialog.vue (new)
  ├─ Dialog (shadcn-vue)
  ├─ Form fields (username, email, password, confirm password)
  ├─ Validation logic
  └─ Calls useAuth.register()

useAuth.ts (extended)
  ├─ Existing: login(), logout(), clearError()
  └─ New: register()
```

### Design Decisions

#### 1. Dialog vs. Separate Route
**Decision:** Use a modal dialog (consistent with login)  
**Rationale:** 
- Maintains UI consistency with LoginDialog
- Reduces friction in auth flow (no page navigation)
- Follows mobile-first principle (overlays work well on small screens)
- Matches shadcn-vue signup-01 template which uses dialog/card

**Alternatives Considered:**
- Separate route (/signup) - rejected because it adds navigation complexity
- Inline form - rejected for lack of visual hierarchy

#### 2. Username vs. Full Name
**Decision:** Use "Username" field instead of "Full Name"  
**Rationale:**
- User entity in domain model defines `username` not full name
- Usernames are more suitable for public-facing display (pub visits, reviews)
- Aligns with test credentials structure already in useAuth
- Requested explicitly by user

#### 3. Validation Strategy
**Decision:** Client-side only validation for now  
**Rationale:**
- No backend integration yet (dummy data phase)
- Provides immediate user feedback
- Will extend with server-side when Firebase Auth is integrated

**Validation Rules:**
- Username: required, minimum 3 characters
- Email: required, valid email format (HTML5 pattern)
- Password: required, minimum 8 characters (matches shadcn template)
- Confirm Password: required, must match password

#### 4. Test Credentials Storage
**Decision:** Extend TEST_CREDENTIALS in useAuth with array of valid accounts  
**Rationale:**
- Maintains consistency with existing login test pattern
- Simple to implement without storage infrastructure
- Easy to demonstrate success/error cases

**Test Accounts:**
```typescript
const TEST_ACCOUNTS = [
  { username: 'test', email: 'test@example.com', password: 'password123' },
  { username: 'testuser', email: 'testuser@example.com', password: 'password123' }
]
```

New signups will be added to this array (lost on page reload, which is acceptable for dummy data phase).

#### 5. Success Flow
**Decision:** On successful signup, show success message and auto-open login dialog  
**Rationale:**
- Clear user pathway (signup → login → use app)
- Avoids auto-login which might mask future backend integration issues
- Provides confirmation of account creation

**Alternatives Considered:**
- Auto-login after signup - rejected to maintain clear separation of concerns
- Redirect to separate success page - rejected for consistency with dialog pattern

#### 6. Error Scenarios
**Decision:** Support multiple error states with specific messages  
**Rationale:**
- Improves user experience with actionable feedback
- Tests error handling patterns for future API integration

**Error Cases:**
- Empty fields → "All fields are required"
- Invalid email format → HTML5 validation message
- Password < 8 characters → "Password must be at least 8 characters"
- Passwords don't match → "Passwords do not match"
- Email already exists (for test account) → "Email already registered. Please log in."

### Component Interaction Flow

```
User clicks "Sign up" in LoginDialog
  ↓
SignupDialog opens
  ↓
User fills form (username, email, password, confirm password)
  ↓
User clicks "Create Account"
  ↓
SignupDialog validates inputs
  ↓
If invalid → Show error message
If valid → Call useAuth.register(username, email, password)
  ↓
useAuth.register() checks if email exists in TEST_ACCOUNTS
  ↓
If exists → Reject with "Email already registered"
If new → Add to TEST_ACCOUNTS, resolve success
  ↓
SignupDialog shows success message
  ↓
SignupDialog closes, LoginDialog opens (or shows toast notification)
```

### Future Extensibility

When integrating with Firebase Authentication:
- `useAuth.register()` will call Firebase Auth `createUserWithEmailAndPassword()`
- Client validation stays, server validation added
- Success flow may auto-login with Firebase auth token
- Error handling extends to network errors, Firebase-specific errors

No architectural changes needed - just implementation details within useAuth composable.

## Technical Notes

### Shadcn-vue Template Adaptation
The signup-01 template includes:
- Full Name field → **Replace with Username**
- Email with helper text → Keep helper text for UX consistency
- Password with minimum length hint → Keep hint
- Confirm Password → Keep
- "Sign up with Google" → Include but keep non-functional (consistent with login)
- "Already have an account?" link → Link to login dialog

### Accessibility Considerations
- All form fields have associated labels
- Error messages use `role="alert"` and `aria-live="polite"`
- Submit button disabled state when form invalid
- Keyboard navigation supported (Tab order: username → email → password → confirm → submit)
- Focus management: auto-focus username field on dialog open

### Mobile Responsiveness
- Dialog uses responsive max-width (sm:max-w-[425px])
- Form fields stack vertically (inherent in shadcn components)
- Touch-friendly button sizes (default shadcn sizing)
- No horizontal scrolling on small screens
