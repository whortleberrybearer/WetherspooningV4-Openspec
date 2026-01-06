# Design: Add On-Demand Pub Sync

## Architecture Overview

This change adds a new Firebase Callable Function (`syncPubsOnDemand`) that wraps the existing `runFullSync` and `runUpdateSync` functions, providing secure remote access to manual sync operations.

```
┌─────────────────────────────────────────────────────────┐
│                    Client / Admin                        │
│         (Firebase Auth, callable function SDK)           │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Authenticated Call
                     ▼
┌─────────────────────────────────────────────────────────┐
│            syncPubsOnDemand (onCall)                     │
│  ┌────────────────────────────────────────────────┐     │
│  │ 1. Verify auth.uid matches ADMIN_USER_ID       │     │
│  │ 2. Parse & validate parameters                 │     │
│  │ 3. Route to runFullSync or runUpdateSync       │     │
│  │ 4. Return results                              │     │
│  └────────────────────────────────────────────────┘     │
└─────────────┬───────────────────────┬───────────────────┘
              │                       │
              │ mode: 'full'          │ mode: 'update'
              ▼                       ▼
   ┌──────────────────┐    ┌──────────────────┐
   │  runFullSync()   │    │ runUpdateSync()  │
   │  (existing)      │    │  (existing)      │
   └──────────────────┘    └──────────────────┘
```

## Key Design Decisions

### 1. Function Type: Callable vs HTTP

**Decision**: Use `onCall` (Callable Function)

**Rationale**:
- Automatic Firebase Auth integration - `context.auth` is populated automatically
- Built-in HTTPS encryption and CORS handling
- Simpler client invocation via Firebase SDK
- Type-safe request/response through callable SDK
- Better error handling with standard callable error codes

**Alternative Considered**: `onRequest` (HTTP Function)
- Requires manual auth token verification
- More complex error handling
- Better for webhook integrations (not needed here)

### 2. Authorization Strategy

**Decision**: Environment variable with single admin UID

**Rationale**:
- Simple and secure for single-admin use case
- Firebase Auth UID is non-predictable (unlike email)
- Can be easily updated via Firebase environment config
- No additional database reads required
- Clear audit trail through Firebase Auth logs

**Implementation**:
```typescript
const adminUserId = process.env.ADMIN_USER_ID;
if (!context.auth || context.auth.uid !== adminUserId) {
  throw new HttpsError('permission-denied', 'Unauthorized');
}
```

**Future Extension**: If multiple admins are needed, can switch to:
- Firestore collection of admin UIDs
- Firebase Custom Claims with `admin: true` flag

### 3. Parameter Schema

**Decision**: Single request object with discriminated union by mode

**Request Schema**:
```typescript
type SyncRequest = 
  | { mode: 'full'; count?: number; start?: number }
  | { mode: 'update'; since: string }  // ISO 8601 date string
```

**Rationale**:
- Type-safe parameter handling
- Clear separation between full and update sync modes
- Matches existing function signatures
- Easy to validate and document

**Alternative Considered**: Separate callable functions for full/update
- Would require two function deployments
- More complex to maintain
- Less flexible for client code

### 4. Response Format

**Decision**: Return success/failure counts and mode

**Response Schema**:
```typescript
interface SyncResponse {
  mode: 'full' | 'update';
  successCount: number;
  failureCount: number;
  parameters?: {
    count?: number;
    start?: number;
    since?: string;
  };
}
```

**Rationale**:
- Consistent with existing function return values
- Provides actionable feedback to caller
- Enables monitoring and alerting
- Parameters echo useful for debugging

### 5. Error Handling

**Decision**: Use callable function error codes

**Error Cases**:
- `permission-denied`: User not authenticated or not admin
- `invalid-argument`: Missing or invalid parameters (e.g., invalid date string, negative count)
- `internal`: Sync execution failed (catch and wrap errors from sync functions)

**Rationale**:
- Standard Firebase Callable error handling
- Clients can differentiate error types
- Proper HTTP status codes automatically set

### 6. Logging Strategy

**Decision**: Reuse existing sync function logs, add auth/invocation metadata

**Additional Logs**:
- Function invocation with user UID and parameters
- Authorization success/failure
- Parameter validation results

**Rationale**:
- Maintains consistency with scheduled sync logs
- Provides audit trail for manual sync operations
- Minimal code duplication

## Environment Configuration

**New Environment Variable**:
```
ADMIN_USER_ID=<firebase-auth-uid>
```

**Configuration Steps**:
1. Development/Emulator: Set in `.env` file
2. Production: `firebase functions:config:set admin.user_id=<uid>`

## Security Considerations

1. **Authentication**: Enforced by Firebase Callable Functions (context.auth)
2. **Authorization**: UID comparison against environment variable
3. **Input Validation**: Strict parameter type checking and range validation
4. **Rate Limiting**: Handled by Firebase Functions platform limits
5. **Audit Trail**: All invocations logged with UID and parameters

## Deployment Considerations

1. **Environment Variable**: Must be set before function is called (deployment won't fail if missing, but calls will fail)
2. **Region**: Should match existing scheduled function (europe-west2)
3. **Timeout**: Inherit from scheduled function (600 seconds / 10 minutes)
4. **Memory**: Inherit from scheduled function (256MiB)
5. **Backward Compatibility**: No changes to existing scheduled function or script

## Testing Strategy

1. **Unit Tests**: Mock context.auth, test authorization logic, parameter validation
2. **Integration Tests**: Test with Firebase emulator, verify sync execution
3. **Manual Testing**: 
   - Call from Firebase CLI: `firebase functions:call syncPubsOnDemand --data '{"mode":"full","count":2}'`
   - Call from frontend with Firebase SDK
   - Verify unauthorized access is rejected

## Alternative Approaches Considered

### Approach 1: HTTP Endpoint with API Key
**Rejected**: Less secure than Firebase Auth, requires additional secret management

### Approach 2: Firestore Trigger (write to `/admin/sync-requests` collection)
**Rejected**: More complex, requires cleanup logic, less direct feedback to caller

### Approach 3: Extend Scheduled Function to Check Firestore Flag
**Rejected**: Requires polling or manual function restart, poor UX for on-demand execution
