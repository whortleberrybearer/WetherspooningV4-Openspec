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
      // Fetch sitemap URLs
      const urls = await getSitemapUrls();
      console.log(`📍 Fetched sitemap: ${urls.length} URLs found`);
      
      // Limit to first 5 pubs for initial implementation
      const urlsToProcess = urls.slice(0, 5);
      console.log(`📋 Processing ${urlsToProcess.length} of ${urls.length} pubs`);
      
      let successCount = 0;
      let failureCount = 0;
      
      // Process each pub
      for (const url of urlsToProcess) {
        try {
          console.log(`🔍 Processing pub: ${url}`);
          
          const pubData = await scrapePubData(url);
          
          if (!pubData) {
            console.warn(`⚠️  Skipping pub (no data extracted): ${url}`);
            failureCount++;
            continue;
          }
          
          await syncPubToFirestore(pubData);
          successCount++;
        } catch (error) {
          console.error(`❌ Error processing pub ${url}:`, error);
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
