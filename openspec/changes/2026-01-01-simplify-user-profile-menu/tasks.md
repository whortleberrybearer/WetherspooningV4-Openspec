# Tasks: Simplify User Profile Menu

## Overview
Replace the user profile dropdown menu with an inline logout button positioned next to the user details.

## Task List

### 1. Update user-profile-menu Specification
**Priority:** High  
**Estimated Effort:** 15 minutes

Update [openspec/specs/user-profile-menu/spec.md](openspec/specs/user-profile-menu/spec.md) to reflect simplified design:
- MODIFY REQ-UPM-002 (User Menu Display) to remove dropdown requirement
- MODIFY REQ-UPM-003 (Logout Action) to specify inline button instead of menu item
- REMOVE REQ-UPM-004 (Extensible Menu Structure) as no longer applicable
- Update scenarios to reflect new interaction pattern

**Validation:**
- All modified scenarios still have clear Given/When/Then structure
- Requirements align with new design
- No references to dropdown menu remain

---

### 2. Refactor AppSidebar User Profile Section
**Priority:** High  
**Estimated Effort:** 20 minutes

Modify [AppSidebar.vue](Wetherspooning/src/components/AppSidebar.vue#L244-L275) to implement new layout:
- Remove `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` components
- Replace with inline button layout: user info on left, logout button on right
- Keep user avatar, username, and email display
- Add logout button with icon next to user details
- Ensure proper spacing and alignment

**Validation:**
- User info displays correctly (avatar, username, email)
- Logout button positioned inline, not in dropdown
- Clicking logout button triggers logout
- No console errors
- Visual hierarchy clear and consistent

---

### 3. Clean Up Component Imports
**Priority:** Medium  
**Estimated Effort:** 5 minutes

Remove unused dropdown imports from [AppSidebar.vue](Wetherspooning/src/components/AppSidebar.vue):
- Remove `DropdownMenu` from imports
- Remove `DropdownMenuContent` from imports
- Remove `DropdownMenuItem` from imports
- Remove `DropdownMenuTrigger` from imports
- Keep only required sidebar components

**Validation:**
- TypeScript type checking passes (`npm run type-check`)
- No unused import warnings
- Component still renders correctly

---

### 4. Test Responsive Behavior
**Priority:** High  
**Estimated Effort:** 10 minutes

Verify the new layout works across different viewports:
- Test on desktop (≥1024px)
- Test on tablet (768px-1023px)
- Test on mobile (320px-767px)
- Verify touch targets meet minimum size (44x44px)
- Check text truncation works properly

**Validation:**
- Logout button accessible on all screen sizes
- User email truncates appropriately on smaller screens
- No layout overflow or breaking
- Touch targets meet accessibility standards

---

### 5. Verify Authentication Flow
**Priority:** High  
**Estimated Effort:** 5 minutes

Test complete authentication flow:
- Login → verify user profile displays with logout button
- Click logout → verify returns to login button state
- Login again → verify profile reappears correctly

**Validation:**
- Logout button only visible when authenticated
- Clicking logout successfully logs out user
- UI updates immediately after logout
- No errors in browser console

---

## Dependencies
- Task 2 depends on Task 1 (spec must be updated before implementation)
- Task 3 depends on Task 2 (imports cleaned after refactor)
- Tasks 4-5 can run in parallel after Task 2-3 complete

## Total Estimated Time
~55 minutes

## Definition of Done
- [x] user-profile-menu spec updated and validated
- [x] AppSidebar.vue refactored with inline logout button
- [x] Dropdown imports removed
- [x] TypeScript type checking passes
- [x] Logout functionality verified
- [x] Responsive design tested on mobile, tablet, desktop
- [x] No console errors or warnings
- [x] `npx openspec validate 2026-01-01-simplify-user-profile-menu --strict` passes
