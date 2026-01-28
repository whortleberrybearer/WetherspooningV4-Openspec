# visit-privacy-settings Specification

## Purpose
TBD - created by archiving change 2026-01-21-add-visit-sharing. Update Purpose after archive.
## Requirements
### Requirement: Privacy Toggle UI (REQ-VPS-001)
**Priority:** MUST  
**Category:** UI/UX

The system MUST provide a toggle control in Account Settings to enable or disable public sharing of visits.

**Acceptance Criteria:**
- Privacy toggle appears in Account Settings dialog
- Toggle labeled "Make my visits public"
- Toggle positioned below email display, above Delete Account button
- Toggle shows current state (on = public, off = private)
- Toggle is keyboard accessible (Tab to focus, Space to toggle)
- Toggle uses shadcn/vue Switch component
- Helper text explains what public means: "Allow others to view your visit history via a shareable link. Notes will remain private."
- Toggle state updates immediately on click
- Loading state shown while saving to Firestore
- Error message if save fails

#### Scenario: Display Privacy Toggle
**Given** an authenticated user opens Account Settings  
**Then** the dialog displays "Make my visits public" toggle  
**And** toggle is below email address  
**And** toggle is above "Delete Account" button  
**And** helper text reads "Allow others to view your visit history via a shareable link. Notes will remain private."

#### Scenario: Toggle Privacy to Public
**Given** an authenticated user "lisa" has `visitsPublic: false`  
**And** Account Settings dialog is open  
**When** lisa clicks the toggle to enable  
**Then** toggle switches to on state  
**And** system updates Firestore `users/lisa-uid/visitsPublic = true`  
**And** shareable URL is displayed below toggle

#### Scenario: Toggle Privacy to Private
**Given** an authenticated user "mark" has `visitsPublic: true`  
**And** Account Settings dialog is open  
**When** mark clicks the toggle to disable  
**Then** toggle switches to off state  
**And** system updates Firestore `users/mark-uid/visitsPublic = false`  
**And** shareable URL is hidden  
**And** a confirmation message appears: "Your visits are now private"

---

### Requirement: Shareable URL Display (REQ-VPS-002)
**Priority:** MUST  
**Category:** UI/UX

The system MUST display the shareable URL when visits are public and provide copy functionality.

**Acceptance Criteria:**
- Shareable URL appears below toggle when `visitsPublic: true`
- URL format: `https://wetherspooning.app/visits/@{username}` (domain may vary by environment)
- URL is displayed in read-only input field or code block
- Copy button adjacent to URL
- Clicking copy button copies full URL to clipboard
- Success feedback after copying: "Link copied!"
- URL hidden when `visitsPublic: false`
- URL updates if username changes (future feature)

#### Scenario: Display Shareable URL When Public
**Given** user "nina" has `visitsPublic: true`  
**And** nina's username is "nina"  
**When** nina opens Account Settings  
**Then** shareable URL is displayed: "https://wetherspooning.app/visits/@nina"  
**And** a "Copy link" button is visible next to URL

#### Scenario: Copy Shareable URL
**Given** user "oscar" has `visitsPublic: true`  
**And** Account Settings displays shareable URL  
**When** oscar clicks "Copy link" button  
**Then** the full URL is copied to clipboard  
**And** button shows "Copied!" feedback for 2 seconds  
**And** button returns to "Copy link" label

#### Scenario: Hide URL When Private
**Given** user "paula" has `visitsPublic: false`  
**When** paula opens Account Settings  
**Then** no shareable URL is displayed  
**And** only the privacy toggle is visible

---

### Requirement: Default Privacy State (REQ-VPS-003)
**Priority:** MUST  
**Category:** Security

The system MUST default new users to private visit visibility for privacy-by-default principle.

**Acceptance Criteria:**
- New user profiles created with `visitsPublic: false`
- User signup process does not prompt for privacy preference (defaults to private)
- First-time Account Settings view shows toggle in off (private) state
- No visits visible via shareable URL until user explicitly enables public
- Default documented in user profile creation logic

#### Scenario: New User Defaults to Private
**Given** a new user "quinn" completes signup  
**When** the user profile is created in Firestore  
**Then** the profile has `visitsPublic: false`  
**And** quinn's visits are not accessible via "/visits/@quinn"  
**And** Account Settings shows toggle in off state

#### Scenario: Privacy Toggle Not Set During Signup
**Given** a user is completing the signup form  
**Then** no privacy preference option is shown  
**And** visits will default to private after account creation

---

### Requirement: Privacy State Persistence (REQ-VPS-004)
**Priority:** MUST  
**Category:** Functional

The system MUST persist privacy toggle state in Firestore and reflect it across sessions.

**Acceptance Criteria:**
- Toggle state saved to `users/{uid}/visitsPublic` field
- Firestore update uses transaction or atomic update
- State persists across page refreshes
- State persists across logout/login cycles
- State loaded when Account Settings opens
- Failed saves show error and revert toggle to previous state

#### Scenario: Privacy State Persists Across Sessions
**Given** user "rachel" sets `visitsPublic: true`  
**And** rachel logs out  
**When** rachel logs back in  
**And** opens Account Settings  
**Then** the toggle shows enabled (public) state  
**And** the shareable URL is displayed

#### Scenario: Privacy State Saves to Firestore
**Given** user "sam" has `visitsPublic: false`  
**When** sam enables the toggle  
**Then** Firestore `users/sam-uid` document is updated  
**And** field `visitsPublic` is set to `true`  
**And** update completes before UI shows success

#### Scenario: Failed Save Reverts Toggle
**Given** user "tina" attempts to enable public visits  
**And** Firestore update fails (network error)  
**When** the error is detected  
**Then** toggle reverts to off (previous state)  
**And** error message displays: "Failed to update privacy setting. Please try again."  
**And** `visitsPublic` remains `false` in Firestore

---

### Requirement: Privacy Confirmation Dialog (REQ-VPS-005)
**Priority:** MUST  
**Category:** UI/UX

The system MUST show a confirmation dialog when enabling public sharing for the first time.

**Acceptance Criteria:**
- Confirmation appears only on first toggle to public (not on subsequent toggles)
- Dialog title: "Make visits public?"
- Dialog explains: "Your visit dates and ratings will be visible to anyone with your link. Notes will remain private."
- Dialog has "Cancel" and "Make Public" buttons
- Clicking "Cancel" reverts toggle to off without saving
- Clicking "Make Public" confirms and saves state
- After first confirmation, toggle works immediately without confirmation

#### Scenario: First-Time Public Confirmation
**Given** user "uma" has never enabled public visits  
**And** Account Settings is open  
**When** uma clicks the privacy toggle to enable  
**Then** a confirmation dialog appears  
**And** dialog title reads "Make visits public?"  
**And** dialog explains visibility and privacy  
**And** "Cancel" and "Make Public" buttons are shown

#### Scenario: Confirm Public Sharing
**Given** the first-time confirmation dialog is displayed  
**When** user clicks "Make Public"  
**Then** dialog closes  
**And** `visitsPublic` is set to `true` in Firestore  
**And** toggle remains enabled  
**And** shareable URL is displayed

#### Scenario: Cancel First-Time Public
**Given** the first-time confirmation dialog is displayed  
**When** user clicks "Cancel"  
**Then** dialog closes  
**And** toggle reverts to off state  
**And** `visitsPublic` remains `false`  
**And** no Firestore update occurs

#### Scenario: Subsequent Toggles Skip Confirmation
**Given** user "victor" has previously enabled public visits  
**And** user now has `visitsPublic: false`  
**When** victor toggles privacy to public again  
**Then** no confirmation dialog appears  
**And** state saves immediately to Firestore

---

### Requirement: Privacy Setting Visibility (REQ-VPS-006)
**Priority:** MUST  
**Category:** Functional

The system MUST enforce privacy settings when loading visit data for shared views.

**Acceptance Criteria:**
- Firestore security rules check `visitsPublic` field before allowing read access
- Client-side code checks `visitsPublic` before loading visits
- Private visits (`visitsPublic: false`) return "This user's visits are private" message
- Public visits (`visitsPublic: true`) load normally
- Privacy setting check happens before visit query (avoid unnecessary reads)
- Owner always sees own visits regardless of privacy setting

#### Scenario: Enforce Private Visits via Security Rules
**Given** user "wendy" has `visitsPublic: false`  
**When** an unauthenticated user queries Firestore for wendy's visits  
**Then** Firestore security rules deny read access  
**And** query returns empty result  
**And** no visit data is exposed

#### Scenario: Allow Public Visits via Security Rules
**Given** user "xavier" has `visitsPublic: true`  
**When** an unauthenticated user queries Firestore for xavier's visits  
**Then** Firestore security rules allow read access  
**And** query returns xavier's visits (excluding notes)

#### Scenario: Owner Bypasses Privacy Setting
**Given** user "yara" has `visitsPublic: false`  
**And** yara is authenticated  
**When** yara views her own visits at "/"  
**Then** all visit data loads normally  
**And** yara sees dates, ratings, and notes  
**And** privacy setting does not block owner access

---

### Requirement: Privacy Toggle Accessibility (REQ-VPS-007)
**Priority:** MUST  
**Category:** Accessibility

The system MUST provide accessible privacy toggle controls for users with disabilities.

**Acceptance Criteria:**
- Toggle has accessible label "Make my visits public"
- Toggle state announced by screen readers ("on" / "off")
- Toggle keyboard accessible (Tab to focus, Space/Enter to toggle)
- Helper text associated with toggle via ARIA
- Error messages announced by screen readers
- Focus indicator visible when toggle focused
- Color not sole indicator of state (uses position/icon)

#### Scenario: Screen Reader Announces Toggle State
**Given** a screen reader user opens Account Settings  
**When** focus moves to privacy toggle  
**Then** screen reader announces "Make my visits public, switch, off"  
**When** user activates toggle  
**Then** screen reader announces "Make my visits public, switch, on"

#### Scenario: Keyboard Toggle Activation
**Given** Account Settings is open  
**When** user presses Tab to focus privacy toggle  
**And** focus indicator is visible around toggle  
**When** user presses Space key  
**Then** toggle switches state  
**And** state saves to Firestore

---

### Requirement: Privacy Setting Integration with User Profile (REQ-VPS-008)
**Priority:** MUST  
**Category:** Functional

The system MUST create and manage user profile documents with privacy settings in Firestore.

**Acceptance Criteria:**
- User profile created in `users` collection on signup
- Profile document ID matches Firebase UID
- Profile includes fields: `uid`, `username`, `email`, `visitsPublic`, `createdAt`
- `visitsPublic` defaults to `false` on profile creation
- Profile updated atomically when toggling privacy
- Profile creation is part of signup transaction (atomic)
- Failed profile creation blocks signup completion

#### Scenario: Create User Profile on Signup
**Given** a new user completes signup with email "zoe@example.com" and username "zoe"  
**And** Firebase Authentication creates UID "abc123"  
**When** the signup process creates user profile  
**Then** Firestore document `users/abc123` is created  
**And** document contains `uid: "abc123"`  
**And** document contains `username: "zoe"`  
**And** document contains `email: "zoe@example.com"`  
**And** document contains `visitsPublic: false`  
**And** document contains `createdAt` timestamp

#### Scenario: Update Privacy in User Profile
**Given** user profile exists for "alice" with UID "uid-alice"  
**And** current state is `visitsPublic: false`  
**When** alice enables privacy toggle  
**Then** Firestore updates `users/uid-alice/visitsPublic` to `true`  
**And** other profile fields remain unchanged  
**And** update is atomic (no partial writes)

