# Design: Theme Toggle Implementation

## Architecture Overview
The theme toggle will use a composable pattern to manage theme state, integrate with Tailwind CSS dark mode, and persist user preferences.

## Component Architecture

### Theme Composable (`useTheme`)
- **Location:** `Wetherspooning/src/composables/useTheme.ts`
- **Responsibilities:**
  - Detect system theme preference
  - Read/write theme preference to localStorage
  - Apply theme class to document root
  - Provide reactive theme state
  - Expose toggle function

### Theme Toggle UI
- **Location:** New menu item in `AppSidebar.vue` sidebar footer
- **Placement:** Above account settings button
- **Visual Design:**
  - Icon-based toggle (sun/moon)
  - Label text for accessibility
  - Consistent with existing sidebar menu items

## Theme Implementation Strategy

### Tailwind CSS Configuration
- Use Tailwind's class-based dark mode strategy
- Apply `dark` class to `<html>` element to enable dark mode
- Remove `dark` class for light mode

### Color Scheme
- Leverage existing shadcn/vue design tokens
- Dark mode styles defined using `dark:` variant prefix
- Maintain consistency with component library

## State Management

### Storage Strategy
```typescript
// localStorage key
const THEME_STORAGE_KEY = 'wetherspooning-theme'

// Possible values: 'light' | 'dark' | 'system'
```

### Initialization Flow
1. Check localStorage for saved preference
2. If no preference exists, detect system theme using `matchMedia('(prefers-color-scheme: dark)')`
3. Apply theme to DOM
4. Set up listener for system preference changes (only if user selected 'system')

### Toggle Behavior
- Cycle: system → light → dark → system
- OR simple toggle: light ↔ dark (defer to tasks phase)

## Technical Details

### System Theme Detection
```typescript
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
```

### DOM Manipulation
```typescript
// Apply dark mode
document.documentElement.classList.add('dark')

// Apply light mode
document.documentElement.classList.remove('dark')
```

### Reactivity
- Use Vue `ref` for theme state
- Watch for changes to update DOM
- Sync with localStorage on change

## Edge Cases
1. **localStorage unavailable:** Fall back to system preference
2. **Invalid stored value:** Reset to system preference
3. **SSR considerations:** Not applicable (client-side only app)
4. **Concurrent tabs:** Each tab manages theme independently (acceptable trade-off)

## Performance Considerations
- Theme application is synchronous DOM operation (fast)
- localStorage read/write is synchronous (acceptable for single value)
- No impact on bundle size (native browser APIs)

## Accessibility
- Include visible label text, not just icon
- Ensure sufficient color contrast in both modes
- Support keyboard navigation (inherent in SidebarMenuButton)
