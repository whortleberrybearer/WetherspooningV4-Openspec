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
  townCityOverride?: string;
  country?: string;
  county?: string;
  countyOverride?: string;
  position: Position | null;
  openState: string;
  isHotel: boolean;
  inAirport: boolean;
  inTrainStation: boolean;
  lastSyncedAt: Timestamp;
}

export interface ScrapedPubData {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  address: string;
  townCity: string;
  country?: string;
  county?: string;
  position: Position | null;
  openState: string;
  isHotel: boolean;
  inAirport: boolean;
  inTrainStation: boolean;
}

export interface SitemapEntry {
  url: string;
  imageUrl: string;
  lastmod?: string;
}
