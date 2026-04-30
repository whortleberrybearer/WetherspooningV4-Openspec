import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';
import type { SitemapEntry } from '../types/pub';

export type SitemapSnapshotEntry = Pick<SitemapEntry, 'url' | 'imageUrl' | 'lastmod'>;

export interface SitemapSnapshot {
  hash: string;
  fetchedAt: Timestamp;
  entryCount: number;
  entries: SitemapSnapshotEntry[];
}

const SNAPSHOT_COLLECTION = 'syncState';
const SNAPSHOT_DOC_ID = 'pubsSitemap';

function normalizeUrl(url: string): string {
  return url.trim();
}

export function computeSitemapHash(entries: SitemapEntry[]): string {
  const lines = entries
    .map((e) => ({
      url: normalizeUrl(e.url),
      lastmod: e.lastmod ?? '',
      imageUrl: e.imageUrl ?? '',
    }))
    .sort((a, b) => a.url.localeCompare(b.url))
    .map((e) => `${e.url}|${e.lastmod}|${e.imageUrl}`)
    .join('\n');

  return crypto.createHash('sha256').update(lines, 'utf8').digest('hex');
}

export function buildSnapshot(entries: SitemapEntry[]): SitemapSnapshot {
  return {
    hash: computeSitemapHash(entries),
    fetchedAt: Timestamp.now(),
    entryCount: entries.length,
    entries: entries.map((e) => ({
      url: normalizeUrl(e.url),
      imageUrl: e.imageUrl ?? '',
      lastmod: e.lastmod,
    })),
  };
}

export async function getStoredSitemapSnapshot(): Promise<SitemapSnapshot | null> {
  const db = getFirestore();
  const doc = await db.collection(SNAPSHOT_COLLECTION).doc(SNAPSHOT_DOC_ID).get();
  if (!doc.exists) return null;
  return doc.data() as SitemapSnapshot;
}

export async function storeSitemapSnapshot(snapshot: SitemapSnapshot): Promise<void> {
  const db = getFirestore();
  await db.collection(SNAPSHOT_COLLECTION).doc(SNAPSHOT_DOC_ID).set(snapshot, { merge: true });
}

export type SitemapDiff = {
  added: SitemapSnapshotEntry[];
  removed: SitemapSnapshotEntry[];
  changed: SitemapSnapshotEntry[];
  unchanged: SitemapSnapshotEntry[];
};

export function diffSitemaps(previous: SitemapSnapshotEntry[], current: SitemapSnapshotEntry[]): SitemapDiff {
  const prevByUrl = new Map(previous.map((e) => [normalizeUrl(e.url), { ...e, url: normalizeUrl(e.url) }]));
  const currByUrl = new Map(current.map((e) => [normalizeUrl(e.url), { ...e, url: normalizeUrl(e.url) }]));

  const added: SitemapSnapshotEntry[] = [];
  const removed: SitemapSnapshotEntry[] = [];
  const changed: SitemapSnapshotEntry[] = [];
  const unchanged: SitemapSnapshotEntry[] = [];

  for (const [url, curr] of currByUrl) {
    const prev = prevByUrl.get(url);
    if (!prev) {
      added.push(curr);
      continue;
    }

    const prevLastmod = prev.lastmod ?? '';
    const currLastmod = curr.lastmod ?? '';
    const prevImageUrl = prev.imageUrl ?? '';
    const currImageUrl = curr.imageUrl ?? '';

    if (prevLastmod !== currLastmod || prevImageUrl !== currImageUrl) {
      changed.push(curr);
    } else {
      unchanged.push(curr);
    }
  }

  for (const [url, prev] of prevByUrl) {
    if (!currByUrl.has(url)) {
      removed.push(prev);
    }
  }

  return { added, removed, changed, unchanged };
}

export function getEntriesWithoutLastmod(entries: SitemapSnapshotEntry[]): SitemapSnapshotEntry[] {
  return entries.filter((e) => !e.lastmod);
}
