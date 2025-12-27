# Change Proposal: Add Navigation Sidebar for Pub Browsing

**Change ID:** `add-pub-navigation-sidebar`  
**Status:** Draft  
**Created:** 2025-12-27  
**Author:** AI Assistant

## Why

Users currently can only discover pubs by panning and zooming the map or clicking individual markers. There is no way to:
- Browse all available pubs in a structured list
- See how many pubs exist in each region
- Navigate directly to a specific pub without knowing its location
- Understand the geographic distribution at a glance

A hierarchical navigation sidebar solves these problems by providing a structured, browsable view of all pub locations organized by country and county.

## What Changes

Add an interactive sidebar component to the pub locations map that:
- Displays all pubs in a hierarchical structure (Country → County → Pub)
- Shows pub counts at each grouping level
- Allows expanding/collapsing groups
- Can be opened/closed via a burger menu button
- Automatically focuses the map on a selected pub

**Affected Capabilities:**
- Creates new capability: `pub-navigation-sidebar`
- Modifies existing: `pub-locations-map` (adds sidebar integration)

## Benefits

- **Discoverability:** Users can see all available pubs at a glance
- **Navigation:** Direct access to any pub without manual map searching
- **Context:** Understanding of pub distribution across regions
- **Accessibility:** Alternative navigation method for users who prefer list-based browsing
- **Mobile-Friendly:** Collapsible design keeps map usable on small screens

## Impact Assessment

### User Impact
- **Who:** All users viewing the pub locations map
- **What Changes:** New sidebar appears with burger menu toggle
- **Migration:** No migration needed (additive feature)

### Technical Impact
- **New Components:** `PubSidebar.vue` component
- **Modified Components:** `PubLocationsMap.vue` (adds sidebar integration)
- **Dependencies:** None (uses existing Vue 3, TypeScript, Tailwind CSS stack)
- **Performance:** Minimal - grouping logic runs once on data load

### Breaking Changes
None - this is a purely additive feature

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Screen space on mobile | Medium | Sidebar overlays map and can be dismissed |
| Grouping logic complexity | Low | Use simple JavaScript sorting and grouping |
| State management | Low | Keep sidebar state minimal (open/collapsed groups) |

## Alternatives Considered

1. **Search box instead of sidebar:** Less visual, doesn't show structure
2. **Dropdown menu:** Harder to navigate multi-level hierarchy
3. **Bottom sheet on mobile:** Inconsistent UX across devices

Chose sidebar for its familiar pattern and ability to show hierarchy clearly.

## Dependencies

None - all required dependencies already in place

## Success Criteria

- Sidebar displays all pubs grouped by country, then county
- Groups show accurate pub counts
- Groups can be expanded/collapsed independently
- Burger menu toggles sidebar open/closed
- Clicking a pub in sidebar focuses map on that location
- Sidebar is responsive and usable on mobile devices
- Implementation follows existing shadcn-vue component patterns

## Timeline Estimate

- Spec creation: 0.5 days
- Implementation: 1-2 days
- Testing: 0.5 days
- Total: 2-3 days
