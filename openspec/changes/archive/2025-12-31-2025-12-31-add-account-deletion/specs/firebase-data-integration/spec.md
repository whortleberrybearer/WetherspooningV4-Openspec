# firebase-data-integration Specification Delta

## ADDED Requirements

### Requirement: User Data Deletion (REQ-FDI-015)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a method to delete all user-specific data from Firestore.

**Acceptance Criteria:**
- `deleteUserData(userId: string)` method is available in firebaseDataService
- Method deletes all visits documents where userId matches
- Method uses Firestore batch operations for atomic deletion
- Method commits batch operation
- Successful deletion resolves Promise without error
- Failed deletion rejects Promise with error message
- Method handles case where user has no visits (succeeds without error)
- Method validates userId parameter is provided and non-empty
- Network errors are caught and returned as error messages
- Error messages are user-friendly

#### Scenario: Delete All User Visits
**Given** a user with userId "user123" has 5 visit documents in Firestore  
**When** `deleteUserData("user123")` is called  
**Then** a Firestore query finds all visits where userId equals "user123"  
**And** all 5 visit documents are added to a batch delete operation  
**And** the batch is committed  
**And** all 5 visits are deleted from Firestore  
**And** the Promise resolves successfully

#### Scenario: Delete User Data When No Visits Exist
**Given** a user with userId "user456" has no visit documents in Firestore  
**When** `deleteUserData("user456")` is called  
**Then** a Firestore query finds no visits where userId equals "user456"  
**And** an empty batch operation is created  
**And** the batch is committed (no-op)  
**And** the Promise resolves successfully

#### Scenario: Handle Invalid UserId Parameter
**Given** the deleteUserData method is called  
**When** the userId parameter is empty string ""  
**Then** the Promise rejects immediately with error message "Invalid user ID provided."  
**And** no Firestore operations are performed

#### Scenario: Handle Network Error During Deletion
**Given** a user with userId "user123" has visits in Firestore  
**And** the network is unavailable  
**When** `deleteUserData("user123")` is called  
**Then** the Firestore query or batch commit fails  
**And** the Promise rejects with error message "Failed to delete user data. Please check your connection and try again."  
**And** no visits are deleted (batch ensures atomicity)

#### Scenario: Handle Partial Query Failure
**Given** a user with userId "user123" has visits in Firestore  
**And** the Firestore query fails due to permissions or network error  
**When** `deleteUserData("user123")` is called  
**Then** the query operation fails  
**And** the Promise rejects with error message "Failed to retrieve user data for deletion. Please try again."  
**And** no visits are deleted

---

### Requirement: Batch Deletion Atomicity (REQ-FDI-016)
**Priority:** MUST  
**Category:** Functional

The system MUST ensure user data deletion is atomic using Firestore batch operations.

**Acceptance Criteria:**
- All visit deletions for a user happen in a single batch
- Batch size does not exceed Firestore limit (500 operations)
- If batch commit fails, no visits are deleted
- If batch commit succeeds, all visits are deleted
- Partial deletions do not occur
- Method handles large numbers of visits (>500) by splitting into multiple batches
- All batches must succeed for Promise to resolve
- If any batch fails, method returns error and stops processing

#### Scenario: Delete User with Many Visits Using Multiple Batches
**Given** a user with userId "user123" has 750 visit documents in Firestore  
**When** `deleteUserData("user123")` is called  
**Then** the first batch contains 500 delete operations  
**And** the first batch is committed  
**And** the second batch contains 250 delete operations  
**And** the second batch is committed  
**And** all 750 visits are deleted from Firestore  
**And** the Promise resolves successfully

#### Scenario: Handle Multi-Batch Failure
**Given** a user with userId "user123" has 750 visit documents  
**And** the first batch of 500 deletions succeeds  
**And** the second batch of 250 deletions fails due to network error  
**When** `deleteUserData("user123")` is called  
**Then** the first 500 visits are deleted  
**And** the second batch fails  
**And** the Promise rejects with error message "Failed to delete all user data. Some data may remain. Please try again."  
**And** 250 visits remain in Firestore

#### Scenario: Ensure Single Batch Atomicity
**Given** a user with userId "user123" has 50 visit documents  
**And** a network error occurs during batch commit  
**When** `deleteUserData("user123")` is called  
**Then** the batch commit fails  
**And** no visits are deleted from Firestore  
**And** the Promise rejects with error message "Failed to delete user data. Please check your connection and try again."

