# theme-toggle Specification

## Purpose
Enable users to switch between light mode and dark mode with their preference persisted and defaulting to system theme.

## ADDED Requirements

### Requirement: Theme Toggle Control (REQ-TT-001)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a theme toggle control in the sidebar footer.

**Acceptance Criteria:**
- Theme toggle is visible in sidebar footer
- Toggle is positioned above account settings button
- Toggle displays appropriate icon (sun for light, moon for dark)
- Toggle includes descriptive label text
- Toggle is keyboard accessible
- Visual style consistent with other sidebar menu items

#### Scenario: View Theme Toggle
**Given** the application is loaded  
**When** the user views the sidebar footer  
**Then** a theme toggle control is visible  
**And** the toggle is positioned above the account settings button  
**And** the toggle displays an icon and label indicating current theme

#### Scenario: Toggle Is Accessible
**Given** the application is loaded  
**When** the user navigates using keyboard  
**Then** the theme toggle can receive focus  
**And** the toggle can be activated using Enter or Space key

---

### Requirement: Theme State Management (REQ-TT-002)
**Priority:** MUST  
**Category:** Functional

The system MUST manage theme state and apply it to the UI.

**Acceptance Criteria:**
- Theme state is reactive and updates UI immediately
- Light mode removes dark class from HTML element
- Dark mode adds dark class to HTML element
- Theme application is synchronous (no flicker)
- Invalid theme states fall back to system preference

#### Scenario: Apply Light Theme
**Given** the current theme is dark  
**When** the user toggles to light theme  
**Then** the HTML element dark class is removed  
**And** the UI displays in light mode  
**And** all components render with light theme colors

#### Scenario: Apply Dark Theme
**Given** the current theme is light  
**When** the user toggles to dark theme  
**Then** the HTML element has dark class added  
**And** the UI displays in dark mode  
**And** all components render with dark theme colors

---

### Requirement: System Theme Detection (REQ-TT-003)
**Priority:** MUST  
**Category:** Functional

The system MUST detect and respect the user's system theme preference as the default.

**Acceptance Criteria:**
- Detect system theme using prefers-color-scheme media query
- Apply system theme when no user preference exists
- System detection occurs on first load
- System preference is read from browser/OS settings

#### Scenario: Default to System Dark Theme
**Given** the user has no stored theme preference  
**And** the system preference is dark mode  
**When** the application loads  
**Then** dark mode is applied  
**And** the theme toggle shows dark mode state

#### Scenario: Default to System Light Theme
**Given** the user has no stored theme preference  
**And** the system preference is light mode  
**When** the application loads  
**Then** light mode is applied  
**And** the theme toggle shows light mode state

---

### Requirement: Theme Persistence (REQ-TT-004)
**Priority:** MUST  
**Category:** Functional

The system MUST persist user's theme preference in local storage.

**Acceptance Criteria:**
- User theme preference is saved to localStorage
- Theme preference is loaded on application start
- Preference survives page refresh
- Preference persists across sessions
- Storage key is namespaced to application

#### Scenario: Persist Theme Selection
**Given** the user selects dark theme  
**When** the theme is applied  
**Then** the preference is saved to localStorage  
**And** the storage key is "wetherspooning-theme"  
**And** the stored value is "dark"

#### Scenario: Load Persisted Theme
**Given** the user previously selected dark theme  
**And** the preference is stored in localStorage  
**When** the user reloads the application  
**Then** dark theme is applied automatically  
**And** the theme toggle reflects the dark state

#### Scenario: Override System Theme with Preference
**Given** the system preference is light mode  
**And** the user previously selected dark theme  
**When** the application loads  
**Then** dark theme is applied (user preference wins)  
**And** system preference is ignored

---

### Requirement: Theme Toggle Interaction (REQ-TT-005)
**Priority:** MUST  
**Category:** Functional

The system MUST allow users to toggle between light and dark themes.

**Acceptance Criteria:**
- Clicking toggle switches between light and dark
- Toggle updates icon to reflect new state
- Toggle updates label to reflect new state
- Theme change is immediate (no delay)
- Toggle is available to all users (authenticated and unauthenticated)

#### Scenario: Toggle from Light to Dark
**Given** the current theme is light  
**When** the user clicks the theme toggle  
**Then** the theme switches to dark  
**And** the icon changes to moon  
**And** the UI updates to dark mode

#### Scenario: Toggle from Dark to Light
**Given** the current theme is dark  
**When** the user clicks the theme toggle  
**Then** the theme switches to light  
**And** the icon changes to sun  
**And** the UI updates to light mode

---

### Requirement: Graceful Fallback (REQ-TT-006)
**Priority:** MUST  
**Category:** Non-Functional

The system MUST handle localStorage unavailability gracefully.

**Acceptance Criteria:**
- If localStorage is unavailable, theme still works
- Theme defaults to system preference when storage fails
- No error thrown to user
- Theme toggle remains functional

#### Scenario: Fallback When Storage Unavailable
**Given** localStorage is disabled or unavailable  
**When** the user toggles the theme  
**Then** the theme changes for current session  
**And** no error is displayed  
**But** the preference is not persisted across sessions
