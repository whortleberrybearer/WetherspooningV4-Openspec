# Proposal: Add Visit Ratings and Notes

## Context
Currently, the Wetherspooning application allows users to track pub visits with only a visit date (which can be omitted). Users cannot record their experience or rating of each visit. This limits the ability to remember why they liked or disliked specific pubs and reduces engagement with the visit tracking feature.

## Problem
- Users have no way to rate their visit experience (1-5 stars)
- Users cannot add personal notes or comments about their visit
- Visit data lacks context beyond "I was here on this date"
- InfoWindow displays only basic visit status, missing rich visit details
- The visit box (PubDetailSheet) has no fields for capturing ratings or notes

## Proposed Solution
Extend the visit tracking system to capture and display ratings (1-5 stars) and notes for each visit:

1. **Data Model**: Add `rating` (number, 1-5) and `notes` (string) fields to Visit interface (already present in schema but not exposed in UI)
2. **Capture UI**: Add rating selector and notes textarea to PubDetailSheet visit form
3. **Display UI**: Show rating and notes in InfoWindow when viewing visited pubs

## Success Metrics
- Users can add/update ratings and notes when tracking visits
- Ratings and notes persist to Firestore
- InfoWindow displays rating stars and note preview for visited pubs
- All existing visit functionality continues to work unchanged

## Dependencies
- Requires `pub-visit-data` spec (Visit data structure)
- Requires `enhanced-infowindow-display` spec (InfoWindow display)
- Build on existing PubDetailSheet component

## Risks & Mitigation
- **Risk**: UI cluttered in PubDetailSheet
  - **Mitigation**: Keep UI minimal with optional fields, use proper spacing
- **Risk**: InfoWindow becomes too large with additional content
  - **Mitigation**: Show rating inline with badges, truncate notes preview to 1-2 lines

## Open Questions
- Should rating be required or optional? (Proposal: optional, like visitedAt)
- Should notes have a character limit? (Proposal: reasonable limit like 500 chars)
- Should rating display as stars or numbers in InfoWindow? (Proposal: stars for visual clarity)
