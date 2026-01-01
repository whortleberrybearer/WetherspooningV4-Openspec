# Tasks: Add Theme Toggle

## Implementation Tasks

- [x] **Configure Tailwind CSS for dark mode**
  - Update `tailwind.config.js` to use class-based dark mode strategy
  - Set `darkMode: 'class'` configuration
  - Verify existing shadcn/vue components support dark mode variants
  - **Validation:** Dark mode class toggles component styles correctly

- [x] **Create useTheme composable**
  - Create `Wetherspooning/src/composables/useTheme.ts`
  - Implement system theme detection using `matchMedia('(prefers-color-scheme: dark)')`
  - Implement localStorage read/write with key `wetherspooning-theme`
  - Implement theme application (add/remove `dark` class on `document.documentElement`)
  - Expose reactive `theme` state (ref)
  - Expose `toggleTheme` function
  - Handle localStorage errors gracefully
  - **Validation:** Composable returns correct initial theme based on system/storage

- [x] **Initialize theme on app load**
  - Import and initialize `useTheme` in `main.ts` or `App.vue`
  - Call theme initialization before Vue app mount
  - Ensure no flash of unstyled content (FOUC)
  - **Validation:** Theme is applied before first render, no flicker observed

- [x] **Add theme toggle to AppSidebar**
  - Add new `SidebarMenuItem` in sidebar footer above account settings
  - Add toggle button using `SidebarMenuButton`
  - Include sun icon (for light mode) or moon icon (for dark mode)
  - Add label text "Theme" or "Light/Dark Mode"
  - Bind click handler to `toggleTheme` function
  - Update icon/label reactively based on current theme state
  - **Validation:** Toggle appears in correct position, displays correct icon

- [x] **Style theme toggle UI**
  - Ensure toggle matches existing sidebar menu item styles
  - Verify icon size and alignment
  - Test hover/focus states
  - Verify keyboard accessibility
  - **Validation:** Toggle is visually consistent and accessible

- [x] **Test theme persistence**
  - Verify theme selection is saved to localStorage
  - Verify theme is restored on page refresh
  - Verify theme persists across browser sessions
  - Test with multiple tabs (each tab manages independently)
  - **Validation:** Theme preference survives reload and persists

- [x] **Test system theme detection**
  - Clear localStorage and reload
  - Verify app respects system preference (light/dark)
  - Test on systems with different default themes
  - **Validation:** Defaults to system theme when no preference stored

- [x] **Test dark mode across components**
  - Verify all existing components render correctly in dark mode
  - Check map markers, dialogs, sidebar, buttons, cards
  - Verify text contrast meets accessibility standards
  - Fix any component-specific dark mode issues
  - **Validation:** All components display correctly in both themes

- [x] **Test edge cases**
  - Test with localStorage disabled/unavailable
  - Test with invalid stored theme value
  - Test rapid theme toggling
  - Test during authentication state changes
  - **Validation:** No errors, graceful fallbacks work

- [x] **Update type definitions if needed**
  - Add types for theme values ('light' | 'dark')
  - Type composable return values
  - **Validation:** TypeScript compilation succeeds with no errors

## Notes
- All tasks should be completed sequentially
- Each task should be validated before proceeding to the next
- Commit after completing logical groups of tasks (e.g., composable creation, UI integration, testing)
