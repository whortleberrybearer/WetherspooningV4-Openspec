# Design: Restructure Pub Data Model

## Overview

This change restructures the Pub data model to support optional locations, nested position data, and GUID-based identifiers. The design ensures backward compatibility in behavior while introducing breaking changes to the data schema.

## Architectural Decisions

### 1. Optional Position Data

**Decision:** Make `position` field optional (`position: { lat: number, lng: number } | null`)

**Rationale:**
- Some pubs may not have location data (temporarily closed, under construction, data pending)
- Sidebar navigation should display all pubs regardless of location availability
- Map should only render pubs with valid position data
- Separates navigation (all pubs) from visualization (positioned pubs only)

**Trade-offs:**
- **Pro:** Increased flexibility in data management
- **Pro:** Clearer separation of concerns (navigation vs mapping)
- **Con:** Adds null checks throughout codebase
- **Con:** Requires careful validation to prevent incomplete data

**Implementation Strategy:**
- Filter pubs for map rendering: `pubs.filter(pub => pub.position !== null)`
- Sidebar continues to render all pubs (no changes needed)
- Add TypeScript optional chaining: `pub.position?.lat`

---

### 2. Nested Position Structure

**Decision:** Group coordinates under `position: { lat: number, lng: number }` instead of top-level `lat`, `lng`

**Rationale:**
- Lat/lng form a logical unit representing geographic position
- Grouping makes optionality clearer (either both or neither, not partially defined)
- Aligns with common geospatial data patterns (GeoJSON, Google Maps LatLngLiteral)
- Easier to extend with additional position metadata (e.g., accuracy, altitude) if needed

**Trade-offs:**
- **Pro:** Clearer data model and intent
- **Pro:** Prevents partial position data (e.g., lat without lng)
- **Pro:** Easier to validate as a unit
- **Con:** Breaking change requiring updates across all pub references

**Migration Pattern:**
```typescript
// Before
const lat = pub.lat
const lng = pub.lng

// After
const lat = pub.position?.lat
const lng = pub.position?.lng

// Or with destructuring
const { lat, lng } = pub.position ?? { lat: null, lng: null }
```

---

### 3. GUID-based Identifiers

**Decision:** Change `id` from `number` to `string` (UUID v4 format)

**Rationale:**
- **Collision resistance:** Sequential integers can collide during imports or multi-source data
- **Global uniqueness:** GUIDs are universally unique without coordination
- **Future-proofing:** Supports distributed data sources and merging datasets
- **Industry standard:** Common practice for distributed systems and APIs

**Trade-offs:**
- **Pro:** Eliminates ID collision risks
- **Pro:** Enables safe parallel data generation and testing
- **Pro:** Simplifies data merging from multiple sources
- **Con:** Larger storage footprint (36 bytes vs 8 bytes)
- **Con:** Less human-readable than sequential numbers
- **Con:** Breaking change for all pub/visit references

**Implementation Strategy:**
- Use `crypto.randomUUID()` for generation
- TypeScript type: `id: string`
- Validation: Regex or UUID library for format checking
- Firestore: Store as string field

---

## Data Model Changes

### Current Structure
```typescript
interface Pub {
  id: number                    // Sequential integer
  name: string
  lat: number                   // Top-level
  lng: number                   // Top-level
  // ... other fields
}
```

### New Structure
```typescript
interface Pub {
  id: string                    // UUID format: "550e8400-e29b-41d4-a716-446655440000"
  name: string
  position: {                   // Grouped and optional
    lat: number
    lng: number
  } | null
  // ... other fields
}
```

### Firestore Document Structure

**Before:**
```json
{
  "id": 42,
  "name": "The Moon Under Water",
  "lat": 52.4931,
  "lng": -1.8843,
  ...
}
```

**After:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "The Moon Under Water",
  "position": {
    "lat": 52.4931,
    "lng": -1.8843
  },
  ...
}
```

**Pubs without location:**
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "name": "The Standing Order",
  "position": null,
  ...
}
```

---

## Component Impact Analysis

### Map Rendering (PubLocationsMap.vue)
**Changes:**
- Filter pubs before marker creation: `filteredPubs = pubs.filter(p => p.position !== null)`
- Access coordinates: `pub.position.lat`, `pub.position.lng`
- Proximity checks: Guard against null position

**Risk:** Medium - Core functionality, requires careful testing

---

### Sidebar Navigation (PubNavigationSidebar)
**Changes:**
- None required - already displays all pubs alphabetically
- Count calculations remain unchanged

**Risk:** Low - No behavioral changes expected

---

### Firebase Data Service (firebaseDataService.ts)
**Changes:**
- Update `Pub` interface definition
- Modify validation: `position` is optional, `lat`/`lng` removed
- Update `validatePub()` to check `position` structure if present
- Change `id` type from `number` to `string`

**Risk:** High - Core data layer, affects all pub operations

---

### Visit Tracking (useVisits.ts, pub-visit-data)
**Changes:**
- Update `Visit` interface: `pubId: string` (was `number`)
- All visit queries use string-based pub IDs
- Visit creation/update uses GUID pub IDs

**Risk:** Medium - Breaking change to visit data structure

---

### Data Generation (generatePubsData.js)
**Changes:**
- Import UUID library: `crypto.randomUUID()`
- Generate GUID for each pub: `id: crypto.randomUUID()`
- Nest coordinates: `position: { lat, lng }` or `position: null`

**Risk:** Low - Isolated script changes

---

## Validation Strategy

### Type-level Validation
```typescript
function validatePub(data: any): data is Pub {
  // Required fields
  if (typeof data.id !== 'string') return false
  if (typeof data.name !== 'string') return false
  
  // Optional position
  if (data.position !== null && data.position !== undefined) {
    if (typeof data.position !== 'object') return false
    if (typeof data.position.lat !== 'number') return false
    if (typeof data.position.lng !== 'number') return false
    if (data.position.lat < -90 || data.position.lat > 90) return false
    if (data.position.lng < -180 || data.position.lng > 180) return false
  }
  
  return true
}
```

### Runtime Checks
- Map rendering: Skip pubs where `position === null`
- Proximity checks: Guard with `if (!pub.position) return null`
- Distance calculations: Validate position exists before computing

---

## Testing Approach

1. **Data Generation:** Generate sample data with mix of positioned/non-positioned pubs
2. **Map Rendering:** Verify only positioned pubs appear as markers
3. **Sidebar Display:** Verify all pubs appear in navigation
4. **Visit Tracking:** Verify visits work with GUID-based pub IDs
5. **Validation:** Test pub documents with/without position
6. **Type Safety:** Ensure no TypeScript errors

---

## Rollout Plan

1. **Phase 1:** Update interfaces and types (TypeScript changes)
2. **Phase 2:** Update validation and data access logic
3. **Phase 3:** Update all components to use new structure
4. **Phase 4:** Update data generation scripts
5. **Phase 5:** Test with emulator using new data
6. **Phase 6:** Document migration path for production data (out of scope for implementation)

---

## Open Questions

1. **Q:** Should we validate UUID format strictly or accept any string?
   **A:** Start with relaxed string validation, can add UUID format validation later if needed

2. **Q:** How to handle pubs that lose their location data?
   **A:** Set `position: null` - they remain in sidebar, disappear from map

3. **Q:** Should position changes be tracked in visit history?
   **A:** Out of scope - visits track pub ID only, not location snapshots
