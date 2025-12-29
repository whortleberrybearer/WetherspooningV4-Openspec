# firebase-data-integration Specification Delta

## ADDED Requirements

### Requirement: Firestore Visit Write Operations (REQ-FDI-009)
**Priority:** MUST
**Category:** Functional

The system MUST provide methods to create, update, and delete visit documents in Firestore.

**Acceptance Criteria:**
- `createVisit(visit: Omit<Visit, 'id'>) => Promise<Visit>` creates new visit with generated ID
- `updateVisit(visitId: number, updates: Partial<Visit>) => Promise<void>` updates existing visit
- `deleteVisit(visitId: number) => Promise<void>` deletes visit document
- Operations use Firestore SDK methods: `addDoc`, `setDoc`, `updateDoc`, `deleteDoc`
- All operations respect 10-second timeout
- All operations log errors and throw on failure
- Created visits return complete Visit object including generated ID
- Updated visits merge changes with existing data
- Delete operations use document ID for direct deletion

#### Scenario: Create New Visit
**Given** user is authenticated with UID "user123"
**When** `createVisit({ userId: 'user123', pubId: 42, visitedAt: '2025-12-15' })` is called
**Then** a new document is created in `visits` collection
**And** the document has a unique numeric ID
**And** the document contains all provided fields
**And** the method returns a Visit object with the generated ID

#### Scenario: Update Existing Visit Date
**Given** a visit with id 100 exists with `visitedAt: '2025-11-01'`
**When** `updateVisit(100, { visitedAt: '2025-12-15' })` is called
**Then** the Firestore document is updated
**And** only the `visitedAt` field is modified
**And** other fields remain unchanged

#### Scenario: Delete Visit by ID
**Given** a visit with id 100 exists
**When** `deleteVisit(100)` is called
**Then** the document is deleted from Firestore
**And** subsequent reads for visit 100 return nothing

#### Scenario: Handle Create Timeout
**Given** the Firestore create operation takes longer than 10 seconds
**When** `createVisit(...)` is called
**Then** the operation times out
**And** an error is thrown: "Firestore operation timed out: createVisit"

---

### Requirement: Visit ID Generation (REQ-FDI-010)
**Priority:** MUST
**Category:** Functional

The system MUST generate unique numeric IDs for new visit documents.

**Acceptance Criteria:**
- Query existing visits to find maximum ID
- Generate new ID as `maxId + 1`
- Use generated ID as Firestore document ID (string representation)
- Handle case when no visits exist (start at 1)
- Retry with incremented ID if document already exists
- Maximum 3 retry attempts before throwing error

#### Scenario: Generate First Visit ID
**Given** the visits collection is empty
**When** `createVisit(...)` is called
**Then** the new visit is assigned id 1
**And** the Firestore document ID is "1"

#### Scenario: Generate Sequential ID
**Given** the visits collection has 150 documents
**And** the maximum id is 150
**When** `createVisit(...)` is called
**Then** the new visit is assigned id 151

#### Scenario: Handle ID Collision with Retry
**Given** the maximum id is 150
**When** `createVisit(...)` attempts to use id 151
**And** document "151" already exists
**Then** the operation retries with id 152
**And** succeeds if id 152 is available

#### Scenario: Fail After Maximum Retries
**Given** id collision occurs 3 times consecutively
**When** `createVisit(...)` retries 3 times
**Then** an error is thrown: "Failed to generate unique visit ID"

---

### Requirement: Visit Mutation Validation (REQ-FDI-011)
**Priority:** MUST
**Category:** Functional

The system MUST validate visit data before persisting mutations to Firestore.

**Acceptance Criteria:**
- `userId` must be non-empty string
- `pubId` must be positive number
- `visitedAt` must be valid ISO 8601 string if provided
- `visitedAt` can be undefined/null
- `rating` must be 1-5 if provided
- `notes` must be string if provided
- Validation errors throw descriptive messages
- Invalid data is not written to Firestore

#### Scenario: Reject Create with Invalid userId
**Given** `createVisit({ userId: '', pubId: 42 })` is called
**When** validation occurs
**Then** an error is thrown: "userId must be a non-empty string"
**And** no Firestore write occurs

#### Scenario: Reject Update with Invalid Rating
**Given** a visit exists with id 100
**When** `updateVisit(100, { rating: 10 })` is called
**Then** an error is thrown: "rating must be between 1 and 5"
**And** no Firestore write occurs

#### Scenario: Accept Update with Undefined visitedAt
**Given** a visit exists with id 100
**When** `updateVisit(100, { visitedAt: undefined })` is called
**Then** validation passes
**And** the `visitedAt` field is removed from the document

---

## MODIFIED Requirements

### Requirement: Firestore Visit Data Operations (REQ-FDI-004)
**Priority:** MUST
**Category:** Functional

**Changes:**
- ADD: Write operations in addition to read operations
- UPDATE: Expanded scope to include create, update, delete methods

The system MUST provide methods to read and write visit documents in Firestore.

**Updated Acceptance Criteria:**
- **EXISTING:** `getUserVisits(userId: string)` returns array of Visit objects for user
- **NEW:** `createVisit(visit)` creates new visit and returns Visit with generated ID
- **NEW:** `updateVisit(visitId, updates)` updates existing visit fields
- **NEW:** `deleteVisit(visitId)` deletes visit document
- All operations use appropriate timeout handling
- All operations validate inputs before Firestore calls
- All operations log errors and handle failures gracefully

#### Scenario: Complete Lifecycle of a Visit
**ADDED:**
**Given** user is authenticated with UID "user123"
**When** `createVisit({ userId: 'user123', pubId: 42, visitedAt: '2025-12-15' })` is called
**Then** a visit is created with id 1
**When** `updateVisit(1, { notes: 'Great pub!' })` is called
**Then** the visit is updated with notes
**When** `getUserVisits('user123')` is called
**Then** the returned array includes the updated visit
**When** `deleteVisit(1)` is called
**Then** the visit is deleted
**When** `getUserVisits('user123')` is called again
**Then** the returned array is empty
