# firebase-data-integration Delta

## ADDED Requirements

### Requirement: Internal Sync-State Storage (REQ-FDI-019)
**Priority:** MUST  
**Category:** Infrastructure

The system MUST store internal scheduled-sync state in Firestore to support incremental processing.

**Acceptance Criteria:**
- The backend uses Firestore (Admin SDK) to store scheduled-sync metadata.
- Sync-state documents are stored outside the publicly readable `pubs` collection (e.g., under `syncState/*`).
- Client applications MUST NOT be able to read or write sync-state documents.
- Stored metadata is limited to what is required for incremental sync (e.g., sitemap hash/snapshot).

#### Scenario: Client Cannot Read Sync State
**Given** a client app is authenticated or unauthenticated  
**When** it attempts to read `syncState/pubsSitemap`  
**Then** the Firestore security rules deny the read

#### Scenario: Backend Writes Sync State
**Given** the scheduled Cloud Function is running using the Firestore Admin SDK  
**When** it persists the latest sitemap snapshot  
**Then** the write succeeds regardless of client security rules
