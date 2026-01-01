# Proposal: Simplify User Profile Menu

## Change Metadata
- **Change ID:** `2026-01-01-simplify-user-profile-menu`
- **Status:** Proposed
- **Created:** 2026-01-01
- **Author:** AI Assistant
- **Type:** Enhancement

## Summary
Simplify the user profile menu by moving the logout action next to the user details and removing the dropdown menu, creating a cleaner, more direct logout experience.

## Motivation
The current user profile menu uses a dropdown with only one action (Logout). This adds unnecessary UI complexity and interaction steps when the sole purpose is to log out. By placing the logout action directly next to the user information, we:
- Reduce clicks (from 2 to 1)
- Simplify the visual hierarchy
- Remove unused dropdown infrastructure
- Make the logout action more discoverable

## Context
Currently in [AppSidebar.vue](Wetherspooning/src/components/AppSidebar.vue#L244-L275), the authenticated user sees:
- User avatar with username and email in a DropdownMenuTrigger
- Clicking opens a DropdownMenuContent with a single "Logout" item

Since there are no other menu items and the extensibility requirement (REQ-UPM-004) shows only future disabled placeholders, the dropdown is overhead for a single action.

## Scope
This change affects:
- **user-profile-menu** specification
- [AppSidebar.vue](Wetherspooning/src/components/AppSidebar.vue) implementation

## Goals
1. Replace dropdown menu with inline logout button
2. Maintain clear visual hierarchy (user info + logout action)
3. Preserve all existing functionality (logout capability)
4. Keep responsive design intact
5. Maintain shadcn/vue component usage where appropriate

## Non-Goals
- Adding new user profile actions
- Changing authentication logic
- Modifying other parts of the sidebar
- Redesigning the entire footer

## Alternatives Considered
1. **Keep dropdown, add more items**: Would require implementing features that don't exist yet (Preferences, Change Password, etc.)
2. **Icon-only logout button**: Less accessible and discoverable
3. **Separate logout button in toolbar**: Would break the logical grouping with user info

## Dependencies
- None (self-contained UI change)

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Future features need dropdown | Medium | Can restore dropdown when 2+ actions exist |
| Users expect dropdown pattern | Low | Direct action is simpler and common in modern UIs |
| Mobile interaction issues | Low | Ensure touch targets meet accessibility standards |

## Rollout Plan
1. Update user-profile-menu spec to reflect new design
2. Modify AppSidebar.vue to remove dropdown components
3. Test on desktop and mobile viewports
4. Verify logout functionality preserved

## Success Criteria
- Logout button visible next to user details
- Clicking logout button successfully logs user out
- No dropdown menu present
- Visual design consistent with application style
- Mobile responsive (touch targets ≥ 44x44px)
