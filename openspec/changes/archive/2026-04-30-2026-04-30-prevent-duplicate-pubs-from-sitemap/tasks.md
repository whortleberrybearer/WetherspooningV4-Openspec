## 1. Implementation
- [x] 1.1 Add a URL canonicalization helper that derives a base slug by stripping trailing `-<number>` from the last path segment
- [x] 1.2 Add duplicate detection logic for sitemap entries based on (base slug + scraped address equality)
- [x] 1.3 Ensure the in-run matching set includes pubs created earlier in the same invocation (full sync and update sync)
- [x] 1.4 Implement canonical selection rules for duplicates:
  - [x] Prefer the entry with non-empty `imageUrl`
  - [x] Otherwise prefer non-suffixed URL over suffixed
  - [x] Update the chosen record’s stored `url`/`imageUrl` when a better canonical candidate is found later in the run
- [x] 1.5 Add structured logging for duplicate detection and canonical switching (e.g., “duplicate detected”, “skipping”, “upgrading url/image”) without excessive verbosity

## 2. Tests
- [x] 2.1 Add unit tests for URL canonicalization (base slug extraction)
- [x] 2.2 Add unit tests for duplicate confirmation by address (same address => skip creating a second record)
- [x] 2.3 Add unit tests for canonical selection:
  - [x] Prefer URL with image when duplicates confirmed
  - [x] Prefer non-suffixed when images are equal
  - [x] Do not dedupe when addresses differ

## 3. Validation
- [x] 3.1 Run `npm test` under `functions/` and ensure all tests pass
- [x] 3.2 Run a controlled test fixture containing `-2/-3` variants (via Jest) to validate dedupe and canonical selection
