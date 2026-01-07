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

Implement a multi-tier caching strategy:

### 1. Client-Side Pub Data Caching
- Cache pub data in browser memory with configurable TTL (default: 24 hours)
- Store cache metadata (timestamp, version) in localStorage
- Automatically revalidate on TTL expiry or manual refresh
- Prepare for future cloud function integration by abstracting data source behind service layer

### 2. Client-Side Visit Data Caching
- Cache user-specific visit data in memory with per-user isolation
- Invalidate only on mutations (create/update/delete visit)
- Automatically reload when user authentication state changes
- Maintain reactivity for immediate UI updates on visit changes

### 3. Future-Ready Architecture
- Abstract Firestore access behind caching service layer
- Design cache invalidation hooks for future cloud function triggers
- Support forced refresh for admin/sync scenarios
- Enable A/B testing between direct reads and cached reads

## Impact Analysis

### Benefits
- **Reduced Firestore reads:** 95%+ reduction in pub data reads (1 per 24h vs current ~10-50 per day per user)
- **Reduced visit reads:** 80%+ reduction (1 per session vs current ~5-10 per session)
- **Improved performance:** Sub-100ms cache hits vs 200-500ms Firestore reads
- **Lower costs:** Significant reduction in Firebase billing for reads
- **Better offline experience:** Cached data available during temporary network issues
- **Scalability:** Prepares for future cloud function integration without breaking changes

### Risks & Mitigation
- **Stale data risk:** Mitigated by 24h TTL for pubs (matches update frequency) and instant invalidation for visits
- **Memory usage:** Minimal (<1MB for ~1000 pubs + visits) - negligible on modern devices
- **Cache inconsistency:** Manual refresh option + automatic TTL expiry ensure data freshness
- **Testing complexity:** Requires cache mock/stub infrastructure - addressed in tasks

### User-Facing Changes
- Faster initial page loads (cached data)
- No breaking changes to existing functionality

### Technical Changes
- New `cachingService.ts` with generic cache implementation
- Modified `firebaseDataService.ts` to use caching layer
- New cache configuration in environment/constants
- Updated tests to handle cached vs fresh data scenarios

## Affected Capabilities

This change modifies the following existing specs:
- **firebase-data-integration** - Add caching layer to pub and visit data retrieval
- **pub-visit-data** - Update visit data loading to use cache with invalidation
- **pub-locations-map** - Update to use cached pub data source

No new capabilities are introduced.

## Dependencies

- No external library dependencies required (native browser APIs)
- No blocking dependencies on other changes
- Can be implemented in parallel with other active changes

## Alternatives Considered

1. **Cloud-side caching (Firebase Functions)** - Rejected due to cold start latency and complexity for low-traffic site
2. **IndexedDB persistence** - Rejected as unnecessary; memory cache sufficient for data size
3. **Service Worker caching** - Rejected as overkill for API-level caching needs
4. **No caching (status quo)** - Rejected due to cost and performance concerns

## Success Metrics

- Firestore read count reduced by >90% (measurable via Firebase console)
- Initial page load time reduced by >50% on cache hits
- Zero user complaints about stale data
- All existing tests pass with caching enabled
- Cache hit rate >80% in production telemetry

## Open Questions

None - requirements are clear and scoped.
