import { Timestamp } from 'firebase-admin/firestore';

export interface Pub {
  id: string;
  name: string;
  url: string;
  lastSyncedAt: Timestamp;
}

export interface ScrapedPubData {
  id: string;
  name: string;
  url: string;
}
