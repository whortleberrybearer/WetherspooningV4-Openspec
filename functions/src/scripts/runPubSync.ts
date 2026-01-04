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

import dotenv from 'dotenv';
import * as admin from 'firebase-admin';

// Load environment variables from .env file
dotenv.config();
import { runFullSync } from '../scheduled/syncPubs';

// Simple argument parser for --count and --start
function parseArgs() {
  const args = process.argv.slice(2);
  let count: number | undefined;
  let start = 0;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--start' && args[i + 1]) {
      start = parseInt(args[i + 1], 10);
      i++;
    } else if (!isNaN(Number(args[i]))) {
      if (count === undefined) {
        count = parseInt(args[i], 10);
      } else {
        start = parseInt(args[i], 10);
      }
    }
  }
  return { count, start };
}

async function main() {
  if (!admin.apps.length) {
    const useProduction = process.env.USE_PRODUCTION === 'true';
    if (!useProduction) {
      process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
      console.log(`🔧 Using Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
    }
    admin.initializeApp({ projectId: 'demo-wetherspooning' });
  }

  const { count, start } = parseArgs();

  if (count !== undefined && (isNaN(count) || count < 0)) {
    console.error('❌ Invalid count. Please provide a positive number or omit for all pubs.');
    process.exit(1);
  }
  if (isNaN(start) || start < 0) {
    console.error('❌ Invalid start. Please provide a positive number or 0.');
    process.exit(1);
  }

  console.log(`Running pub sync with count: ${count ?? 'all'}, start: ${start}`);

  try {
    const result = await runFullSync(count, start);
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
