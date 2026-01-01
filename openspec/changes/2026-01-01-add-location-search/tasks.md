# Implementation Tasks

## Overview
This document outlines the implementation tasks for adding location search functionality with Google Places Autocomplete.

## Tasks

### 1. Create LocationSearch Component
**Scope:** Create new Vue component for search UI  
**Dependencies:** None  
**Validation:** Component renders without errors

**Details:**
- Create `Wetherspooning/src/components/LocationSearch.vue`
- Add props for theme support (isDark)
- Implement basic input field with placeholder
- Add appropriate ARIA labels for accessibility
- Style component to match existing UI (shadcn/vue patterns)
- Support light/dark mode styling
- Export component for use in PubLocationsMap

**Acceptance:**
- Component file exists
- TypeScript compilation succeeds
- Component can be imported without errors

---

### 2. Integrate Google Places Autocomplete API
**Scope:** Add Places API library loading and initialization  
**Dependencies:** Task 1  
**Validation:** Places API loaded successfully in browser console

**Details:**
- Import Places library from `@googlemaps/js-api-loader`
- Load Places library in `PubLocationsMap.vue` alongside Maps library
- Initialize AutocompleteService in component
- Use existing `VITE_GOOGLE_MAPS_API_KEY` environment variable
- Add error handling for API loading failures
- Log successful initialization to console

**Acceptance:**
- Places library loads without errors
- AutocompleteService initializes successfully
- Browser console shows no API errors
- API key is correctly configured

---

### 3. Implement Autocomplete Logic
**Scope:** Add autocomplete request handling with debouncing  
**Dependencies:** Task 2  
**Validation:** Autocomplete suggestions appear when typing

**Details:**
- Create reactive state for search query and suggestions
- Implement debounced autocomplete request function (300ms delay)
- Call AutocompleteService.getPlacePredictions with query
- Add session token generation and management
- Filter/prioritize UK locations (region biasing)
- Store suggestions in reactive state
- Handle API errors gracefully (log to console)
- Clear suggestions when input is cleared

**Acceptance:**
- Typing 3+ characters triggers autocomplete request after 300ms
- Suggestions are displayed in UI
- Rapid typing only sends one request
- UK locations appear first in results
- No errors when API fails

---

### 4. Implement Suggestion Selection
**Scope:** Handle user selection of autocomplete suggestion  
**Dependencies:** Task 3  
**Validation:** Map centers when suggestion is selected

**Details:**
- Create event handler for suggestion click
- Use PlacesService.getDetails to fetch place details (coordinates)
- Extract lat/lng from place details response
- Emit event to parent component with coordinates
- Clear search input and suggestions after selection
- Create new session token for next search
- Add loading state during place details fetch

**Acceptance:**
- Clicking suggestion fetches place details
- Coordinates are correctly extracted
- Event is emitted to parent component
- Search UI resets after selection

---

### 5. Add Map Centering Logic
**Scope:** Center map on selected location  
**Dependencies:** Task 4  
**Validation:** Map smoothly pans to selected location

**Details:**
- In `PubLocationsMap.vue`, add event listener for location selection
- Create function to center map on coordinates
- Implement smooth panning animation (map.panTo)
- Set appropriate zoom level based on location type:
  - Cities/regions: zoom 14
  - Addresses/landmarks: zoom 16
  - Default: zoom 15
- Ensure existing markers remain functional
- Update map center while preserving user interaction

**Acceptance:**
- Selecting location centers map smoothly
- Zoom level is appropriate for location type
- Map remains interactive after centering
- Pub markers are visible and clickable

---

### 6. Add Keyboard Navigation
**Scope:** Support keyboard navigation for accessibility  
**Dependencies:** Task 3  
**Validation:** Arrow keys navigate suggestions, Enter selects

**Details:**
- Track highlighted suggestion index in reactive state
- Add keydown event listener on search input
- Implement arrow key navigation (Up/Down)
- Implement Enter key to select highlighted suggestion
- Implement Escape key to clear suggestions
- Add visual highlight to selected suggestion
- Ensure focus management works correctly

**Acceptance:**
- Down arrow highlights first suggestion
- Up/Down navigate through suggestions
- Enter selects highlighted suggestion and centers map
- Escape clears suggestions
- Visual highlight is clearly visible

---

### 7. Implement Mobile Responsiveness
**Scope:** Optimize search UI for mobile devices  
**Dependencies:** Task 1, 5  
**Validation:** Manual testing on mobile devices/emulators

**Details:**
- Adjust search input positioning for mobile viewports
- Ensure touch targets are minimum 44x44px
- Position autocomplete dropdown to avoid keyboard overlap
- Test on iOS Safari and Android Chrome
- Add viewport meta tags if needed
- Ensure suggestions are scrollable on small screens
- Test with virtual keyboard open

**Acceptance:**
- Search input is tappable on mobile
- Keyboard doesn't obscure input or suggestions
- Suggestions have adequate touch target size
- Feature works on iOS Safari and Android Chrome
- No horizontal scrolling or layout issues

---

### 8. Add Loading and Error States
**Scope:** Provide user feedback during API operations  
**Dependencies:** Task 3, 4  
**Validation:** Loading indicators and error messages display correctly

**Details:**
- Add loading spinner/indicator while fetching suggestions
- Add loading state while fetching place details
- Display user-friendly message for network errors
- Log detailed errors to console for debugging
- Ensure UI remains functional during errors
- Test error scenarios (network offline, quota exceeded)

**Acceptance:**
- Loading indicator shows during API calls
- Network errors display gracefully
- Console logs contain useful debugging info
- UI doesn't crash on errors
- User can retry after error

---

### 9. Update Project Documentation
**Scope:** Document the new feature  
**Dependencies:** All implementation tasks  
**Validation:** Documentation is clear and accurate

**Details:**
- Update project.md with Google Places API dependency
- Document environment variable requirements
- Add comments to key functions in code
- Note any API quota considerations
- Update README if necessary

**Acceptance:**
- project.md lists Places API as external dependency
- Code comments explain why, not what
- Environment setup instructions are clear

---

### 10. Manual Testing
**Scope:** Comprehensive testing of location search feature  
**Dependencies:** All implementation tasks  
**Validation:** All test scenarios pass

**Details:**
- Test search with various location types (cities, addresses, landmarks)
- Test with UK and international locations
- Test keyboard navigation thoroughly
- Test on desktop (Chrome, Firefox, Safari, Edge)
- Test on mobile (iOS Safari, Android Chrome)
- Test with light and dark themes
- Test error scenarios (no network, invalid input)
- Test with Firefox emulators enabled
- Verify no regression in existing map features

**Acceptance:**
- All scenarios from spec.md pass
- No console errors in normal operation
- Feature works across browsers and devices
- Existing features (markers, sidebar, etc.) work normally
- Performance is acceptable (no lag or freezing)

---

## Task Sequence

**Sequential (must be done in order):**
1 → 2 → 3 → 4 → 5

**Parallel (can be done alongside):**
- Task 6 can start after Task 3
- Task 7 can start after Task 1 and 5
- Task 8 can start after Task 3 and 4

**Final:**
- Task 9 and 10 must be done after all implementation tasks

## Estimated Effort
- Tasks 1-5: ~4-6 hours (core functionality)
- Tasks 6-8: ~2-3 hours (enhancements)
- Tasks 9-10: ~1-2 hours (documentation and testing)
- **Total:** ~7-11 hours
