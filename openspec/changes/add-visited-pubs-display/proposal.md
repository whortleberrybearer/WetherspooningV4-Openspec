# Proposal: Add Visited Pubs Display

## Summary
Enable authenticated users to see which pubs they have visited with visual differentiation on the map and progress tracking in the sidebar. This provides users with a way to track their pub visit progress and easily identify which locations they have already been to.

## Motivation
Users want to track their Wetherspoon pub visits and see their progress. Visual feedback on the map and in the sidebar helps users:
- Quickly identify which pubs they've already visited
- See their visit progress within different regions
- Plan future visits to unvisited locations
- Maintain motivation through visible progress tracking

## Scope

### In Scope
- Loading visit data from static JSON file (`/data/visits-sample.json`)
- Displaying 4 distinct visual states on map markers:
  - Unvisited + Open
  - Unvisited + Closed
  - Visited + Open
  - Visited + Closed
- Showing visit count and progress per group in sidebar (e.g., "Visited 3/10 Greater Manchester pubs")
- Test data with sample visited pubs for authenticated test user

### Out of Scope
- Marking pubs as visited (manual user action)
- Persisting visit changes (localStorage, backend)
- Visit timestamps, ratings, or notes
- Visit statistics or analytics pages
- Backend integration for visit data

## Proposed Changes

### New Capability: pub-visit-data
**Type:** create  
**Spec:** `openspec/specs/pub-visit-data/spec.md`

New capability to manage pub visit data for authenticated users.

**Added Requirements:**
- REQ-PVD-001: Visit Data Source - Load visit data from static JSON
- REQ-PVD-002: Visit Data Structure - Define Visit entity format
- REQ-PVD-003: Visit Lookup - Provide method to check if pub is visited
- REQ-PVD-004: Visit Counts - Calculate visited/total counts per group
- REQ-PVD-005: Authentication Integration - Only load visits for authenticated users

### Modified Capability: pub-locations-map
**Type:** modify  
**Spec:** `openspec/specs/pub-locations-map/spec.md`

Update map to show 4 visual states based on visit status and open state.

**Modified Requirements:**
- REQ-PLM-002: Pub Markers - Add visual differentiation for visited pubs (4 states)
- REQ-PLM-007: Visual Differentiation - Update to support visit-based styling alongside open/closed state

### Modified Capability: pub-navigation-sidebar
**Type:** modify  
**Spec:** `openspec/specs/pub-navigation-sidebar/spec.md`

Add visit progress tracking to sidebar groups.

**Modified Requirements:**
- REQ-PNS-001: Sidebar Display - Add visit count display per group
- REQ-PNS-006: Group Count Display - Include visited/total format with progress indicator

## Dependencies
- Requires user-authentication capability (already implemented)
- Builds on pub-locations-map and pub-navigation-sidebar

## Testing Strategy
- Unit tests for visit data loading and lookup logic
- Component tests for map marker styling with different states
- Component tests for sidebar progress display
- E2E tests for complete visit tracking user flow
- Visual regression tests for 4 marker states

## Migration Notes
No migration required - this is a new feature that enhances existing functionality without breaking changes.

## Alternatives Considered

### Alternative 1: Single Progress Bar for All Pubs
Show one overall progress bar instead of per-group progress.
**Rejected:** Less useful for users who want to complete specific regions; per-group tracking provides better granularity and motivation.

### Alternative 2: 3 Visual States (Skip Visited+Closed)
Only show visited state for open pubs, treat visited closed pubs as unvisited closed.
**Rejected:** Users want to see all their visits regardless of current open state; hiding visited closed pubs would lose valuable data.

### Alternative 3: Percentage-Based Progress Only
Show only percentages (e.g., "75%") instead of counts.
**Rejected:** Absolute counts (e.g., "3/10") provide more concrete sense of progress and scale.

## Open Questions
None - all requirements clarified with user.

## Rollout Plan
1. Implement visit data loading and composable
2. Update map markers with 4 visual states
3. Add progress indicators to sidebar groups
4. Create test data file with sample visits
5. Test with authenticated user flow
6. Document visit data format for future backend integration
