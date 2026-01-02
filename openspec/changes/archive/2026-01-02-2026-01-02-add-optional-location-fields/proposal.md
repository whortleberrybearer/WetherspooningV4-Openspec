# Change Proposal: Add Optional Location Fields

**Change ID:** `2026-01-02-add-optional-location-fields`  
**Date:** 2026-01-02  
**Author:** AI Assistant  
**Priority:** SHOULD  
**Status:** Draft

## Why

Some pubs in the database may have incomplete location metadata (country, region). Currently, these fields are required, which means pubs cannot be added without complete data or may display empty/undefined values in the UI. This creates a poor user experience when browsing pubs with missing location information.

Making country and region optional allows pubs to be added with partial location data while maintaining a clean, consistent UI by displaying "Unknown" for missing values.

## What

Make the `country` and `region` fields optional in the Pub data model and update all display logic to show "Unknown" when these fields are null, undefined, or empty strings.

## What Changes

### Capabilities Modified
- **firebase-data-integration**: Update Pub validation to make country and region optional
- **enhanced-infowindow-display**: Display "Unknown" for missing country/region in info windows
- **pub-navigation-sidebar**: Display "Unknown" for missing country/region in sidebar lists

## How

### Changes Required

1. **Type Definitions**
   - Update `Pub` interface to make `country?: string` and `region?: string` optional
   - Update validation to accept null/undefined/empty for these fields
   - Update all component interfaces that use Pub type

2. **Display Logic**
   - Add helper function or computed property to display "Unknown" for missing values
   - Update all UI components that display country or region
   - Ensure consistent "Unknown" display across map info windows, sidebar, detail sheets

3. **Data Validation**
   - Update `validatePub()` to allow optional country and region
   - Remove these fields from required fields list
   - Ensure existing validation for other required fields remains

4. **Sample Data**
   - Update data generation script to randomly omit country/region (10-15% of pubs)
   - Regenerate sample data with some pubs having null country/region
   - Verify display logic works with test data

## Impact

### Components Affected
- `firebaseDataService.ts` - Pub interface and validation
- `PubLocationsMap.vue` - Info window display
- `PubSidebar.vue` - Pub list display
- `AppSidebar.vue` - Pub list display
- `PubDetailSheet.vue` - Pub detail display
- `generatePubsData.js` - Data generation script

### Breaking Changes
None. This is a non-breaking change as:
- Existing pubs with country/region continue to work
- Optional fields are backward compatible
- Default "Unknown" display handles all edge cases

## Acceptance Criteria

SHALL display "Unknown" for country when field is null, undefined, or empty string
SHALL display "Unknown" for region when field is null, undefined, or empty string
SHALL validate pubs without country or region fields
SHALL generate sample data with 10-15% of pubs missing country or region
SHALL maintain consistent "Unknown" display across all UI components displaying location

## Rollback Plan

If issues arise:
1. Revert type definitions to make fields required
2. Revert validation changes
3. Revert display logic changes
4. Regenerate sample data with all fields populated
5. Existing data with null/undefined values will display as empty strings (existing behavior)

## Dependencies

- Completes after: `2026-01-02-restructure-pub-data-model`
- Blocks: None
- Related: None
