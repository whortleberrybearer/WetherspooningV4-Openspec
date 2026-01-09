# Proposal: Fix Pub Opening States

## Problem Statement
Multiple issues exist with how pub opening states are scraped, filtered, and displayed:

1. **Scraping Issue**: Pubs showing "Reopening [date]" are not being parsed correctly and should have openState like "Reopening 12/01/2026" but currently default to "Unknown"
2. **Filtering Issue**: The filter logic uses `includes('closed')` which incorrectly treats "Temporarily Closed" and "Reopening..." states as permanently "Closed", hiding them when "Show Closed Pubs" is OFF
3. **Count Issue**: Total pub count and "that are now closed" count include wrong pub states
4. **Display Issue**: State tags shown on pub details don't match actual openState values (e.g., "Opening Soon" showing as "Opening")

## Proposed Solution
1. **Update scraper** to detect and parse "Reopening [date]" patterns from the HTML
2. **Refine filtering logic** to only treat `openState === 'Closed'` as permanently closed
3. **Fix counts** so:
   - Total pubs = all pubs except those with `openState === 'Closed'`
   - "that are now closed" = only pubs with `openState === 'Closed'`
4. **Add state badges** to pub detail sheet showing exact openState value with appropriate styling

## Affected Capabilities
- `scheduled-data-sync` (scraper logic)
- `pub-visibility-filter` (filtering and counting logic)
- `pub-detail-sheet` (display of state badges)
- `enhanced-infowindow-display` (potential map marker badges)

## Success Criteria
1. Pubs with "Reopening Monday 12 January 2026" have openState = "Reopening 12/01/2026"
2. When "Show Closed Pubs" is OFF, temporarily closed and reopening pubs remain visible
3. Total pub count excludes only permanently closed pubs
4. State badges display correct openState values with visual differentiation
5. Map markers visually differentiate non-open states (temporarily closed, opening soon, reopening)

## Risks & Dependencies
- Existing visits to pubs may need openState migration if field structure changes significantly
- Frontend filtering logic is used in multiple components (AppSidebar, PubSidebar, PubLocationsMap)
