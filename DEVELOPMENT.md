# Local Development Guide

This guide explains how to run the Wetherspooning application locally using Firebase Emulators.

## Prerequisites

- **Node.js** (^20.19.0 || >=22.12.0)
- **Java Runtime** (for Firebase Emulator) - [Download JDK](https://www.oracle.com/java/technologies/downloads/)
- **Firebase CLI** - Install with `npm install -g firebase-tools`
- **Google Maps API Key** - See [setup instructions](Wetherspooning/README.md#google-maps-api-setup)

## Quick Start

### 1. Install Dependencies

From the **root directory**, run:
```bash
npm install
cd functions && npm install
cd ../Wetherspooning && npm install
cd ..
```

### 2. Configure Environment Variables

#### Frontend (`Wetherspooning/.env`)
Create a `.env` file in the `Wetherspooning/` directory:
```bash
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_MAPS_MAP_ID=your_map_id

# Firebase (Emulator)
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=demo-wetherspooning.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-wetherspooning
VITE_FIREBASE_STORAGE_BUCKET=demo-wetherspooning.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Hosting URL (Emulator)
VITE_HOSTING_URL=http://127.0.0.1:5000
```

#### Backend (`functions/.env`)
Create a `.env` file in the `functions/` directory:
```bash
GOOGLE_GEOCODING_API_KEY=your_geocoding_api_key
WETHERSPOONING_ADMIN_USER_ID=test-admin-uid
```

### 3. Build Cloud Functions

Functions must be built before starting the emulator:
```bash
npm run functions:build
```

Or in watch mode (rebuilds on changes):
```bash
cd functions
npm run watch
```

### 4. Start Firebase Emulators

From the **root directory**:
```bash
npm run dev
```

This starts:
- **Firestore Emulator** on `http://localhost:8080`
- **Auth Emulator** on `http://localhost:9099`
- **Functions Emulator** on `http://localhost:5001`
- **Emulator UI** on `http://localhost:4000`

**Note:** Emulator data is automatically imported from `.emulator-data/` on start and exported on exit.

### 5. Seed Test Data (First Time Only)

In a **new terminal**, seed the emulator with test data:
```bash
npm run seed
```

This creates:
- Sample pub data (~1000 pubs)
- Test users (test@example.com, alice@example.com, bob@example.com)
- Sample visit data

**Default test credentials:**
- Email: `test@example.com`
- Password: `password123`

### 6. Start Frontend Dev Server

In a **new terminal**:
```bash
cd Wetherspooning
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Development Workflow

### Normal Development (One-Time Setup)
1. **Terminal 1** (root): `npm run dev` - Starts emulators
2. **Terminal 2** (Wetherspooning): `npm run dev` - Starts frontend
3. Open http://localhost:5173

### With Function Changes
If you're modifying Cloud Functions:
1. **Terminal 1** (functions): `npm run watch` - Rebuilds on changes
2. **Terminal 2** (root): `npm run dev` - Starts emulators
3. **Terminal 3** (Wetherspooning): `npm run dev` - Starts frontend

**Note:** Restart emulators after function changes for them to take effect.

## Available Scripts

### Root Directory
- `npm run dev` - Start emulators (imports/exports data)
- `npm run emulator:clear` - Start fresh emulators (no data import)
- `npm run seed` - Seed emulator with test data
- `npm run functions:build` - Build Cloud Functions

### Wetherspooning Directory
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

### Functions Directory
- `npm run build` - Build TypeScript to JavaScript
- `npm run watch` - Build in watch mode
- `npm test` - Run Jest tests
- `npm run sync:pubs` - Manually trigger pub data sync

## Emulator UI

Access the Firebase Emulator UI at [http://localhost:4000](http://localhost:4000)

Features:
- View Firestore collections and documents
- View registered Auth users
- Inspect function logs
- Manually trigger functions

## Troubleshooting

### "Emulator already running" Error
Kill the process using port 8080 (Firestore):
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <pid> /F

# macOS/Linux
lsof -ti:8080 | xargs kill -9
```

### Functions Not Working
1. Ensure functions are built: `npm run functions:build`
2. Check function logs in Emulator UI (http://localhost:4000)
3. Restart emulators after code changes

### Frontend Can't Connect to Emulators
1. Check `Wetherspooning/.env` has correct emulator URLs
2. Ensure `VITE_HOSTING_URL=http://127.0.0.1:5000`
3. Check browser console for connection errors

### "Data already seeded" Warning
The seed script prevents duplicate data. To reseed:
```bash
npm run emulator:clear  # In terminal 1 (stops current emulator)
npm run seed           # Seed fresh data
```

### TypeScript Compilation Errors
```bash
cd functions
npm run build  # Check for errors
```

## Data Persistence

Emulator data is stored in `.emulator-data/` directory:
- **Automatic import** on emulator start
- **Automatic export** on emulator shutdown (Ctrl+C)
- **Git ignored** (local development only)

To start fresh:
```bash
rm -rf .emulator-data
npm run dev
npm run seed
```

## Testing

### Frontend Tests
```bash
cd Wetherspooning
npm test
```

### Function Tests
```bash
cd functions
npm test
```

## Production vs Development

| Feature | Development | Production |
|---------|-------------|------------|
| Firebase Project | `demo-wetherspooning` | Real project ID |
| Firestore | localhost:8080 | cloud |
| Auth | localhost:9099 | cloud |
| Functions | localhost:5001 | cloud |
| Data | Local emulator | Cloud Firestore |
| Environment | `import.meta.env.DEV` | `import.meta.env.PROD` |

The app automatically detects development mode and connects to emulators when `import.meta.env.DEV` is true.
