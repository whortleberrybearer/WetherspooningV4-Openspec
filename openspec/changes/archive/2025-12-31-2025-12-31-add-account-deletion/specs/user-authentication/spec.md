# user-authentication Specification Delta

## ADDED Requirements

### Requirement: Re-authentication (REQ-UA-004)
**Priority:** MUST  
**Category:** Security

The system MUST provide a method to re-authenticate users before performing sensitive operations.

**Acceptance Criteria:**
- `reauthenticate(password: string)` method is available in useAuth composable
- Method uses Firebase reauthenticateWithCredential API
- Method requires current user's email and provided password
- Method creates EmailAuthProvider credential
- Successful re-authentication resolves Promise without error
- Failed re-authentication rejects Promise with error message
- Error messages are user-friendly
- Network errors are caught and returned as error messages
- Method validates that user is currently authenticated before attempting re-auth

#### Scenario: Successfully Re-authenticate User
**Given** the user is authenticated with email "user@example.com"  
**And** the user's password is "correctpassword123"  
**When** `reauthenticate("correctpassword123")` is called  
**Then** Firebase reauthenticateWithCredential is invoked with correct credentials  
**And** the Promise resolves successfully  
**And** no error is thrown  
**And** the user remains authenticated

#### Scenario: Re-authenticate with Incorrect Password
**Given** the user is authenticated with email "user@example.com"  
**And** the user's password is "correctpassword123"  
**When** `reauthenticate("wrongpassword")` is called  
**Then** Firebase reauthenticateWithCredential is invoked  
**And** the Promise rejects with error message "Incorrect password. Please try again."  
**And** the user remains authenticated

#### Scenario: Attempt Re-authentication When Not Authenticated
**Given** the user is not authenticated  
**When** `reauthenticate("anypassword")` is called  
**Then** the Promise rejects immediately with error message "No user is currently logged in."  
**And** no Firebase API calls are made

#### Scenario: Handle Network Error During Re-authentication
**Given** the user is authenticated  
**And** the network is unavailable  
**When** `reauthenticate("correctpassword123")` is called  
**Then** Firebase reauthenticateWithCredential fails with network error  
**And** the Promise rejects with error message "Network error. Please check your connection and try again."

---

### Requirement: Account Deletion (REQ-UA-005)
**Priority:** MUST  
**Category:** Functional

The system MUST provide a method to permanently delete the current user's account and all associated data.

**Acceptance Criteria:**
- `deleteAccount()` method is available in useAuth composable
- Method deletes all user data from Firestore before deleting Auth account
- Method calls firebaseDataService.deleteUserData(userId) first
- Method calls Firebase deleteUser() after Firestore deletion succeeds
- Method clears authentication state after successful deletion
- Method sets user to null after deletion
- Method sets isAuthenticated to false after deletion
- Method validates user is authenticated before attempting deletion
- Failed Firestore deletion stops process before Auth deletion
- Failed Auth deletion logs error and reports to user
- Method returns Promise that resolves on success or rejects with error
- Error messages are user-friendly

#### Scenario: Successfully Delete User Account
**Given** the user is authenticated with userId "user123"  
**And** the user has 5 visits in Firestore  
**When** `deleteAccount()` is called  
**Then** firebaseDataService.deleteUserData("user123") is called  
**And** all 5 visits are deleted from Firestore  
**And** Firebase deleteUser() is called  
**And** the Firebase Auth account is deleted  
**And** the authentication state is cleared  
**And** user is set to null  
**And** isAuthenticated is set to false  
**And** the Promise resolves successfully

#### Scenario: Handle Firestore Deletion Failure
**Given** the user is authenticated with userId "user123"  
**And** a network error occurs during Firestore operations  
**When** `deleteAccount()` is called  
**Then** firebaseDataService.deleteUserData("user123") is called  
**And** the Firestore operation fails  
**And** Firebase deleteUser() is NOT called  
**And** the authentication state remains unchanged  
**And** the user remains authenticated  
**And** the Promise rejects with error message "Failed to delete account data. Please check your connection and try again."

#### Scenario: Handle Auth Deletion Failure
**Given** the user is authenticated with userId "user123"  
**And** Firestore deletion succeeds  
**And** a network error occurs during Auth deletion  
**When** `deleteAccount()` is called  
**Then** firebaseDataService.deleteUserData("user123") succeeds  
**And** Firebase deleteUser() is called  
**And** the Auth deletion fails  
**And** the Promise rejects with error message "Failed to delete account. Please try again or contact support."  
**And** the authentication state remains unchanged

#### Scenario: Attempt Deletion When Not Authenticated
**Given** the user is not authenticated  
**When** `deleteAccount()` is called  
**Then** the Promise rejects immediately with error message "No user is currently logged in."  
**And** no Firebase or Firestore operations are performed

---

## MODIFIED Requirements

### Requirement: Logout Functionality (REQ-UA-003)
**Priority:** MUST  
**Category:** Functional

**Changes:**
- ADD: Clear error state on logout

The system MUST provide logout functionality that clears authentication state, Firebase session, and any error messages.

**Updated Acceptance Criteria:**
- Logout action is accessible to authenticated users
- Logout calls Firebase Auth signOut method
- Logout clears user state
- Logout sets authenticated state to false
- **ADDED:** Logout clears error state
- Logout action is immediate (no confirmation required)
- After logout, UI returns to unauthenticated state
- Firebase session is terminated on logout

#### Scenario: Logout
**MODIFIED:**
**Given** the user is authenticated via Firebase  
**When** the user clicks the "Logout" button  
**Then** Firebase signOut is called  
**And** the Firebase session is terminated  
**And** the authentication state is cleared  
**And** the user state is set to null  
**And** the authenticated state is false  
**And** the error state is cleared  
**And** the UI displays the "Login" button again  
**And** the user menu is hidden

