# Proposal: Add On-Demand Pub Sync

## Background

The pub sync system currently runs only on a scheduled basis (daily at 23:00 UTC), executing either a full sync on Wednesdays or an incremental update sync on other days. While this automated approach works well for routine updates, there are operational scenarios where manual intervention is required:

- **Data Quality Issues**: When issues are detected in pub data that need immediate correction
- **Emergency Updates**: When Wetherspoon's website has significant changes that affect data extraction
- **Testing & Verification**: When validating fixes to the sync logic or scraping code
- **Missed Sync Recovery**: When scheduled syncs fail and need to be re-run manually

Currently, the only way to run a sync manually is through the local script (`runPubSync.ts`), which requires:
- Local development environment setup
- Direct Firestore access or emulator configuration
- Knowledge of the codebase and npm commands

This creates operational friction and limits the ability to respond quickly to issues, especially for administrators who may not have the local development environment readily available.

## Goals

1. **Enable On-Demand Execution**: Create a Firebase Callable Function that allows authorized administrators to trigger pub syncs remotely without local environment setup
2. **Support Existing Parameters**: Preserve all existing sync functionality including:
   - Full sync mode with optional `count` and `start` parameters for partial processing
   - Update sync mode with `since` date parameter for incremental updates
3. **Secure Access**: Restrict function execution to specific authorized administrator user ID(s) configured via environment variables
4. **Maintain Consistency**: Reuse existing sync logic (`runFullSync`, `runUpdateSync`) to ensure identical behavior between scheduled and on-demand executions

## Non-Goals

- Exposing sync functionality to regular users (admin-only feature)
- Creating a UI for triggering syncs (can be called programmatically or via Firebase CLI/SDK)
- Modifying the existing scheduled sync behavior or schedule
- Adding new sync modes beyond what currently exists

## Success Criteria

- Authorized administrators can trigger full syncs and update syncs via a callable function
- The function accepts and respects `count`, `start`, and `since` parameters
- Unauthorized users receive clear error messages when attempting to call the function
- Sync execution and results are logged consistently with scheduled syncs
- Function can be invoked from Firebase CLI, frontend code, or other Firebase functions

## Affected Capabilities

- **scheduled-data-sync**: Adds new callable function trigger alongside existing scheduled trigger

## Dependencies

- None (extends existing functionality)

## Risks & Mitigations

**Risk**: Unauthorized access if admin user ID is compromised  
**Mitigation**: Use Firebase Auth UID (not predictable), store in environment variables (not in code), consider adding IP allowlisting if needed

**Risk**: Concurrent executions (scheduled + manual) could cause conflicts  
**Mitigation**: Document that manual syncs should be avoided during scheduled sync window (23:00 UTC), consider adding execution lock in future if needed

**Risk**: Resource exhaustion from repeated manual syncs  
**Mitigation**: Rely on Firebase Function timeout limits (10 minutes max), document appropriate usage patterns

## Open Questions

None - all questions have been clarified.
