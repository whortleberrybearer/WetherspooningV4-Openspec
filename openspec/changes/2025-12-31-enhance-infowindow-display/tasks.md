# Tasks: Enhance InfoWindow Display

## Implementation Tasks

### 1. Update InfoWindow HTML Structure
**Estimated Effort:** 30 minutes  
**Dependencies:** None

Update the `showPubInfo` function in PubLocationsMap.vue to generate Card-style HTML structure with proper semantic elements and class names.

**Steps:**
- Refactor InfoWindow HTML generation to use cleaner structure
- Apply Card-style container with white background, rounded corners, and shadow
- Structure content vertically: image → name → details → button
- Use consistent padding and spacing values

**Validation:**
- Visual inspection shows Card-style layout
- HTML structure is clean and semantic
- TypeScript compilation passes

---

### 2. Enhance Image Display Section
**Estimated Effort:** 20 minutes  
**Dependencies:** Task 1

Update image rendering in InfoWindow to include rounded corners, proper sizing, and conditional attribution text.

**Steps:**
- Apply rounded corners (border-radius: 8px) to image
- Set image container to full width with max-height constraint
- Use object-fit: cover for proper aspect ratio
- Add conditional logic for JD Wetherspoon attribution based on imageUrl
- Style attribution text with small font and muted color

**Validation:**
- Images display with rounded corners at top of InfoWindow
- Images maintain aspect ratio without distortion
- Attribution appears only for jdwetherspoon.com URLs
- No image section when imageUrl is missing

---

### 3. Update Pub Name and Address Styling
**Estimated Effort:** 15 minutes  
**Dependencies:** Task 1

Enhance typography and styling for pub name and address to match Card design patterns.

**Steps:**
- Apply heading styles to pub name (16-18px, semibold weight)
- Set address text to 14px with muted color
- Add proper spacing between name and address
- Ensure full address is visible without truncation

**Validation:**
- Pub name displays prominently as heading
- Address is readable with proper hierarchy
- Spacing creates clear visual separation

---

### 4. Refine Badge Display
**Estimated Effort:** 25 minutes  
**Dependencies:** Task 1

Update badge HTML/CSS to match shadcn/vue Badge component design with proper colors, spacing, and visit date formatting.

**Steps:**
- Apply Badge component styling to status and visit badges
- Use green background (bg-green-500) for Open badge, red for Closed
- Add checkmark (✓) to Visited badge
- Format visit date as DD/MM/YY using JavaScript Date methods
- Position badges horizontally with 8px gap
- Use 12px font size and semibold weight for badge text

**Validation:**
- Status badge displays with correct color based on openState
- Visited badge shows formatted date when available
- Badges are horizontally aligned with consistent spacing
- Badge styling matches shadcn/vue Badge component

---

### 5. Update Website Link Styling
**Estimated Effort:** 10 minutes  
**Dependencies:** Task 1

Enhance website link styling and ensure security attributes are properly set.

**Steps:**
- Apply primary color to link text
- Add hover underline effect
- Verify target="_blank" and rel="noopener noreferrer" attributes
- Set font size to match body text (14px)
- Position link between badges and button

**Validation:**
- Link displays with primary color
- Link underlines on hover
- Link opens in new tab with proper security attributes
- Link is omitted when pub.url is missing

---

### 6. Implement Authentication-Aware Button Logic
**Estimated Effort:** 30 minutes  
**Dependencies:** Task 1, useAuth composable, useVisits composable

Update button display logic to show different text and actions based on authentication and visit status.

**Steps:**
- Check isAuthenticated from useAuth composable
- Check isVisited status from useVisits composable  
- Set button text to "Visit" when authenticated and not visited
- Set button text to "Update Visit" when authenticated and visited
- Set button text to "Sign in to track visit" when not authenticated
- Apply full width and primary button styling
- Update click handler to open LoginDialog when not authenticated
- Maintain existing PubDetailSheet behavior for authenticated users

**Validation:**
- Button text changes based on authentication state
- Button text changes based on visit status
- "Sign in to track visit" opens LoginDialog
- "Visit"/"Update Visit" opens PubDetailSheet
- Button styling matches primary Button component

---

### 7. Add Responsive Layout Constraints
**Estimated Effort:** 15 minutes  
**Dependencies:** Task 1

Add CSS media queries and constraints to ensure InfoWindow displays well on mobile and desktop.

**Steps:**
- Set minimum width to 250px
- Set maximum width to 400-500px
- Ensure text sizing is readable on small screens (minimum 14px)
- Verify button height meets 44px minimum for touch targets
- Test on mobile viewport sizes

**Validation:**
- InfoWindow width is appropriate for mobile screens (< 450px)
- InfoWindow width is constrained on desktop screens
- Text remains readable on all screen sizes
- Touch targets are accessible on mobile

---

### 8. Verify Accessibility Standards
**Estimated Effort:** 20 minutes  
**Dependencies:** Task 1-6

Audit InfoWindow HTML for accessibility compliance and make necessary adjustments.

**Steps:**
- Use semantic HTML heading for pub name
- Add ARIA labels to external link if needed
- Verify button has accessible label
- Check color contrast meets WCAG AA (4.5:1)
- Test keyboard navigation (Tab, Enter, Space)
- Verify focus indicators are visible

**Validation:**
- Screen reader announces content correctly
- Keyboard navigation works for all interactive elements
- Focus indicators are visible and clear
- Color contrast passes WCAG AA standards

---

### 9. Test InfoWindow Interactions
**Estimated Effort:** 20 minutes  
**Dependencies:** Task 1-8

Perform comprehensive testing of InfoWindow functionality across scenarios.

**Steps:**
- Test InfoWindow with authenticated user on visited pub
- Test InfoWindow with authenticated user on unvisited pub
- Test InfoWindow with unauthenticated user
- Test InfoWindow with pub that has image
- Test InfoWindow with pub that has no image
- Test InfoWindow with pub that has JD Wetherspoon image
- Test InfoWindow with pub that has external image
- Test button clicks (PubDetailSheet and LoginDialog)
- Test website link click
- Test on mobile and desktop viewports

**Validation:**
- All content displays correctly in each scenario
- Buttons trigger correct actions
- Website link opens in new tab
- Layout is responsive across screen sizes
- No console errors or TypeScript issues

---

### 10. Verify No Regressions
**Estimated Effort:** 15 minutes  
**Dependencies:** Task 9

Ensure InfoWindow changes don't break existing functionality.

**Steps:**
- Verify marker clicks still open InfoWindow
- Verify InfoWindow positioning is correct relative to marker
- Verify InfoWindow close button works (native Google Maps close)
- Verify proximity visit prompt still works independently
- Run TypeScript type-check
- Test with Firebase emulator

**Validation:**
- Marker interactions work as before
- InfoWindow opens at correct position
- InfoWindow can be closed
- Proximity prompt functionality unchanged
- TypeScript compilation passes
- No Firebase integration issues

---

## Summary
**Total Estimated Effort:** ~3.5 hours  
**Critical Path:** Tasks 1 → 2-6 → 7-8 → 9 → 10  
**Parallelizable Work:** Tasks 2-6 can be worked on in parallel after Task 1 is complete
