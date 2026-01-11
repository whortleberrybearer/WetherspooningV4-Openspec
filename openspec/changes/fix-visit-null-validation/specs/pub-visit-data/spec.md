# pub-visit-data Specification Deltas

## MODIFIED Requirements

### Requirement: Visit Data Structure (REQ-PVD-002)
**Priority:** MUST
**Category:** Functional

**Changes:**
- CLARIFY: Optional fields (rating, notes, visitedAt) can be `null`, `undefined`, or have a value
- ADD: Validation must accept both `null` and `undefined` for optional fields
- ADD: TypeScript types must allow `null | undefined` for optional fields

The system MUST define and validate the Visit entity structure for both read and write operations, handling `null` values gracefully.

**Updated Acceptance Criteria:**
- Visit interface includes required fields: `id`, `userId`, `pubId`
- Visit interface includes optional fields: `visitedAt`, `rating`, `notes`
- **NEW:** Optional fields are typed as `field?: type | null` to allow both undefined and null
- **NEW:** Firestore stores `null` for cleared optional fields
- **NEW:** Application code handles both `null` and `undefined` identically
- `pubId` references a valid pub from the pub data source
- `userId` references the authenticated user
- `rating` is between 1 and 5 (inclusive) if provided, or `null`/`undefined`
- **MODIFIED:** Validation accepts `null` for rating (previously rejected)
- **MODIFIED:** Validation accepts `null` for notes (previously only checked type when present)
- **MODIFIED:** Validation accepts `null` for visitedAt (previously only checked type when present)
- `notes` is a string field for user comments, or `null`/`undefined`
- `visitedAt` can be `null` or `undefined` to indicate unknown date
- New visit `id` values are unique and do not conflict with existing visits
- **MODIFIED:** Invalid visits are logged but `null` optional fields are not considered invalid

#### Scenario: Load Visit with Null Rating from Firestore
**ADDED:**
**Given** a visit document exists in Firestore with `rating: null`
**When** the visit is loaded via `getUserVisits()`
**Then** the visit passes validation
**And** the in-memory Visit object has `rating: null`
**And** no warning is logged about invalid rating

#### Scenario: Load Visit with Null Notes from Firestore
**ADDED:**
**Given** a visit document exists in Firestore with `notes: null`
**When** the visit is loaded via `getUserVisits()`
**Then** the visit passes validation
**And** the in-memory Visit object has `notes: null`
**And** no warning is logged about invalid notes

#### Scenario: Validate Rating is in Range When Present
**MODIFIED:**
**Given** a visit document has `rating: 6`
**When** the visit is validated
**Then** validation fails with warning "rating must be between 1 and 5"
**And** the visit is excluded from the loaded visits array
**Given** a visit document has `rating: null`
**When** the visit is validated
**Then** validation succeeds
**And** the visit is included in the loaded visits array

#### Scenario: Validate Rating is Number or Null
**ADDED:**
**Given** a visit document has `rating: "3"` (string instead of number)
**When** the visit is validated
**Then** validation fails with warning about type mismatch
**Given** a visit document has `rating: null`
**When** the visit is validated
**Then** validation succeeds

---

### Requirement: Update Visit (REQ-PVD-008)
**Priority:** MUST
**Category:** Functional

**Changes:**
- CLARIFY: Setting rating or notes to `null` clears the field in Firestore
- ADD: Firestore rules validate rating range server-side

The system MUST allow authenticated users to update an existing visit record, including clearing rating and notes by setting them to `null`.

**Updated Acceptance Criteria:**
- `updateVisit(pubId: number, updates: { visitedAt?: string | null, rating?: number | null, notes?: string | null })` updates existing visit
- Only updates fields provided in `updates` parameter
- Can update `rating` to value 1-5 or null to clear
- Can update `notes` to new text or null to clear
- Can update `visitedAt` to new date or null to clear
- **NEW:** When rating is set to `null`, Firestore stores `null` (field is not deleted)
- **NEW:** When notes is set to `null`, Firestore stores `null` (field is not deleted)
- **NEW:** Application handles `null` values correctly in all operations
- Persists changes to Firestore
- Updates local reactive state
- Returns Promise that resolves when operation completes
- Throws error if visit does not exist
- Throws error if user is not authenticated
- Throws error if rating is outside 1-5 range (when not null)
- **NEW:** Firestore security rules validate rating is 1-5 or null server-side

#### Scenario: Clear Rating Sets Null in Database
**ADDED:**
**Given** an authenticated user has a visit with rating 4
**When** `updateVisit(42, { rating: null })` is called
**Then** the Firestore document is updated with `rating: null`
**And** local state is updated with `rating: null`
**And** the visit remains valid on subsequent loads

#### Scenario: Clear Notes Sets Null in Database
**ADDED:**
**Given** an authenticated user has a visit with notes "Great pub"
**When** `updateVisit(42, { notes: null })` is called
**Then** the Firestore document is updated with `notes: null`
**And** local state is updated with `notes: null`
**And** the visit remains valid on subsequent loads

#### Scenario: Firestore Rules Reject Invalid Rating
**ADDED:**
**Given** an authenticated user attempts to update a visit via Firestore API
**When** the update sets `rating: 10`
**Then** Firestore security rules reject the operation
**And** an error is returned to the client
**When** the update sets `rating: null`
**Then** Firestore security rules accept the operation
**When** the update sets `rating: 3`
**Then** Firestore security rules accept the operation

---

### Requirement: Reactive State Updates (REQ-PVD-010)
**Priority:** MUST
**Category:** Functional

**Changes:**
- ADD: UI components must handle both `null` and `undefined` for optional fields

The system MUST update local reactive state immediately after successful visit mutations and ensure UI components safely handle `null` and `undefined` values.

**Updated Acceptance Criteria:**
- After `addVisit()` succeeds, `visitedPubIds` Set includes the new pub ID
- After `addVisit()` succeeds, `visits` array includes the new visit
- After `updateVisit()` succeeds, the visit in `visits` array reflects changes
- After `removeVisit()` succeeds, pub ID is removed from `visitedPubIds` Set
- After `removeVisit()` succeeds, visit is removed from `visits` array
- `useVisits()` composable exposes readonly `visits` array for components to watch
- Components can watch `visits` array with deep watching to detect updates to individual visits
- **NEW:** UI components use optional chaining (`visit?.rating`) and nullish checks to safely access optional fields
- **NEW:** UI components treat `null` and `undefined` identically for display purposes
- **NEW:** Rating display only shows stars when `visit?.rating` is a number (handles null and undefined)
- **NEW:** Notes display only shows content when `visit?.notes` is a truthy non-empty string (handles null and undefined)
- UI components that depend on visit state re-render automatically
- Map markers update colors to reflect visit status changes
- Map info windows update content when visit data changes (create, update, or remove)

#### Scenario: Display Rating with Null-Safe Check
**ADDED:**
**Given** the map info window is displaying a visited pub
**And** the visit has `rating: null`
**When** the info window renders the rating display
**Then** no stars are displayed (conditional check prevents rendering)
**And** no JavaScript errors occur
**Given** the visit has `rating: undefined`
**When** the info window renders the rating display
**Then** no stars are displayed (conditional check prevents rendering)
**And** no JavaScript errors occur
**Given** the visit has `rating: 4`
**When** the info window renders the rating display
**Then** 4 filled stars and 1 empty star are displayed

#### Scenario: Display Notes with Null-Safe Check
**ADDED:**
**Given** the map info window is displaying a visited pub
**And** the visit has `notes: undefined`
**When** the info window renders the notes section
**Then** no notes preview is displayed
**And** no JavaScript errors occur
**Given** the visit has `notes: null`
**When** the info window renders the notes section
**Then** no notes preview is displayed
**And** no JavaScript errors occur
**Given** the visit has `notes: ""`  (empty string)
**When** the info window renders the notes section
**Then** no notes preview is displayed
**And** no JavaScript errors occur
**Given** the visit has `notes: "Great atmosphere"`
**When** the info window renders the notes section
**Then** the notes preview displays "Great atmosphere"

---

## ADDED Requirements

### Requirement: Firestore Security Rules for Visit Validation (REQ-PVD-013)
**Priority:** MUST
**Category:** Security

The system MUST validate visit field constraints at the Firestore security rules level to prevent invalid data from being written to the database.

**Acceptance Criteria:**
- Firestore rules validate `rating` is a number between 1-5 (inclusive) or `null`
- Firestore rules validate `notes` is a string or `null`
- Firestore rules validate `visitedAt` is a string or `null`
- Firestore rules reject documents with invalid types for these fields
- Firestore rules reject documents with rating values outside 1-5 range
- Rules apply to both `create` and `update` operations
- Rules allow visits with all optional fields set to `null`

#### Scenario: Rules Accept Valid Rating Values
**Given** an authenticated user creates a visit document
**When** the document has `rating: 3`
**Then** Firestore rules accept the write
**When** the document has `rating: null`
**Then** Firestore rules accept the write
**When** the document has no rating field
**Then** Firestore rules accept the write

#### Scenario: Rules Reject Invalid Rating Values
**Given** an authenticated user creates a visit document
**When** the document has `rating: 0`
**Then** Firestore rules reject the write with permission error
**When** the document has `rating: 6`
**Then** Firestore rules reject the write with permission error
**When** the document has `rating: "3"` (string)
**Then** Firestore rules reject the write with permission error

#### Scenario: Rules Accept Null Notes
**Given** an authenticated user updates a visit document
**When** the update sets `notes: null`
**Then** Firestore rules accept the write
**When** the update sets `notes: "Some feedback"`
**Then** Firestore rules accept the write
**When** the update sets `notes: 123` (number)
**Then** Firestore rules reject the write with permission error
