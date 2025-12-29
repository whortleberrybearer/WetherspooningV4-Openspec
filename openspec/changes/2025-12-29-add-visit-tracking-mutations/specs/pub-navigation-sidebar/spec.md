# pub-navigation-sidebar Specification Delta

## ADDED Requirements

### Requirement: Visit Tracking Actions (REQ-PNS-009)
**Priority:** MUST
**Category:** Functional

The system MUST provide UI controls in the pub sidebar for tracking visits.

**Acceptance Criteria:**
- When pub is not visited, display "Mark as Visited" button
- When pub is visited, display visit details section with:
  - Visit date (editable via date picker)
  - Notes field (optional, editable)
  - "Remove Visit" button
- "Mark as Visited" button triggers `addVisit()` with default date
- Date picker allows selecting past dates or clearing date (unknown)
- Date defaults to today when marking as visited
- "Remove Visit" button shows confirmation dialog before deletion
- All mutations show loading state while in progress
- All mutations display error messages on failure
- All mutations update UI immediately on success

#### Scenario: Display Mark as Visited Button
**Given** the sidebar is displaying pub 42
**And** the user has not visited pub 42
**When** the sidebar renders
**Then** a "Mark as Visited" button is displayed
**And** no visit details section is shown

#### Scenario: Mark Pub as Visited with Default Date
**Given** the sidebar is displaying pub 42
**And** pub 42 is not visited
**And** today is 2025-12-29
**When** the user clicks "Mark as Visited"
**Then** `addVisit(42)` is called with no date parameter
**And** the button shows loading state
**And** when the operation succeeds, visit details section appears
**And** the visit date displays 2025-12-29

#### Scenario: Display Visit Details Section
**Given** the sidebar is displaying pub 42
**And** the user visited pub 42 on 2025-11-15
**When** the sidebar renders
**Then** a visit details section is displayed showing:
  - Visit date: 2025-11-15 (with edit icon)
  - Notes field (empty or with existing notes)
  - "Remove Visit" button
**And** the "Mark as Visited" button is not shown

#### Scenario: Edit Visit Date
**Given** the sidebar shows visit details for pub 42 with date 2025-11-15
**When** the user clicks the edit date icon
**Then** a date picker opens
**When** the user selects 2025-12-01
**Then** `updateVisit(42, { visitedAt: '2025-12-01T00:00:00Z' })` is called
**And** the date picker shows loading state
**And** when the operation succeeds, the displayed date updates to 2025-12-01

#### Scenario: Clear Visit Date
**Given** the sidebar shows visit details for pub 42 with a date
**When** the user opens the date picker
**And** clicks "Clear" or removes the date
**Then** `updateVisit(42, { visitedAt: undefined })` is called
**And** when the operation succeeds, the date displays as "Date unknown"

#### Scenario: Add Visit Notes
**Given** the sidebar shows visit details for pub 42
**And** the notes field is empty
**When** the user types "Great atmosphere!" in the notes field
**And** blurs the field or presses Enter
**Then** `updateVisit(42, { notes: 'Great atmosphere!' })` is called
**And** when the operation succeeds, the notes are saved

#### Scenario: Remove Visit with Confirmation
**Given** the sidebar shows visit details for pub 42
**When** the user clicks "Remove Visit"
**Then** a confirmation dialog appears with message:
  - "Remove this visit? This action cannot be undone."
  - "Cancel" button
  - "Remove" button (destructive style)
**When** the user clicks "Remove"
**Then** `removeVisit(42)` is called
**And** the dialog shows loading state
**And** when the operation succeeds:
  - The dialog closes
  - Visit details section disappears
  - "Mark as Visited" button appears

#### Scenario: Cancel Remove Visit
**Given** the remove visit confirmation dialog is open
**When** the user clicks "Cancel"
**Then** the dialog closes
**And** no `removeVisit()` call is made
**And** the visit details remain unchanged

#### Scenario: Display Error on Failed Mutation
**Given** the sidebar is displaying pub 42
**When** the user clicks "Mark as Visited"
**And** the `addVisit()` operation fails with network error
**Then** an error message is displayed: "Unable to save visit. Please try again."
**And** the button returns to normal state
**And** the pub remains unvisited in the UI

---

### Requirement: Visit Tracking Permissions (REQ-PNS-010)
**Priority:** MUST
**Category:** Functional

The system MUST only show visit tracking controls to authenticated users.

**Acceptance Criteria:**
- Visit tracking buttons are hidden when user is not authenticated
- Attempting to track a visit while unauthenticated shows login prompt
- Visit details section is hidden for unauthenticated users even if pub was visited (by this user before logout)

#### Scenario: Hide Visit Tracking When Not Authenticated
**Given** the user is not authenticated
**And** the sidebar is displaying pub 42
**When** the sidebar renders
**Then** no "Mark as Visited" button is displayed
**And** no visit details section is shown
**And** a message may indicate "Sign in to track visits" (optional)

#### Scenario: Show Visit Tracking After Login
**Given** the user is not authenticated
**And** the sidebar is displaying pub 42 with no visit controls
**When** the user signs in
**And** the user has previously visited pub 42
**Then** the visit details section appears
**And** shows the user's visit date and notes
