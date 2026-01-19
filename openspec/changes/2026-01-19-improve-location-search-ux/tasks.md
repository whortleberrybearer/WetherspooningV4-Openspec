# Tasks for improve-location-search-ux

## Implementation Tasks

### 1. Update LocationSearch Component Width Styling
**Files:** `Wetherspooning/src/components/LocationSearch.vue`
- Remove fixed `max-width: 20rem` from `.location-search-container`
- Change to `max-width: 100%` to allow full responsiveness
- Ensure container respects parent constraints
- **Validation:** Test on narrow mobile devices (< 400px) and verify no overflow

### 2. Update Component Restrictions to Include Ireland
**Files:** `Wetherspooning/src/components/LocationSearch.vue`
- Change `componentRestrictions: { country: 'uk' }` to `componentRestrictions: { country: ['uk', 'ie'] }`
- **Validation:** Test search suggestions to verify both UK and Ireland locations appear

### 3. Enhance Theme CSS Variables Integration
**Files:** `Wetherspooning/src/components/LocationSearch.vue`
- Update `:deep(input)` styles to ensure background uses `hsl(var(--background))` or `hsl(var(--input))`
- Verify text color uses `hsl(var(--foreground))`
- Ensure border uses `hsl(var(--border))`
- Test that CSS variables properly respond to theme changes
- **Validation:** Toggle between light and dark mode and verify widget appearance updates correctly

### 4. Improve Dark Mode Widget Customization
**Files:** `Wetherspooning/src/components/LocationSearch.vue`
- Enhance `:deep(.dark-mode)` CSS customization
- Add/update Google Places widget CSS variables for dark mode
- May include: `--gm-fillcolor`, `--gm-textcolor`, etc.
- Ensure dropdown (`.pac-container`) also respects theme
- **Validation:** In dark mode, widget should have dark background (not black or light)

### 5. Test on Multiple Devices and Browsers
**Files:** N/A (Testing)
- Test on narrow mobile devices (iPhone SE, small Android phones)
- Test on wide mobile devices (iPhone Pro Max, large Android phones)
- Test on tablets and desktops
- Test light and dark mode on each device
- Test search suggestions for both UK and Ireland locations
- **Validation:** All scenarios from spec delta pass

### 6. Verify No Regressions
**Files:** N/A (Testing)
- Verify existing location search functionality still works
- Verify map centering on place selection still works
- Verify keyboard navigation still works
- Verify sidebar trigger is not obscured
- **Validation:** All existing REQ-LS requirements still pass

## Testing & Validation

### Manual Testing Checklist
- [x] Widget displays correctly on iPhone SE (375px width)
- [x] Widget displays correctly on wider devices
- [x] Widget background matches dark theme when dark mode is enabled
- [x] Widget background matches light theme when light mode is enabled
- [x] Toggling theme updates widget appearance immediately
- [x] Searching for UK locations returns relevant results
- [x] Searching for Ireland locations returns relevant results
- [x] No horizontal scroll on narrow devices
- [x] Widget maintains appropriate margins on all devices

### Automated Testing
- No new unit tests required (visual/integration change only)
- Consider adding visual regression tests if infrastructure exists

## Notes
- Changes are isolated to LocationSearch component
- No breaking changes expected
- Mobile-first approach aligns with project conventions
- Theme integration uses existing CSS variable infrastructure
