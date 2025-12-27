# Proposal: Add User Authentication

## What
Add user authentication functionality with login/logout capabilities, visual indication of authentication state, and error handling for invalid credentials. Initial implementation uses test credentials with an architecture that supports future backend integration.

## Why
User authentication is foundational for personalized features like tracking pub visits, saving preferences, and managing user profiles. By implementing the authentication UI and state management now with test credentials, we create the infrastructure needed for future backend integration while allowing users to experience the logged-in state.

## How
- Add login form with username/password fields
- Implement authentication state management using Vue composables
- Display visual indication of logged-in user (e.g., user menu in header/sidebar)
- Handle and display authentication errors
- Use test credentials for validation (no backend required initially)
- Structure authentication layer to support future backend integration
- Add logout functionality
- Design extensible user menu for future features (preferences, password change, etc.)

## What Changes

### New Capabilities
- **user-authentication**: Login, logout, auth state management, and error handling
- **user-profile-menu**: Visual indication of logged-in state with extensible menu for future profile features

## Scope
- Login form with username and password fields
- Client-side validation using test credentials
- Authentication state management (reactive state)
- Visual indication of logged-in state
- User menu in UI (accessible from sidebar or header)
- Logout functionality
- Error display for invalid login attempts
- Extensible architecture for future features:
  - User preferences
  - Password management
  - Profile editing

## Non-Goals
- Backend API integration (future work)
- Persistent sessions across page refreshes (future enhancement)
- Password reset functionality (future work)
- OAuth/social login (future consideration)
- Multi-factor authentication (future consideration)
- User registration (future work)

## Related Changes
- Extends `pub-navigation-sidebar` (will add user menu to sidebar)
- Foundation for future visit tracking features

## Implementation Notes
- Use Vue composables for authentication state management (e.g., `useAuth`)
- Test credentials: username: "test", password: "password123"
- Authentication errors should be user-friendly (e.g., "Invalid username or password")
- Logged-in state should persist in memory (reset on page refresh)
- User menu should be designed for extensibility (dropdown/modal with menu items)
- Consider using shadcn/vue components for consistent UI (Dialog, DropdownMenu, etc.)
- Future backend integration point: replace test credential validation with API call
