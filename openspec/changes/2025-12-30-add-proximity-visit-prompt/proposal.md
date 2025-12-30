# Proposal: Add Proximity Visit Prompt

## What Changes

When a user's geolocation is detected and the closest open pub is within 100 metres, display a prompt asking if the user is visiting that pub. The prompt should include the pub's address and image (if available from Wetherspoon's website, with attribution). If the user is already signed in and has already visited the pub, no prompt is displayed. If the user is not signed in, provide a link to sign in. If signed in, show a "Yes" button that creates a visit record with the current date. After creating the visit, display the pub's info window.

### New Capability: proximity-visit-prompt
**Type:** new  
**Spec:** `openspec/specs/proximity-visit-prompt/spec.md`

Add a location-aware feature that prompts authenticated users to log visits when they are physically near a Wetherspoon pub.

**New Requirements:**
- REQ-PVP-001: Proximity Detection - Detect when user is within 100m of an open pub
- REQ-PVP-002: Visit Prompt Display - Show prompt with pub details when near an unvisited pub
- REQ-PVP-003: Authentication State Handling - Display appropriate UI based on authentication state
- REQ-PVP-004: Visit Creation from Prompt - Create visit record when user confirms
- REQ-PVP-005: Post-Visit Info Window - Display pub info window after visit creation

## Why This Matters

**User Value:**
- Frictionless visit tracking when physically at a pub
- Encourages engagement with the tracking feature through contextual prompts
- Reduces manual search and selection effort

**Business Value:**
- Increases user engagement with visit tracking feature
- Higher quality visit data (location-verified visits)
- Drives authentication sign-ups through contextual prompts

## Implementation Scope

### Components Affected
- `PubLocationsMap.vue` - Add proximity detection logic and prompt UI
- `useVisits.ts` - Use existing visit creation methods

### New Files
- New component: `ProximityVisitPrompt.vue` - Dialog/card component for visit prompt

### Dependencies
- Geolocation API (already in use for map centering)
- Existing visit tracking system (`useVisits` composable)
- Existing authentication system (`useAuth` composable)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Geolocation permission denied | Feature unusable | Gracefully degrade - no prompt shown, feature optional |
| Inaccurate GPS coordinates | Wrong pub suggested | Use 100m threshold to reduce false positives |
| Prompt appears too frequently | Annoying user experience | Only show once per pub visit, hide after user dismisses |
| Performance impact from distance calculations | Map lag | Throttle calculations, only check on geolocation updates |

## Open Questions

1. Should the prompt automatically dismiss after a timeout (e.g., 30 seconds)?
2. Should there be a "Not now" option that prevents re-prompting for the same pub during the session?
3. Should the distance threshold be configurable (e.g., user preference)?
4. Should the prompt show if the user is near multiple pubs? (Show closest only)

## Related Changes

None - this is a new, standalone feature.

## Validation

- Proposal structure follows OpenSpec conventions
- Spec deltas include clear scenarios for all requirements
- Tasks are ordered and verifiable
- All validation passes with `npx openspec validate 2025-12-30-add-proximity-visit-prompt --strict`
