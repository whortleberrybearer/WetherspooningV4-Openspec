# Tasks: Add User Signup

## Implementation Tasks

### 1. Create SignupDialog Component
**Priority:** HIGH  
**Dependencies:** None  
**Estimated Effort:** Medium

Create `Wetherspooning/src/components/SignupDialog.vue` component based on shadcn-vue signup-01 template.

**Subtasks:**
- Create component file structure (template, script setup, imports)
- Add Dialog wrapper with open/close state management
- Implement form fields: username, email, password, confirm password
- Add field labels and helper text per spec
- Style form with grid layout (gap-4) matching LoginDialog
- Add "Create Account" submit button with loading state
- Add visual divider with "Or sign up with" text
- Add "Sign up with Google" button (non-functional placeholder)
- Add "Already have an account? Sign in" footer with link
- Implement keyboard navigation and focus management
- Add auto-focus to username field on dialog open

**Validation:**
- [ ] Component renders without errors
- [ ] All form fields display with correct labels and helper text
- [ ] Visual layout matches design.md specifications
- [ ] Dialog can open and close
- [ ] Username field receives focus on open

---

### 2. Implement Client-Side Validation
**Priority:** HIGH  
**Dependencies:** Task 1  
**Estimated Effort:** Medium

Add form validation logic to SignupDialog component.

**Subtasks:**
- Create validation function for required fields
- Add username minimum length validation (3 characters)
- Add email format validation (HTML5 type="email")
- Add password minimum length validation (8 characters)
- Add password confirmation match validation
- Create error state management (reactive ref)
- Add error display component with role="alert" and aria-live="polite"
- Disable submit button when fields are empty
- Clear errors on dialog close
- Trigger validation on form submit only

**Validation:**
- [ ] Empty fields show "All fields are required" error
- [ ] Short username shows "Username must be at least 3 characters" error
- [ ] Short password shows "Password must be at least 8 characters" error
- [ ] Mismatched passwords show "Passwords do not match" error
- [ ] Invalid email triggers HTML5 validation
- [ ] Submit button is disabled when form is incomplete
- [ ] Errors clear when dialog closes

---

### 3. Extend useAuth Composable with Register Function
**Priority:** HIGH  
**Dependencies:** None (can be done in parallel with Task 1-2)  
**Estimated Effort:** Small

Add `register()` function to `Wetherspooning/src/composables/useAuth.ts`.

**Subtasks:**
- Rename TEST_CREDENTIALS to TEST_ACCOUNTS and convert to array
- Add default test account: `{ username: 'test', email: 'test@example.com', password: 'password123' }`
- Implement `register(username, email, password)` function
- Check for existing email in TEST_ACCOUNTS array
- Return error if email already exists
- Add new account to TEST_ACCOUNTS on successful registration
- Return success promise on registration
- Update login function to work with TEST_ACCOUNTS array

**Validation:**
- [ ] TEST_ACCOUNTS array contains default test account
- [ ] `register()` function accepts username, email, password parameters
- [ ] Duplicate email returns "Email already registered" error
- [ ] New account is added to TEST_ACCOUNTS
- [ ] Existing login function still works with test account
- [ ] New registered accounts can be used to log in

---

### 4. Wire Up SignupDialog to useAuth
**Priority:** HIGH  
**Dependencies:** Tasks 2, 3  
**Estimated Effort:** Small

Connect SignupDialog form submission to useAuth.register() function.

**Subtasks:**
- Import useAuth composable in SignupDialog
- Call useAuth.register() on form submit (after validation passes)
- Handle success response (show success message, close signup, open login)
- Handle error response (display error message)
- Implement loading state during registration
- Update button text to "Creating account..." during loading
- Clear form fields after successful registration

**Validation:**
- [ ] Valid form submission calls useAuth.register()
- [ ] Success shows confirmation and opens login dialog
- [ ] Duplicate email error displays correctly
- [ ] Loading state shows during registration
- [ ] Form clears after successful registration

---

### 5. Add Dialog Navigation Links
**Priority:** HIGH  
**Dependencies:** Tasks 1, 4  
**Estimated Effort:** Small

Implement navigation between LoginDialog and SignupDialog.

**Subtasks:**
- Add "Sign up" link click handler in LoginDialog
- Emit event to close LoginDialog and open SignupDialog
- Add "Sign in" link click handler in SignupDialog
- Emit event to close SignupDialog and open LoginDialog
- Clear form fields when switching dialogs
- Implement dialog state management in parent component (likely App.vue or UserMenu.vue)

**Validation:**
- [ ] Clicking "Sign up" in LoginDialog opens SignupDialog
- [ ] Clicking "Sign in" in SignupDialog opens LoginDialog
- [ ] Previous dialog closes when new dialog opens
- [ ] Form fields clear when switching between dialogs
- [ ] No console errors during navigation

---

### 6. Add Accessibility Attributes
**Priority:** MEDIUM  
**Dependencies:** Tasks 1, 2  
**Estimated Effort:** Small

Ensure SignupDialog meets accessibility requirements.

**Subtasks:**
- Add `for`/`id` attributes to all label-input pairs
- Add `aria-describedby` to inputs with helper text
- Ensure error container has `role="alert"` and `aria-live="polite"`
- Add `autocomplete` attributes (username, email, new-password)
- Verify Tab order: username → email → password → confirm → submit → Google → sign in
- Test Escape key to close dialog
- Test Enter key to submit form
- Verify disabled button is visually distinct

**Validation:**
- [ ] All form fields have associated labels
- [ ] Helper text is linked via aria-describedby
- [ ] Error messages are announced to screen readers
- [ ] Tab navigation follows logical order
- [ ] Escape closes dialog
- [ ] Enter submits form
- [ ] Autocomplete attributes are set correctly

---

### 7. Test Sample Scenarios
**Priority:** HIGH  
**Dependencies:** Tasks 1-6  
**Estimated Effort:** Small

Manually test signup flow with sample data per user requirements.

**Subtasks:**
- Test successful signup with: username "testuser", email "testuser@example.com", password "password123"
- Verify success message and login dialog opens
- Test login with newly created account
- Test error scenario: signup with existing email "test@example.com"
- Verify "Email already registered" error displays
- Test validation errors: empty fields, short username, short password, mismatched passwords
- Test dialog navigation: signup ↔ login
- Test keyboard navigation through entire flow
- Test mobile responsive layout

**Validation:**
- [ ] testuser@example.com successfully registers and can log in
- [ ] Duplicate email test@example.com shows error
- [ ] All validation errors display correctly
- [ ] Dialog navigation works smoothly
- [ ] Form is fully keyboard accessible
- [ ] Mobile layout displays correctly

---

## Task Dependencies

```
Task 1 (Create SignupDialog) ──┬──> Task 2 (Client Validation) ──┬──> Task 4 (Wire to useAuth) ──┬──> Task 5 (Navigation)
                                │                                 │                             │
Task 3 (Extend useAuth) ────────┴─────────────────────────────────┴─────────────────────────────┴──> Task 7 (Testing)
                                                                                                 │
Task 6 (Accessibility) ──────────────────────────────────────────────────────────────────────────┘
```

**Parallelizable Work:**
- Tasks 1 and 3 can be done simultaneously
- Task 6 can start once Task 1 is complete (doesn't need to wait for Task 2)

**Sequential Work:**
- Task 2 depends on Task 1
- Task 4 depends on Tasks 2 and 3
- Task 5 depends on Tasks 1 and 4
- Task 7 depends on all previous tasks

---

## Verification Checklist

After completing all tasks, verify:

- [ ] SignupDialog component exists and renders
- [ ] All form fields present with correct labels and helper text
- [ ] Client-side validation works for all error cases
- [ ] useAuth.register() function exists and works
- [ ] TEST_ACCOUNTS array contains default test account
- [ ] New accounts can be registered and used to log in
- [ ] Dialog navigation between signup and login works
- [ ] Success flow: signup → confirmation → login → authentication
- [ ] Error flow: validation errors and duplicate email error display
- [ ] Accessibility: keyboard navigation, screen reader support, ARIA attributes
- [ ] Visual consistency with LoginDialog
- [ ] Mobile responsive layout
- [ ] Sample scenario: testuser@example.com successfully registers
- [ ] Sample scenario: test@example.com shows "already registered" error
