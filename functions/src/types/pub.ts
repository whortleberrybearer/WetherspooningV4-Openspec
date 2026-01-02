import { Timestamp } from 'firebase-admin/firestore';

export interface Pub {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  lastSyncedAt: Timestamp;
}

export interface ScrapedPubData {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
}

export interface SitemapEntry {
  url: string;
  imageUrl: string;
}
