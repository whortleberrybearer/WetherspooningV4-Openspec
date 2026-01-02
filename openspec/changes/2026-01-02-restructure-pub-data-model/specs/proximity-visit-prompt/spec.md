# proximity-visit-prompt Specification Delta

## MODIFIED Requirements

### Requirement: Proximity Detection (REQ-PVP-001)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: Proximity checks only consider pubs with defined `position` data
- MODIFIED: Access coordinates via `pub.position.lat` and `pub.position.lng`
- ADDED: Pubs with `position: null` are automatically excluded from proximity detection

**Updated Acceptance Criteria:**
- System periodically checks user's location against nearby pubs
- **MODIFIED:** Only pubs with `position !== null` are checked for proximity
- **MODIFIED:** Position coordinates accessed via `pub.position.lat` and `pub.position.lng`
- Detection uses 200-meter radius
- Only unvisited pubs trigger prompts
- **ADDED:** Pubs without position data are skipped in proximity loop
- Detection does not trigger for visited pubs
- Check runs when user location updates

#### Scenario: Check Proximity for Positioned Pubs Only
**ADDED:**
**Given** user location is available at (52.4931, -1.8843)  
**And** pub A has `position: { lat: 52.4935, lng: -1.8843 }` (nearby)  
**And** pub B has `position: null`  
**And** pub C has `position: { lat: 52.4932, lng: -1.8844 }` (nearby)  
**When** proximity detection runs  
**Then** pubs A and C are checked for proximity  
**And** pub B is skipped without error  
**And** proximity calculation uses `pub.position.lat` and `pub.position.lng` for A and C

#### Scenario: Calculate Distance with Nested Position
**MODIFIED:**
**Given** user is at location (52.4931, -1.8843)  
**And** a pub has `position: { lat: 52.4935, lng: -1.8843 }`  
**When** distance is calculated  
**Then** coordinates are extracted as `pub.position.lat` and `pub.position.lng`  
**And** distance is calculated correctly (approximately 45 meters)

---

### Requirement: Prompt Display (REQ-PVP-002)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- MODIFIED: Prompts only appear for positioned pubs (since only they can trigger proximity)

**Updated Acceptance Criteria:**
- Prompt appears when user is within 200 meters of an unvisited pub
- **MODIFIED:** Pub must have valid `position` data to trigger prompt
- Prompt displays pub name and distance
- Prompt shows "Mark as Visited" button
- Only one prompt is shown at a time
- Prompt disappears after user interaction or when out of range
- Prompt does not appear for already visited pubs

#### Scenario: Show Prompt for Nearby Positioned Pub
**MODIFIED:**
**Given** user location is (52.4931, -1.8843)  
**And** an unvisited pub has `position: { lat: 52.4932, lng: -1.8844 }` (within 200m)  
**When** proximity check runs  
**Then** a visit prompt is displayed  
**And** the prompt shows the pub name  
**And** the prompt shows the distance

---

## ADDED Requirements

### Requirement: Position Null-safety in Proximity (REQ-PVP-004)
**Priority:** MUST  
**Category:** Functional

The system MUST safely handle pubs without position data during proximity detection without errors.

**Acceptance Criteria:**
- Proximity loop guards against null position before distance calculation
- No errors are thrown when encountering pubs with `position: null`
- Distance calculation function returns early for null positions
- TypeScript null checks are enforced on position access
- Logging indicates when pubs are skipped due to missing position (debug level)

#### Scenario: Skip Pub Without Position
**Given** a pub has `position: null`  
**When** proximity detection iterates through pubs  
**Then** the pub is skipped before distance calculation  
**And** no error occurs  
**And** next pub in list is processed normally

#### Scenario: Guard Distance Calculation
**Given** distance calculation receives a pub with `position: null`  
**When** calculation is attempted  
**Then** function checks `if (!pub.position) return null`  
**And** returns early without calculation  
**And** no NaN or error is produced

#### Scenario: Safe Coordinate Access
**Given** proximity code accesses `pub.position?.lat`  
**And** pub has `position: null`  
**When** access occurs  
**Then** result is `undefined`  
**And** optional chaining prevents runtime error  
**And** pub is filtered out by null check
