# Firebase Functions - Wetherspooning

This directory contains Firebase Cloud Functions for the Wetherspooning application.

## Features

### Scheduled Pub Sync (`scheduledSyncPubs`)

A scheduled function that runs daily at 2:00 AM UTC to sync pub data from the Wetherspoon's website.

**What it does:**
- Fetches the sitemap from https://www.jdwetherspoon.com/pubs-sitemap.xml
- Extracts pub URLs
- Scrapes the first 5 pub pages (limited for initial implementation)
- Extracts pub names
- Writes/updates data to Firestore `pubs` collection

**Schedule:** Daily at 2:00 AM UTC

## Project Structure

```
functions/
├── src/
│   ├── index.ts                 # Main exports
│   ├── scheduled/
│   │   └── syncPubs.ts          # Scheduled sync function
│   ├── services/
│   │   ├── sitemapService.ts    # Sitemap fetching and parsing
│   │   ├── pubScraperService.ts # Pub page scraping
│   │   └── pubSyncService.ts    # Firestore sync logic
│   └── types/
│       └── pub.ts               # Type definitions
├── test/
│   ├── services/                # Unit tests
│   └── fixtures/                # Test data
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

## Development

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

## Future Enhancements

- Process all pubs (currently limited to 5)
- Extract full pub details (address, coordinates, opening hours)
- Add change detection (only update if data changed)
- Implement retry logic and rate limiting
- Add monitoring and alerting
- Create manual trigger endpoint for testing

## License

Part of the Wetherspooning project.
