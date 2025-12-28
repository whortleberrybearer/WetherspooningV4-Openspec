# Proposal: Add User Geolocation Centering

## What Changes

When a user visits the page, the map should center on their current location using the browser's Geolocation API. If the current location is not available (user denies permission, browser doesn't support geolocation, or geolocation fails), the map should fall back to the existing default center position (54.0, -2.0) covering the UK.

### Modified Capability: pub-locations-map
**Type:** modify  
**Spec:** `openspec/specs/pub-locations-map/spec.md`

Enhance map initialization to attempt geolocation before falling back to default center.

**Modified Requirements:**
- REQ-PLM-001: Map Display - Update to support user geolocation-based centering

**New Requirements:**
- REQ-PLM-009: Geolocation-Based Centering - Center map on user's current location when available

## Dependencies
- Requires browser Geolocation API support (standard in modern browsers)
- No backend changes required - purely client-side feature
- Builds on existing pub-locations-map capability

## Testing Strategy
- Manual testing with geolocation permission granted/denied
- Manual testing with geolocation blocked in browser settings
- Manual testing in browsers without geolocation support
- Visual verification that map centers correctly on user location
- Verification that fallback to default center works when geolocation unavailable
- Console logging for debugging geolocation status

## Migration Notes
No migration required - this is a progressive enhancement. Existing behavior (default center) remains as fallback.

## Alternatives Considered

### Alternative 1: Require Geolocation Permission
Always request geolocation and don't show map until permission granted.
**Rejected:** Too intrusive and prevents users from using the app if they decline location access. Silent fallback provides better UX.

### Alternative 2: Save Last Known Location
Store user's last known location in localStorage and use that as fallback.
**Rejected:** Adds complexity and may show stale location data. Fresh geolocation request provides most accurate current position.

### Alternative 3: IP-Based Geolocation
Use IP geolocation service as middle ground between browser geolocation and default center.
**Rejected:** Requires external service, less accurate than browser geolocation, and adds latency. Simple fallback is cleaner.

## Open Questions
None - implementation is straightforward using standard Geolocation API.
