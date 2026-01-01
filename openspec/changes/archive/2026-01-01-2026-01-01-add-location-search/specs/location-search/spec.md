# location-search Specification

## Purpose
Enable users to search for geographic locations using Google Places Autocomplete widget and center the map on selected results.

## ADDED Requirements

### Requirement: Autocomplete Widget Display (REQ-LS-001)
**Priority:** MUST  
**Category:** Functional

The map MUST display a Google Places Autocomplete widget that allows users to search for locations.

**Acceptance Criteria:**
- Autocomplete widget is embedded on the map view
- Widget is positioned in a non-obstructive location (top area of map)
- Widget has placeholder text indicating its purpose
- Widget is responsive and accessible on mobile devices
- Widget does not obscure map controls or sidebar trigger
- Widget styling integrates with application theme (light/dark mode)
- Widget is keyboard accessible with standard navigation built-in

#### Scenario: Autocomplete Widget Visible on Desktop
**Given** the user opens the map view on a desktop browser  
**When** the map loads  
**Then** the Google Places Autocomplete widget is displayed at the top-center of the map  
**And** the widget has placeholder text "Search for a location" or similar  
**And** the widget does not overlap the sidebar trigger or map controls  
**And** the widget styling integrates with the current theme (light or dark)

#### Scenario: Autocomplete Widget Visible on Mobile
**Given** the user opens the map view on a mobile device  
**When** the map loads  
**Then** the Autocomplete widget is displayed at the top of the map  
**And** the widget is appropriately sized for touch interaction  
**And** the widget does not obscure the sidebar trigger  
**And** the widget is horizontally centered with appropriate margins

#### Scenario: Widget Keyboard Accessible
**Given** the user is navigating via keyboard  
**When** the user tabs through page elements  
**Then** the widget input receives focus in the correct tab order  
**And** the widget's built-in keyboard navigation works (arrow keys, Enter, Escape)  
**And** the user can type and select suggestions using only the keyboard

---

### Requirement: Autocomplete Suggestions (REQ-LS-002)
**Priority:** MUST  
**Category:** Functional

The Autocomplete widget MUST provide suggestions automatically as users type.

**Acceptance Criteria:**
- Widget triggers autocomplete requests after user types (managed by widget)
- Suggestions are displayed in the widget's built-in dropdown
- Suggestions include location names and addresses
- Widget handles debouncing automatically
- Widget manages session tokens automatically
- Loading state is shown while fetching suggestions (managed by widget)
- Network errors fail gracefully without crashing the UI
- User can navigate suggestions via keyboard (handled by widget)
- User can select a suggestion via click or Enter key
- Suggestions are cleared when input is cleared

#### Scenario: Widget Shows Suggestions
**Given** the user has the map view open  
**When** the user types "London" into the widget  
**Then** the widget's built-in dropdown of location suggestions appears  
**And** each suggestion shows the location name and additional context (e.g., "London, UK")  
**And** suggestions integrate with the current theme

#### Scenario: Widget Handles Debouncing
**Given** the user is typing rapidly in the widget  
**When** the user types "Man" quickly  
**Then** the widget automatically debounces requests  
**And** only appropriate requests are made (managed by widget)

#### Scenario: Widget Keyboard Navigation
**Given** autocomplete suggestions are displayed in the widget  
**When** the user presses the Down arrow key  
**Then** the widget highlights the first suggestion  
**When** the user presses Down again  
**Then** the widget highlights the next suggestion  
**When** the user presses Enter on a highlighted suggestion  
**Then** the location is selected and the map centers on it

#### Scenario: Widget Network Error Handling
**Given** the user types "Paris" into the widget  
**And** the Google Places API request fails due to network error  
**When** the error occurs  
**Then** the widget handles the error gracefully  
**And** the UI remains functional (no crash)  
**And** the user can retry by typing again

---

### Requirement: Map Centering on Selection (REQ-LS-003)
**Priority:** MUST  
**Category:** Functional

When a user selects a location from autocomplete suggestions, the map MUST center on that location.

**Acceptance Criteria:**
- Selecting a suggestion centers the map on the location's coordinates
- Map zoom level adjusts to an appropriate level for the location type (e.g., 14 for cities, 16 for addresses)
- Map pans smoothly to the new location (animated transition)
- Existing pub markers remain visible and functional
- Search input is cleared or shows the selected location name
- User can still interact with the map normally after centering
- Centering works for all location types (cities, addresses, landmarks)

#### Scenario: Center on City Selection
**Given** the user has typed "Manchester" into the search input  
**And** autocomplete suggestions are displayed  
**When** the user clicks "Manchester, UK" from the suggestions  
**Then** the map smoothly pans to Manchester's coordinates  
**And** the zoom level changes to 14  
**And** pub markers in the Manchester area become visible  
**And** the search input shows "Manchester, UK" or is cleared  
**And** the autocomplete dropdown closes

#### Scenario: Center on Address Selection
**Given** the user has typed "10 Downing Street" into the search input  
**And** autocomplete suggestions are displayed  
**When** the user selects "10 Downing Street, London, UK"  
**Then** the map smoothly pans to the address coordinates  
**And** the zoom level changes to 16 (closer zoom for specific address)  
**And** nearby pub markers are visible  
**And** the autocomplete dropdown closes

#### Scenario: Center on Landmark Selection
**Given** the user searches for "Big Ben"  
**When** the user selects "Big Ben, London, UK" from suggestions  
**Then** the map centers on Big Ben's coordinates  
**And** the zoom level is appropriate for viewing the area (15-16)  
**And** the map remains fully interactive

---

### Requirement: Google Places Widget Integration (REQ-LS-004)
**Priority:** MUST  
**Category:** Technical

The implementation MUST use Google Places Autocomplete widget correctly and efficiently.

**Acceptance Criteria:**
- Uses Google Places Autocomplete widget (PlaceAutocompleteElement)
- API key is sourced from existing environment variable `VITE_GOOGLE_MAPS_API_KEY`
- Widget is configured with appropriate options (componentRestrictions for UK bias)
- Widget events are properly handled (place_changed event)
- Widget lifecycle is managed correctly (cleanup on unmount)
- Errors from widget are caught and logged appropriately
- Implementation follows Google Places widget best practices

#### Scenario: Widget Integration with UK Biasing
**Given** the user starts typing in the widget  
**When** autocomplete requests are made  
**Then** the widget is configured with componentRestrictions for UK  
**And** UK locations appear first in suggestions  
**But** users can still search for international locations if needed

#### Scenario: Widget Event Handling
**Given** the user searches for a location  
**When** the user selects a place from the widget  
**Then** the place_changed event is triggered  
**And** the selected place details are retrieved  
**And** the map centers on the location  
**And** appropriate logging occurs

#### Scenario: Widget Error Logging
**Given** the user searches for a location  
**When** an error occurs with the widget or API  
**Then** the error is caught and logged to the console with details  
**And** the user sees no broken UI  
**And** the widget remains functional for future attempts

---

### Requirement: Mobile Responsiveness (REQ-LS-005)
**Priority:** MUST  
**Category:** Functional

The Autocomplete widget MUST work effectively on mobile devices.

**Acceptance Criteria:**
- Widget is appropriately sized for touch interaction
- Widget dropdown is readable and scrollable on small screens
- Suggestions are touch-friendly (adequate spacing, size)
- Virtual keyboard does not obscure widget or suggestions
- Widget adapts to mobile viewport automatically
- Feature works on iOS Safari and Android Chrome

#### Scenario: Mobile Touch Interaction
**Given** the user opens the map on a mobile device  
**When** the user taps the widget input  
**Then** the virtual keyboard appears  
**And** the widget input remains visible above the keyboard  
**When** autocomplete suggestions appear  
**Then** the dropdown is positioned appropriately  
**And** each suggestion has adequate touch target size  
**And** the user can tap a suggestion to select it

#### Scenario: Mobile Viewport Adaptation
**Given** the user is on a mobile device  
**When** the widget is displayed  
**Then** it adapts to the mobile viewport size  
**And** the map viewport remains usable  
**When** the user focuses the widget  
**Then** the layout adjusts for keyboard and suggestions  
**And** the user can dismiss the keyboard to return to full map view

---

### Requirement: Theme Consistency (REQ-LS-006)
**Priority:** MUST  
**Category:** UI/UX

The Autocomplete widget MUST be styled to match the application's theme (light/dark mode).

**Acceptance Criteria:**
- Widget input background and text colors can be customized
- Widget dropdown background and text can be styled
- Theme styles are applied via CSS customization
- Theme changes are reflected in the widget styling

#### Scenario: Dark Mode Styling
**Given** the user has dark mode enabled  
**When** the widget is displayed  
**Then** custom CSS applies dark mode styling to the widget  
**And** the widget integrates visually with the dark theme

#### Scenario: Light Mode Styling
**Given** the user has light mode enabled  
**When** the widget is displayed  
**Then** custom CSS applies light mode styling to the widget  
**And** the widget integrates visually with the light theme

#### Scenario: Theme Toggle
**Given** the user has the widget displayed  
**When** the user toggles from light to dark mode  
**Then** the widget styling updates to match the new theme  
**And** no visual glitches or layout shifts occur
