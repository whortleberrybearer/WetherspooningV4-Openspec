# Implementation Tasks

This document outlines the step-by-step implementation tasks for adding visit ratings and notes.

## Task List

### 1. Update Visit Data Model and Services
**Verification:** TypeScript compilation passes, no type errors

- [x] Update `Visit` interface in `useVisits.ts` to ensure `rating` and `notes` are documented
- [x] Verify `firebaseDataService.ts` Visit interface includes `rating?: number` and `notes?: string`
- [x] Update `addVisit()` in `useVisits.ts` to accept `rating` and `notes` in options parameter
- [x] Update `updateVisit()` in `useVisits.ts` to accept `rating` and `notes` in updates parameter
- [x] Add validation for rating range (1-5) in `addVisit()` and `updateVisit()`
- [x] Ensure `getVisit()` returns complete Visit object including rating and notes
- [ ] Add unit tests for rating validation (if test framework exists)

**Dependencies:** None  
**Deliverable:** Visit data model supports rating and notes fields

---

### 2. Add Rating Input to PubDetailSheet
**Verification:** Component renders rating selector, rating can be selected and saved

- [x] Import or create a StarRating component (5 clickable stars)
- [x] Add `rating` ref to PubDetailSheet component state
- [x] Add rating label "Rating (optional)" to form
- [x] Render StarRating component with 5 stars
- [x] Implement star click handler to set rating (1-5)
- [x] Implement clear/reset functionality for rating
- [x] Initialize rating from `currentVisit.value?.rating` when editing
- [x] Update `hasChanges` computed to detect rating changes
- [x] Update `handleSave()` to include rating in options/updates
- [x] Disable rating input during save operation (`isSaving`)
- [x] Add hover states for visual feedback on stars

**Dependencies:** Task 1  
**Deliverable:** Users can select and save 1-5 star ratings

---

### 3. Add Notes Input to PubDetailSheet
**Verification:** Component renders textarea, notes can be entered and saved

- [x] Add `notes` ref to PubDetailSheet component state
- [x] Add notes label "Notes (optional)" to form
- [x] Render Textarea component from shadcn/vue
- [x] Set placeholder: "Add your thoughts about this visit..."
- [x] Set minimum rows to 3-4 for textarea
- [x] Implement character limit (500 characters) with validation
- [x] Add character counter display "X / 500"
- [x] Initialize notes from `currentVisit.value?.notes` when editing
- [x] Update `hasChanges` computed to detect notes changes
- [x] Update `handleSave()` to include notes in options/updates
- [x] Trim leading/trailing whitespace before saving
- [x] Disable notes input during save operation (`isSaving`)

**Dependencies:** Task 1  
**Deliverable:** Users can add and save notes up to 500 characters

---

### 4. Update PubDetailSheet Layout
**Verification:** Form layout is clean and well-organized

- [x] Adjust form layout to accommodate new fields
- [x] Ensure consistent spacing between fields (visit date, rating, notes, buttons)
- [x] Verify form remains within dialog height constraints
- [x] Test responsive behavior on mobile/small screens
- [x] Ensure tab order is logical (date → rating → notes → buttons)
- [x] Add appropriate `grid gap` values for spacing

**Dependencies:** Tasks 2, 3  
**Deliverable:** Form layout is clean and user-friendly

---

### 5. Display Rating in InfoWindow Visited Badge
**Verification:** Rating stars appear in visited badge when rating exists

- [x] Read current visit data in InfoWindow rendering logic
- [x] Modify visited badge text generation to include rating stars
- [x] Format rating as filled stars (★) and empty stars (☆)
- [x] Example formats:
  - With date and rating: "✓ Visited 25/12/25 ★★★★☆"
  - Without date but rating: "✓ Visited ★★★★★"
  - Without rating: "✓ Visited 25/12/25" (existing)
- [x] Use Unicode star characters: ★ (U+2605) for filled, ☆ (U+2606) for empty
- [x] Ensure badge width accommodates stars without overflow
- [x] Test badge appearance with all rating values (1-5)

**Dependencies:** Task 1  
**Deliverable:** Visited badges display rating stars when available

---

### 6. Display Notes Preview in InfoWindow
**Verification:** Notes preview appears below badges when notes exist

- [x] Add notes preview section to InfoWindow content structure
- [x] Insert preview between badges and website link in layout order
- [x] Truncate notes to first 100 characters if longer than 100
- [x] Add "..." ellipsis for truncated notes
- [x] Apply muted text color (e.g., text-muted-foreground)
- [x] Use smaller font size (11-12px)
- [x] Add subtle background or border for visual separation
- [x] Add appropriate spacing (8-12px) from badges
- [x] Only render preview when notes exist and are non-empty
- [x] Test with short notes (< 100 chars) and long notes (> 100 chars)

**Dependencies:** Task 1  
**Deliverable:** Notes preview displays in InfoWindow when notes exist

---

### 7. Update InfoWindow Layout with Rating and Notes
**Verification:** InfoWindow layout remains clean and readable with new content

- [x] Verify content order: image → name → badges → notes → link → button
- [x] Ensure total InfoWindow height remains reasonable (< 450px)
- [x] Test layout with:
  - All fields present (image, date, rating, notes, link)
  - Only rating (no notes)
  - Only notes (no rating)
  - Neither rating nor notes
- [x] Verify spacing is consistent (8px grid)
- [x] Ensure no scrolling required for typical content
- [x] Test on mobile/small screens for responsiveness

**Dependencies:** Tasks 5, 6  
**Deliverable:** InfoWindow layout is clean with all visit details

---

### 8. Testing and Validation
**Verification:** All features work correctly across scenarios

- [x] Test creating new visit with all fields (date, rating, notes)
- [x] Test creating visit with only rating
- [x] Test creating visit with only notes
-[x] Test creating visit with no optional fields
- [x] Test updating existing visit to add rating and notes
- [x] Test updating existing visit to change rating and notes
- [x] Test updating existing visit to clear rating and notes
- [x] Test removing visit with rating and notes
- [x] Test rating validation (reject < 1 or > 5)
- [x] Test notes character limit (500 chars)
- [x] Test InfoWindow display with various combinations
- [x] Test unauthenticated user experience (no changes)
- [x] Verify Firestore persistence of rating and notes
- [x] Check TypeScript compilation passes
- [x] Run `npm run type-check` to verify no type errors

**Dependencies:** Tasks 1-7  
**Deliverable:** All features tested and working correctly

---

### 9. Update Documentation (Optional)
**Verification:** Documentation reflects new features

- [ ] Update README if visit features are documented
- [ ] Update inline code comments for rating/notes fields
- [ ] Document rating star format in InfoWindow code comments

**Dependencies:** Task 8  
**Deliverable:** Code documentation is current

## Implementation Notes

- **Parallel Work:** Tasks 2 and 3 can be implemented in parallel (both modify PubDetailSheet)
- **Parallel Work:** Tasks 5 and 6 can be implemented in parallel (both modify InfoWindow)
- **Sequencing:** Complete Task 1 before starting UI tasks (2-7)
- **Sequencing:** Complete Task 4 after Tasks 2-3 to finalize layout
- **Sequencing:** Complete Task 7 after Tasks 5-6 to finalize InfoWindow

## Testing Strategy

- **Manual Testing:** Primary validation method for UI/UX features
- **Type Checking:** Run `npm run type-check` after each task
- **Browser Testing:** Test in development with Firebase emulator
- **Cross-browser:** Verify in Chrome, Firefox, Safari (if available)
- **Responsive:** Test on mobile viewport sizes

## Validation Criteria

- All TypeScript compilation passes
- No console errors in browser
- Rating stars render correctly
- Notes textarea enforces character limit
- InfoWindow displays rating and notes appropriately
- All existing visit features continue to work
- Unauthenticated users see no changes
