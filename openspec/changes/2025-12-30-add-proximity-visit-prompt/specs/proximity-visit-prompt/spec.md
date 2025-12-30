# proximity-visit-prompt Specification Delta

## ADDED Requirements

### Requirement: Proximity Detection (REQ-PVP-001)
**Priority:** MUST  
**Category:** Functional

The system MUST detect when the user's current location is within 100 metres of an open Wetherspoon pub.

**Acceptance Criteria:**
- System uses browser Geolocation API via `navigator.geolocation.watchPosition()`
- Geolocation watch is configured with:
  - `enableHighAccuracy: true` (for precise proximity detection)
  - `maximumAge: 10000` (accept positions cached up to 10 seconds)
  - `timeout: 5000` (5 second timeout for position updates)
- Distance calculation uses Haversine formula for accuracy
- Distance is calculated in metres
- Only open pubs are considered (pubs with `openState` containing "closed" are excluded)
- System identifies the single closest open pub
- Detection triggers only when geolocation position updates (not continuously)
- If geolocation is denied or unavailable, feature is disabled gracefully

#### Scenario: Detect Nearby Open Pub
**Given** the user has granted geolocation permission  
**And** the user's location is at coordinates (53.4808, -2.2426)  
**And** there is an open pub at (53.4816, -2.2430) approximately 95 metres away  
**And** all other pubs are farther than 100 metres  
**When** the geolocation position updates  
**Then** the system calculates the distance using Haversine formula  
**And** identifies the pub at (53.4816, -2.2430) as the closest  
**And** determines the user is within 100 metres of that pub

#### Scenario: No Nearby Open Pubs
**Given** the user's location is known  
**And** the closest open pub is 250 metres away  
**When** the geolocation position updates  
**Then** the system determines no pubs are within 100 metres  
**And** no proximity prompt is shown

#### Scenario: Nearby Pub is Closed
**Given** the user is 50 metres from a pub  
**And** that pub has `openState` set to "Closed"  
**When** the geolocation position updates  
**Then** the system excludes that pub from consideration  
**And** checks other open pubs for proximity  
**And** no prompt is shown if no open pubs are within 100m

#### Scenario: Geolocation Permission Denied
**Given** the user has denied geolocation permission  
**When** the page loads  
**Then** the proximity detection feature is disabled  
**And** no prompts are shown  
**And** no errors are thrown  
**And** the map continues to function normally

---

### Requirement: Visit Prompt Display (REQ-PVP-002)
**Priority:** MUST  
**Category:** User Interface

The system MUST display a prompt with pub details when the user is near an unvisited open pub.

**Acceptance Criteria:**
- Prompt appears automatically when proximity conditions are met
- Prompt displays:
  - Pub image (if `imageUrl` is available)
  - Image attribution text: "Image: JD Wetherspoon" (if image present)
  - Pub name
  - Pub address
  - Action button(s) based on authentication state
  - Dismiss/close option
- Prompt is mobile-friendly (positioned at bottom of screen)
- Prompt is modal or overlay (non-blocking but prominent)
- Prompt does NOT appear if user has already visited the pub
- Prompt does NOT appear if user has dismissed it for this pub in current session
- Only one prompt is shown at a time (even if multiple pubs nearby)
- Prompt for the closest pub only

#### Scenario: Display Prompt for Nearby Unvisited Pub
**Given** the user is authenticated  
**And** the user is within 95 metres of "The Moon Under Water"  
**And** the user has not visited "The Moon Under Water"  
**And** "The Moon Under Water" has an image URL  
**When** proximity is detected  
**Then** a prompt is displayed at the bottom of the screen  
**And** the prompt shows the pub's image  
**And** the prompt shows "Image: JD Wetherspoon"  
**And** the prompt shows "The Moon Under Water"  
**And** the prompt shows the pub's full address  
**And** the prompt shows a "Yes, I'm here" button

#### Scenario: No Prompt for Already Visited Pub
**Given** the user is authenticated  
**And** the user is within 80 metres of "The Moon Under Water"  
**And** the user has already visited "The Moon Under Water"  
**When** proximity is detected  
**Then** no prompt is displayed

#### Scenario: No Prompt After Dismissal in Session
**Given** the user is within 90 metres of "The Moon Under Water"  
**And** the user previously dismissed the prompt for this pub in this browser session  
**When** proximity is detected  
**Then** no prompt is displayed  
**And** the dismissal persists until the browser session ends

#### Scenario: Prompt Without Image
**Given** the user is within 75 metres of "The Counting House"  
**And** "The Counting House" has no `imageUrl`  
**When** proximity is detected  
**Then** a prompt is displayed  
**And** no image placeholder is shown  
**And** the pub name and address are displayed  
**And** no image attribution text is shown

---

### Requirement: Authentication State Handling (REQ-PVP-003)
**Priority:** MUST  
**Category:** User Experience

The system MUST display different prompt actions based on whether the user is authenticated.

**Acceptance Criteria:**
- If user is NOT authenticated:
  - Prompt shows "Sign in to track visits" link/button
  - Clicking the link opens the login dialog
  - No "Yes" button is shown
- If user IS authenticated:
  - Prompt shows "Yes, I'm here" button
  - No sign-in link is shown
- Authentication state changes update prompt UI reactively
- Prompt respects authentication state at time of display

#### Scenario: Prompt for Unauthenticated User
**Given** the user is NOT authenticated  
**And** the user is within 85 metres of "The Regal"  
**When** the proximity prompt is displayed  
**Then** the prompt shows "Sign in to track visits" button  
**And** the prompt does NOT show "Yes, I'm here" button

#### Scenario: Sign In Link Opens Login Dialog
**Given** the user is NOT authenticated  
**And** the proximity prompt is displayed  
**When** the user clicks "Sign in to track visits"  
**Then** the login dialog opens  
**And** the proximity prompt remains visible (or closes based on UX decision)

#### Scenario: Prompt for Authenticated User
**Given** the user is authenticated  
**And** the user is within 70 metres of "The Moon Under Water"  
**And** the user has not visited "The Moon Under Water"  
**When** the proximity prompt is displayed  
**Then** the prompt shows "Yes, I'm here" button  
**And** the prompt does NOT show "Sign in to track visits"

#### Scenario: Authentication State Changes While Prompt Open
**Given** the proximity prompt is displayed for an unauthenticated user  
**And** the prompt shows "Sign in to track visits"  
**When** the user authenticates (logs in)  
**Then** the prompt updates to show "Yes, I'm here" button  
**And** the "Sign in to track visits" button is hidden

---

### Requirement: Visit Creation from Prompt (REQ-PVP-004)
**Priority:** MUST  
**Category:** Functional

The system MUST create a visit record when an authenticated user confirms they are at the pub.

**Acceptance Criteria:**
- Clicking "Yes, I'm here" button calls `addVisit()` from `useVisits` composable
- Visit is created with:
  - `pubId`: ID of the nearby pub
  - `visitedAt`: Current date/time as ISO 8601 string
  - `userId`: Authenticated user's Firebase UID
- Visit creation uses existing Firestore service
- Visit is added to local reactive state immediately
- Prompt closes after successful visit creation
- Prompt shows error message if visit creation fails
- Failed visit creation keeps prompt open for retry

#### Scenario: Create Visit from Proximity Prompt
**Given** the user is authenticated with UID "user123"  
**And** the proximity prompt is displayed for "The Moon Under Water" (pubId: 42)  
**When** the user clicks "Yes, I'm here"  
**Then** `addVisit(42, { visitedAt: <currentDateTime> }, "user123")` is called  
**And** a new visit is created in Firestore  
**And** the visit has `visitedAt` set to the current ISO 8601 timestamp  
**And** the local visit state is updated  
**And** `isVisited(42)` returns true  
**And** the proximity prompt closes

#### Scenario: Handle Visit Creation Failure
**Given** the user is authenticated  
**And** the proximity prompt is displayed  
**When** the user clicks "Yes, I'm here"  
**And** the Firestore operation fails (network error)  
**Then** an error message is displayed in or near the prompt  
**And** the prompt remains open  
**And** the user can retry by clicking "Yes, I'm here" again

#### Scenario: Dismiss Prompt Without Creating Visit
**Given** the proximity prompt is displayed  
**When** the user clicks the close/dismiss button  
**Then** the prompt closes  
**And** no visit is created  
**And** the pub ID is added to the dismissed list for this session  
**And** the prompt will not reappear for this pub until next browser session

---

### Requirement: Post-Visit Info Window (REQ-PVP-005)
**Priority:** MUST  
**Category:** User Experience

The system MUST display the pub's info window on the map after a visit is successfully created via the proximity prompt.

**Acceptance Criteria:**
- After visit creation succeeds, system calls `showPubInfo()` for the visited pub
- Info window opens automatically without user interaction
- Info window displays standard pub information (name, address, visit badge, etc.)
- Info window reflects the newly created visit (shows visited status)
- Map pans/centers to show the info window if necessary
- User can close info window normally

#### Scenario: Display Info Window After Visit Creation
**Given** the user confirmed a visit via proximity prompt for "The Moon Under Water"  
**And** the visit was created successfully  
**When** the prompt closes  
**Then** the info window for "The Moon Under Water" opens on the map  
**And** the info window shows the pub's details  
**And** the info window displays a visit badge with today's date  
**And** the map marker reflects visited status (color change)

#### Scenario: Info Window Shows Updated Visit Status
**Given** the user just created a visit for pub 42 via proximity prompt  
**When** the info window opens  
**Then** the info window shows the visit badge  
**And** the visit date displayed is today's date  
**And** the info window uses the "visited pub" styling

---

### Requirement: Session Dismissal Tracking (REQ-PVP-006)
**Priority:** MUST  
**Category:** User Experience

The system MUST track which pub prompts have been dismissed in the current browser session to prevent repeated prompts.

**Acceptance Criteria:**
- Dismissed pub IDs are stored in a Set for O(1) lookup
- Dismissed pub IDs are persisted to `sessionStorage`
- Dismissal state is loaded from `sessionStorage` on component mount
- Dismissal state clears when browser session ends (window/tab closed)
- Dismissal state is specific to the user's browser session (not shared)
- Dismissing a prompt adds the pub ID to the dismissed set
- Proximity detection checks dismissed set before showing prompt

#### Scenario: Dismiss Prompt Prevents Re-Display
**Given** the user is shown a proximity prompt for pub 42  
**When** the user dismisses the prompt (clicks close/not now)  
**Then** pub ID 42 is added to the dismissed set  
**And** the dismissed set is saved to `sessionStorage`  
**When** the user moves away and returns to within 100m of pub 42  
**Then** no prompt is displayed for pub 42  
**And** the dismissal persists for the duration of the browser session

#### Scenario: Dismissal State Clears on New Session
**Given** the user dismissed the prompt for pub 42 in a previous session  
**And** the browser window was closed  
**When** the user opens the app in a new browser session  
**And** is within 100m of pub 42  
**Then** the proximity prompt is displayed again  
**And** the previous dismissal state is not loaded

#### Scenario: Dismissal Persists Across Page Refreshes
**Given** the user dismissed the prompt for pub 42  
**When** the user refreshes the page (F5)  
**And** is still within 100m of pub 42  
**Then** the dismissal state is loaded from `sessionStorage`  
**And** no prompt is displayed for pub 42

---

### Requirement: Performance Optimization (REQ-PVP-007)
**Priority:** MUST  
**Category:** Performance

The system MUST optimize distance calculations to avoid performance degradation.

**Acceptance Criteria:**
- Distance calculations only occur when geolocation position updates
- Distance is calculated only for open pubs (closed pubs filtered out first)
- Haversine formula implementation is efficient (no unnecessary allocations)
- Maximum distance calculation time is <20ms for 100 pubs
- No distance calculations occur when geolocation is unavailable
- Proximity check does not block map rendering or interactions

#### Scenario: Efficient Distance Calculation
**Given** there are 100 pubs in the system  
**And** 15 of them are marked as closed  
**When** the user's geolocation position updates  
**Then** distance is calculated for only 85 open pubs  
**And** the calculation completes in <20ms  
**And** the map remains responsive during calculation

#### Scenario: No Calculations Without Geolocation
**Given** the user has not granted geolocation permission  
**When** the map loads  
**Then** no distance calculations are performed  
**And** no proximity detection logic runs

---

### Requirement: Accessibility (REQ-PVP-008)
**Priority:** MUST  
**Category:** Accessibility

The system MUST ensure the proximity prompt is accessible to users with disabilities.

**Acceptance Criteria:**
- Prompt is keyboard navigable (Tab, Enter, Escape)
- Escape key dismisses the prompt
- Focus is moved to the prompt when it appears
- Focus returns to previous element when prompt closes
- Screen reader announces: "Nearby pub: [pub name], [distance] metres"
- All buttons have appropriate ARIA labels
- Prompt has `role="dialog"` and `aria-labelledby` attributes
- Color contrast meets WCAG AA standards (4.5:1 minimum)
- Text is readable at 200% zoom

#### Scenario: Keyboard Navigation
**Given** the proximity prompt is displayed  
**When** the user presses Tab  
**Then** focus moves to the first interactive element (button)  
**When** the user presses Tab again  
**Then** focus moves to the next button  
**When** the user presses Escape  
**Then** the prompt closes  
**And** focus returns to the map

#### Scenario: Screen Reader Announcement
**Given** the user is using a screen reader  
**And** the proximity prompt appears for "The Moon Under Water"  
**When** the prompt is displayed  
**Then** the screen reader announces "Nearby pub: The Moon Under Water, 95 metres"  
**And** the screen reader announces the available actions
