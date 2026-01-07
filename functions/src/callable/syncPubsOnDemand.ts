import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { runFullSync, runUpdateSync } from '../scheduled/syncPubs';

// Request type definitions
interface FullSyncRequest {
  mode: 'full';
  count?: number;
  start?: number;
}

interface UpdateSyncRequest {
  mode: 'update';
  since: string;
}

type SyncRequest = FullSyncRequest | UpdateSyncRequest;

// Response type definition
interface SyncResponse {
  mode: string;
  successCount: number;
  failureCount: number;
  parameters?: {
    count?: number;
    start?: number;
    since?: string;
  };
}

/**
 * On-demand pub sync callable function
 * Allows authorized administrators to trigger pub syncs remotely
 */
export const syncPubsOnDemand = onCall(
  {
    region: 'europe-west2',
    memory: '256MiB',
    timeoutSeconds: 600,
    maxInstances: 1,
  },
  async (request): Promise<SyncResponse> => {
    const { auth, data } = request;

    // Authorization: Check if WETHERSPOONING_ADMIN_USER_ID is configured
    const adminUserId = process.env.WETHERSPOONING_ADMIN_USER_ID;
    if (!adminUserId) {
      console.error('❌ WETHERSPOONING_ADMIN_USER_ID environment variable not set');
      throw new HttpsError('internal', 'Server configuration error: WETHERSPOONING_ADMIN_USER_ID not set');
    }

    const startTime = Date.now();
    console.log(`🚀 Sync function invoked at ${new Date().toISOString()}`);

    // Authorization: Check if user is authenticated
    if (!auth) {
      console.warn('⚠️  Unauthorized access attempt: No authentication');
      throw new HttpsError('permission-denied', 'Unauthorized: Admin access required');
    }

    // Authorization: Check if user UID matches admin UID
    if (auth.uid !== adminUserId) {
      console.warn(`⚠️  Unauthorized access attempt by UID: ${auth.uid}`);
      throw new HttpsError('permission-denied', 'Unauthorized: Admin access required');
    }

    console.log(`✅ Authorized access by admin UID: ${auth.uid}`);

    // Parameter validation: Check mode parameter exists
    if (!data || typeof data.mode !== 'string') {
      throw new HttpsError('invalid-argument', 'Missing required parameter: mode');
    }

    const syncRequest = data as SyncRequest;

    // Parameter validation: Validate mode value
    if (syncRequest.mode !== 'full' && syncRequest.mode !== 'update') {
      throw new HttpsError('invalid-argument', "Invalid mode. Must be 'full' or 'update'");
    }

    // Mode-specific parameter validation and execution
    if (syncRequest.mode === 'full') {
      // Validate full sync parameters
      const count = syncRequest.count;
      const start = syncRequest.start ?? 0;

      if (count !== undefined && (typeof count !== 'number' || count < 0)) {
        throw new HttpsError('invalid-argument', 'Invalid count. Must be a non-negative number');
      }

      if (typeof start !== 'number' || start < 0) {
        throw new HttpsError('invalid-argument', 'Invalid start. Must be a non-negative number');
      }

      console.log(`🚀 On-demand full sync initiated by ${auth.uid} with count: ${count ?? 'all'}, start: ${start}`);

      try {
        const result = await runFullSync(count, start);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ On-demand full sync completed in ${duration}s: ${result.successCount} successful, ${result.failureCount} failed`);

        return {
          mode: 'full',
          successCount: result.successCount,
          failureCount: result.failureCount,
          parameters: {
            ...(count !== undefined && { count }),
            start,
          },
        };
      } catch (error) {
        console.error('❌ Full sync execution failed:', error);
        throw new HttpsError('internal', 'Sync execution failed. Check logs for details');
      }
    } else {
      // Update sync mode
      const { since } = syncRequest;

      // Validate since parameter exists
      if (!since || typeof since !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing required parameter for update mode: since');
      }

      // Validate since is a valid ISO 8601 date string
      const sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        throw new HttpsError('invalid-argument', 'Invalid since date. Must be a valid ISO 8601 date string');
      }

      console.log(`🚀 On-demand update sync initiated by ${auth.uid} with since: ${since}`);

      try {
        const result = await runUpdateSync(sinceDate);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ On-demand update sync completed in ${duration}s: ${result.successCount} successful, ${result.failureCount} failed`);

        return {
          mode: 'update',
          successCount: result.successCount,
          failureCount: result.failureCount,
          parameters: {
            since,
          },
        };
      } catch (error) {
        console.error('❌ Update sync execution failed:', error);
        throw new HttpsError('internal', 'Sync execution failed. Check logs for details');
      }
    }
  }
);
