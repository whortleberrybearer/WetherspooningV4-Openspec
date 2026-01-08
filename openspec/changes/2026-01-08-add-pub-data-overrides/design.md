# Design: Pub Data Overrides

## Context

Data scraped from the Wetherspoons website occasionally contains errors in the `county` and `townCity` fields due to:
- Inconsistent address formatting on pub pages
- Incorrect geocoding results from Google Geocoding API
- Ambiguous location names (e.g., "City of London" vs "London")
- Data extraction logic limitations

These errors affect pub organization in the navigation sidebar and filtering, but the scraped data must be retained to:
- Track what was originally extracted from the website
- Detect changes during future syncs
- Maintain data integrity and sync transparency

The system needs a mechanism to correct these errors while preserving the original scraped values.

## Goals / Non-Goals

**Goals:**
- Allow manual correction of county and townCity errors without modifying scraped data
- Make corrections transparent to clients (no client-side override logic required)
- Preserve override values during scheduled data syncs
- Support cases where scraped value is empty/null but override provides the correct value

**Non-Goals:**
- Admin UI for managing overrides (manual Firestore updates acceptable for now)
- Automated error detection or suggestion of overrides
- Override history or audit trail
- Validation of override values (trust manual input)
- Overrides for other pub fields (only county and townCity for this change)
- Region or country overrides (not requested)

## Decisions

### Decision 1: Server-Side Override Application

**Choice:** Apply overrides in the `getPubs` callable function before returning data to clients.

**Rationale:**
- Centralizes override logic in one place (backend)
- Clients receive clean, corrected data without knowing about overrides
- Simplifies client implementation (no conditional display logic needed)
- Maintains separation: scraped data stored, corrected data served

**Alternatives Considered:**
- **Client-side override application:** Rejected because it requires all clients to implement the same override logic and increases complexity
- **Replace scraped values directly:** Rejected because it loses original data and breaks sync transparency

### Decision 2: Separate Override Fields in Firestore

**Choice:** Store overrides as separate optional fields: `countyOverride` and `townCityOverride`.

**Rationale:**
- Preserves original scraped `county` and `townCity` values
- Clear distinction between scraped data and manual corrections
- Allows sync service to update scraped values without touching overrides
- Enables future features like "revert to scraped value" or "compare scraped vs override"

**Schema:**
```typescript
interface Pub {
  // ... existing fields
  county?: string;           // Scraped value
  countyOverride?: string;   // Manual override (takes precedence)
  townCity: string;          // Scraped value
  townCityOverride?: string; // Manual override (takes precedence)
}
```

### Decision 3: Preserve Overrides During Sync

**Choice:** Sync service updates scraped fields but never modifies override fields.

**Rationale:**
- Overrides are manual corrections and should persist across syncs
- Sync only updates what was scraped from the website
- Override fields are only set/modified via direct Firestore updates or future admin tools

**Implementation:**
- `syncPubToFirestore` uses `{ merge: true }` to avoid overwriting override fields
- Override fields are explicitly excluded from sync operations

### Decision 4: Nullable Override Values Not Supported

**Choice:** Override fields are either undefined/absent or contain a non-empty string. No support for explicitly setting "null" to clear a scraped value.

**Rationale:**
- Simplifies merge logic: `override || scraped` pattern
- Empty string override would be confusing (is it intentional or a mistake?)
- If scraped value is wrong and should be empty, delete the override field entirely

**Trade-off:** Cannot explicitly override a scraped value with "no value". Workaround: set override to a placeholder like "Unknown" or delete override to use scraped value.

## Implementation Pattern

### Data Flow

```
Scrape → Store (county, townCity) → Firestore
                                       ↓
Manual Correction → Store (countyOverride, townCityOverride)
                                       ↓
Client Request → getPubs → Apply overrides → Return (merged data)
```

### Override Merge Logic

```typescript
function applyOverrides(pub: Pub): Pub {
  return {
    ...pub,
    county: pub.countyOverride ?? pub.county,
    townCity: pub.townCityOverride ?? pub.townCity,
  };
}
```

### Sync Preservation

```typescript
// In pubSyncService.syncPubToFirestore:
const pubDoc = {
  // ... scraped fields (county, townCity, etc.)
  // Override fields are NOT included in this object
};

// Using merge: true preserves existing countyOverride and townCityOverride
await db.collection('pubs').doc(pubData.id).set(pubDoc, { merge: true });
```

## Risks / Trade-offs

**Risk:** Manual override management via Firestore console is error-prone  
**Mitigation:** Document override field names and accepted values; plan future admin UI

**Risk:** Override fields may become stale if scraped data is later corrected  
**Mitigation:** Periodic review of overrides vs scraped values (manual for now)

**Trade-off:** Increases Firestore document size slightly (two optional string fields)  
**Impact:** Negligible (~50-100 bytes per pub with overrides)

**Trade-off:** No validation of override values  
**Impact:** Accepted risk; manual updates are trusted; validation can be added later if needed

## Migration Plan

### Phase 1: Add Override Fields (This Change)
1. Update Pub TypeScript interface to include optional override fields
2. Modify getPubs to apply overrides before returning data
3. Update sync service to preserve override fields during merges
4. Deploy to production (no data migration needed; fields are optional)

### Phase 2: Manual Corrections (Post-Deployment)
1. Identify pubs with incorrect county or townCity values
2. Set countyOverride or townCityOverride fields via Firestore console
3. Verify corrections appear in client applications

### Phase 3: Admin UI (Future)
1. Design and implement admin interface for managing overrides
2. Add validation and bulk update capabilities
3. Provide comparison view (scraped vs override)

### Rollback Plan
If issues arise:
1. Revert getPubs function to not apply overrides (clients see scraped data)
2. Override fields remain in Firestore but are ignored
3. No data loss; can re-enable override application after fixing issues

## Open Questions

None - requirements are clear and scoped appropriately for manual override management.
