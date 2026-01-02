# Running the Pub Sync Service Locally

The pub sync service has been successfully refactored! Here's how to use it:

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
