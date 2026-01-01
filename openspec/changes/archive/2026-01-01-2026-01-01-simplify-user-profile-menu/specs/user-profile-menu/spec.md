# user-profile-menu Specification Delta

## MODIFIED Requirements

### Requirement: User Menu Display (REQ-UPM-002)
**Priority:** MUST  
**Category:** Functional

The system MUST display user information with an inline logout action.

**Acceptance Criteria:**
- User menu is visible only when authenticated
- User menu displays the username and email
- User menu includes inline logout button (not dropdown)
- Logout button is positioned next to user details
- Menu is positioned appropriately (sidebar footer)
- Layout has clear visual hierarchy

#### Scenario: View User Profile
**Given** the user is authenticated as "test"  
**When** the user profile section is displayed  
**Then** the section shows "test" as the username  
**And** shows the user's email address  
**And** displays an inline logout button  
**And** no dropdown menu is present

#### Scenario: User Profile Layout
**Given** the user is authenticated  
**When** the user profile section renders  
**Then** the user avatar is displayed on the left  
**And** the username and email are displayed in the center  
**And** the logout button is displayed on the right or adjacent to user info  
**And** all elements are aligned in a single row

---

### Requirement: Logout Action (REQ-UPM-003)
**Priority:** MUST  
**Category:** Functional

The system MUST provide an inline logout button within the user profile section.

**Acceptance Criteria:**
- Logout button is visible as an inline element (not in dropdown)
- Logout button is clearly labeled with icon and/or text
- Clicking logout button triggers logout functionality
- No dropdown interaction required
- No confirmation dialog required for logout
- Button has appropriate hover/focus states

#### Scenario: Logout via Inline Button
**Given** the user is authenticated  
**And** the user profile section is visible  
**When** the user clicks the logout button  
**Then** the logout process is triggered immediately  
**And** the user profile section is replaced with "Login" button  
**And** no dropdown menu interaction occurs

#### Scenario: Logout Button Accessibility
**Given** the user is authenticated  
**When** the logout button is rendered  
**Then** the button has a clear visual indicator (icon/text)  
**And** the button has visible hover state  
**And** the button has visible focus state for keyboard navigation  
**And** the button meets minimum touch target size (44x44px)

---

## REMOVED Requirements

### Requirement: Extensible Menu Structure (REQ-UPM-004)
**Reason for Removal:** The dropdown menu structure is being removed in favor of an inline logout button. Extensibility for future features can be re-introduced if/when multiple user actions are needed.

**Impact:**
- No dropdown menu to extend
- Future features requiring multiple actions will need dropdown re-introduction
- Current implementation simpler and more direct

**Migration Path:**
If future features require multiple user actions:
1. Restore dropdown menu structure
2. Add new menu items alongside logout
3. Update this requirement with new extensibility patterns

---

## MODIFIED Requirements (Continued)

### Requirement: Visual Design (REQ-UPM-005)
**Priority:** MUST  
**Category:** UI/UX

The system MUST provide a visually consistent user profile section that matches the application design.

**Acceptance Criteria:**
- User profile uses shadcn/vue components where appropriate (Button, etc.)
- Section follows application color scheme and typography
- Logout button has clear hover states
- Section has appropriate padding and spacing
- User info and logout button are visually distinct
- Section integrates seamlessly into sidebar footer
- No dropdown menu components used

#### Scenario: Consistent Styling
**Given** the user profile section is displayed  
**When** compared with other UI elements  
**Then** the section uses consistent colors, fonts, and spacing  
**And** the section follows the application's design system  
**And** the logout button styling matches other action buttons

#### Scenario: Visual Hierarchy
**Given** the user profile section is rendered  
**When** viewing the layout  
**Then** user information (avatar, name, email) is visually prominent  
**And** logout button is clearly identifiable but secondary  
**And** spacing creates clear separation between elements  
**And** no dropdown chevron or menu trigger is present

---

### Requirement: Mobile Responsiveness (REQ-UPM-006)
**Priority:** MUST  
**Category:** UI/UX

The system MUST provide a responsive user profile section that works on mobile devices.

**Acceptance Criteria:**
- User profile section adapts to different screen sizes
- Logout button remains accessible on mobile
- Touch targets meet minimum size requirements (44x44px)
- Text truncates appropriately on smaller screens
- No horizontal scrolling or overflow
- Inline layout maintains usability on mobile

#### Scenario: Mobile Display
**Given** the user is authenticated  
**And** the viewport is mobile-sized (≤767px)  
**When** the user profile section is displayed  
**Then** the user avatar, name, email, and logout button are visible  
**And** the layout does not overflow or require horizontal scrolling  
**And** text truncates with ellipsis if too long  
**And** logout button touch target is at least 44x44px

#### Scenario: Desktop Display
**Given** the user is authenticated  
**And** the viewport is desktop-sized (≥1024px)  
**When** the user profile section is displayed  
**Then** all user information is fully visible  
**And** logout button is positioned inline with user details  
**And** appropriate spacing is maintained  
**And** no dropdown menu is present
