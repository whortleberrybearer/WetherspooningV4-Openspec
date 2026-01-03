import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getSitemapUrls } from '../services/sitemapService';
import { scrapePubData } from '../services/pubScraperService';
import { syncPubToFirestore, getExistingPub } from '../services/pubSyncService';

/**
 * Core pub sync function that can be run independently
 * @param limit Optional limit on number of pubs to process (default: 5)
 * @returns Object with success and failure counts
 */
export async function runPubSync(count?: number, start: number = 0): Promise<{ successCount: number; failureCount: number }> {
  console.log('🚀 Starting pub sync');
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

    let successCount = 0;
    let failureCount = 0;

    for (const entry of entriesToProcess) {
      try {
        console.log(`🔍 Processing pub: ${entry.url}`);
        
        // Extract pub ID from URL to check for existing record
        const urlParts = entry.url.replace(/\/$/, '').split('/');
        const pubId = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
        const existingPub = await getExistingPub(pubId);
        
        const pubData = await scrapePubData(entry.url, entry.imageUrl);
        if (!pubData) {
          console.warn(`⚠️  Skipping pub (no data extracted): ${entry.url}`);
          failureCount++;
          continue;
        }
        
        // Reuse existing country/county data if scraping didn't provide it
        if (existingPub?.country && existingPub?.county && !pubData.country && !pubData.county) {
          pubData.country = existingPub.country;
          pubData.county = existingPub.county;
          console.log(`📍 Reusing existing geocode data for ${pubId}: ${existingPub.country}, ${existingPub.county}`);
        }
        
        await syncPubToFirestore(pubData);
        successCount++;
      } catch (error) {
        console.error(`❌ Error processing pub ${entry.url}:`, error);
        failureCount++;
      }
    }
    console.log(`✅ Sync complete: ${successCount} successful, ${failureCount} failed`);
    return { successCount, failureCount };
  } catch (error) {
    console.error('❌ Fatal error during pub sync:', error);
    throw error;
  }
}

/**
 * Firebase scheduled function wrapper
 */
export const scheduledSyncPubs = onSchedule(
  {
    schedule: 'every day 02:00',
    timeZone: 'UTC',
    memory: '256MiB',
    timeoutSeconds: 540,
  },
  async (event) => {
    await runPubSync();
  }
);
