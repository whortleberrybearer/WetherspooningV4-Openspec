# pub-detail-sheet Specification

## Purpose
TBD - created by archiving change add-visit-ratings-notes. Update Purpose after archive.
## Requirements
### Requirement: Visit Detail Dialog (REQ-PDS-001)
**Priority:** MUST  
**Category:** UI/UX

The system MUST provide a dialog (PubDetailSheet) for authenticated users to create and update visit records for a specific pub.

**Acceptance Criteria:**
- Dialog displays pub name and address in header
- Dialog is modal and overlays the map
- Dialog can be opened by clicking pub marker or from proximity prompt
- Dialog can be closed via close button or clicking outside
- Dialog shows "Sign in to track visits" message for unauthenticated users
- Dialog shows visit form for authenticated users
- Dialog shows save/update button based on visit status
- Dialog shows remove button for existing visits
- Dialog displays error messages when operations fail
- Dialog closes automatically after successful save/update/remove

#### Scenario: Open Dialog for Pub
**Given** a user clicks on a pub marker or action button  
**When** the PubDetailSheet opens  
**Then** the dialog displays the pub's name in the header  
**And** the dialog displays the pub's address in the description  
**And** the dialog overlays the map  
**And** the user can close it via close button or clicking outside

#### Scenario: Show Form for Authenticated User
**Given** an authenticated user opens PubDetailSheet  
**When** the dialog displays  
**Then** the visit form is visible  
**And** the form includes visit date input  
**And** the form includes rating selector  
**And** the form includes notes textarea  
**And** the form includes save/update button  
**And** the form includes remove button (if visit exists)

#### Scenario: Show Message for Unauthenticated User
**Given** an unauthenticated user opens PubDetailSheet  
**When** the dialog displays  
**Then** a message "Sign in to track visits" is shown  
**And** no visit form is displayed  
**And** no action buttons are displayed

---

### Requirement: Visit Date Input (REQ-PDS-002)
**Priority:** MUST  
**Category:** UI/UX

The system MUST provide a date input field for users to specify when they visited the pub.

**Acceptance Criteria:**
- Date input displays with label "Visit Date"
- Date input accepts HTML5 date format (YYYY-MM-DD)
- Date input is pre-filled with today's date for new visits
- Date input is pre-filled with existing date for visited pubs
- Date input can be cleared to indicate unknown visit date
- Help text displays: "Leave empty if date is unknown"
- Date input is disabled during save operation

#### Scenario: Date Input for New Visit
**Given** an authenticated user opens PubDetailSheet for an unvisited pub  
**When** the dialog displays  
**Then** the date input is pre-filled with today's date  
**And** the label "Visit Date" is displayed  
**And** help text "Leave empty if date is unknown" is shown  
**And** the user can change or clear the date

#### Scenario: Date Input for Existing Visit
**Given** an authenticated user opens PubDetailSheet for a visited pub  
**And** the visit was recorded on "2025-12-25"  
**When** the dialog displays  
**Then** the date input shows "2025-12-25"  
**And** the user can update or clear the date

#### Scenario: Clear Date for Unknown Visit Date
**Given** an authenticated user is adding a visit  
**When** the user clears the date input  
**Then** the date field is empty  
**And** the visit can be saved without a date  
**And** the saved visit has no visitedAt value

---

### Requirement: Rating Input (REQ-PDS-003)
**Priority:** MUST  
**Category:** UI/UX

**NEW REQUIREMENT**

The system MUST provide a rating selector for users to rate their visit experience from 1 to 5 stars.

**Acceptance Criteria:**
- Rating input displays with label "Rating (optional)"
- Rating input shows 5 clickable star icons
- Empty stars indicate unselected rating
- Filled stars indicate selected rating (1-5)
- Clicking star N fills stars 1 through N
- Rating can be cleared/unset
- Rating is optional (visits can be saved without rating)
- Rating input is disabled during save operation
- Stars use appropriate size and spacing
- Hover state provides visual feedback

#### Scenario: Select 5-Star Rating
**Given** an authenticated user opens PubDetailSheet  
**When** the user clicks the 5th star  
**Then** all 5 stars appear filled  
**And** the rating value is set to 5  
**And** the user can save the visit with rating 5

#### Scenario: Select 3-Star Rating
**Given** an authenticated user opens PubDetailSheet  
**When** the user clicks the 3rd star  
**Then** stars 1, 2, and 3 appear filled  
**And** stars 4 and 5 appear empty  
**And** the rating value is set to 3

#### Scenario: Change Rating
**Given** the user has selected a 4-star rating  
**When** the user clicks the 2nd star  
**Then** only stars 1 and 2 appear filled  
**And** stars 3, 4, and 5 appear empty  
**And** the rating value is updated to 2

#### Scenario: Clear Rating
**Given** the user has selected a rating  
**When** the user clicks the clear/reset button or clicks same star again  
**Then** all stars appear empty  
**And** the rating value is unset  
**And** the visit can be saved without a rating

#### Scenario: Load Existing Rating
**Given** a visit exists with rating 4  
**When** the user opens PubDetailSheet for that pub  
**Then** stars 1-4 appear filled  
**And** star 5 appears empty  
**And** the user can update or clear the rating

#### Scenario: Save Visit Without Rating
**Given** an authenticated user is adding a visit  
**And** no rating stars are selected  
**When** the user saves the visit  
**Then** the visit is saved successfully  
**And** the visit has no rating value

---

### Requirement: Notes Input (REQ-PDS-004)
**Priority:** MUST  
**Category:** UI/UX

**NEW REQUIREMENT**

The system MUST provide a textarea for users to add personal notes or comments about their visit.

**Acceptance Criteria:**
- Notes input displays with label "Notes (optional)"
- Notes input is a multiline textarea
- Notes input has reasonable character limit (500 characters)
- Character count displays as user types
- Notes are optional (visits can be saved without notes)
- Notes input is disabled during save operation
- Textarea has minimum height of 3-4 rows
- Placeholder text: "Add your thoughts about this visit..."
- Notes are trimmed of leading/trailing whitespace before save

#### Scenario: Add Notes to Visit
**Given** an authenticated user opens PubDetailSheet  
**When** the user types "Great atmosphere and friendly staff!" in notes  
**Then** the notes field contains the text  
**And** character count shows "40 / 500"  
**And** the user can save the visit with these notes

#### Scenario: Load Existing Notes
**Given** a visit exists with notes "Excellent beer selection"  
**When** the user opens PubDetailSheet for that pub  
**Then** the notes textarea displays "Excellent beer selection"  
**And** the user can update or clear the notes

#### Scenario: Character Limit Enforcement
**Given** an authenticated user is adding notes  
**When** the user types 500 characters  
**Then** the character count shows "500 / 500"  
**When** the user attempts to type more  
**Then** additional characters are prevented  
**And** the limit is enforced

#### Scenario: Trim Whitespace
**Given** the user enters notes with leading/trailing spaces  
**When** the user saves the visit  
**Then** the notes are trimmed before saving  
**And** unnecessary whitespace is removed

#### Scenario: Save Visit Without Notes
**Given** an authenticated user is adding a visit  
**And** the notes field is empty  
**When** the user saves the visit  
**Then** the visit is saved successfully  
**And** the visit has no notes value

---

### Requirement: Save and Update Actions (REQ-PDS-005)
**Priority:** MUST  
**Category:** Functional

The system MUST allow users to save new visits or update existing visits with date, rating, and notes.

**Acceptance Criteria:**
- Button text is "Save Visit" for new visits
- Button text is "Update Visit" for existing visits
- Button is disabled when no changes have been made
- Button is disabled during save operation
- Button shows "Saving..." text during operation
- Successful save closes the dialog
- Failed save displays error message
- Error message remains visible until dialog closes
- Changes include: date modifications, rating changes, notes changes

#### Scenario: Save New Visit with All Fields
**Given** an authenticated user opens PubDetailSheet for unvisited pub  
**And** the user sets date to "2026-01-01"  
**And** the user selects 5-star rating  
**And** the user enters notes "Best pub ever!"  
**When** the user clicks "Save Visit"  
**Then** the button shows "Saving..."  
**And** the visit is created in Firestore with all fields  
**And** the dialog closes  
**And** the pub marker updates to visited state

#### Scenario: Update Visit Rating Only
**Given** a visit exists with date and notes but no rating  
**And** the user opens PubDetailSheet  
**When** the user selects 4-star rating  
**And** clicks "Update Visit"  
**Then** the visit is updated with rating 4  
**And** date and notes remain unchanged  
**And** the dialog closes

#### Scenario: Save Button Disabled for No Changes
**Given** a visit exists with current values  
**And** the user opens PubDetailSheet  
**When** no fields are modified  
**Then** the "Update Visit" button is disabled  
**When** the user changes the rating  
**Then** the button becomes enabled

#### Scenario: Handle Save Error
**Given** an authenticated user is saving a visit  
**When** the Firestore operation fails  
**Then** the button returns to enabled state  
**And** an error message displays below the form  
**And** the dialog remains open  
**And** the user can retry or close

---

### Requirement: Remove Visit Action (REQ-PDS-006)
**Priority:** MUST  
**Category:** Functional

The system MUST allow users to remove/delete existing visit records.

**Acceptance Criteria:**
- "Remove" button displays only when visit exists
- "Remove" button uses destructive/danger styling (red)
- Clicking "Remove" opens confirmation dialog
- Confirmation dialog shows pub name
- Confirmation dialog has "Cancel" and "Remove" buttons
- Successful removal closes both dialogs
- Failed removal displays error message
- Removal clears all visit data (date, rating, notes)

#### Scenario: Remove Existing Visit
**Given** a visit exists for a pub  
**And** the user opens PubDetailSheet  
**When** the user clicks "Remove"  
**Then** a confirmation dialog opens  
**And** the dialog shows "Remove Visit?"  
**And** the dialog shows pub name  
**When** the user clicks "Remove" in confirmation  
**Then** the visit is deleted from Firestore  
**And** both dialogs close  
**And** the pub marker updates to unvisited state

#### Scenario: Cancel Removal
**Given** the remove confirmation dialog is open  
**When** the user clicks "Cancel"  
**Then** the confirmation dialog closes  
**And** the PubDetailSheet remains open  
**And** the visit is not deleted

#### Scenario: No Remove Button for Unvisited Pub
**Given** an authenticated user opens PubDetailSheet for unvisited pub  
**When** the dialog displays  
**Then** no "Remove" button is shown  
**And** only "Save Visit" button is displayed

