# Tasks: Enhance InfoWindow Display

## Implementation Tasks

### 1. Update InfoWindow HTML Structure ✓
**Estimated Effort:** 30 minutes  
**Dependencies:** None
**Status:** COMPLETED

Update the `showPubInfo` function in PubLocationsMap.vue to generate Card-style HTML structure with proper semantic elements and class names.

**Steps:**
- [x] Refactor InfoWindow HTML generation to use cleaner structure
- [x] Apply Card-style container with white background, rounded corners, and shadow
- [x] Structure content vertically: image → name → details → button
- [x] Use consistent padding and spacing values

**Validation:**
- [x] Visual inspection shows Card-style layout
- [x] HTML structure is clean and semantic
- [x] TypeScript compilation passes

---

### 2. Enhance Image Display Section ✓
**Estimated Effort:** 20 minutes  
**Dependencies:** Task 1
**Status:** COMPLETED

Update image rendering in InfoWindow to include rounded corners, proper sizing, and conditional attribution text.

**Steps:**
- [x] Apply rounded corners (border-radius: 8px) to image
- [x] Set image container to full width with max-height constraint
- [x] Use object-fit: cover for proper aspect ratio
- [x] Add conditional logic for JD Wetherspoon attribution based on imageUrl
- [x] Style attribution text with small font and muted color

**Validation:**
- [x] Images display with rounded corners at top of InfoWindow
- [x] Images maintain aspect ratio without distortion
- [x] Attribution appears only for jdwetherspoon.com URLs
- [x] No image section when imageUrl is missing

---

### 3. Update Pub Name and Address Styling ✓
**Estimated Effort:** 15 minutes  
**Dependencies:** Task 1
**Status:** COMPLETED

Enhance typography and styling for pub name and address to match Card design patterns.

**Steps:**
- [x] Apply heading styles to pub name (16-18px, semibold weight)
- [x] Set address text to 14px with muted color
- [x] Add proper spacing between name and address
- [x] Ensure full address is visible without truncation

**Validation:**
- [x] Pub name displays prominently as heading
- [x] Address is readable with proper hierarchy
- [x] Spacing creates clear visual separation

---

### 4. Refine Badge Display ✓
**Estimated Effort:** 25 minutes  
**Dependencies:** Task 1
**Status:** COMPLETED

Update badge HTML/CSS to match shadcn/vue Badge component design with proper colors, spacing, and visit date formatting.

**Steps:**
- [x] Apply Badge component styling to status and visit badges
- [x] Use green background (bg-green-500) for Open badge, red for Closed
- [x] Add checkmark (✓) to Visited badge
- [x] Format visit date as DD/MM/YY using JavaScript Date methods
- [x] Position badges horizontally with 8px gap
- [x] Use 12px font size and semibold weight for badge text

**Validation:**
- [x] Status badge displays with correct color based on openState
- [x] Visited badge shows formatted date when available
- [x] Badges are horizontally aligned with consistent spacing
- [x] Badge styling matches shadcn/vue Badge component

---

### 5. Update Website Link Styling ✓
**Estimated Effort:** 10 minutes  
**Dependencies:** Task 1
**Status:** COMPLETED

Enhance website link styling and ensure security attributes are properly set.

**Steps:**
- [x] Apply primary color to link text
- [x] Add hover underline effect
- [x] Verify target="_blank" and rel="noopener noreferrer" attributes
- [x] Set font size to match body text (14px)
- [x] Position link between badges and button

**Validation:**
- [x] Link displays with primary color
- [x] Link underlines on hover
- [x] Link opens in new tab with proper security attributes
- [x] Link is omitted when pub.url is missing

---

### 6. Implement Authentication-Aware Button Logic ✓
**Estimated Effort:** 30 minutes  
**Dependencies:** Task 1, useAuth composable, useVisits composable
**Status:** COMPLETED

Update button display logic to show different text and actions based on authentication and visit status.

**Steps:**
- [x] Check isAuthenticated from useAuth composable
- [x] Check isVisited status from useVisits composable  
- [x] Set button text to "Visit" when authenticated and not visited
- [x] Set button text to "Update Visit" when authenticated and visited
- [x] Set button text to "Sign in to track visit" when not authenticated
- [x] Apply full width and primary button styling
- [x] Update click handler to open LoginDialog when not authenticated
- [x] Maintain existing PubDetailSheet behavior for authenticated users

**Validation:**
- [x] Button text changes based on authentication state
- [x] Button text changes based on visit status
- [x] "Sign in to track visit" opens LoginDialog
- [x] "Visit"/"Update Visit" opens PubDetailSheet
- [x] Button styling matches primary Button component

---

### 7. Add Responsive Layout Constraints ✓
**Estimated Effort:** 15 minutes  
**Dependencies:** Task 1
**Status:** COMPLETED

Add CSS media queries and constraints to ensure InfoWindow displays well on mobile and desktop.

**Steps:**
- [x] Set minimum width to 250px
- [x] Set maximum width to 400-500px
- [x] Ensure text sizing is readable on small screens (minimum 14px)
- [x] Verify button height meets 44px minimum for touch targets
- [x] Test on mobile viewport sizes

**Validation:**
- [x] InfoWindow width is appropriate for mobile screens (< 450px)
- [x] InfoWindow width is constrained on desktop screens
- [x] Text remains readable on all screen sizes
- [x] Touch targets are accessible on mobile

---

### 8. Verify Accessibility Standards ✓
**Estimated Effort:** 20 minutes  
**Dependencies:** Task 1-6
**Status:** COMPLETED

Audit InfoWindow HTML for accessibility compliance and make necessary adjustments.

**Steps:**
- [x] Use semantic HTML heading for pub name
- [x] Add ARIA labels to external link if needed
- [x] Verify button has accessible label
- [x] Check color contrast meets WCAG AA (4.5:1)
- [x] Test keyboard navigation (Tab, Enter, Space)
- [x] Verify focus indicators are visible

**Validation:**
- [x] Screen reader announces content correctly
- [x] Keyboard navigation works for all interactive elements
- [x] Focus indicators are visible and clear
- [x] Color contrast passes WCAG AA standards

---

### 9. Test InfoWindow Interactions ✓
**Estimated Effort:** 20 minutes  
**Dependencies:** Task 1-8
**Status:** COMPLETED

Perform comprehensive testing of InfoWindow functionality across scenarios.

**Steps:**
- [x] Test InfoWindow with authenticated user on visited pub
- [x] Test InfoWindow with authenticated user on unvisited pub
- [x] Test InfoWindow with unauthenticated user
- [x] Test InfoWindow with pub that has image
- [x] Test InfoWindow with pub that has no image
- [x] Test InfoWindow with pub that has JD Wetherspoon image
- [x] Test InfoWindow with pub that has external image
- [x] Test button clicks (PubDetailSheet and LoginDialog)
- [x] Test website link click
- [x] Test on mobile and desktop viewports

**Validation:**
- [x] All content displays correctly in each scenario
- [x] Buttons trigger correct actions
- [x] Website link opens in new tab
- [x] Layout is responsive across screen sizes
- [x] No console errors or TypeScript issues

---

### 10. Verify No Regressions ✓
**Estimated Effort:** 15 minutes  
**Dependencies:** Task 9
**Status:** COMPLETED

Ensure InfoWindow changes don't break existing functionality.

**Steps:**
- [x] Verify marker clicks still open InfoWindow
- [x] Verify InfoWindow positioning is correct relative to marker
- [x] Verify InfoWindow close button works (native Google Maps close)
- [x] Verify proximity visit prompt still works independently
- [x] Run TypeScript type-check
- [x] Test with Firebase emulator

**Validation:**
- [x] Marker interactions work as before
- [x] InfoWindow opens at correct position
- [x] InfoWindow can be closed
- [x] Proximity prompt functionality unchanged
- [x] TypeScript compilation passes
- [x] No Firebase integration issues

---

## Summary
**Total Estimated Effort:** ~3.5 hours  
**Actual Effort:** ~30 minutes  
**Critical Path:** Tasks 1 → 2-6 → 7-8 → 9 → 10  
**Parallelizable Work:** Tasks 2-6 can be worked on in parallel after Task 1 is complete
**Status:** ALL TASKS COMPLETED ✓
