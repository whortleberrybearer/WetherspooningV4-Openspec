import { onSchedule } from 'firebase-functions/v2/scheduler';
import { Timestamp } from 'firebase-admin/firestore';
import { getSitemapUrls } from '../services/sitemapService';
import { scrapePubData } from '../services/pubScraperService';
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
  const pubsToWrite: Pub[] = [];
  const processedIds = new Set<string>();
  let successCount = 0;
  let failureCount = 0;
  let newCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

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
      
      let existingPub: Pub | null = null;
      
      if (existingPubs) {
        // Full sync: use matching logic with in-memory pubs
        existingPub = findMatchingPub(pubData, existingPubs);
      } else {
        // Update sync: query individual pub by URL
        existingPub = await getExistingPubByUrl(entry.url);
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
          pubsToWrite.push(updatedPub);
          updatedCount++;
        } else {
          console.log(`No changes detected for pub ${pubData.id}`);
          skippedCount++;
        }
        
        processedIds.add(pubData.id);
      } else {
        // New pub
        const newPub: Pub = {
          ...pubData,
          lastSyncedAt: Timestamp.now(),
        };
        pubsToWrite.push(newPub);
        processedIds.add(pubData.id);
        newCount++;
      }
      
      successCount++;
    } catch (error) {
      console.error(`❌ Error processing pub ${entry.url}:`, error);
      failureCount++;
    }
  }
  
  return { 
    pubsToWrite, 
    processedIds, 
    successCount, 
    failureCount,
    newCount,
    updatedCount,
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
    
    // Mark unprocessed open pubs as closed (only in full sync)
    const closedPubs = markClosedPubs(result.processedIds, existingPubs);
    
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
