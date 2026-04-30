## 1. Implementation
- [ ] 1.1 Add a URL canonicalization helper that derives a base slug by stripping trailing `-<number>` from the last path segment
- [ ] 1.2 Add duplicate detection logic for sitemap entries based on (base slug + scraped address equality)
- [ ] 1.3 Ensure the in-run matching set includes pubs created earlier in the same invocation (full sync and update sync)
- [ ] 1.4 Implement canonical selection rules for duplicates:
  - [ ] Prefer the entry with non-empty `imageUrl`
  - [ ] Otherwise prefer non-suffixed URL over suffixed
  - [ ] Update the chosen record’s stored `url`/`imageUrl` when a better canonical candidate is found later in the run
- [ ] 1.5 Add structured logging for duplicate detection and canonical switching (e.g., “duplicate detected”, “skipping”, “upgrading url/image”) without excessive verbosity

## 2. Tests
- [ ] 2.1 Add unit tests for URL canonicalization (base slug extraction)
- [ ] 2.2 Add unit tests for duplicate confirmation by address (same address => skip creating a second record)
- [ ] 2.3 Add unit tests for canonical selection:
  - [ ] Prefer URL with image when duplicates confirmed
  - [ ] Prefer non-suffixed when images are equal
  - [ ] Do not dedupe when addresses differ

## 3. Validation
- [ ] 3.1 Run `npm test` under `functions/` and ensure all tests pass
- [ ] 3.2 Run a local emulator or dry-run script (if available) against a controlled sitemap fixture containing `-2/-3` variants
