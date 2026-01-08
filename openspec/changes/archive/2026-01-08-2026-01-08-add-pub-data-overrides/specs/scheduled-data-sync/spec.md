# scheduled-data-sync Spec Delta

## MODIFIED Requirements

### Requirement: Firestore Data Sync (REQ-SDS-005)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Preserve countyOverride and townCityOverride fields during sync operations
- UPDATE: Clarify that sync only updates scraped fields, not override fields

The system MUST sync scraped pub data to Firestore while preserving manually set override fields.

**Updated Acceptance Criteria:**
- Each pub is written to Firestore using `set()` with `{ merge: true }`
- Before writing, compare scraped data with existing pub data (if a match was found)
- If data has changed, write to Firestore and update `lastSyncedAt`
- If data is identical, skip write (no Firestore operation)
- Document contains fields: `id`, `name`, `url`, `imageUrl`, `address`, `townCity`, `position`, `openState`, `isHotel`, `inAirport`, `inTrainStation`, `lastSyncedAt`, `country`, `county`
- `id` field matches sitemap URL-derived identifier
- `name` field is cleaned to remove location suffix
- `townCity` field contains the town/city derived from URL slug
- `address` field is full address string with postcode
- `position` field is `{ lat, lng }` object or `null`
- `openState` field reflects current operating status
- `lastSyncedAt` is set to current server timestamp **only when data is written**
- **ADDED:** Sync operations do NOT set or modify `countyOverride` field
- **ADDED:** Sync operations do NOT set or modify `townCityOverride` field
- **ADDED:** Existing `countyOverride` values are preserved via `{ merge: true }`
- **ADDED:** Existing `townCityOverride` values are preserved via `{ merge: true }`
- **ADDED:** Only scraped fields (`county`, `townCity`, etc.) are updated during sync

#### Scenario: No Change, No Write
**Given** an existing pub "Star Light" with all fields matching the scraped data  
**When** the sync processes the pub  
**Then** no Firestore write operation occurs  
**And** `lastSyncedAt` is NOT updated  
**And** no network request is made to Firestore

#### Scenario: Update When Data Changes
**Given** an existing pub "Star Light" with address "Old Address"  
**And** the scraped pub has address "New Address"  
**When** the sync processes the pub  
**Then** the pub is written to Firestore  
**And** the address field is updated to "New Address"  
**And** `lastSyncedAt` is updated to current timestamp  
**And** other fields remain unchanged

#### Scenario: Create New Pub
**Given** a scraped pub "New Tavern" that does not match any existing pub  
**When** the sync processes the pub  
**Then** a new document is created in Firestore with all scraped fields  
**And** `lastSyncedAt` is set to current timestamp

#### Scenario: Preserve County Override During Sync
**ADDED:**
**Given** an existing pub in Firestore with:
```json
{
  "id": "abc-123",
  "county": "London",
  "countyOverride": "Greater London",
  "townCity": "Westminster",
  "address": "123 Old St"
}
```
**And** the scraped pub has:
```json
{
  "id": "abc-123",
  "county": "London",
  "townCity": "Westminster",
  "address": "123 New St"
}
```
**When** the sync processes the pub  
**Then** the pub is written to Firestore with `{ merge: true }`  
**And** the address field is updated to "123 New St"  
**And** the county field remains "London" (scraped value unchanged)  
**And** the countyOverride field remains "Greater London" (preserved)  
**And** `lastSyncedAt` is updated

#### Scenario: Preserve TownCity Override During Sync
**ADDED:**
**Given** an existing pub in Firestore with:
```json
{
  "id": "abc-123",
  "townCity": "City of London",
  "townCityOverride": "London",
  "county": "Greater London",
  "name": "The Old Name"
}
```
**And** the scraped pub has:
```json
{
  "id": "abc-123",
  "townCity": "City of London",
  "name": "The New Name"
}
```
**When** the sync processes the pub  
**Then** the pub is written to Firestore with `{ merge: true }`  
**And** the name field is updated to "The New Name"  
**And** the townCity field remains "City of London" (scraped value unchanged)  
**And** the townCityOverride field remains "London" (preserved)  
**And** `lastSyncedAt` is updated

#### Scenario: Preserve Both Overrides During Sync
**ADDED:**
**Given** an existing pub with both countyOverride and townCityOverride set  
**And** the scraped pub has different values for county and townCity  
**When** the sync processes the pub  
**Then** the scraped county value is written (updates original scraped value)  
**And** the scraped townCity value is written (updates original scraped value)  
**And** the countyOverride value is preserved (not modified by sync)  
**And** the townCityOverride value is preserved (not modified by sync)  
**And** `lastSyncedAt` is updated

#### Scenario: Sync Updates Scraped Fields Without Override
**ADDED:**
**Given** an existing pub with no overrides:
```json
{
  "id": "abc-123",
  "county": "Old County",
  "townCity": "Old TownCity"
}
```
**And** the scraped pub has:
```json
{
  "id": "abc-123",
  "county": "New County",
  "townCity": "New TownCity"
}
```
**When** the sync processes the pub  
**Then** the county field is updated to "New County"  
**And** the townCity field is updated to "New TownCity"  
**And** no override fields are created or modified  
**And** `lastSyncedAt` is updated

---

### Requirement: Pub Matching Logic (REQ-SDS-009)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- CLARIFY: Matching uses scraped townCity value, not override value

The system MUST match scraped pubs to existing pubs using a three-tier strategy before deciding to create or update.

**Updated Acceptance Criteria:**
- Tier 1: Match by URL (most reliable, handles name changes)
- Tier 2: Match by name AND townCity for pubs with `openState === 'Open'` (handles URL changes)
- Tier 3: Match by address for pubs with `openState === 'Open'` (handles name and URL changes, requires address length > 10)
- Matching tiers are evaluated in order: URL → Name+TownCity → Address
- First successful match is used (tiers do not fallback)
- Tier 2 and 3 only match pubs with `openState === 'Open'`
- No match found results in creating a new pub
- **ADDED:** Tier 2 matching uses scraped `townCity` value, NOT `townCityOverride`
- **ADDED:** Override fields are never used in pub matching logic

#### Scenario: Match by URL (Tier 1)
**Given** an existing pub with URL "https://www.jdwetherspoon.com/pubs/london/the-moon-under-water"  
**And** the scraped pub has the same URL  
**When** pub matching is performed  
**Then** tier 1 succeeds (URL match found)  
**And** the existing pub is returned for update  
**And** tier 2 and 3 are not evaluated

#### Scenario: Match by Name and TownCity (Tier 2)
**Given** an existing pub with name "The Moon Under Water", townCity "London", `openState === 'Open'`, and URL "https://www.jdwetherspoon.com/pubs/old-url"  
**And** the scraped pub has URL "https://www.jdwetherspoon.com/pubs/new-url"  
**And** the scraped pub has name "The Moon Under Water" and townCity "London"  
**When** pub matching is performed  
**Then** tier 1 fails (URL does not match)  
**And** tier 2 succeeds (name and townCity match, pub is open)  
**And** the existing pub is returned for update

#### Scenario: Tier 2 Matching Ignores TownCity Override
**ADDED:**
**Given** an existing pub with:
```json
{
  "name": "The Moon Under Water",
  "townCity": "City of London",
  "townCityOverride": "London",
  "openState": "Open"
}
```
**And** the scraped pub has:
```json
{
  "name": "The Moon Under Water",
  "townCity": "City of London"
}
```
**When** pub matching tier 2 is evaluated  
**Then** the match uses scraped townCity "City of London" vs existing scraped townCity "City of London"  
**And** the match succeeds (name and scraped townCity match)  
**And** the townCityOverride value "London" is not used in matching

#### Scenario: No Match Creates New Pub (with Override Preservation)
**ADDED:**
**Given** no existing pub matches the scraped pub by URL, name+townCity, or address  
**When** pub matching is performed  
**Then** no match is found  
**And** a new pub is created in Firestore  
**And** the new pub has no override fields (only scraped data)  
**And** override fields can be added manually later

#### Scenario: Tier 2 Does Not Match Closed Pubs
**Given** an existing pub with name "The Moon Under Water", townCity "London", and `openState === 'Closed'`  
**And** the scraped pub has name "The Moon Under Water" and townCity "London"  
**When** pub matching tier 2 is evaluated  
**Then** tier 2 fails (pub is closed, not open)  
**And** tier 3 is evaluated next

---

### Requirement: Change Detection (REQ-SDS-010)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- CLARIFY: Change detection compares scraped fields only, ignores override fields

The system MUST compare scraped pub data with existing pub data to detect changes before writing to Firestore.

**Updated Acceptance Criteria:**
- Fields compared: `name`, `url`, `imageUrl`, `address`, `townCity`, `openState`, `isHotel`, `inAirport`, `inTrainStation`, `position`, `country`, `county`
- **ADDED:** Override fields (`countyOverride`, `townCityOverride`) are NOT compared
- Position comparison uses null-safe equality check
- Position objects are compared by lat and lng values (not reference equality)
- Position `null` values are handled correctly (null === null is true, null !== { lat, lng })
- If any field differs, data is considered changed
- If all fields are identical, data is considered unchanged
- **ADDED:** Changes in scraped `county` or `townCity` trigger update even if overrides exist
- **ADDED:** Presence or absence of override fields does not affect change detection

#### Scenario: Detect Change in Scraped County (Override Exists)
**ADDED:**
**Given** an existing pub with:
```json
{
  "county": "London",
  "countyOverride": "Greater London"
}
```
**And** the scraped pub has `county: "Greater London"`  
**When** change detection compares the pubs  
**Then** a change is detected (scraped county changed from "London" to "Greater London")  
**And** the pub will be written to Firestore  
**And** the countyOverride "Greater London" will be preserved via merge

#### Scenario: Detect Change in Scraped TownCity (Override Exists)
**ADDED:**
**Given** an existing pub with:
```json
{
  "townCity": "City of London",
  "townCityOverride": "London"
}
```
**And** the scraped pub has `townCity: "Westminster"`  
**When** change detection compares the pubs  
**Then** a change is detected (scraped townCity changed from "City of London" to "Westminster")  
**And** the pub will be written to Firestore  
**And** the townCityOverride "London" will be preserved via merge

#### Scenario: No Change When Override Exists But Scraped Value Matches
**ADDED:**
**Given** an existing pub with:
```json
{
  "county": "London",
  "countyOverride": "Greater London",
  "townCity": "Westminster"
}
```
**And** the scraped pub has `county: "London"` and `townCity: "Westminster"`  
**And** all other fields match  
**When** change detection compares the pubs  
**Then** no change is detected (all scraped fields match)  
**And** no Firestore write occurs  
**And** countyOverride remains unchanged in Firestore

#### Scenario: No Change Detection for Override Fields Themselves
**ADDED:**
**Given** an existing pub with no countyOverride field  
**And** all scraped fields match the scraped pub data  
**When** an administrator manually adds a countyOverride field via Firestore console  
**Then** the next scheduled sync does not detect this as a "change"  
**And** change detection only compares scraped fields  
**And** no additional Firestore write is triggered by the presence of the override
