import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

// Export functions
export { scheduledSyncPubs } from './scheduled/syncPubs';
export { syncPubsOnDemand } from './callable/syncPubsOnDemand';
