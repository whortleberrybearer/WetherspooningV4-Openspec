# shared-visit-viewing Specification

## Purpose
Enable users to view other users' pub visit history when shared publicly via a unique URL, supporting social discovery and comparison features.

## ADDED Requirements

### Requirement: Shareable URL Pattern (REQ-SVV-001)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a unique, permanent URL for each user's visit data based on their username.

**Acceptance Criteria:**
- URL pattern follows `/visits/@{username}` format
- Username in URL is case-insensitive (routes to correct user regardless of case)
- URL is permanent and does not change if user updates visit data
- URL is accessible to both authenticated and unauthenticated users
- Invalid username in URL shows 404 "User not found" page
- URL can be shared via copy-paste or standard share mechanisms
- Route is handled by Vue Router with appropriate route guard
- Direct navigation to URL works (deep linking supported)

#### Scenario: Navigate to Shared Visit URL
**Given** a user "alice" exists with username "alice"  
**And** alice has `visitsPublic: true`  
**When** any user navigates to "/visits/@alice"  
**Then** the system loads alice's public visit data  
**And** the page displays alice's visit history  
**And** the page title shows "alice's Visits - Wetherspooning"

#### Scenario: Case-Insensitive Username Routing
**Given** a user exists with username "alice" (lowercase)  
**When** a user navigates to "/visits/@ALICE" (uppercase)  
**Then** the system routes to alice's visit data  
**And** displays visits for user "alice"

#### Scenario: Invalid Username Shows 404
**Given** no user exists with username "nonexistent"  
**When** a user navigates to "/visits/@nonexistent"  
**Then** a 404 page is displayed  
**And** the page shows "User not found" message  
**And** provides a link to return to home page

---

### Requirement: Public Visit Data Access (REQ-SVV-002)
**Priority:** MUST  
**Category:** Functional

The system MUST load and display visit data for users who have enabled public sharing.

**Acceptance Criteria:**
- Visit data is loaded from Firestore `visits` collection filtered by target user's UID
- Only visits belonging to the target user are displayed
- Loading requires target user to have `visitsPublic: true` in their user profile
- If `visitsPublic: false`, shows "This user's visits are private" message
- Visit data includes: pub information, visit date, rating
- Visit data excludes: notes field (always private)
- Empty visit list shows "No visits yet" empty state
- Loading errors show user-friendly error message
- Firestore security rules enforce public access permissions

#### Scenario: View Public Visits
**Given** user "bob" exists with `visitsPublic: true`  
**And** bob has 15 visits in Firestore  
**And** 5 of those visits have notes  
**When** any user navigates to "/visits/@bob"  
**Then** the system loads all 15 visits  
**And** displays pub names, visit dates, and ratings  
**And** does not display notes for any visit  
**And** shows visit count "15 pubs visited"

#### Scenario: Private Visits Not Accessible
**Given** user "charlie" exists with `visitsPublic: false`  
**When** any user navigates to "/visits/@charlie"  
**Then** the system queries charlie's user profile  
**And** detects `visitsPublic: false`  
**And** displays message "This user's visits are private"  
**And** does not load or display any visit data  
**And** provides navigation to home page

#### Scenario: User With No Visits
**Given** user "dana" exists with `visitsPublic: true`  
**And** dana has 0 visits in Firestore  
**When** any user navigates to "/visits/@dana"  
**Then** the page loads successfully  
**And** displays "No visits yet" empty state  
**And** shows "0 pubs visited" count

---

### Requirement: Notes Field Privacy (REQ-SVV-003)
**Priority:** MUST  
**Category:** Security

The system MUST never expose the notes field from visits in shared views, regardless of privacy settings.

**Acceptance Criteria:**
- Notes field is filtered out before displaying visit data
- Notes field is not included in API responses for shared views
- Firestore queries do not select notes field for shared visits
- Client-side rendering does not show notes UI elements
- Notes field remains hidden even if Firestore rules misconfigured
- UI shows no placeholder or indication that notes exist
- Defense-in-depth: both client and server enforce notes privacy

#### Scenario: Notes Excluded from Shared View
**Given** user "eve" has `visitsPublic: true`  
**And** eve has a visit with notes "Great atmosphere, friendly staff"  
**When** another user views "/visits/@eve"  
**Then** the visit is displayed with pub name, date, and rating  
**And** the notes field is not visible  
**And** no UI element indicates notes exist  
**And** no notes data is present in network responses

#### Scenario: Notes Privacy with Firestore Rules
**Given** user "frank" has `visitsPublic: true`  
**And** frank has 10 visits, all with notes  
**When** an unauthenticated user queries frank's visits via Firestore  
**Then** the query returns visit documents  
**And** notes field is excluded by security rules or client filtering  
**And** attempting to access notes field returns undefined/null

---

### Requirement: View Mode Indicator (REQ-SVV-004)
**Priority:** MUST  
**Category:** UI/UX

The system MUST clearly indicate when viewing another user's data versus viewing own data.

**Acceptance Criteria:**
- Shared view displays banner "Viewing @{username}'s visits"
- Banner appears at top of main content area
- Banner uses distinct styling (different background color)
- Banner is visible on mobile and desktop layouts
- Own view (when viewing own visits) shows no banner
- Banner persists while viewing shared data (doesn't dismiss)
- Banner is accessible and readable

#### Scenario: Shared View Shows Banner
**Given** user "grace" has `visitsPublic: true`  
**When** any user views "/visits/@grace"  
**Then** a banner appears at the top  
**And** the banner text reads "Viewing @grace's visits"  
**And** the banner has distinct styling (colored background)  
**And** the banner is visible above the visit list

#### Scenario: Own View Shows No Banner
**Given** an authenticated user is logged in as "grace"  
**When** grace views "/" (own visits)  
**Then** no "Viewing" banner is displayed  
**And** the normal navigation and UI are shown

---

### Requirement: Navigation to Own Visits (REQ-SVV-005)
**Priority:** MUST  
**Category:** UI/UX

The system MUST provide clear navigation from shared visit view back to the user's own visits or to start tracking.

**Acceptance Criteria:**
- Banner includes "View my visits" button for authenticated users
- Banner includes "Start tracking" button for unauthenticated users
- Clicking "View my visits" navigates to "/" (home)
- Clicking "Start tracking" navigates to "/" and shows signup prompt
- Buttons are clearly styled as interactive elements
- Keyboard accessible (focusable, Enter key triggers action)
- Mobile-friendly (adequate touch target size)

#### Scenario: Authenticated User Returns to Own Visits
**Given** an authenticated user "henry" is viewing "/visits/@grace"  
**And** the banner displays "Viewing @grace's visits"  
**When** henry clicks "View my visits" button  
**Then** the app navigates to "/"  
**And** henry's own visit data is loaded  
**And** the banner disappears

#### Scenario: Unauthenticated User Starts Tracking
**Given** an unauthenticated user is viewing "/visits/@grace"  
**And** the banner displays "Viewing @grace's visits"  
**When** the user clicks "Start tracking"  
**Then** the app navigates to "/"  
**And** shows signup or login prompt  
**And** the banner disappears

---

### Requirement: Visit Statistics Display (REQ-SVV-006)
**Priority:** MUST  
**Category:** Functional

The system MUST display aggregate visit statistics for shared users.

**Acceptance Criteria:**
- Total visit count displayed prominently
- Count of visits to closed pubs displayed (if any)
- Count of remaining visits (non-closed pubs) displayed
- Statistics update when visit data loads
- Statistics calculation matches existing stats logic from own view
- Statistics show "0 visits" for users with no visits
- Statistics are read-only (no editing in shared view)

#### Scenario: Display Visit Statistics
**Given** user "iris" has `visitsPublic: true`  
**And** iris has 25 total visits  
**And** 3 of those visits are to pubs with `openState === 'Closed'`  
**When** any user views "/visits/@iris"  
**Then** the page displays "25 pubs visited"  
**And** displays "3 closed" (or similar indicator for closed pubs)  
**And** displays "22 remaining" (non-closed visits)  
**And** statistics are visible above the visit list

#### Scenario: Statistics with All Closed Pubs
**Given** user "jack" has `visitsPublic: true`  
**And** jack has 10 visits  
**And** all 10 visits are to pubs with `openState === 'Closed'`  
**When** any user views "/visits/@jack"  
**Then** the page displays "10 pubs visited"  
**And** displays "10 closed"  
**And** displays "0 remaining"

---

### Requirement: Shared View Map Integration (REQ-SVV-007)
**Priority:** MUST  
**Category:** UI/UX

The system MUST display visited pubs on the map in shared view with appropriate markers.

**Acceptance Criteria:**
- Map displays with visited pub markers for shared user
- Visited markers use same styling as own visited markers
- Unvisited pubs shown with normal markers
- Clicking marker shows pub detail sheet with visit info (date, rating)
- Pub detail sheet in shared view hides notes field
- Pub detail sheet indicates this is shared data (no edit buttons)
- Map initial center matches logic from own view (user location or first pub)

#### Scenario: Map Shows Shared Visited Pubs
**Given** user "karen" has `visitsPublic: true`  
**And** karen has visited 8 pubs in London  
**When** any user views "/visits/@karen"  
**Then** the map displays with all pubs visible  
**And** 8 markers show as visited (distinct styling)  
**And** remaining pubs show as unvisited  
**And** clicking a visited marker shows pub details with karen's visit date and rating

#### Scenario: Pub Detail in Shared View
**Given** viewing "/visits/@karen" (karen's shared visits)  
**And** a visited pub marker is clicked  
**When** the pub detail sheet opens  
**Then** the sheet shows pub information  
**And** shows karen's visit date and rating  
**And** does not show karen's notes  
**And** does not show "Edit visit" or "Delete visit" buttons  
**And** shows "Add to my visits" button for authenticated viewers

---

### Requirement: Shared View Responsive Design (REQ-SVV-008)
**Priority:** MUST  
**Category:** UI/UX

The system MUST provide a responsive shared visit view that works on mobile and desktop.

**Acceptance Criteria:**
- Shared view follows mobile-first design principles
- Banner responsive across screen sizes
- Visit list adapts to screen width
- Map integration responsive (same as own view)
- Touch-friendly controls on mobile
- No horizontal scrolling required
- Readable text at all screen sizes

#### Scenario: Mobile Shared View
**Given** viewing "/visits/@grace" on mobile device (320px width)  
**Then** the banner text wraps appropriately  
**And** "View my visits" / "Start tracking" button is full-width or stacked  
**And** visit list items stack vertically  
**And** map takes full width  
**And** all interactive elements have adequate touch targets (44×44px minimum)

#### Scenario: Desktop Shared View
**Given** viewing "/visits/@grace" on desktop (1920px width)  
**Then** the banner spans full width with centered content  
**And** visit list and map display side-by-side (if applicable)  
**And** text is readable without zooming  
**And** layout utilizes available space efficiently

---

### Requirement: Accessibility (REQ-SVV-009)
**Priority:** MUST  
**Category:** Accessibility

The system MUST provide accessible shared visit viewing for users with disabilities.

**Acceptance Criteria:**
- Banner has appropriate ARIA landmark role
- "View my visits" / "Start tracking" buttons have accessible labels
- Keyboard navigation works for all interactive elements
- Screen readers announce view mode (shared vs own)
- Color contrast meets WCAG AA standards
- Focus indicators visible for keyboard users
- All interactive elements reachable via Tab key

#### Scenario: Screen Reader Announces Shared View
**Given** a screen reader user navigates to "/visits/@grace"  
**When** the page loads  
**Then** screen reader announces "Viewing grace's visits"  
**And** announces "View my visits button" or "Start tracking button"  
**And** announces visit count and statistics

#### Scenario: Keyboard Navigation in Shared View
**Given** viewing "/visits/@grace"  
**When** the user presses Tab key  
**Then** focus moves to "View my visits" / "Start tracking" button  
**And** subsequent Tab moves through visit list items  
**And** all interactive elements are reachable  
**And** focus indicators are visible
