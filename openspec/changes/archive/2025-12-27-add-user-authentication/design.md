# Design: Add User Authentication

## Problem
The application currently has no concept of user identity or authentication. To support future features like visit tracking, preferences, and user profiles, we need to establish authentication infrastructure. However, we don't have a backend yet, so we need a solution that works client-side but is designed for future backend integration.

## Solution
Implement a layered authentication system with:
1. **Authentication Service Layer**: Composable that manages auth state and validation
2. **Login UI**: Form component for credentials entry
3. **User Menu**: Visual indication of logged-in state with extensible menu
4. **Error Handling**: Clear feedback for invalid credentials

The authentication service uses test credentials initially but has a clean interface for swapping in API-based authentication later.

## Architecture

### Component Structure
```
App.vue (root)
└── PubLocationsMap.vue (main view)
    ├── PubSidebar.vue (existing)
    │   └── UserMenu.vue (NEW - shows when logged in)
    └── LoginDialog.vue (NEW - modal/dialog for login form)
```

### State Management
Use Vue 3 composables pattern for authentication state:

```typescript
// composables/useAuth.ts
interface User {
  username: string
  email?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  error: string | null
}

// Reactive state accessible across components
const authState = reactive<AuthState>({
  user: null,
  isAuthenticated: false,
  error: null
})

// Test credentials
const TEST_CREDENTIALS = {
  username: 'test',
  password: 'password123',
  email: 'test@example.com'
}

export function useAuth() {
  const login = (username: string, password: string) => {
    // Validate against test credentials
    // Set user state or error
  }
  
  const logout = () => {
    // Clear user state
  }
  
  return {
    user: readonly(toRef(authState, 'user')),
    isAuthenticated: readonly(toRef(authState, 'isAuthenticated')),
    error: readonly(toRef(authState, 'error')),
    login,
    logout
  }
}
```

### UI Components

#### 1. LoginDialog.vue
- Modal/dialog component (using shadcn/vue Dialog)
- Username and password input fields
- Submit button and form validation
- Error message display area
- Triggered by "Login" button in sidebar/header

#### 2. UserMenu.vue
- Displays logged-in user's name
- Dropdown menu with extensible options:
  - User info display (username, email)
  - "Logout" action (immediate)
  - Placeholder items for future features:
    - "Preferences" (disabled/coming soon)
    - "Change Password" (disabled/coming soon)
    - "Profile" (disabled/coming soon)

#### 3. Integration into PubSidebar.vue
- Show "Login" button when not authenticated
- Show UserMenu component when authenticated
- Place in sidebar header area

### Data Flow
```
User clicks "Login" button
  ↓
LoginDialog opens
  ↓
User enters credentials
  ↓
useAuth.login(username, password)
  ↓
Validate against TEST_CREDENTIALS
  ↓
Success: Set user state, close dialog
Failure: Set error state, show error message
  ↓
PubSidebar reactively updates to show UserMenu
  ↓
User clicks "Logout" in UserMenu
  ↓
useAuth.logout()
  ↓
PubSidebar reactively updates to show "Login" button
```

### Error Handling
- Invalid credentials: "Invalid username or password"
- Empty fields: "Please enter both username and password"
- Display errors inline in LoginDialog
- Clear errors when dialog closes or on successful login

## Trade-offs

### Option 1: Composable Pattern (CHOSEN)
**Pros:**
- Clean separation of business logic and UI
- Easy to test
- Type-safe with TypeScript
- Simple to swap test implementation for API calls
- Reactive state automatically updates all components

**Cons:**
- Requires understanding of Vue 3 composition API
- Slightly more boilerplate than direct component state

### Option 2: Vuex/Pinia Store
**Pros:**
- Centralized state management
- DevTools support
- Well-established pattern

**Cons:**
- Overkill for current app size
- Additional dependency
- More boilerplate
- Not necessary until app state becomes complex

### Option 3: Component-Level State
**Pros:**
- Simplest to implement
- No abstraction layer

**Cons:**
- Hard to share state across components
- Difficult to refactor for backend integration
- Testing is harder

## Future Extensibility

### Backend Integration Points
When backend is ready, only the composable needs updating:

```typescript
// Future: Replace test validation with API call
const login = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    const data = await response.json()
    // Set user state from API response
  } catch (err) {
    // Handle errors
  }
}
```

### Session Persistence
Future enhancement: Store auth token in localStorage

```typescript
// Save on login
localStorage.setItem('authToken', token)

// Restore on app mount
const token = localStorage.getItem('authToken')
if (token) {
  // Validate token with backend
}
```

### Additional User Features
The UserMenu is designed to easily add new items:
- Link to preferences page/dialog
- Link to profile page
- Password change dialog
- Visit history
- Saved pubs

## Testing Considerations
- Test login with valid credentials
- Test login with invalid credentials
- Test login with empty fields
- Test logout clears state
- Test user menu appears after login
- Test user menu disappears after logout
- Test error messages display correctly
- Test dialog opens and closes correctly
- Test keyboard accessibility (Tab, Enter, Escape)

## Mobile Considerations
- LoginDialog should be responsive
- Form fields should have appropriate mobile input types
- Touch-friendly button sizes
- Consider bottom sheet on mobile instead of center dialog
