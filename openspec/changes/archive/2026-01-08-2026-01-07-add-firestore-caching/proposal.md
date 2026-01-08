# Proposal: Add Firestore Caching

**Change ID:** 2026-01-07-add-firestore-caching  
**Author:** GitHub Copilot  
**Date:** 2026-01-07  
**Status:** DRAFT

## Why

The application currently makes direct Firestore reads on every page load and user interaction, resulting in unnecessary costs and latency:

1. **Pub data** - Retrieved via `getAllPubs()` on every page load, despite changing only ~once per 24 hours and being identical for all users
2. **Visit data** - Retrieved via `getUserVisits()` for each authenticated user, despite rarely changing after initial load

With low user count (<10) and infrequent data changes, these reads can be dramatically reduced through caching strategies without compromising user experience.

Additionally, future server-side processing requirements for pub data necessitate a flexible architecture that can support both client-side caching and cloud function integration.

## Proposed Solution

Leverage Firebase's built-in caching capabilities and CDN infrastructure for maximum simplicity and effectiveness:

### 1. Cloud Function + CDN Caching for Pub Data
- Create HTTPS onRequest Cloud Function `getPubs` that returns pub data as JSON
- Cache headers configured in `firebase.json` hosting section: `Cache-Control: public, max-age=86400, s-maxage=86400` (24h)
- Firebase Hosting CDN caches response globally (shared across all users)
- Client-side sessionStorage provides instant loads within same browser session (no TTL - valid until session ends)
- `bypassCache` parameter on client forces fresh server fetch (still caches the result)
- Future server-side processing requirements easily integrated into the function
- Simpler function code - no parameter handling or header logic needed

### 2. Firestore SDK Built-In Persistence for Visit Data
- Firestore SDK automatically enables persistence when IndexedDB is available
- Automatic cache management - no manual configuration needed
- Cache serves data instantly on subsequent loads
- Cache persists across sessions automatically
- No custom invalidation logic needed - Firestore handles cache management
- Supports session-scoped data access

### 3. Session-Based Cache Lifecycle
- Pub data persists in sessionStorage across authentication state changes (same for all users)
- Visit data cleared on user logout (user-specific)
- Fresh data loaded on new browser session (handles cross-device changes)
- No manual cache invalidation needed
- Simpler mental model: session = cache lifetime

## What Changes

### Code Changes
- **New Cloud Function:** `functions/src/callable/getPubs.ts` - Serves pub data via HTTPS
- **New Service:** `Wetherspooning/src/services/pubDataService.ts` - sessionStorage caching wrapper
- **Modified:** `Wetherspooning/src/lib/firebase.ts` - Automatic Firestore persistence
- **Modified:** `Wetherspooning/src/views/PubLocationsMap.vue` - Uses pubDataService
- **Modified:** `Wetherspooning/src/composables/useAuth.ts` - Cache behavior documentation
- **Modified:** `firebase.json` - Cache headers and hosting rewrites
- **New Tests:** `pubDataService.test.ts` - Unit tests for caching logic

### Configuration Changes
- Environment variable: `VITE_FIREBASE_FUNCTIONS_URL`
- Firebase hosting headers for `/api/pubs` endpoint
- Firebase hosting rewrite rule for Cloud Function

## Impact Analysis

### Benefits
- **Reduced Firestore reads:** 95%+ reduction in pub data reads (1 globally per 24h via CDN vs current ~10-50 per day per user)
- **Reduced visit reads:** 90%+ reduction via Firestore SDK persistence (1 per session vs current ~5-10 per session)
- **Improved performance:** CDN cache hits <50ms globally; sessionStorage <10ms; Firestore persistence <20ms
- **Lower costs:** Dramatic reduction in Firebase billing
- **Better UX:** Firestore persistence provides automatic offline support
- **Scalability:** Cloud function ready for future server-side processing
- **Simpler implementation:** Leverages Firebase built-in features instead of custom code

### Risks
- **Cold start latency:** Cloud function cold starts (~1-2s) mitigated by CDN cache
- **Multi-tab scenarios:** Firestore persistence handles automatically
- **Browser compatibility:** Graceful degradation if IndexedDB unavailable

### User-Facing Changes
- Faster initial page loads (cached data)
- No breaking changes to existing functionality

## Affected Capabilities

- **firebase-data-integration** - Adds automatic Firestore persistence
- **pub-visit-data** - Visit data uses Firestore SDK persistence
- **pub-locations-map** - Pub data loaded via Cloud Function with CDN caching

No new capabilities are introduced.

## Dependencies

- No external library dependencies required (native browser APIs)
- No blocking dependencies on other changes
- Can be implemented in parallel with other active changes

## Alternatives Considered
ustom client-side caching service** - Rejected in favor of Firestore SDK's built-in persistence
2. **Direct Firestore reads with custom cache** - Rejected; SDK persistence is battle-tested and simpler

1. **Custom client-side caching service** - Rejected in favor of Firestore SDK's built-in persistence
2. **Direct Firestore reads with custom cache** - Rejected; SDK persistence is battle-tested and simpler
3. **Service Worker caching** - Rejected as overkill; CDN + sessionStorage sufficient
4. **Real-time listeners for visit data** - Rejected; session-scoped cache simpler for low-traffic site
5. **No caching (status quo)** - Rejected due to cost and performance concerns

## Success Metrics

- Firestore pub reads reduced to ~1 per 24h globally (measurable via Firebase console)
- Firestore visit reads reduced by >90% per user session
- Cloud Function invocations for pubs: ~1 per 24h (rest served by CDN)
- Initial page load time <100ms on CDN cache hits
- sessionStorage cache hits provide <10ms pub data loads within session
- All existing tests pass with caching enabled