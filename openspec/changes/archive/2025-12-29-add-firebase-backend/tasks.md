# Tasks: Add Firebase Backend

## Setup and Configuration
- [x] Create Firebase project in Firebase Console
- [x] Enable Firestore Database in production mode
- [x] Generate web app configuration credentials
- [x] Create `.env.local` file with Firebase credentials
- [x] Add `.env.local` to `.gitignore` if not already present
- [x] Create `.env.example` file with placeholder values for documentation

## Dependencies and Infrastructure
- [x] Install Firebase SDK packages: `firebase` (firestore module)
- [x] Create `src/lib/firebase.ts` for Firebase initialization
- [x] Create `src/services/firebaseDataService.ts` for pub data operations
- [x] Create TypeScript interfaces for Firestore pub documents

## Local Development Setup
- [x] Install Firebase CLI globally: `npm install -g firebase-tools`
- [x] Login to Firebase: `firebase login`
- [x] Initialize Firebase Emulators: `firebase init emulators`
- [x] Select Firestore Emulator during initialization
- [x] Configure `firebase.json` with emulator ports (Firestore: 8080, UI: 4000)
- [x] Add emulator connection logic to `src/lib/firebase.ts` (detect DEV mode)
- [x] Create `scripts/seedEmulator.js` to populate emulator with test data
- [x] Add npm script for starting emulator: `"emulator": "firebase emulators:start"`
- [x] Test emulator can start and UI is accessible at localhost:4000
- [x] Document emulator workflow in README.md

## Data Migration
- [x] Create `scripts/migrateToFirestore.ts` migration script for pubs
- [x] Install `firebase-admin` package as dev dependency for migration
- [x] Generate service account key for Admin SDK
- [x] Run migration script to upload pubs data to Firestore
- [x] Verify pub data in Firestore Console
- [x] Document migration process in README or separate MIGRATION.md

## Firestore Security Rules
- [x] Create `firestore.rules` file in project root
- [x] Implement public read, admin-only write rules for `pubs` collection
- [x] Deploy security rules using Firebase CLI or Console
- [x] Test rules with Firebase Emulator or Console test interface

## Data Service Implementation
- [x] Implement `getAllPubs()` method in firebaseDataService
- [x] Implement `getPubById()` method in firebaseDataService
- [x] Implement error handling with try-catch and logging
- [x] Add timeout handling (10 second limit)
- [x] Add data validation for Firestore pub responses

## Component Integration
- [x] Update `PubLocationsMap.vue` to use `getAllPubs()` from firebaseDataService
- [x] Remove `fetch('/data/pubs-sample.json')` call
- [x] Update error handling for Firestore-specific errors
- [x] Test map loading with Firestore data

## Spec Updates
- [x] Create `specs/firebase-data-integration/spec.md` with pub-related requirements
- [x] Create `specs/pub-locations-map/spec.md` delta for modified REQ-PLM-003

## Testing and Validation
- [ ] Test pub data loading from Firestore in development
- [ ] Test error handling when Firestore is unavailable (network offline)
- [ ] Test loading states and error states in UI
- [ ] Verify markers display correctly with Firestore pub data
- [ ] Verify sidebar displays pub list from Firestore
- [ ] Verify visits still load from JSON file correctly
- [ ] Test performance (initial pub load <2 seconds)

## Documentation
- [x] Update `openspec/project.md` to add Firebase to tech stack backend
- [x] Document Firebase setup process in README.md
- [x] Document environment variables in .env.example
- [x] Add troubleshooting section for common Firebase errors
- [x] Note that visits remain file-based for now

## Cleanup
- [x] Keep `pubs-sample.json` as reference/backup
- [x] Ensure `visits-sample.json` remains active and functional
- [x] Remove any placeholder or test code
