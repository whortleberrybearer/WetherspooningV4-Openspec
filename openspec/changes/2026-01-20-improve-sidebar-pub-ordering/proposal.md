# Proposal: Improve Sidebar Pub Ordering and Layout

## Overview
Improve the pub navigation sidebar to provide more intuitive sorting of pubs within counties, fix layout issues causing horizontal scrollbar, and improve visual hierarchy by repositioning location type icons.

## Motivation
Users currently experience:
1. **Confusing pub ordering**: Pubs within a county are only sorted by townCity, making it hard to find specific pubs. When multiple pubs exist in the same town with the same name, there's no consistent ordering.
2. **Horizontal scrollbar**: The sidebar width (480px) combined with progress indicators and pub details causes horizontal overflow on smaller screens or when content is too wide.
3. **Visual hierarchy issues**: Location type icons (hotel, airport, train station) appear before the pub name, disrupting reading flow and making names harder to scan.

## Goals
1. Provide intuitive, predictable ordering of pubs within county groups
2. Eliminate horizontal scrollbar by optimizing sidebar content width
3. Improve visual scanning by positioning icons after pub names

## Non-Goals
- Changing the country/county grouping hierarchy
- Changing mobile responsiveness behavior
- Adding new filtering options

## Proposed Changes

### 1. Multi-Level Pub Sorting Within Counties
Update the sorting logic in `groupedPubs` computed property to sort pubs within each county by:
1. **Primary**: Pub name (alphabetically)
2. **Secondary**: TownCity (alphabetically)
3. **Tertiary**: OpenState (open pubs before closed pubs)

This ensures:
- Pubs are alphabetically ordered by name first, making them easy to find
- When names match, townCity provides secondary ordering
- When both name and townCity match, open pubs appear before closed ones

**Implementation**: Update the sorting comparator at line 459-460 in `AppSidebar.vue`.

### 2. Fix Sidebar Width to Prevent Horizontal Scroll
Reduce sidebar width from 480px to a more reasonable width that accommodates all content without overflow.

**Options considered**:
- Reduce to 420px (moderate reduction)
- Reduce to 400px (more compact)
- Reduce to 352px (matches mobile sidebar pattern from REQ-PNS-003)

**Recommendation**: Use **400px** as it provides a good balance between content space and preventing overflow while remaining readable.

**Implementation**: Update the width override at line 2 in `AppSidebar.vue`.

### 3. Reposition Location Type Icons After Pub Name
Move the location type icons (🏨 hotel, ✈️ airport, 🚂 train station) to appear after the pub name instead of before it.

**Current order**: `[icon] Name`  
**New order**: `Name [icon]`

This improves:
- **Scannability**: Users can quickly scan pub names without icons interrupting the visual flow
- **Reading order**: Name is the primary identifier, icons are supplementary metadata
- **Alignment**: Pub names align more consistently in the list

**Implementation**: Reorder the span elements in the pub name template at lines 142-145 in `AppSidebar.vue`.

## Impact Assessment

### User Impact
- **Positive**: Easier to find specific pubs, better visual hierarchy, no horizontal scrolling
- **Neutral**: Icon position change may require brief adjustment period
- **Breaking**: None - all changes are enhancements to existing behavior

### Technical Impact
- **Risk**: Low - changes are localized to one component
- **Complexity**: Low - simple comparator update, CSS change, and template reordering
- **Testing**: Manual testing of sorting edge cases (same name+town, mixed open/closed)

### Performance Impact
- **Sorting**: Adding two more comparison levels has negligible impact (still O(n log n))
- **Rendering**: No change - same elements, just different order/positions

## Affected Specs
- `pub-navigation-sidebar` - Requires MODIFIED requirements for sorting behavior and layout

## Alternatives Considered

### Alternative: Make sorting configurable
Allow users to choose sort order (by name, by town, by visit status)
- **Rejected**: Adds UI complexity for marginal benefit; alphabetical by name is the most intuitive default

### Alternative: Keep 480px width, reduce progress bar size
Shrink progress indicators to prevent overflow
- **Rejected**: Progress bars are already compact (100px min-width); reducing further hurts readability

### Alternative: Icons before name with better spacing
Keep icons before name but add more spacing
- **Rejected**: Doesn't solve the visual hierarchy issue; names should be the primary scan target

## Dependencies
None - this is a standalone UI improvement.

## Migration Strategy
No migration needed - purely frontend display logic changes.

## Open Questions
1. Should closed pubs always appear after open pubs, or only when names match?
   - **Recommendation**: Only when name AND townCity match (tertiary sort)
   - **Rationale**: Keeps alphabetical ordering primary; open/closed is tiebreaker only

2. Is 400px the optimal width, or should it be even narrower?
   - **Recommendation**: Start with 400px and iterate based on user feedback
   - **Rationale**: Balances content density with readability
