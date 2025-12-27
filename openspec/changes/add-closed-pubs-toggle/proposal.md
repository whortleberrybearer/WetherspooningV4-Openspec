# Proposal: Add Closed Pubs Toggle

## What
Add a "Show Closed Pubs" toggle control that allows users to control the visibility of closed pubs on the map while always displaying all pubs in the sidebar with visual differentiation.

## Why
Users primarily want to discover and visit pubs that are currently open. Closed pubs should remain visible in the sidebar for completeness and historical reference, but should be visually de-emphasized (grayed out) to indicate their status. On the map, closed pubs can be hidden by default to reduce clutter, but users should have the option to show them.

## How
- Add a toggle control labeled "Show Closed Pubs" to the sidebar header
- Filter map markers based on `openState` field (default: OFF, hiding closed markers)
- Display all pubs in sidebar regardless of toggle state
- Apply visual styling (grayed out, muted text) to closed pubs in sidebar
- Update pub counts in sidebar to show total count with indication of open vs closed

## Scope
- Add a toggle control labeled "Show Closed Pubs" to the UI
- Filter map markers based on `openState` field (toggle controls map visibility only)
- Display all pubs in sidebar with visual differentiation for closed pubs
- Apply muted/grayed styling to closed pubs in sidebar
- Toggle defaults to OFF (closed pubs hidden from map but visible in sidebar)
- Update pub counts to show breakdown of open vs total pubs

## Non-Goals
- Persisting user preference across sessions (may be added later)
- Filtering by other criteria (region, rating, etc.)
- Editing or managing pub open states

## Related Changes
- Extends `pub-locations-map` (REQ-PLM-002, REQ-PLM-003)
- Extends `pub-navigation-sidebar` (all requirements)

## Implementation Notes
- The toggle should be easily accessible in the UI, likely near the burger menu or in the sidebar header
- Toggle affects map markers only - sidebar always shows all pubs
- Closed pubs in sidebar should be visually muted (opacity, grayed text, strikethrough, or disabled state)
- Map marker filtering should be reactive - changing toggle immediately updates map
- The `openState` field in pub data can have values like "Open", "Closed", "Temporarily Closed"
- Consider pubs without an `openState` field as "Open" (fail-safe)
- Sidebar counts behavior:
  - Toggle ON: Show "X (Y closed)" format to indicate breakdown
  - Toggle OFF: Show only "X" (open count) since closed markers are hidden
