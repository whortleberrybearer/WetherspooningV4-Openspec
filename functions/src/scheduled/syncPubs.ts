import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getSitemapUrls } from '../services/sitemapService';
import { scrapePubData } from '../services/pubScraperService';
import { syncPubToFirestore, getExistingPubByUrl } from '../services/pubSyncService';
import { SitemapEntry } from '../types/pub';

/**
 * Processes a list of sitemap entries and syncs them to Firestore
 * @param entries Sitemap entries to process
 * @returns Object with success and failure counts
 */
async function processPubEntries(entries: SitemapEntry[]): Promise<{ successCount: number; failureCount: number }> {
  let successCount = 0;
  let failureCount = 0;

  for (const entry of entries) {
    try {
      console.log(`🔍 Processing pub: ${entry.url}`);
      
      // Check for existing pub by URL
      const existingPub = await getExistingPubByUrl(entry.url);
      
      const pubData = await scrapePubData(entry.url, entry.imageUrl);
      if (!pubData) {
        console.warn(`⚠️  Skipping pub (no data extracted): ${entry.url}`);
        failureCount++;
        continue;
      }
      
      // If pub already exists, reuse its ID
      if (existingPub) {
        pubData.id = existingPub.id;
        
        // Reuse existing country/county data if scraping didn't provide it
        if (existingPub.country && existingPub.county && !pubData.country && !pubData.county) {
          pubData.country = existingPub.country;
          pubData.county = existingPub.county;
          console.log(`📍 Reusing existing geocode data for ${existingPub.id}: ${existingPub.country}, ${existingPub.county}`);
        }
      }
      
      await syncPubToFirestore(pubData);
      successCount++;
    } catch (error) {
      console.error(`❌ Error processing pub ${entry.url}:`, error);
      failureCount++;
    }
  }
  
  return { successCount, failureCount };
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
    const entries = await getSitemapUrls();
    console.log(`📍 Fetched sitemap: ${entries.length} entries found`);

    let entriesToProcess;
    if (typeof count === 'number' && count > 0) {
      entriesToProcess = entries.slice(start, start + count);
    } else {
      entriesToProcess = entries.slice(start);
    }
    console.log(`📋 Processing ${entriesToProcess.length} of ${entries.length} pubs (start: ${start}, count: ${count ?? 'all'})`);

    const result = await processPubEntries(entriesToProcess);
    console.log(`✅ Full sync complete: ${result.successCount} successful, ${result.failureCount} failed`);
    return result;
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

    const result = await processPubEntries(filteredEntries);
    console.log(`✅ Update sync complete: ${result.successCount} successful, ${result.failureCount} failed`);
    return result;
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
