# Proposal: Add Proximity Visit Prompt

## What Changes

When a user's geolocation is detected on initial page load and the closest open pub is within 100 metres, automatically center the map on that pub's location and display its info window. This provides immediate contextual awareness when a user opens the app near a Wetherspoon pub. The proximity check only happens once on the first geolocation detection, not continuously.

### Updated Capability: proximity-visit-prompt
**Type:** modified  
**Spec:** `openspec/specs/proximity-visit-prompt/spec.md`

Modify the location-aware feature to automatically focus the map on nearby pubs instead of showing a separate prompt dialog.

**Updated Requirements:**
- REQ-PVP-001: Proximity Detection - Detect when user is within 100m of an open pub on initial geolocation
- REQ-PVP-002: Auto-Center and Info Window - Center map on pub and display info window when proximity detected
- REQ-PVP-003: Single Check Only - Only check proximity on first geolocation, not continuously

**Removed:**
- ProximityVisitPrompt component (no longer needed)
- Session storage for dismissed prompts
- Authentication-specific prompt handling
- Visit creation from prompt

## Why This Matters

**User Value:**
- Immediate awareness when near a pub without requiring extra interaction
- Simpler, more streamlined UX - reuses existing info window instead of new UI
- Reduces cognitive load - one less dialog to dismiss

**Business Value:**
- Lower development/maintenance overhead - fewer components
- Reuses existing info window UI patterns
- Still encourages visit tracking through focused context

## Implementation Scope

### Components Affected
- `PubLocationsMap.vue` - Update proximity detection to center map and show info window

### Files to Remove
- `ProximityVisitPrompt.vue` - Component no longer needed

### Dependencies
- Geolocation API (already in use for map centering)
- Google Maps API (for map centering and info window display)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Geolocation permission denied | Feature unusable | Gracefully degrade - map centers on default location |
| Inaccurate GPS coordinates | Wrong pub focused | Use 100m threshold to reduce false positives |
| Performance impact | Map lag | Single check on initial load only |

## Related Changes

Supersedes previous proximity-visit-prompt implementation with dialog component.

## Validation

- Proposal structure follows OpenSpec conventions
- Spec deltas include clear scenarios for all requirements
- Tasks are ordered and verifiable
