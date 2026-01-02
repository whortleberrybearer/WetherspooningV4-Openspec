#!/usr/bin/env node
/**
 * Standalone script to run pub sync locally
 * Usage: npx ts-node src/scripts/runPubSync.ts [limit]
 * Example: npx ts-node src/scripts/runPubSync.ts 10
 * 
 * Environment Variables:
 * - FIRESTORE_EMULATOR_HOST: Set to "localhost:8080" to use Firestore emulator (default)
 * - USE_PRODUCTION: Set to "true" to use production Firestore (requires credentials)
 */

import * as admin from 'firebase-admin';
import { runPubSync } from '../scheduled/syncPubs';

async function main() {
  // Initialize Firebase Admin for local execution
  if (!admin.apps.length) {
    const useProduction = process.env.USE_PRODUCTION === 'true';
    
    if (!useProduction) {
      // Use emulator by default
      process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
      console.log(`🔧 Using Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
    }
    
    admin.initializeApp({
      projectId: 'demo-wetherspooning',
    });
  }
  
  // Get limit from command line args, default to 5
  const limit = process.argv[2] ? parseInt(process.argv[2], 10) : 5;
  
  if (isNaN(limit) || limit < 0) {
    console.error('❌ Invalid limit. Please provide a positive number or 0 for all pubs.');
    process.exit(1);
  }
  
  console.log(`Running pub sync with limit: ${limit === 0 ? 'all pubs' : limit}`);
  
  try {
    const result = await runPubSync(limit);
    console.log('\n📊 Final Results:');
    console.log(`   ✅ Successful: ${result.successCount}`);
    console.log(`   ❌ Failed: ${result.failureCount}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main();
