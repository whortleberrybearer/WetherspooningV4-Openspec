# Implementation Tasks

## Overview
This document outlines the implementation tasks for adding location search functionality with Google Places Autocomplete widget.

## Tasks

### 1. Create LocationSearch Component with Widget
- [x] Create `Wetherspooning/src/components/LocationSearch.vue`
- [x] Add props for theme support (isDark)
- [x] Initialize PlaceAutocompleteElement widget
- [x] Configure widget with UK componentRestrictions
- [x] Set placeholder text on widget
- [x] Add gmp-placeselect event listener
- [x] Support light/dark mode styling with CSS
- [x] Implement proper cleanup on unmount

---

### 2. Integrate Places Library
- [x] Import Places library in `PubLocationsMap.vue` using importLibrary
- [x] Load Places library alongside Maps and Marker libraries
- [x] Use existing `VITE_GOOGLE_MAPS_API_KEY` environment variable
- [x] Ensure library loads before widget initialization

---

### 3. Handle Widget Events
- [x] Listen for gmp-placeselect event from widget
- [x] Fetch place details with geometry field
- [x] Emit place-changed event to parent component
- [x] Handle errors gracefully with console logging
- [x] Widget automatically handles debouncing and session tokens

---

### 4. Add Map Centering Logic
- [x] Create handlePlaceChanged function in PubLocationsMap
- [x] Extract location from place geometry
- [x] Implement smooth panning animation (map.panTo)
- [x] Set appropriate zoom level based on place type (14 for cities, 16 for addresses)
- [x] Ensure existing markers remain functional

---

### 5. Apply Theme Styling
- [x] Add CSS custom properties for dark mode
- [x] Apply dark-mode class based on isDark prop
- [x] Watch for theme changes and update widget styling
- [x] Ensure widget integrates visually with app theme

---

### 6. Position Widget on Map
- [x] Position widget at top-center of map
- [x] Ensure widget doesn't obscure sidebar trigger
- [x] Make widget responsive for mobile viewports
- [x] Set appropriate max-width constraint

---

### 7. Update Project Documentation
- [x] Update project.md with Google Places API dependency
- [x] Update proposal.md to reflect widget approach
- [x] Update spec.md requirements for widget
- [x] Add code comments explaining widget setup

---

### 8. Manual Testing
- [ ] Test search with various location types (cities, addresses, landmarks)
- [ ] Test with UK and international locations (widget handles UK bias)
- [ ] Test keyboard navigation (built into widget)
- [ ] Test on desktop browsers
- [ ] Test on mobile devices
- [ ] Test with light and dark themes
- [ ] Verify no regression in existing map features

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
