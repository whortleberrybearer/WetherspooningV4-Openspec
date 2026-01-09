# pub-detail-sheet Spec Delta

## ADDED Requirements

### Requirement: Display Pub Opening State Badge (REQ-PDS-007) **NEW**

**Priority:** MUST  
**Category:** Functional

The system MUST display a visual badge indicating the pub's opening state when the state is not "Open".

**Acceptance Criteria:**
- Badge is displayed in the dialog header near the pub name
- Badge shows the exact `openState` value
- Badge color coding:
  - Green: "Open" (badge hidden as this is default)
  - Red: "Closed" with X icon
  - Orange: All other non-open states ("Temporary Closed", "Opening dd/MM/yyyy", "Opening Soon", "Reopening dd/MM/yyyy") with warning icon
  - Gray: "Unknown"
- Badge is only shown when `openState` is not "Open"
- Badge text matches the `openState` field exactly
- Badge is positioned clearly but doesn't obstruct pub name
- Badge uses consistent styling with other UI badges

#### Scenario: Display Reopening State Badge
**Given** a pub with `openState === 'Reopening 12/01/2026'`  
**When** the pub detail sheet is opened  
**Then** an orange badge is displayed  
**And** the badge text reads "Reopening 12/01/2026"  
**And** the badge is positioned in the dialog header

#### Scenario: Display Temporarily Closed Badge
**Given** a pub with `openState === 'Temporary Closed'`  
**When** the pub detail sheet is opened  
**Then** an orange badge is displayed  
**And** the badge text reads "Temporary Closed"

#### Scenario: Display Opening Soon Badge
**Given** a pub with `openState === 'Opening Soon'`  
**When** the pub detail sheet is opened  
**Then** an orange badge is displayed  
**And** the badge text reads "Opening Soon"

#### Scenario: Hide Badge for Open Pubs
**Given** a pub with `openState === 'Open'`  
**When** the pub detail sheet is opened  
**Then** no state badge is displayed  
**And** only the pub name and address are shown in the header

#### Scenario: Display Closed Badge
**Given** a pub with `openState === 'Closed'`  
**When** the pub detail sheet is opened  
**Then** a red badge is displayed  
**And** the badge text reads "Closed"  
**And** visit tracking section shows appropriate messaging for closed pub

---

## MODIFIED Requirements

### Requirement: Display Pub Details in Dialog (REQ-PDS-001)

The system MUST display pub details in a dialog including name, address, and opening state badge.

**MODIFIED Acceptance Criteria:**
- **ADDED:** Dialog header includes opening state badge when applicable (see REQ-PDS-007)
- Dialog displays pub name, address, and opening state
- Opening state badge provides visual context without disrupting layout
- All existing pub details (visit tracking, location, facilities) remain visible

#### Scenario: Display Pub Details with State Badge
**Given** a pub with `openState === 'Reopening 12/01/2026'`  
**When** the user opens the pub detail sheet  
**Then** the dialog displays the pub name in the header  
**And** an orange "Reopening 12/01/2026" badge is shown  
**And** the pub address is displayed  
**And** visit tracking controls are available (if authenticated)

---

## Implementation Notes

### Badge Component
Use the existing `Badge` component from `@/components/ui/badge` with variant and color customization:

```vue
<Badge 
  v-if="pub.openState && pub.openState !== 'Open'" 
  :variant="getStateVariant(pub.openState)"
  :class="getStateBadgeClass(pub.openState)"
>
  {{ pub.openState }}
</Badge>
```

### Color Mapping
```typescript
function getStateBadgeClass(openState: string): string {
  if (openState === 'Closed') return 'bg-red-500 text-white'
  if (openState === 'Temporary Closed') return 'bg-orange-500 text-white'
  if (openState.startsWith('Opening')) return 'bg-orange-500 text-white'
  if (openState.startsWith('Reopening')) return 'bg-orange-500 text-white'
  return 'bg-gray-500 text-white'
}
```

---

## Cross-References
This delta impacts:
- `scheduled-data-sync` - requires accurate openState values from scraper
- `pub-visibility-filter` - state badges must align with filter behavior
- `enhanced-infowindow-display` - may want similar badges in map infowindows
