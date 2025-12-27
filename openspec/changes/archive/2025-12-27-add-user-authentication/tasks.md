# Tasks: Add User Authentication

## Implementation Tasks

### Phase 1: Authentication Service Layer

- [x] **Create authentication composable**
  - Create `src/composables/useAuth.ts`
  - Define `User` interface (username, email)
  - Define `AuthState` interface (user, isAuthenticated, error)
  - Create reactive auth state
  - Implement `login(username, password)` function
  - Implement `logout()` function
  - Implement credential validation against test credentials
  - Export composable with readonly state refs
  - Add JSDoc comments for public API

- [x] **Add test credentials**
  - Define test username: "test"
  - Define test password: "password123"
  - Define test email: "test@example.com"
  - Implement case-sensitive validation

### Phase 2: Login UI Components

- [x] **Create LoginDialog component**
  - Create `src/components/LoginDialog.vue`
  - Use shadcn/vue Dialog component
  - Add username input field with label
  - Add password input field with type="password" and label
  - Add submit button with disabled state when fields empty
  - Add form validation on submit
  - Call `useAuth().login()` on submit
  - Display error messages from auth state
  - Clear password field on dialog close
  - Clear error state on dialog close
  - Implement keyboard accessibility (Enter to submit, Escape to close)
  - Add loading state during authentication
  - Focus username field when dialog opens

- [x] **Add Login button to sidebar**
  - Modify `src/components/PubSidebar.vue`
  - Import `useAuth` composable
  - Import `LoginDialog` component
  - Add reactive state for dialog open/close
  - Add "Login" button in sidebar header (show when not authenticated)
  - Connect button click to open LoginDialog
  - Use `v-if="!isAuthenticated"` to conditionally show button

### Phase 3: User Menu Components

- [x] **Create UserMenu component**
  - Create `src/components/UserMenu.vue`
  - Use shadcn/vue DropdownMenu component
  - Display username in menu trigger
  - Create dropdown menu structure
  - Add "Logout" menu item
  - Connect logout item to `useAuth().logout()`
  - Add placeholder items for future features (disabled):
    - "Preferences" (disabled)
    - "Change Password" (disabled)
    - "Profile" (disabled)
  - Style disabled items appropriately
  - Implement keyboard navigation
  - Add appropriate ARIA attributes

- [x] **Integrate UserMenu into sidebar**
  - Modify `src/components/PubSidebar.vue`
  - Import `UserMenu` component
  - Add UserMenu to sidebar header (show when authenticated)
  - Use `v-if="isAuthenticated"` to conditionally show menu
  - Position menu appropriately in header layout
  - Ensure layout doesn't shift when switching between Login button and UserMenu

### Phase 4: Error Handling & Polish

- [x] **Implement error display**
  - Style error messages in LoginDialog
  - Use error/danger color scheme
  - Position error message clearly (above or below form)
  - Add ARIA live region for screen reader announcements
  - Test error message display for invalid credentials
  - Test error clearing on dialog close

- [x] **Add form validation**
  - Disable submit button when fields are empty
  - Validate fields are not just whitespace
  - Show appropriate error messages:
    - "Invalid username or password" for wrong credentials
    - Prevent submission if fields empty (via disabled button)
  - Clear password field after failed login attempt

- [x] **Implement keyboard accessibility**
  - Test Tab navigation through form fields
  - Test Enter key submits form
  - Test Escape key closes dialog
  - Implement focus trap in LoginDialog
  - Implement focus trap in UserMenu dropdown
  - Test focus returns correctly when dialogs close
  - Add aria-labels where needed

### Phase 5: Testing

- [ ] **Test login flow**
  - Test successful login with correct credentials ("test" / "password123")
  - Test failed login with incorrect username
  - Test failed login with incorrect password
  - Test failed login with wrong case (e.g., "Test")
  - Test login with empty fields (button disabled)
  - Test UI updates after successful login (shows UserMenu)
  - Test login dialog closes after successful login

- [ ] **Test logout flow**
  - Test logout clears authentication state
  - Test UI updates after logout (shows Login button)
  - Test UserMenu disappears after logout

- [ ] **Test error handling**
  - Test error message displays for invalid credentials
  - Test error message clears when dialog closes
  - Test error message is accessible to screen readers
  - Test multiple failed login attempts

- [ ] **Test state management**
  - Test authentication state is reactive across components
  - Test state does not persist after page refresh
  - Test multiple components can use useAuth simultaneously

- [ ] **Test UI/UX**
  - Test LoginDialog opens and closes correctly
  - Test LoginDialog is responsive on mobile
  - Test UserMenu dropdown opens and closes correctly
  - Test UserMenu is responsive on mobile
  - Test touch targets are appropriate size on mobile
  - Test visual consistency with existing UI

- [ ] **Test accessibility**
  - Test keyboard navigation in LoginDialog
  - Test keyboard navigation in UserMenu
  - Test screen reader announcements
  - Test ARIA attributes are correct
  - Test focus management
  - Test with keyboard-only navigation

### Phase 6: Documentation

- [ ] **Update documentation**
  - Add authentication section to README.md
  - Document useAuth composable API
  - Document test credentials
  - Document component structure
  - Add comments in code where needed
  - Document future backend integration points

## Dependencies
- All tasks in Phase 1 must complete before Phase 2
- Phases 2 and 3 can be developed in parallel after Phase 1
- Phase 4 can start after Phases 2 and 3
- Phase 5 (testing) requires all implementation phases complete
- Phase 6 (documentation) can happen alongside testing

## Parallel Work
- Phase 2 (Login UI) and Phase 3 (User Menu) can be developed simultaneously after Phase 1 completes
- Error handling tasks can be done as components are built
- Documentation can be written alongside implementation
