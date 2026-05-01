# Tasks: Fix false “duplicate detected” logging in full pub sync

## 1. Implementation
- [x] Add an exact-URL lookup index for existing pubs during full sync processing.
- [x] Update full sync flow to treat URL matches as normal “existing pub” processing, not as dedupe.
- [x] Apply location-based dedupe only when a second, distinct sitemap URL is encountered for an already-known location key.
- [x] Ensure “Duplicate detected …” logs only occur for true duplicates (distinct URL; same trimmed address).

## 2. Tests
- [x] Add/update Jest coverage for full sync ensuring that a normal URL match does not produce a “duplicate detected” log.
- [x] Add/update Jest coverage ensuring that when base + numeric-suffix variants for the same address appear in one invocation, exactly one pub is written and the canonical URL selection rules still apply.

## 3. Validation
- [x] Run functions test suite: `cd functions; npm test`.
- [x] Run OpenSpec validation: `openspec validate 2026-05-01-fix-full-sync-duplicate-detection-logging --strict`.
