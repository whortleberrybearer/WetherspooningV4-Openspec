# Proposal: Add Firebase Backend

## Overview
Replace static pub data JSON file (`pubs-sample.json`) with Firebase Firestore database integration to enable centralized pub data management and future scalability.

## Motivation
The current implementation uses a static JSON file for pub data, which:
- Requires manual file updates to add or modify pub data
- Cannot scale beyond sample data without rebuilding the app
- Makes it difficult to maintain accurate pub information (open/closed status)
- Prevents future admin interfaces for pub data management

Firebase provides:
- Cloud database (Firestore) for centralized, scalable pub data storage
- SDK for web applications with TypeScript support
- Free tier suitable for development and small-scale deployment
- Foundation for future real-time updates and admin features

## Current Behavior
- Pub data is fetched from `/data/pubs-sample.json` on map initialization
- Visit data remains in `/data/visits-sample.json` (unchanged by this proposal)
- Authentication remains file-based/static (unchanged by this proposal)
- Sample data includes ~20 pubs

## Proposed Changes
1. **Add Firebase SDK and Configuration**
   - Install Firebase npm packages (firestore only)
   - Configure Firebase project with Firestore
   - Set up environment variables for Firebase credentials
   - Initialize Firebase in the application

2. **Create Firestore Data Service**
   - New `firebase-data-integration` capability/spec
   - Service layer to abstract Firestore operations for pubs
   - Methods for reading pub data only
   - Error handling and retry logic

3. **Update Pub Data Loading**
   - Modify `pub-locations-map` to load pubs from Firestore instead of JSON
   - Update loading states and error handling
   - Maintain all existing functionality

4. **Data Migration**
   - Migrate pubs-sample.json data to Firestore `pubs` collection
   - Set up Firestore security rules for read-only pub access
   - Document data schema and collection structure

## Affected Specifications
- **NEW:** `firebase-data-integration` - Firebase setup, configuration, and pub data service layer
- **MODIFIED:** `pub-locations-map` - Update REQ-PLM-003 (Data Source) to use Firestore

## Dependencies
- Firebase project must be created and configured before implementation
- Environment variables must be set up for Firebase credentials
- Pub data must be migrated to Firestore before testing

## Implementation Scope
This change includes:
- Firebase SDK installation and initialization (Firestore only)
- Firestore data service creation for pub operations
- Update to pub data loading in map component
- Pub data migration script/documentation
- Firestore security rules for pubs collection

This change excludes:
- Visit data migration (remains in visits-sample.json)
- Authentication changes (remains static/file-based)
- Real-time data synchronization (future enhancement)
- Offline data caching (future enhancement)
- Visit write operations (future enhancement)
- Admin interface for pub data management (future enhancement)

## Risks and Mitigations
**Risk:** Firebase costs could increase with usage  
**Mitigation:** Start with free tier (pub data is read-only and small dataset), monitor usage

**Risk:** Migration may break existing functionality  
**Mitigation:** Test thoroughly, keep JSON file as backup for rollback

**Risk:** Firebase configuration complexity  
**Mitigation:** Document setup steps clearly, provide example environment variables

**Risk:** Network dependency for pub data loading  
**Mitigation:** Implement proper loading states, error handling, and graceful degradation

## Out of Scope
This proposal explicitly does NOT change:
- Visit data loading (remains in `/data/visits-sample.json`)
- Authentication system (remains static/file-based)
- User data storage or management
