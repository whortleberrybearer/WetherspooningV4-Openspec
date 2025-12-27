# Specification Delta: Pub Locations Map Integration

**Capability ID:** `pub-locations-map`  
**Delta Type:** MODIFIED  
**Version:** 1.1.0  
**Last Updated:** 2025-12-27

## Overview

Modifications to the existing `pub-locations-map` capability to integrate with the new `pub-navigation-sidebar` capability.

## MODIFIED Requirements

### Requirement: Map Display (REQ-PLM-001)
**Priority:** MUST  
**Category:** Functional

**Modifications:**
- Map container must accommodate sidebar overlay on desktop
- Map controls must remain accessible when sidebar is open
- Map must remain interactive when sidebar is displayed

**Updated Acceptance Criteria:**
- Map initializes with center coordinates (54.0, -2.0) at zoom level 6
- Map displays standard roadmap view
- Map includes zoom controls and fullscreen option
- Map is responsive and fills available viewport
- Map is displayed as the home page at route `/`
- **NEW:** Map remains fully interactive when sidebar is overlaid
- **NEW:** Map controls are not obscured by sidebar

#### Scenario: Map with Sidebar Open
**Given** the pub locations map is displayed  
**And** the sidebar is open  
**When** the user interacts with the map  
**Then** the map remains fully functional (pan, zoom, marker clicks)  
**And** map controls remain accessible  
**And** sidebar does not interfere with map interactions

---

### Requirement: Pub Information Display (REQ-PLM-004)
**Priority:** MUST  
**Category:** Functional

**Modifications:**
- Info windows can be triggered from sidebar pub selection
- Info windows display correctly when triggered via sidebar

**Updated Acceptance Criteria:**
- Clicking a marker opens an info window
- Info window displays: pub name, address, town/city, county
- If available, info window includes link to pub details page
- Only one info window is open at a time
- Info window can be closed by clicking the X or clicking another marker
- **NEW:** Selecting a pub from sidebar opens its info window
- **NEW:** Map pans to center selected pub before opening info window

#### Scenario: Select Pub from Sidebar
**Given** the sidebar is open  
**And** the map is displayed  
**When** the user clicks a pub in the sidebar list  
**Then** the map pans to center on that pub's location  
**And** the pub's info window opens  
**And** any previously open info window is closed  
**And** the info window displays the same information as marker clicks

---

## Integration Points

### New Component Dependencies
- `PubLocationsMap.vue` now imports and renders `PubSidebar.vue`
- Pub data from REQ-PLM-003 is passed to sidebar component
- Sidebar pub selection events trigger map interactions

### New UI Elements
- Burger menu button in top-left corner (z-index 60)
- Sidebar component (z-index 50)
- Mobile backdrop overlay (z-index 40)

### Shared State
- Pub data array shared between map markers and sidebar
- Map instance exposed for sidebar to trigger pan/zoom
- Info window instance exposed for sidebar to trigger display

## Behavioral Changes

No breaking changes. All existing functionality remains unchanged. New features are additive:
- Burger menu button appears in top-left
- Sidebar can be toggled open/closed
- Pubs can be selected from sidebar (alternative to marker clicks)
