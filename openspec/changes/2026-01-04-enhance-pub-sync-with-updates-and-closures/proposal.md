# Enhance Pub Sync with Updates and Closures

**Change ID:** `2026-01-04-enhance-pub-sync-with-updates-and-closures`  
**Status:** Draft  
**Created:** 2026-01-04  

## Problem Statement

The current scheduled pub sync (REQ-SDS-001 through REQ-SDS-008) creates or overwrites pub records without intelligent matching or lifecycle management. This creates several issues:

1. **No Update Logic:** Every sync rewrites pub data even when nothing has changed, creating unnecessary database load and costs
2. **No Closure Tracking:** Pubs that close or are removed from the Wetherspoon's sitemap remain marked as "Open" indefinitely
3. **URL Changes Not Handled:** When a pub's URL changes (e.g., name change, relocation), the system creates a duplicate record instead of updating the existing one
4. **Missing Tests:** The sync logic lacks comprehensive test coverage for matching, update, and closure scenarios

## Proposed Solution

Enhance the scheduled-data-sync capability with:

1. **Multi-Step Matching Logic:** Implement a three-tier matching strategy to find existing pubs:
   - Match by URL (primary)
   - Match by name + townCity for open pubs (handles URL changes)
   - Match by address for open pubs (handles name and URL changes)

2. **Change Detection:** Before writing to Firestore, compare scraped data with existing pub data. Only update if changes are detected, reducing unnecessary writes.

3. **Closure Management:** During full sync, track which existing open pubs were not matched against sitemap entries. Mark these pubs as closed and clear their URLs.

4. **Database Load Management:** Implement batching and rate limiting to manage Firestore write operations during large syncs.

5. **Comprehensive Test Coverage:** Add unit tests for all matching scenarios, change detection, and closure logic.

## Scope

### In Scope
- Three-tier pub matching logic (URL, name+townCity, address)
- Change detection to avoid unnecessary database writes
- Closure tracking for pubs removed from sitemap
- Database load management (batching/rate limiting)
- Comprehensive unit tests for new logic

### Out of Scope
- UI changes or frontend display of closure information
- Historical tracking of pub changes over time
- Manual override of closure status
- Notification system for pub closures

## Impact

### Modified Capabilities
- **scheduled-data-sync:** Enhanced with intelligent matching, change detection, and closure management

### Dependencies
- Firestore batch operations
- Existing pub data model (id, name, url, address, townCity, openState)

## Success Criteria
1. Full sync correctly identifies and updates existing pubs using multi-tier matching
2. Full sync marks pubs not in sitemap as closed with cleared URLs
3. Change detection prevents unnecessary database writes when data hasn't changed
4. Test coverage for sync service reaches >80%
5. Database write operations are batched to reduce load

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| False positive matches (wrong pubs matched) | Data corruption | Strict matching criteria; address matching as last resort |
| Large batch operations timeout | Sync failure | Implement rate limiting and resumable sync state |
| Incorrect closure detection | Pubs marked closed incorrectly | Only mark closed during full sync; log all closures |
| Performance degradation | Slow syncs | Batch Firestore reads; cache existing pubs in memory |

## Open Questions
None - requirements are clear and well-defined.
