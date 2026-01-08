# Add Pub Data Overrides for County and TownCity

**Change ID:** `2026-01-08-add-pub-data-overrides`  
**Status:** Proposed  
**Created:** 2026-01-08

## Why

Data scraped from the Wetherspoons website for county and townCity fields is not always correct, but must be retained to track what was originally scraped. The system needs the ability to define override values that take precedence over scraped data when displaying pub information to clients. This will allow manual correction of data errors while maintaining data integrity and sync transparency.

## What Changes

- **ADD:** Optional `countyOverride` and `townCityOverride` fields to Pub data model
- **ADD:** Server-side logic to merge override values with scraped values before returning data to clients
- **ADD:** Firestore schema updates to support override fields
- **MODIFY:** `getPubs` callable function to apply overrides transparently
- **MODIFY:** Sync service to preserve existing override values when updating scraped data
- **PRESERVE:** Original scraped `county` and `townCity` values remain unchanged in Firestore

This change ensures clients receive corrected data without requiring client-side override logic, simplifying frontend implementation.

## Impact

### Affected Capabilities
- `firebase-data-integration` - Pub interface, data retrieval, and validation
- `scheduled-data-sync` - Sync behavior to preserve overrides when updating pubs

### Affected Code
- `functions/src/types/pub.ts` - Pub and ScrapedPubData interfaces
- `functions/src/callable/getPubs.ts` - Apply overrides before returning data
- `functions/src/services/pubSyncService.ts` - Preserve overrides during sync
- Firestore database schema (new optional fields)

### Out of Scope
- Admin UI for managing overrides (manual Firestore updates for now)
- Bulk override management tools
- Override history/audit trail
- Validation of override values (accepted as-is)
- Client-side override display or editing
