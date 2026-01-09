# Implementation Tasks

## 1. Update Scraper for Reopening State
**Priority:** High  
**Scope:** Backend (functions)

- [ ] Update `extractOpenState()` in `pubScraperService.ts` to detect "Reopening" text pattern
- [ ] Parse reopening date from sibling `<p class="opening-closing-time">` element
- [ ] Format date as "Reopening dd/MM/yyyy" to match existing pattern
- [ ] Add test case for "Reopening Monday 12 January 2026" HTML fixture
- [ ] Validate scraper handles edge cases (missing dates, invalid date formats)

**Files:**
- `functions/src/services/pubScraperService.ts`
- `functions/test/services/pubScraperService.test.ts`

**Validation:** Run scraper tests and verify the-clairville-sample.html produces "Reopening 12/01/2026"

---

## 2. Refine Closed Pub Detection Logic
**Priority:** High  
**Scope:** Frontend (components/composables)

- [ ] Create `isPermanentlyClosed()` helper that checks `openState === 'Closed'` (exact match)
- [ ] Update `isPubClosed()` in AppSidebar.vue to use exact match
- [ ] Update `isPubClosed()` in PubSidebar.vue to use exact match
- [ ] Update isClosed checks in PubLocationsMap.vue (3 locations)
- [ ] Update PubDetailSheet.vue closed detection

**Files:**
- `Wetherspooning/src/components/AppSidebar.vue`
- `Wetherspooning/src/components/PubSidebar.vue` 
- `Wetherspooning/src/views/PubLocationsMap.vue`
- `Wetherspooning/src/components/PubDetailSheet.vue`

**Validation:** Test with mix of Open, Closed, Temporarily Closed, Opening Soon, and Reopening pubs

---

## 3. Fix Pub Counts
**Priority:** High  
**Scope:** Frontend (components)

- [ ] Update total pub count logic to exclude only permanently closed (`openState === 'Closed'`)
- [ ] Update "that are now closed" count to only count permanently closed pubs
- [ ] Update sidebar group counts to exclude only permanently closed
- [ ] Verify counts update correctly when toggling "Show Closed Pubs"

**Files:**
- `Wetherspooning/src/components/AppSidebar.vue` (allTimeStats computed)
- `Wetherspooning/src/components/PubSidebar.vue` (if similar logic exists)

**Validation:** Verify counts with test data containing all state types

---

## 4. Add State Badges to Pub Detail Sheet
**Priority:** Medium  
**Scope:** Frontend (components)

- [ ] Add Badge component to PubDetailSheet template near pub name
- [ ] Show openState value with appropriate color coding:
  - Open: Green badge
  - Closed: Red badge  
  - Temporarily Closed: Orange badge
  - Opening Soon: Blue badge
  - Reopening: Purple badge
- [ ] Only show badge when openState is not "Open"
- [ ] Position badge appropriately in dialog header

**Files:**
- `Wetherspooning/src/components/PubDetailSheet.vue`

**Validation:** Test each state type renders with correct color and text

---

## 5. Enhance Map Marker Visual Differentiation
**Priority:** Medium  
**Scope:** Frontend (views)

- [ ] Update marker badge logic to show different styles for non-open states
- [ ] Add visual indicators for:
  - Temporarily Closed: Orange badge
  - Opening Soon: Blue badge
  - Reopening: Purple badge with date
- [ ] Maintain existing red badge for permanently closed
- [ ] Update infowindow to show state badge

**Files:**
- `Wetherspooning/src/views/PubLocationsMap.vue`

**Validation:** Verify map shows differentiated markers for each state type

---

## 6. Update Tests and Documentation
**Priority:** Medium  
**Scope:** Tests, Specs

- [ ] Add/update test fixtures with various opening states
- [ ] Update getPubs.test.ts with new state scenarios
- [ ] Verify spec delta requirements are met
- [ ] Add manual test scenarios document

**Files:**
- `functions/test/fixtures/*.html`
- `functions/test/callable/getPubs.test.ts`
- `functions/test/services/pubScraperService.test.ts`

**Validation:** All tests pass, coverage maintained

---

## Dependencies
- Task 2 depends on Task 1 (need correct states to filter)
- Task 3 depends on Task 2 (need correct filtering to count)
- Task 4 can be done in parallel with Tasks 2-3
- Task 5 depends on Task 2

## Parallelizable Work
- Tasks 1 and 4 can be done simultaneously
- Tasks 2 and 3 should be done together as they're tightly coupled
