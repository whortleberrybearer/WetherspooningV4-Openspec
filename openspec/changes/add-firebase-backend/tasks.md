# Tasks: Add Firebase Backend

## Setup and Configuration
- [ ] Create Firebase project in Firebase Console
- [ ] Enable Firestore Database in production mode
- [ ] Generate web app configuration credentials
- [ ] Create `.env.local` file with Firebase credentials
- [ ] Add `.env.local` to `.gitignore` if not already present
- [ ] Create `.env.example` file with placeholder values for documentation

## Dependencies and Infrastructure
- [ ] Install Firebase SDK packages: `firebase` (firestore module)
- [ ] Create `src/lib/firebase.ts` for Firebase initialization
- [ ] Create `src/services/firebaseDataService.ts` for pub data operations
- [ ] Create TypeScript interfaces for Firestore pub documents

## Local Development Setup
- [ ] Install Firebase CLI globally: `npm install -g firebase-tools`
- [ ] Login to Firebase: `firebase login`
- [ ] Initialize Firebase Emulators: `firebase init emulators`
- [ ] Select Firestore Emulator during initialization
- [ ] Configure `firebase.json` with emulator ports (Firestore: 8080, UI: 4000)
- [ ] Add emulator connection logic to `src/lib/firebase.ts` (detect DEV mode)
- [ ] Create `scripts/seedEmulator.js` to populate emulator with test data
- [ ] Add npm script for starting emulator: `"emulator": "firebase emulators:start"`
- [ ] Test emulator can start and UI is accessible at localhost:4000
- [ ] Document emulator workflow in README.md

## Data Migration
- [ ] Create `scripts/migrateToFirestore.ts` migration script for pubs
- [ ] Install `firebase-admin` package as dev dependency for migration
- [ ] Generate service account key for Admin SDK
- [ ] Run migration script to upload pubs data to Firestore
- [ ] Verify pub data in Firestore Console
- [ ] Document migration process in README or separate MIGRATION.md

## Firestore Security Rules
- [ ] Create `firestore.rules` file in project root
- [ ] Implement public read, admin-only write rules for `pubs` collection
- [ ] Deploy security rules using Firebase CLI or Console
- [ ] Test rules with Firebase Emulator or Console test interface

## Data Service Implementation
- [ ] Implement `getAllPubs()` method in firebaseDataService
- [ ] Implement `getPubById()` method in firebaseDataService
- [ ] Implement error handling with try-catch and logging
- [ ] Add timeout handling (10 second limit)
- [ ] Add data validation for Firestore pub responses

## Component Integration
- [ ] Update `PubLocationsMap.vue` to use `getAllPubs()` from firebaseDataService
- [ ] Remove `fetch('/data/pubs-sample.json')` call
- [ ] Update error handling for Firestore-specific errors
- [ ] Test map loading with Firestore data

## Spec Updates
- [ ] Create `specs/firebase-data-integration/spec.md` with pub-related requirements
- [ ] Create `specs/pub-locations-map/spec.md` delta for modified REQ-PLM-003

## Testing and Validation
- [ ] Test pub data loading from Firestore in development
- [ ] Test error handling when Firestore is unavailable (network offline)
- [ ] Test loading states and error states in UI
- [ ] Verify markers display correctly with Firestore pub data
- [ ] Verify sidebar displays pub list from Firestore
- [ ] Verify visits still load from JSON file correctly
- [ ] Test performance (initial pub load <2 seconds)

## Documentation
- [ ] Update `openspec/project.md` to add Firebase to tech stack backend
- [ ] Document Firebase setup process in README.md
- [ ] Document environment variables in .env.example
- [ ] Add troubleshooting section for common Firebase errors
- [ ] Note that visits remain file-based for now

## Cleanup
- [ ] Keep `pubs-sample.json` as reference/backup
- [ ] Ensure `visits-sample.json` remains active and functional
- [ ] Remove any placeholder or test code
