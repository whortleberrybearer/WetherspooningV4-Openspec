# Proposal: Add Firestore Caching

**Change ID:** 2026-01-07-add-firestore-caching  
**Author:** GitHub Copilot  
**Date:** 2026-01-07  
**Status:** DRAFT

## Problem Statement

The application currently makes direct Firestore reads on every page load and user interaction, resulting in unnecessary costs and latency:

1. **Pub data** - Retrieved via `getAllPubs()` on every page load, despite changing only ~once per 24 hours and being identical for all users
2. **Visit data** - Retrieved via `getUserVisits()` for each authenticated user, despite rarely changing after initial load

With low user count (<10) and infrequent data changes, these reads can be dramatically reduced through caching strategies without compromising user experience.

Additionally, future server-side processing requirements for pub data necessitate a flexible architecture that can support both client-side caching and cloud function integration.

## Proposed Solution

Leverage Firebase's built-in caching capabilities and CDN infrastructure for maximum simplicity and effectiveness:

### 1. Cloud Function + CDN Caching for Pub Data
- Create HTTPS callable Cloud Function `getPubs` that returns pub data as JSON
- Function queries Firestore and returns data with HTTP cache headers: `Cache-Control: public, max-age=86400` (24h)
- Firebase Hosting CDN caches response globally (shared across all users)
- Client-side sessionStorage provides instant loads within same browser session
- Optional `?nocache=1` query parameter bypasses server-side cache for admin/testing
- Future server-side processing requirements easily integrated into the function

### 2. Firestore SDK Built-In Persistence for Visit Data
- Enable `enableIndexedDbPersistence()` on Firestore initialization
- Firestore SDK automatically caches all reads in IndexedDB
- Cache serves data instantly on subsequent loads
- Cache cleared on logout (session-scoped)
- No custom invalidation logic needed - Firestore handles cache management
- Supports offline access out-of-the-box

### 3. Session-Based Cache Lifecycle
- Pub data persists in sessionStorage across authentication state changes (same for all users)
- Visit data cleared on user logout (user-specific)
- Fresh data loaded on new browser session (handles cross-device changes)
- No manual cache invalidation needed
- Simpler mental model: session = cache lifetime

## Impact Analysis

### Benefits
- **Reduced Firestore reads:** 95%+ reduction in pub data reads (1 globally per 24h via CDN vs current ~10-50 per day per user)
- **Reduced visit reads:** 90%+ reduction via Firestore SDK persistence (1 per session vs current ~5-10 per session)
- **Improved performance:** CDN cache hits <50ms globally; sessionStorage <10ms; Firestore persistence <20ms
- **Lower costs:** Dramatic reduction in Firebase billing - CDN caching means zero Firestore reads after first global request
- **Better offline experience:** Firestore persistence provides full offline support automatically
- **Scalability:** Cloud function already in place for future server-side processing
- **Simpler implementation:** Leverages Firebase built-in features instead of custom code
- **Global CDN:** Pub data cached on Firebase's CDN edge nodes worldwide
CDN TTL for pubs (matches update frequency) and session-scoped visit cache
- **Cold start latency:** Cloud function cold starts (~1-2s) mitigated by CDN cache hits and function keep-alive
- **Cross-device visit sync:** Handled by session-scoped cache - fresh data loaded on each new session
- **Cache bypass needed:** `?nocache=1` parameter available for admin scenarios
- **Multiple tabs:** Firestore persistence handles multi-tab scenarios automatically
- **Browser compatibility:** Firestore persistence gracefully degrades if IndexedDB unavailableces
- **Cache inconsistency:** Manual refresh option + automatic TTL expiry ensure data freshness
- **Testing complexity:** Requires cache mock/stub infrastructure - addressed in tasks

### User-Facing Changes
- Faster initial page loads (cached data)
- No breaking changes to existing functionality
Cloud Function `functions/src/callable/getPubs.ts` with cache headers
- Modified `Wetherspooning/src/services/firebaseDataService.ts` to call function for pub data
- Added `enableIndexedDbPersistence()` to `Wetherspooning/src/lib/firebase.ts`
- New `pubDataService.ts` with sessionStorage caching wrapper
- Updated `useAuth.ts` to clear Firestore cache on logout
- Updated tests to handle cached data scenarios and cache bypasr
- New cache configuration in environment/constants
- Updated tests to handle cached vs fresh data scenarios

## Affected Capabilities
Enable Firestore persistence; add Cloud Function for pub data
- **pub-visit-data** - Visit data uses Firestore SDK persistence (session-scoped)
- **pub-locations-map** - Pub data loaded via Cloud Function with CDN caching
- **scheduled-data-sync** - Cloud function integration point for future pub data processing visit data retrieval
- **pub-visit-data** - Update visit data loading to use cache with invalidation
- **pub-locations-map** - Update to use cached pub data source

No new capabilities are introduced.

## Dependencies

- No external library dependencies required (native browser APIs)
- No blocking dependencies on other changes
- Can be implemented in parallel with other active changes

## Alternatives Considered
ustom client-side caching service** - Rejected in favor of Firestore SDK's built-in persistence
2. **Direct Firestore reads with custom cache** - Rejected; SDK persistence is battle-tested and simpler
3. **Service Worker caching** - Rejected as overkill; CDN + sessionStorage sufficient
4. **Real-time listeners for visit data** - Rejected; session-scoped cache simpler for low-traffic site
5. **Service Worker caching** - Rejected as overkill for API-level caching needs
4. **No caching (status quo)** - Rejected due to cost and performance concerns

## Success Metrics
pub reads reduced to ~1 per 24h globally (measurable via Firebase console)
- Firestore visit reads reduced by >90% per user session
- Cloud Function invocations for pubs: ~1 per 24h (rest served by CDN)
- Initial page load time <100ms on CDN cache hits
- sessionStorage cache hits provide <10ms pub data loads within session
- Zero user complaints about stale data
- All existing tests pass with caching enabled
- Offline functionality works for visit datad
- Cache hit rate >80% in production telemetry

## Open Questions

None - requirements are clear and scoped.
