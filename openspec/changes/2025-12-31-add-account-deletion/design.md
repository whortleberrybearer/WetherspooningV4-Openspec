# Design: Account Deletion

## Architectural Overview
Account deletion follows a secure multi-step flow that ensures user intent while thoroughly removing all user data from the system.

## Component Architecture

### 1. UI Layer
**AccountSettingsDialog.vue** (NEW)
- Modal dialog component using shadcn/vue Dialog
- Contains account management options
- Houses "Delete Account" button with destructive styling
- Manages sub-dialogs for deletion flow

**DeleteAccountConfirmDialog.vue** (NEW)
- Confirmation dialog displayed when user clicks "Delete Account"
- Shows warning message about permanent, non-recoverable action
- Provides "Cancel" and "Confirm Deletion" buttons
- Triggers re-authentication flow on confirmation

**ReauthDialog.vue** (NEW)
- Re-authentication dialog requiring user to re-enter password
- Uses Firebase reauthenticateWithCredential API
- Only proceeds with deletion after successful re-authentication
- Returns error if credentials don't match

### 2. Composable Layer
**useAuth.ts** (MODIFIED)
- Add `deleteAccount()` method
- Add `reauthenticate(password: string)` method
- Handle Firebase Auth errors during deletion
- Coordinate auth deletion with Firestore data deletion

### 3. Service Layer
**firebaseDataService.ts** (MODIFIED)
- Add `deleteUserData(userId: string)` method
- Use Firestore batch operations to delete all visits for user
- Ensure atomic deletion (all-or-nothing)
- Handle deletion errors gracefully

## Data Flow

### Deletion Sequence
```
1. User opens Account Settings (sidebar footer)
   → AccountSettingsDialog opens

2. User clicks "Delete Account"
   → DeleteAccountConfirmDialog opens with warning

3. User confirms deletion
   → ReauthDialog opens
   → User enters password
   → Firebase reauthenticateWithCredential() called

4. Re-authentication succeeds
   → deleteUserData(userId) called (Firestore visits)
   → Firebase Auth deleteUser() called
   → User state cleared
   → User redirected to logged-out state
   → All dialogs closed

5. Re-authentication fails
   → Error shown in ReauthDialog
   → User can retry or cancel
```

## Security Considerations

### Re-authentication Requirement
- **Why:** Prevents accidental deletions and ensures user is actively present
- **How:** Firebase reauthenticateWithCredential requires fresh password entry
- **Session:** Recent logins still require re-auth for deletion

### Data Deletion Order
- **Firestore data first:** Delete visits and other user data
- **Auth account last:** Delete Firebase Auth user account
- **Rationale:** If auth deletion fails, user can retry. If visits delete fails but auth succeeds, orphaned data remains (mitigated by error handling)

### Error Handling
- Network failures during deletion: Show error, allow retry
- Partial deletion: Firestore batch ensures atomicity for visits
- Auth deletion failure: Log error, inform user, allow retry

## UI/UX Design

### Sidebar Footer Placement
- Account Settings button appears at bottom of SidebarFooter
- Only visible when authenticated
- Styled consistently with other sidebar menu items
- Icon: Settings/gear icon

### Dialog Hierarchy
1. **Account Settings Dialog**
   - Title: "Account Settings"
   - Contains account info (username, email)
   - "Delete Account" button in destructive (red) styling
   - Footer: "Close" button

2. **Delete Confirmation Dialog**
   - Title: "Delete Account?"
   - Warning text: "This action is permanent and cannot be undone. All your visit data will be permanently deleted."
   - Footer: "Cancel" + "Delete Account" (destructive)

3. **Re-authentication Dialog**
   - Title: "Confirm Your Identity"
   - Description: "Please enter your password to confirm account deletion"
   - Password field (masked)
   - Footer: "Cancel" + "Confirm" (destructive)
   - Error display for wrong password

### Loading States
- Re-authentication: Disable confirm button, show spinner
- Deletion in progress: Show "Deleting account..." overlay
- Success: Brief "Account deleted" message before logout

### Mobile Responsiveness
- All dialogs are mobile-friendly (shadcn/vue handles this)
- Touch-friendly button sizes
- Readable warning text on small screens

## Implementation Considerations

### Firebase API Usage
```typescript
// Re-authentication
const credential = EmailAuthProvider.credential(user.email, password)
await reauthenticateWithCredential(auth.currentUser, credential)

// Delete user data (Firestore)
const batch = writeBatch(db)
const visitsRef = collection(db, 'visits')
const q = query(visitsRef, where('userId', '==', userId))
const snapshot = await getDocs(q)
snapshot.docs.forEach(doc => batch.delete(doc.ref))
await batch.commit()

// Delete auth account
await deleteUser(auth.currentUser)
```

### Rollback Strategy
- Firestore batch operations are atomic
- If auth deletion fails after Firestore deletion, user retains login but loses data
  - Mitigation: Clear error message, provide support contact
  - Future: Consider two-phase commit or transaction log

### Testing Strategy
- Test re-authentication with correct/incorrect passwords
- Test network failures during deletion
- Test partial deletion scenarios
- Verify all user data is removed
- Verify logout occurs after deletion
- Test dialog navigation and cancellation

## Alternative Approaches Considered

### Soft Delete
- **Approach:** Mark account as deleted, hide from UI, purge later
- **Rejected:** Adds complexity, doesn't meet immediate data deletion expectations

### No Re-authentication
- **Approach:** Delete immediately on confirmation
- **Rejected:** Too risky for accidental deletions, industry standard requires re-auth

### Separate Data Retention
- **Approach:** Keep anonymized visit statistics
- **Rejected:** Not in scope for MVP, can be added later with user consent

## Future Enhancements
- Export user data before deletion (GDPR data portability)
- Account deactivation (temporary) vs deletion (permanent)
- Grace period (30 days) before permanent deletion
- Email confirmation before deletion
- Multi-factor authentication for deletion
