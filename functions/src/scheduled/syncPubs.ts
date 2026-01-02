import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getSitemapUrls } from '../services/sitemapService';
import { scrapePubData } from '../services/pubScraperService';
import { syncPubToFirestore } from '../services/pubSyncService';

export const scheduledSyncPubs = onSchedule(
  {
    schedule: 'every day 02:00',
    timeZone: 'UTC',
    memory: '256MiB',
    timeoutSeconds: 540,
  },
  async (event) => {
    console.log('🚀 Starting scheduled pub sync');
    
    try {
      // Fetch sitemap entries (URLs and image URLs)
      const entries = await getSitemapUrls();
      console.log(`📍 Fetched sitemap: ${entries.length} entries found`);
      
      // Limit to first 5 pubs for initial implementation
      const entriesToProcess = entries.slice(0, 5);
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
    } catch (error) {
      console.error('❌ Fatal error during pub sync:', error);
      throw error;
    }
  }
);
