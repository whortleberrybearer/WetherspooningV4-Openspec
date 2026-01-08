# Firebase Functions - Wetherspooning

This directory contains Firebase Cloud Functions for the Wetherspooning application.

## Features

### Scheduled Pub Sync (`scheduledSyncPubs`)

A scheduled function that runs daily at 23:00 UTC to sync pub data from the Wetherspoon's website.

**What it does:**
- Fetches the sitemap from https://www.jdwetherspoon.com/pubs-sitemap.xml
- Extracts pub URLs and image URLs
- Scrapes pub data (name, address, location, facilities, etc.)
- Syncs data to Firestore `pubs` collection with change detection
- Runs full sync on Wednesdays, incremental update sync on other days

**Schedule:** Daily at 23:00 UTC

### On-Demand Pub Sync (`syncPubsOnDemand`)

A callable function that allows authorized administrators to trigger pub syncs remotely.

**What it does:**
- Provides secure remote access to sync operations
- Supports both full sync and update sync modes
- Accepts parameters for partial syncs (`count`, `start`, `since`)
- Returns sync results (success/failure counts)

**Authorization:** Requires Firebase Auth with UID matching `WETHERSPOONING_ADMIN_USER_ID` environment variable

**Usage:**
```bash
# Full sync with first 10 pubs
firebase functions:call syncPubsOnDemand --data '{"mode":"full","count":10}'

# Full sync starting from position 20
firebase functions:call syncPubsOnDemand --data '{"mode":"full","count":10,"start":20}'

# Update sync since specific date
firebase functions:call syncPubsOnDemand --data '{"mode":"update","since":"2026-01-01T00:00:00Z"}'
```

## Project Structure

```
functions/
├── src/
│   ├── index.ts                 # Main exports
│   ├── callable/
│   │   └── syncPubsOnDemand.ts  # On-demand sync callable function
│   ├── scheduled/
│   │   └── syncPubs.ts          # Scheduled sync function
│   ├── scripts/
│   │   └── runPubSync.ts        # Local sync script
│   ├── services/
│   │   ├── sitemapService.ts    # Sitemap fetching and parsing
│   │   ├── pubScraperService.ts # Pub page scraping
│   │   ├── pubSyncService.ts    # Firestore sync logic
│   │   └── geocodingService.ts  # Geocoding service
│   └── types/
│       └── pub.ts               # Type definitions
├── test/
│   ├── services/                # Unit tests
│   └── fixtures/                # Test data
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Setup

### Prerequisites
- Node.js 18 or later
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Firebase project initialized

### Installation

```bash
cd functions
npm install
```

### Environment Variables

Copy the `.env.example` file to `.env` and configure the required variables:

```bash
cp .env.example .env
```

Required environment variables:

- `GOOGLE_GEOCODING_API_KEY` - Your Google Geocoding API key
- `WETHERSPOONING_ADMIN_USER_ID` - Firebase Auth UID for on-demand sync authorization

**Getting your Firebase Auth UID:**

1. Go to [Firebase Console](https://console.firebase.google.com) > Authentication > Users
2. Find your user and copy the UID
3. Or export users: `firebase auth:export users.json --format=JSON`

**Production Configuration:**

For production, set environment variables using Firebase Functions config:

```bash
# Set admin user ID
firebase functions:config:set admin.user_id="your-firebase-auth-uid"

# View current config
firebase functions:config:get
```

Note: Configuration changes take effect after deployment.

## Development

### Running the Pub Sync Locally

The pub sync service has been refactored to allow independent execution. You can run it locally in several ways:

#### Prerequisites
Make sure the Firebase emulator is running first (in a separate terminal):
```bash
# From the project root
npm run emulator
```

Or run without the emulator by setting environment variables (not recommended for testing):
```bash
export USE_PRODUCTION=true  # Linux/Mac
$env:USE_PRODUCTION = "true"  # Windows PowerShell
```

#### Option 1: Using npm script (recommended)
```bash
# From the functions directory
npm run sync:pubs

# With a custom limit (e.g., process 10 pubs)
npm run sync:pubs 10

# Process all pubs (use 0)
npm run sync:pubs 0
```

#### Option 2: Direct execution with ts-node
```bash
# From the functions directory
npx ts-node src/scripts/runPubSync.ts

# With a custom limit
npx ts-node src/scripts/runPubSync.ts 10
```

#### Option 3: Using the function programmatically
```typescript
import { runPubSync } from './scheduled/syncPubs';

// Run sync with default limit (5 pubs)
const result = await runPubSync();

// Run sync with custom limit
const result = await runPubSync(10);

// Run sync for all pubs
const result = await runPubSync(0);

console.log(`Success: ${result.successCount}, Failed: ${result.failureCount}`);
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Test

Run unit tests with Jest:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Local Development

Run functions locally with the emulator:

```bash
npm run serve
```

This will start the Functions emulator at http://localhost:5001

## Deployment

### Deploy All Functions

```bash
npm run deploy
```

Or from the project root:

```bash
firebase deploy --only functions
```

### Deploy Specific Function

```bash
firebase deploy --only functions:scheduledSyncPubs
firebase deploy --only functions:syncPubsOnDemand
```

## Pub Data Overrides

The system supports manual correction of `county` and `townCity` fields when scraped data is incorrect.

### How Overrides Work

- **Scraped fields** (`county`, `townCity`) are always preserved and never manually modified
- **Override fields** (`countyOverride`, `townCityOverride`) take precedence when returning data to clients
- Overrides are applied server-side by the `getPubs` function before returning data
- Sync operations preserve override fields while updating scraped fields

### Setting Overrides

To correct pub data, add override fields via Firestore console:

1. Go to Firestore console > `pubs` collection
2. Find the pub document to correct
3. Add field `countyOverride` or `townCityOverride` with the correct value
4. Save the document

**Example:**

If a pub has incorrect scraped data:
```json
{
  "county": "London",
  "townCity": "City of London"
}
```

Add override fields:
```json
{
  "county": "London",
  "countyOverride": "Greater London",
  "townCity": "City of London",
  "townCityOverride": "London"
}
```

Clients will receive the corrected values:
```json
{
  "county": "Greater London",
  "townCity": "London"
}
```

### Override Persistence

- Overrides persist across scheduled syncs
- The sync service only updates scraped fields (`county`, `townCity`)
- Override fields remain unchanged unless manually modified
- To remove an override, delete the override field from Firestore

### First-Time Deployment of On-Demand Sync

Before deploying the `syncPubsOnDemand` function for the first time:

1. Set the `ADMIN_USER_ID` in production:
   ```bash
   firebase functions:config:set admin.user_id="your-firebase-auth-uid"
   ```

2. Deploy the function:
   ```bash
   firebase deploy --only functions:syncPubsOnDemand
   ```

3. Test the deployment:
   ```bash
   firebase functions:call syncPubsOnDemand --data '{"mode":"full","count":2}'
   ```

## Testing

The project includes comprehensive unit tests for all services:

- **sitemapService.test.ts** - Tests XML parsing and URL extraction
- **pubScraperService.test.ts** - Tests HTML parsing and name extraction
- **pubSyncService.test.ts** - Tests Firestore write operations

Coverage threshold is set to 80% for all metrics.

## Dependencies

### Production
- `firebase-functions` - Cloud Functions SDK
- `firebase-admin` - Admin SDK for Firestore access
- `fast-xml-parser` - XML parsing for sitemap
- `cheerio` - HTML parsing for pub pages

### Development
- `typescript` - TypeScript compiler
- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `@types/*` - TypeScript type definitions

## Monitoring

View function logs:

```bash
npm run logs
```

Or in Firebase Console: https://console.firebase.google.com → Functions → Logs

## Troubleshooting

### Build Errors

If you encounter TypeScript errors, ensure you're using Node.js 18+:

```bash
node --version
```

### Test Failures

Clear Jest cache if tests behave unexpectedly:

```bash
npx jest --clearCache
npm test
```

### Deployment Issues

Ensure you're authenticated with Firebase:

```bash
firebase login
firebase projects:list
```

### On-Demand Sync Errors

**Error: "Server configuration error: WETHERSPOONING_ADMIN_USER_ID not set"**
- Solution: Set the environment variable in production: `firebase functions:config:set admin.user_id="your-uid"`
- For local development: Add `WETHERSPOONING_ADMIN_USER_ID=your-uid` to `.env` file

**Error: "Unauthorized: Admin access required"**
- Your Firebase Auth UID doesn't match the configured `WETHERSPOONING_ADMIN_USER_ID`
- Verify your UID in Firebase Console > Authentication > Users
- Ensure you're authenticated: `firebase login`

**Error: "Invalid argument" errors**
- Check your request data format
- Full sync: `{"mode":"full","count":10,"start":0}`
- Update sync: `{"mode":"update","since":"2026-01-01T00:00:00Z"}`
- Ensure `count` and `start` are non-negative numbers
- Ensure `since` is a valid ISO 8601 date string

## Future Enhancements

- Process all pubs (currently limited to 5)
- Extract full pub details (address, coordinates, opening hours)
- Add change detection (only update if data changed)
- Implement retry logic and rate limiting
- Add monitoring and alerting
- Create manual trigger endpoint for testing

## License

Part of the Wetherspooning project.
