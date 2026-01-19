# location-search Specification Delta

## MODIFIED Requirements

### Requirement: Autocomplete Widget Display (REQ-LS-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- Updated acceptance criteria to specify responsive width behavior
- Added scenario for narrow mobile devices
- Enhanced theme integration requirements

**Acceptance Criteria:**
- Autocomplete widget is embedded on the map view
- Widget is positioned in a non-obstructive location (top area of map)
- Widget has placeholder text indicating its purpose
- **Widget width adapts to container with max-width: 100%, ensuring proper display on all device widths including narrow mobile devices (< 400px)**
- Widget is responsive and accessible on mobile devices
- Widget does not obscure map controls or sidebar trigger
- **Widget styling fully integrates with application theme (light/dark mode), including background color, text color, and border**
- Widget is keyboard accessible with standard navigation built-in

#### Scenario: Autocomplete Widget Responsive on Narrow Mobile
**Given** the user opens the map view on a narrow mobile device (e.g., iPhone SE at 375px width)  
**When** the map loads  
**Then** the Google Places Autocomplete widget is displayed at the top of the map  
**And** the widget width adapts to the container without exceeding screen width  
**And** appropriate horizontal margins are maintained (preventing edge-to-edge display)  
**And** the widget remains fully functional and readable

#### Scenario: Widget Theme Integration in Dark Mode
**Given** the user has dark mode enabled  
**When** the map loads with the location search widget  
**Then** the widget background color matches the dark theme background  
**And** the widget text color is appropriate for dark mode (light text)  
**And** the widget border color matches the dark theme border color  
**And** there are no visual inconsistencies with the rest of the application

#### Scenario: Widget Theme Integration in Light Mode
**Given** the user has light mode enabled  
**When** the map loads with the location search widget  
**Then** the widget background color matches the light theme background  
**And** the widget text color is appropriate for light mode (dark text)  
**And** the widget border color matches the light theme border color  
**And** there are no visual inconsistencies with the rest of the application

---

### Requirement: Google Places Widget Integration (REQ-LS-004)
**Priority:** MUST  
**Category:** Technical

**Changes:**
- Updated componentRestrictions to include both UK and Ireland
- Added requirement for proper theme CSS variable integration

**Acceptance Criteria:**
- Uses Google Places Autocomplete widget (PlaceAutocompleteElement)
- API key is sourced from existing environment variable `VITE_GOOGLE_MAPS_API_KEY`
- **Widget is configured with componentRestrictions for both UK and Ireland (`['uk', 'ie']`)**
- Widget events are properly handled (place_changed event)
- Widget lifecycle is managed correctly (cleanup on unmount)
- Errors from widget are caught and logged appropriately
- Implementation follows Google Places widget best practices
- **Widget CSS is customized to use application theme CSS variables (--background, --foreground, --border, --input)**

#### Scenario: Widget Integration with UK and Ireland Biasing
**Given** the user starts typing in the widget  
**When** autocomplete requests are made  
**Then** the widget is configured with componentRestrictions for both UK and Ireland  
**And** UK and Ireland locations appear first in suggestions  
**But** users can still search for international locations if needed

#### Scenario: Widget Theme CSS Customization
**Given** the location search widget is initialized  
**When** the widget is rendered in the DOM  
**Then** the widget's CSS uses application theme variables for colors  
**When** the user toggles between light and dark mode  
**Then** the widget appearance updates to match the new theme  
**And** the transition is smooth without visual glitches

---

### Requirement: Mobile Responsiveness (REQ-LS-005)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- Enhanced mobile width requirements for narrow devices
- Added specific scenarios for very narrow screens

**Acceptance Criteria:**
- **Widget width is 100% of its container with appropriate max-width constraints**
- **Widget adapts gracefully to narrow mobile devices (< 400px width) without overflow**
- Widget is appropriately sized for touch interaction
- Widget dropdown is readable and scrollable on small screens
- Suggestions are touch-friendly (adequate spacing, size)
- Virtual keyboard does not obscure widget or suggestions
- Widget adapts to mobile viewport automatically
- Feature works on iOS Safari and Android Chrome

#### Scenario: Narrow Mobile Device Layout
**Given** the user opens the map on a narrow mobile device (< 400px width)  
**When** the location search widget is displayed  
**Then** the widget width does not exceed the available container width  
**And** horizontal margins are maintained to prevent edge-to-edge appearance  
**And** the widget remains fully functional and readable  
**And** no horizontal scrolling is triggered

---

### Requirement: Theme Consistency (REQ-LS-006)
**Priority:** MUST  
**Category:** UI/UX

**Changes:**
- Enhanced theme implementation requirements
- Added specific CSS variable usage requirements
- Clarified background color expectations

**Acceptance Criteria:**
- **Widget background color responds to theme changes (not fixed to black)**
- **Widget uses application CSS variables: --background, --foreground, --border, --input**
- Widget input background and text colors match the current theme
- Widget dropdown background and text are styled to match theme
- Theme styles are applied via CSS customization
- Theme changes are reflected immediately in the widget styling

#### Scenario: Dark Mode Background Color
**Given** the user has dark mode enabled  
**When** the widget is displayed  
**Then** the widget background is dark (matching --background or --input variable)  
**And** the widget background is NOT black or light-colored  
**And** the widget integrates seamlessly with other dark mode UI elements

#### Scenario: Light Mode Background Color
**Given** the user has light mode enabled  
**When** the widget is displayed  
**Then** the widget background is light (matching --background or --input variable)  
**And** the widget background is NOT dark or black  
**And** the widget integrates seamlessly with other light mode UI elements

#### Scenario: Theme Toggle Responsiveness
**Given** the user has the widget displayed  
**When** the user toggles from light to dark mode  
**Then** the widget background color changes to match the new theme  
**And** the widget text color changes to ensure readability  
**And** the widget border color updates to match the theme  
**And** no visual glitches or layout shifts occur  
**And** the change happens immediately (within 300ms)
