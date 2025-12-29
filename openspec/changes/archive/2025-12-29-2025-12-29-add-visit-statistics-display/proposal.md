# Proposal: Add Visit Statistics Display

## Problem Statement
Users currently cannot see their overall visit progress at a glance. While individual country and county groups show progress bars, there is no summary view of total visited pubs versus remaining pubs. Users need a quick reference to understand their overall progress in visiting Wetherspoons pubs, with statistics that respect the closed pubs filter setting.

## Proposed Solution
Add a visit statistics summary section in the sidebar header (below the login/user menu controls) that displays:
- Total number of visited pubs
- Total number of remaining pubs to visit
- Overall progress percentage

The statistics will:
- Only display when user is authenticated
- Adapt to the "Show Closed Pubs" toggle state
- Update in real-time when visits are added/removed or filter changes
- Use the same visual styling as existing progress indicators for consistency

## Impact Assessment

### User Experience
- **Positive:** Immediate visibility of overall progress without expanding groups
- **Positive:** Motivation through clear goal tracking
- **Positive:** Respects user preference for including/excluding closed pubs
- **Neutral:** Minimal additional UI space required (compact stats section)

### Technical
- **Low Risk:** Leverages existing `getGroupCounts()` function and visit tracking infrastructure
- **Low Complexity:** Simple computed property based on filtered pubs list
- **Performance:** Negligible impact (single calculation over all pubs, already filtered)

### Maintenance
- **Low:** Follows existing patterns for visit progress display
- **Low:** No new composables or services required

## Alternatives Considered

1. **Progress bar only (no text stats)**
   - Rejected: Less informative, harder to see exact numbers

2. **Stats in a separate dedicated page**
   - Rejected: Reduces discoverability, adds navigation complexity

3. **Stats in footer instead of header**
   - Rejected: May be below fold on mobile devices

## Open Questions
None - requirements are clear and implementation is straightforward.

## Dependencies
- Requires existing specs:
  - `pub-visit-data` (REQ-PVD-003, REQ-PVD-004) for visit counting
  - `pub-navigation-sidebar` (REQ-PNS-008) for visual style consistency
  - `pub-visibility-filter` (REQ-PVF-002) for closed pub filtering
  - `user-authentication` for authentication state

## Success Metrics
- Statistics display updates within 50ms when filter state changes
- Statistics correctly exclude closed pubs when toggle is OFF
- Statistics are only visible to authenticated users
- UI remains responsive and doesn't impact sidebar performance

## Related Changes
None
