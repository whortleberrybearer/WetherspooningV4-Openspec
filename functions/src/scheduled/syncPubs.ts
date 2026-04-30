import { onSchedule } from 'firebase-functions/v2/scheduler';
import { Timestamp } from 'firebase-admin/firestore';
import { getSitemapUrls } from '../services/sitemapService';
import { scrapePubData } from '../services/pubScraperService';
import {
  getBaseSlug,
  isNumericSuffixVariant,
  pickCanonicalSitemapEntry,
  SitemapPubEntry,
  toBaseUrl,
} from '../services/pubDedupeService';
import { 
  getExistingPubByUrl, 
  findMatchingPub, 
  hasDataChanged,
  getAllPubs,
  markClosedPubs,
  batchWritePubs
} from '../services/pubSyncService';
import { SitemapEntry, Pub } from '../types/pub';

interface ProcessResult {
  pubsToWrite: Pub[];
  processedIds: Set<string>;
  successCount: number;
  failureCount: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
}

/**
 * Processes a list of sitemap entries and syncs them to Firestore
 * @param entries Sitemap entries to process
 * @param existingPubs Optional array of existing pubs for full sync matching
 * @returns Object with pubs to write, processed IDs, and counts
 */
async function processPubEntries(
  entries: SitemapEntry[],
  existingPubs?: Pub[]
): Promise<ProcessResult> {
  const pubsToWriteById = new Map<string, Pub>();
  const processedIds = new Set<string>();
  let successCount = 0;
  let failureCount = 0;
  const newPubIds = new Set<string>();
  const updatedPubIds = new Set<string>();
  let skippedCount = 0;

  const matchCandidates: Pub[] = existingPubs ? [...existingPubs] : [];
  const pubById = new Map<string, Pub>(matchCandidates.map(p => [p.id, p]));

  type DedupeIndexRecord = {
    pubId: string;
    preferred: SitemapPubEntry;
  };

  const dedupeIndex = new Map<string, DedupeIndexRecord>();

  function getDedupeKey(url: string, address: string): string | null {
    const normalizedAddress = address.trim();
    if (!normalizedAddress) return null;
    const baseSlug = getBaseSlug(url);
    if (!baseSlug) return null;
    return `${baseSlug}||${normalizedAddress}`;
  }

  function maybeSeedDedupeIndexFromPub(pub: Pub): void {
    if (!pub.url || !pub.address) return;
    const key = getDedupeKey(pub.url, pub.address);
    if (!key || dedupeIndex.has(key)) return;
    dedupeIndex.set(key, {
      pubId: pub.id,
      preferred: {
        url: pub.url,
        imageUrl: pub.imageUrl ?? '',
      },
    });
  }

  function queueWrite(pub: Pub, kind: 'new' | 'updated'): void {
    pubsToWriteById.set(pub.id, pub);
    if (kind === 'new') {
      newPubIds.add(pub.id);
      return;
    }
    if (!newPubIds.has(pub.id)) {
      updatedPubIds.add(pub.id);
    }
  }

  for (const pub of matchCandidates) {
    maybeSeedDedupeIndexFromPub(pub);
  }

  // Helper to sleep for ms milliseconds
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  for (const entry of entries) {
    try {
      console.log(`🔍 Processing pub: ${entry.url}`);
      // Add 0.1s delay before each request to Wetherspoons
      await sleep(100);
      const pubData = await scrapePubData(entry.url, entry.imageUrl);
      if (!pubData) {
        console.warn(`⚠️  Skipping pub (no data extracted): ${entry.url}`);
        failureCount++;
        continue;
      }

      const dedupeKey = getDedupeKey(entry.url, pubData.address);
      const candidateEntry: SitemapPubEntry = { url: entry.url, imageUrl: entry.imageUrl };
      
      let existingPub: Pub | null = null;

      if (dedupeKey) {
        const record = dedupeIndex.get(dedupeKey);
        if (record) {
          const canonical = pubById.get(record.pubId);
          if (canonical) {
            existingPub = canonical;
            pubData.id = canonical.id;

            const preferred = pickCanonicalSitemapEntry(record.preferred, candidateEntry);
            if (preferred.url !== record.preferred.url || preferred.imageUrl !== record.preferred.imageUrl) {
              console.log(`🔁 Duplicate detected; upgrading canonical URL: ${record.preferred.url} -> ${preferred.url}`);
              dedupeIndex.set(dedupeKey, { pubId: record.pubId, preferred });
            } else {
              console.log(`🧩 Duplicate detected; using canonical pub ${canonical.id}`);
            }

            const finalPreferred = dedupeIndex.get(dedupeKey)!.preferred;
            pubData.url = finalPreferred.url;
            pubData.imageUrl = finalPreferred.imageUrl;
          }
        }
      }

      if (!existingPub && existingPubs) {
        // Full sync: use matching logic with Firestore-loaded pubs
        existingPub = findMatchingPub(pubData, existingPubs);
      }

      if (!existingPub && !existingPubs) {
        // Update sync: query individual pub by URL
        existingPub = await getExistingPubByUrl(entry.url);

        // If this is a numeric-suffix URL, also check base URL for a confirmed duplicate
        if (!existingPub && isNumericSuffixVariant(entry.url)) {
          const baseUrl = toBaseUrl(entry.url);
          if (baseUrl && baseUrl !== entry.url) {
            const basePub = await getExistingPubByUrl(baseUrl);
            if (basePub && basePub.address && basePub.address.trim() === pubData.address.trim()) {
              console.log(`🧩 Duplicate detected via base URL lookup: ${entry.url} matches ${baseUrl}`);
              existingPub = basePub;

              if (!pubById.has(basePub.id)) {
                matchCandidates.push(basePub);
                pubById.set(basePub.id, basePub);
                maybeSeedDedupeIndexFromPub(basePub);
              }

              const key = dedupeKey ?? getDedupeKey(baseUrl, pubData.address);
              if (key) {
                const preferred = pickCanonicalSitemapEntry(
                  { url: basePub.url, imageUrl: basePub.imageUrl ?? '' },
                  candidateEntry
                );
                dedupeIndex.set(key, { pubId: basePub.id, preferred });
                pubData.url = preferred.url;
                pubData.imageUrl = preferred.imageUrl;
              }
            }
          }
        }
      }
      
      if (existingPub) {
        // Reuse existing pub's ID
        pubData.id = existingPub.id;
        
        // Reuse existing country/county data if scraping didn't provide it
        if (existingPub.country && existingPub.county && !pubData.country && !pubData.county) {
          pubData.country = existingPub.country;
          pubData.county = existingPub.county;
          console.log(`📍 Reusing existing geocode data for ${existingPub.id}: ${existingPub.country}, ${existingPub.county}`);
        }
        
        // Check if data has changed
        if (hasDataChanged(existingPub, pubData)) {
          // Create updated pub document
          const updatedPub: Pub = {
            ...pubData,
            lastSyncedAt: Timestamp.now(),
          };
          queueWrite(updatedPub, 'updated');
        } else {
          console.log(`No changes detected for pub ${pubData.id}`);
          skippedCount++;
        }
        
        processedIds.add(pubData.id);

        if (dedupeKey && !dedupeIndex.has(dedupeKey)) {
          dedupeIndex.set(dedupeKey, {
            pubId: pubData.id,
            preferred: {
              url: pubData.url,
              imageUrl: pubData.imageUrl,
            },
          });
        }
      } else {
        // New pub
        const newPub: Pub = {
          ...pubData,
          lastSyncedAt: Timestamp.now(),
        };
        queueWrite(newPub, 'new');
        processedIds.add(pubData.id);

        matchCandidates.push(newPub);
        pubById.set(newPub.id, newPub);

        if (dedupeKey && !dedupeIndex.has(dedupeKey)) {
          dedupeIndex.set(dedupeKey, {
            pubId: newPub.id,
            preferred: {
              url: newPub.url,
              imageUrl: newPub.imageUrl,
            },
          });
        }
      }
      
      successCount++;
    } catch (error) {
      console.error(`❌ Error processing pub ${entry.url}:`, error);
      failureCount++;
    }
  }
  
  return { 
    pubsToWrite: Array.from(pubsToWriteById.values()), 
    processedIds, 
    successCount, 
    failureCount,
    newCount: newPubIds.size,
    updatedCount: updatedPubIds.size,
    skippedCount
  };
}

/**
 * Full sync: processes all pubs or a subset based on count/start parameters
 * @param count Optional limit on number of pubs to process
 * @param start Starting index (default: 0)
 * @returns Object with success and failure counts
 */
export async function runFullSync(count?: number, start: number = 0): Promise<{ successCount: number; failureCount: number }> {
  console.log('🚀 Starting full pub sync');
  try {
    // Load all existing pubs for matching and closure detection
    const existingPubs = await getAllPubs();
    
    const entries = await getSitemapUrls();
    console.log(`📍 Fetched sitemap: ${entries.length} entries found`);

    let entriesToProcess;
    if (typeof count === 'number' && count > 0) {
      entriesToProcess = entries.slice(start, start + count);
    } else {
      entriesToProcess = entries.slice(start);
    }
    console.log(`📋 Processing ${entriesToProcess.length} of ${entries.length} pubs (start: ${start}, count: ${count ?? 'all'})`);

    // Process entries with matching and change detection
    const result = await processPubEntries(entriesToProcess, existingPubs);
    
    // Mark unprocessed open pubs as closed (only when processing complete sitemap)
    let closedPubs: Pub[] = [];
    if (start === 0 && count === undefined) {
      // Complete sync - run closure detection
      closedPubs = markClosedPubs(result.processedIds, existingPubs);
    } else {
      // Partial sync - skip closure detection
      console.log(`⚠️  Skipping closure detection (partial sync: start=${start}, count=${count ?? 'all'})`);
    }
    
    // Combine all pubs to write
    const allPubsToWrite = [...result.pubsToWrite, ...closedPubs];
    
    // Batch write to Firestore
    if (allPubsToWrite.length > 0) {
      await batchWritePubs(allPubsToWrite);
    }
    
    console.log(`✅ Full sync complete: ${result.successCount} processed, ${result.newCount} new, ${result.updatedCount} updated, ${closedPubs.length} closed, ${result.skippedCount} skipped, ${result.failureCount} errors`);
    return { successCount: result.successCount, failureCount: result.failureCount };
  } catch (error) {
    console.error('❌ Fatal error during full sync:', error);
    throw error;
  }
}

/**
 * Update sync: processes only pubs updated since the specified date
 * @param since Only process pubs with lastmod >= this date
 * @returns Object with success and failure counts
 */
export async function runUpdateSync(since: Date): Promise<{ successCount: number; failureCount: number }> {
  console.log(`🚀 Starting update sync (since: ${since.toISOString()})`);
  try {
    const entries = await getSitemapUrls();
    console.log(`📍 Fetched sitemap: ${entries.length} entries found`);

    // Filter entries by lastmod date
    const filteredEntries = entries.filter(entry => {
      if (!entry.lastmod) {
        return false; // Skip entries without lastmod
      }
      const lastmodDate = new Date(entry.lastmod);
      return lastmodDate >= since;
    });
    console.log(`🔍 Found ${filteredEntries.length} pubs updated since ${since.toISOString()}`);

    // Process entries without loading all existing pubs (performance optimization)
    const result = await processPubEntries(filteredEntries);
    
    // Batch write to Firestore
    if (result.pubsToWrite.length > 0) {
      await batchWritePubs(result.pubsToWrite);
    }
    
    console.log(`✅ Update sync complete: ${result.successCount} processed, ${result.newCount} new, ${result.updatedCount} updated, ${result.skippedCount} skipped, ${result.failureCount} errors`);
    return { successCount: result.successCount, failureCount: result.failureCount };
  } catch (error) {
    console.error('❌ Fatal error during update sync:', error);
    throw error;
  }
}

/**
 * Firebase scheduled function wrapper
 * - Runs full sync on Wednesdays
 * - Runs update sync (last 15 hours) on other days
 */
export const scheduledSyncPubs = onSchedule(
  {
    schedule: 'every day 23:00',
    timeZone: 'UTC',
    memory: '256MiB',
    timeoutSeconds: 600,
    region: 'europe-west2',
  },
  async (event) => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 3 = Wednesday
    
    if (dayOfWeek === 3) {
      // Wednesday: Full sync
      console.log('📅 Wednesday: Running full sync');
      await runFullSync();
    } else {
      // Other days: Update sync for changes in last 15 hours
      const fifteenHoursAgo = new Date(now.getTime() - (15 * 60 * 60 * 1000));
      console.log(`📅 ${now.toDateString()}: Running update sync since ${fifteenHoursAgo.toISOString()}`);
      await runUpdateSync(fifteenHoursAgo);
    }
  }
);
