import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getSitemapUrls } from '../services/sitemapService';
import { scrapePubData } from '../services/pubScraperService';
import { syncPubToFirestore } from '../services/pubSyncService';

/**
 * Core pub sync function that can be run independently
 * @param limit Optional limit on number of pubs to process (default: 5)
 * @returns Object with success and failure counts
 */
export async function runPubSync(limit: number = 5): Promise<{ successCount: number; failureCount: number }> {
  console.log('🚀 Starting pub sync');
  
  try {
    // Fetch sitemap entries (URLs and image URLs)
    const entries = await getSitemapUrls();
    console.log(`📍 Fetched sitemap: ${entries.length} entries found`);
    
    // Limit entries to process
    const entriesToProcess = limit > 0 ? entries.slice(0, limit) : entries;
    console.log(`📋 Processing ${entriesToProcess.length} of ${entries.length} pubs`);
    
    let successCount = 0;
    let failureCount = 0;
    
    // Process each pub
    for (const entry of entriesToProcess) {
      try {
        console.log(`🔍 Processing pub: ${entry.url}`);
        
        const pubData = await scrapePubData(entry.url, entry.imageUrl);
        
        if (!pubData) {
          console.warn(`⚠️  Skipping pub (no data extracted): ${entry.url}`);
          failureCount++;
          continue;
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
    await runPubSync(5);
  }
);
