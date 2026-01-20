# Implementation Tasks

## Overview
Implement improved sidebar pub ordering, fix horizontal scrollbar, and reposition location type icons.

## Tasks

### 1. Update Pub Sorting Logic in AppSidebar.vue
**File**: `Wetherspooning/src/components/AppSidebar.vue`  
**Location**: Line 459-460 in `groupedPubs` computed property  
**Action**: Replace the current townCity-only sort with a multi-level comparator

**Current**:
```typescript
const countyPubs = grouped[country]![county]!.sort((a, b) =>
  a.townCity.localeCompare(b.townCity)
)
```

**New**:
```typescript
const countyPubs = grouped[country]![county]!.sort((a, b) => {
  // Primary sort: by name
  const nameComparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  if (nameComparison !== 0) return nameComparison
  
  // Secondary sort: by townCity
  const townComparison = a.townCity.localeCompare(b.townCity, undefined, { sensitivity: 'base' })
  if (townComparison !== 0) return townComparison
  
  // Tertiary sort: open before closed
  const aIsClosed = (a.openState || 'Open') === 'Closed'
  const bIsClosed = (b.openState || 'Open') === 'Closed'
  if (aIsClosed && !bIsClosed) return 1
  if (!aIsClosed && bIsClosed) return -1
  
  return 0
})
```

**Validation**:
- Test with pubs that have identical names in different towns
- Test with pubs that have identical names AND towns with different open states
- Test case-insensitive sorting (e.g., "The Angel" vs "the moon")
- Verify alphabetical ordering is maintained

---

### 2. Reduce Sidebar Width to Prevent Horizontal Scroll
**File**: `Wetherspooning/src/components/AppSidebar.vue`  
**Location**: Line 2 (Sidebar root element)  
**Action**: Change width from 480px to 400px

**Current**:
```vue
<Sidebar collapsible="offcanvas" class="overflow-hidden [&>div]:w-[480px]">
```

**New**:
```vue
<Sidebar collapsible="offcanvas" class="overflow-hidden [&>div]:w-[400px]">
```

**Validation**:
- Check that no horizontal scrollbar appears at 400px width
- Verify progress bars (min-w-[100px]) still display correctly
- Verify visit dates and pub names don't overflow
- Test on various screen sizes (desktop, tablet)
- Ensure mobile responsiveness is not affected (uses overlay, not fixed width)

---

### 3. Reposition Location Type Icons After Pub Name
**File**: `Wetherspooning/src/components/AppSidebar.vue`  
**Location**: Lines 142-145 (pub name template)  
**Action**: Move icon spans after the pub name span

**Current**:
```vue
<span :class="['text-sm break-words flex items-center gap-1', isPubClosed(pub) ? 'text-muted-foreground' : '']">
  <span v-if="pub.isHotel" title="Hotel">🏨</span>
  <span v-if="pub.inAirport" title="Airport">✈️</span>
  <span v-if="pub.inTrainStation" title="Train Station">🚂</span>
  <span>{{ pub.name }}</span>
</span>
```

**New**:
```vue
<span :class="['text-sm break-words flex items-center gap-1', isPubClosed(pub) ? 'text-muted-foreground' : '']">
  <span>{{ pub.name }}</span>
  <span v-if="pub.isHotel" title="Hotel">🏨</span>
  <span v-if="pub.inAirport" title="Airport">✈️</span>
  <span v-if="pub.inTrainStation" title="Train Station">🚂</span>
</span>
```

**Validation**:
- Verify icons appear after name for hotel pubs
- Verify icons appear after name for airport pubs
- Verify icons appear after name for train station pubs
- Verify multiple icons display correctly when pub has multiple types
- Verify tooltips still work on icon hover
- Verify visual alignment looks good with flex gap-1

---

### 4. Manual Testing of Combined Changes
**Action**: Test all three changes together to ensure they work harmoniously

**Test Cases**:
1. **Sorting Validation**:
   - Expand multiple county groups and verify name → townCity → openState ordering
   - Find duplicate names in different towns and verify townCity secondary sort
   - Find duplicate name+town pairs and verify open appears before closed

2. **Width Validation**:
   - Open sidebar on desktop (≥1024px viewport)
   - Expand countries/counties with long pub names and visit progress
   - Verify no horizontal scrollbar appears
   - Scroll vertically to check all sections
   - Resize browser window to test at different desktop widths

3. **Icon Position Validation**:
   - Find pubs with isHotel, inAirport, inTrainStation flags
   - Verify icons appear after name in all cases
   - Verify names align consistently for easy scanning
   - Verify icons don't overlap with visit checkmarks/dates

4. **Regression Testing**:
   - Verify country/county grouping still works
   - Verify expand/collapse still works
   - Verify pub selection still works
   - Verify visit progress bars still display correctly
   - Verify mobile sidebar still works (overlay, backdrop)
   - Verify Show Closed Pubs toggle still works

---

### 5. Update Tests if Necessary
**File**: `functions/test/` (if sorting tests exist)  
**Action**: Update any tests that depend on pub ordering

**Note**: Based on current workspace structure, there are tests in `functions/test/` but they appear to be for backend services. Frontend component tests may not exist. If component tests are added in the future, ensure they validate the new sorting logic.

**Validation**:
- Run existing tests: `npm test` in `Wetherspooning/` directory
- Verify no tests fail due to ordering changes
- Add comment in code about sort order for future test authors

---

## Completion Criteria
- [ ] Pubs within counties sort by name → townCity → openState
- [ ] Case-insensitive sorting works correctly
- [ ] Open pubs appear before closed when name+town match
- [ ] Sidebar width is 400px on desktop
- [ ] No horizontal scrollbar appears in sidebar
- [ ] Location type icons appear after pub name
- [ ] All existing functionality works (expand/collapse, selection, filtering)
- [ ] Visual regression check passes (icons, alignment, spacing)
- [ ] Mobile responsiveness unaffected
- [ ] No console errors or warnings

## Estimated Effort
- Task 1 (Sorting): 15 minutes
- Task 2 (Width): 5 minutes
- Task 3 (Icons): 5 minutes
- Task 4 (Testing): 20 minutes
- Task 5 (Tests): 10 minutes
- **Total**: ~55 minutes

## Dependencies
None - all changes are isolated to AppSidebar.vue component.

## Rollback Plan
If issues arise, revert the single commit containing all three changes. The changes are purely visual/ordering and don't affect data structures or APIs.
