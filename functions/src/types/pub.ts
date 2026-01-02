import { Timestamp } from 'firebase-admin/firestore';

export interface Position {
  lat: number;
  lng: number;
}

export interface Pub {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  address: string;
  townCity: string;
  position: Position | null;
  openState: string;
  lastSyncedAt: Timestamp;
}

export interface ScrapedPubData {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  address: string;
  townCity: string;
  position: Position | null;
  openState: string;
}

export interface SitemapEntry {
  url: string;
  imageUrl: string;
}
