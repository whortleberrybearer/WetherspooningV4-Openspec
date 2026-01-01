# enhanced-infowindow-display Spec Delta

This delta extends the enhanced-infowindow-display specification to include rating and notes display for visited pubs.

## MODIFIED Requirements

### Requirement: Status and Visit Badges (REQ-EID-004)
**Priority:** MUST  
**Category:** UI/UX

**Changes:**
- MODIFY: Visited badge to include rating stars when available
- ADD: Notes preview display below badges when notes exist

The InfoWindow must display status badges (Open/Closed) and visit badges (Visited with date/rating) for authenticated users.

**Updated Acceptance Criteria:**
- Status badge (Open/Closed) displays based on `openState` field
- Open badge has green background (#34a853), Closed has red (#ea4335)
- For authenticated users, visited badge displays if pub is visited
- **MODIFIED:** Visited badge includes rating stars when rating exists
- **MODIFIED:** Badge format with rating: "✓ Visited DD/MM/YY ★★★★☆" (example 4 stars)
- **MODIFIED:** Badge format without date but with rating: "✓ Visited ★★★★☆"
- Badge format without rating: "✓ Visited DD/MM/YY" or "✓ Visited"
- **NEW:** Rating displays as filled (★) and empty (☆) stars (1-5 total)
- Badges display horizontally with gap spacing (8px)
- Badge text uses small font size (12px) and semibold weight
- **NEW:** Notes preview displays below badges if notes exist
- **NEW:** Notes preview shows first 100 characters with ellipsis if longer
- **NEW:** Notes preview uses muted text color and smaller font (11-12px)
- **NEW:** Notes preview has subtle background or border for separation

#### Scenario: Display Visited Badge with Date and Rating
**MODIFIED:**
**Given** user is authenticated  
**And** user visited the pub on "2025-12-25"  
**And** the visit has rating 4  
**When** the InfoWindow opens  
**Then** a "✓ Visited 25/12/25 ★★★★☆" badge displays with green background  
**And** 4 filled stars and 1 empty star are shown  
**And** badge appears next to status badge with proper spacing

#### Scenario: Display Visited Badge with Rating Only
**ADDED:**
**Given** user is authenticated  
**And** user visited the pub but no date is recorded  
**And** the visit has rating 5  
**When** the InfoWindow opens  
**Then** a "✓ Visited ★★★★★" badge displays with green background  
**And** all 5 stars are filled  
**And** no date is shown

#### Scenario: Display Visited Badge Without Rating
**Given** user is authenticated  
**And** user visited the pub on "2025-11-10"  
**And** the visit has no rating  
**When** the InfoWindow opens  
**Then** a "✓ Visited 10/11/25" badge displays with green background  
**And** no stars are shown (existing behavior)

#### Scenario: Display Notes Preview
**ADDED:**
**Given** user is authenticated  
**And** user visited the pub  
**And** the visit has notes "Great atmosphere, friendly staff, excellent beer selection"  
**When** the InfoWindow opens  
**Then** the visited badge displays  
**And** a notes preview displays below the badges  
**And** the preview shows "Great atmosphere, friendly staff, excellent beer selection"  
**And** the preview uses muted text color  
**And** the preview has subtle background or border

#### Scenario: Display Truncated Notes Preview
**ADDED:**
**Given** user is authenticated  
**And** user visited the pub  
**And** the visit has notes longer than 100 characters  
**When** the InfoWindow opens  
**Then** the notes preview displays first 100 characters  
**And** the preview ends with "..." ellipsis  
**And** full notes can be viewed by opening PubDetailSheet

#### Scenario: No Notes Preview When Notes Empty
**ADDED:**
**Given** user is authenticated  
**And** user visited the pub  
**And** the visit has no notes  
**When** the InfoWindow opens  
**Then** the visited badge displays  
**And** no notes preview is shown  
**And** content flows directly to website link or button

#### Scenario: No Rating or Notes for Unauthenticated User
**ADDED:**
**Given** user is not authenticated  
**When** the InfoWindow opens  
**Then** only the status badge displays  
**And** no visited badge appears  
**And** no rating is shown  
**And** no notes preview is shown

---

## ADDED Requirements

### Requirement: InfoWindow Layout with Notes (REQ-EID-007)
**Priority:** MUST  
**Category:** UI/UX

The InfoWindow must maintain clean vertical layout when displaying rating and notes, ensuring content remains readable and not cluttered.

**Acceptance Criteria:**
- Content follows vertical order: image → name → badges → notes → link → button
- Notes preview has appropriate spacing from badges (8-12px margin)
- Notes preview does not push content height beyond reasonable limits
- Total InfoWindow max-height remains manageable (e.g., 400-450px)
- Scrolling is not required for typical visits with short notes
- Long notes are truncated to prevent excessive height
- All spacing follows consistent 8px grid system

#### Scenario: Layout with All Visit Details
**Given** a visited pub with image, rating 5, and notes  
**When** the InfoWindow opens  
**Then** the image displays at top  
**And** pub name displays below image  
**And** badges display below name (Open badge, Visited badge with stars)  
**And** notes preview displays below badges with spacing  
**And** website link displays below notes  
**And** action button displays at bottom  
**And** total height is reasonable and content is readable

#### Scenario: Layout Without Notes
**Given** a visited pub with rating but no notes  
**When** the InfoWindow opens  
**Then** the layout shows: image → name → badges → link → button  
**And** no extra space appears where notes would be  
**And** content flows naturally without gaps

#### Scenario: Compact Layout for Unvisited Pub
**Given** an unvisited pub  
**When** the InfoWindow opens  
**Then** the layout shows: image → name → status badge → link → button  
**And** no visit details (rating/notes) are shown  
**And** layout is compact and clean
