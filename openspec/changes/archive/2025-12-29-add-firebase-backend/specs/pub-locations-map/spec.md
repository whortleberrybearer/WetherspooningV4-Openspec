# pub-locations-map Specification Delta

## MODIFIED Requirements

### Requirement: Data Source (REQ-PLM-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- REMOVE: Static JSON file data source
- ADD: Firestore database data source
- UPDATE: Loading mechanism and error handling for Firestore

**Updated Description:**
The system MUST load pub location data from Firebase Firestore database.

**Updated Acceptance Criteria:**
- Data is loaded from Firestore `pubs` collection via `getAllPubs()` method
- Loading uses `firebase-data-integration` service layer
- Each pub document includes: id, name, lat, lng
- Optional fields: address, townCity, county, region, country, url, imageUrl, openState
- Loading errors are caught and logged
- Empty collection is handled gracefully (no error, empty map)
- Network errors display user-friendly error message
- Loading state is shown during data fetch
- Firestore query completes within 10 seconds or times out

#### Scenario: Load Pub Data from Firestore
**Given** the Firestore `pubs` collection contains 20 valid pub documents  
**When** the map component initializes  
**Then** the `getAllPubs()` method is called  
**And** pub data is fetched from Firestore  
**And** the data is parsed into Pub objects  
**And** the data is used to create map markers  
**And** the operation completes within 2 seconds

#### Scenario: Handle Firestore Data Load Failure
**Given** the Firestore service returns a network error  
**When** the map component attempts to load data  
**Then** the error is caught and logged to console  
**And** a user-friendly error message is displayed: "Failed to load pub data. Please check your connection."  
**And** the map still initializes without markers  
**And** the user can retry by refreshing the page

#### Scenario: Handle Empty Firestore Collection
**Given** the Firestore `pubs` collection contains no documents  
**When** the map component loads data  
**Then** `getAllPubs()` returns an empty array  
**And** no error is displayed  
**And** the map initializes with no markers  
**And** a console warning is logged: "No pubs found in Firestore"

#### Scenario: Handle Firestore Timeout
**Given** the Firestore query takes longer than 10 seconds  
**When** the timeout is reached  
**Then** the query is cancelled  
**And** an error is displayed: "Request timed out. Please try again."  
**And** the error is logged with operation details

---

## REMOVED Requirements

None. All other requirements remain unchanged.

---

## Notes

**Related Changes:**
- Depends on `firebase-data-integration` spec (REQ-FDI-002) for `getAllPubs()` method
- Replaces static `/data/pubs-sample.json` file with Firestore database

**Migration Impact:**
- Existing pub data must be migrated to Firestore before deployment
- Component must handle both loading states and Firestore-specific errors
- Error messages updated to reflect database connectivity issues

**Backward Compatibility:**
- Not backward compatible with JSON file approach
- Migration script required to populate Firestore
- Consider feature flag for gradual rollout if needed
