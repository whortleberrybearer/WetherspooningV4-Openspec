# Running the Pub Sync Service

The pub sync service can be run in three ways:

## 1. On-Demand via Firebase Callable Function (Recommended for Production)

For administrators with the correct Firebase Auth UID, you can trigger syncs remotely:

```bash
# Full sync with first 10 pubs
firebase functions:call syncPubsOnDemand --data '{"mode":"full","count":10}'

# Full sync starting from position 20
firebase functions:call syncPubsOnDemand --data '{"mode":"full","count":10,"start":20}'

# Update sync since specific date
firebase functions:call syncPubsOnDemand --data '{"mode":"update","since":"2026-01-01T00:00:00Z"}'

# Full sync of all pubs (omit count parameter)
firebase functions:call syncPubsOnDemand --data '{"mode":"full"}'
```

**Requirements:**
- Must be authenticated with Firebase CLI (`firebase login`)
- Your Firebase Auth UID must match the `ADMIN_USER_ID` environment variable
- Function must be deployed to Firebase

**Advantages:**
- No local environment setup required
- Can be run from anywhere
- Secure (requires admin authorization)
- Works on production Firestore

## 2. Locally with Emulator (For Development/Testing)

## Quick Start

### Step 1: Set Java Path (Windows PowerShell)
```powershell
$env:Path = "C:\Program Files\Java\jdk-23\bin;" + $env:Path
```

### Step 2: Start Firebase Emulator (in one terminal)
```powershell
cd C:\Users\wheel\source\repos\WetherspooningV4-Openspec
firebase emulators:start --project demo-wetherspooning
```

Wait for the message:
```
✔ All emulators ready! It is now safe to connect your app.
```

### Step 3: Run Pub Sync (in a DIFFERENT terminal)
```powershell
cd C:\Users\wheel\source\repos\WetherspooningV4-Openspec\functions
npm run sync:pubs 2
```

This will:
- Fetch the sitemap
- Process 2 pubs
- Scrape their data
- Save to Firestore emulator
- Show success/failure counts

## Customizing the Limit

```powershell
# Process 5 pubs (default)
npm run sync:pubs

# Process 10 pubs
npm run sync:pubs 10

# Process ALL pubs (814 total)
npm run sync:pubs 0
```

## What You'll See

Expected output:
```
🔧 Using Firestore Emulator at localhost:8080
Running pub sync with limit: 2
🚀 Starting pub sync
📍 Fetched sitemap: 814 entries found
📋 Processing 2 of 814 pubs
🔍 Processing pub: https://www.jdwetherspoon.com/pubs/...
✅ Sync complete: 2 successful, 0 failed

📊 Final Results:
   ✅ Successful: 2
   ❌ Failed: 0
```

## View Results

Open the Firestore Emulator UI to see the data:
```
http://127.0.0.1:4000/firestore
```

Look for the `pubs` collection - you'll see your synced pub data there!

## Code Structure

The refactoring created:
1. **`runPubSync(limit)` function** - Core sync logic (can be called from anywhere)
2. **`scheduledSyncPubs`** - Firebase scheduled function wrapper
3. **`runPubSync.ts` script** - Standalone CLI tool with Firebase initialization

This means you can:
- Run it locally for testing ✅
- Import and call it programmatically ✅
- Use it as a scheduled Firebase function ✅
