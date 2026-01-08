# Wetherspooning

A Vue 3 application for exploring Wetherspoons pub locations across the UK using an interactive Google Maps interface.

## Features

- Interactive map display of Wetherspoons pub locations
- Click markers to view pub details (name, address, location)
- Mobile-responsive design
- Firebase Firestore backend for pub data
- Visit tracking with static JSON data (authentication to be added later)
- Local Firebase emulator support for development

## Data Structure

### Pub Entity

Pubs are stored with the following structure:

```typescript
interface Pub {
  id: string                    // UUID (e.g., "53ab523b-9dbf-4fbc-bdf2-e14c230b24ad")
  name: string                  // Pub name
  townCity: string              // Town or city
  address: string               // Full address
  county: string                // County
  region: string                // Region (e.g., "South East England")
  country: string               // Country (England, Scotland, Wales, Northern Ireland)
  position: {                   // Geographic coordinates (nullable)
    lat: number                 // Latitude (-90 to 90)
    lng: number                 // Longitude (-180 to 180)
  } | null
  url?: string                  // JD Wetherspoon website URL
  imageUrl?: string             // Pub image URL
  openState?: string            // "Open" or "Closed"
  isHotel?: boolean             // Whether the pub is a hotel
  inAirport?: boolean           // Whether the pub is in an airport
  inTrainStation?: boolean      // Whether the pub is in a train station
}
```

**Note:** Pubs without a `position` (where `position` is `null`) will not appear on the map but are still visible in the sidebar. Approximately 10% of the sample data has null positions for testing purposes.

### Visit Entity

Visit tracking uses the following structure:

```typescript
interface Visit {
  id: string          // Visit ID
  userId: string      // User ID
  pubId: string       // Pub UUID
  visitedAt: string   // ISO 8601 timestamp
  rating?: number     // Optional rating (1-5)
  notes?: string      // Optional notes
}
```

## Local Development Setup

**For complete local development instructions, see the root [DEVELOPMENT.md](../DEVELOPMENT.md) guide.**

Quick setup:
1. Install Node.js and Java
2. Configure Google Maps API key in `.env`
3. Run `npm install` in root, functions, and Wetherspooning directories
4. Start emulators: `npm run dev` (from root)
5. Start frontend: `npm run dev` (from Wetherspooning)

## Google Maps API Setup

1. Visit the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Create an API key under **Credentials**
5. Create a Map ID for Advanced Markers:
   - Go to [Maps Management](https://console.cloud.google.com/google/maps-apis/studio/maps)
   - Click **Create Map ID**
   - Choose **JavaScript** as the map type
   - Give it a name (e.g., "Wetherspoon Map")
   - Copy the Map ID
6. (Optional) Restrict your API key:
   - Add HTTP referrers for production domains
   - Limit to Maps JavaScript API only

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Required: Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_api_key
VITE_GOOGLE_MAPS_MAP_ID=your_map_id

# Development (Emulator) - Use these values
VITE_FIREBASE_PROJECT_ID=demo-wetherspooning
VITE_HOSTING_URL=http://127.0.0.1:5000

# Production - Get from Firebase Console
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# etc.
```

See [.env.example](.env.example) for all available options.
# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here

# Firebase (get from Firebase Console > Project Settings > General)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

**Important:** Never commit your `.env` file with actual credentials to version control.

## Firebase Setup

### Option 1: Local Development with Emulator (Recommended)

**Important:** Complete steps 1-4 in "Project Setup" above before starting the emulator.

1. Start the Firebase emulator (keep this terminal running):
```sh
cd Wetherspooning
firebase emulators:start --project demo-wetherspooning
```

The emulator will start on:
- Firestore: http://localhost:8080
- Emulator UI: http://localhost:4000

2. In a **new terminal**, seed the emulator with test data:
```sh
cd WetherspooningV4-Openspec
node scripts/seedEmulator.js
```

You should see: "✅ Seeded 15 pubs to Firestore emulator"

3. In a **new terminal**, start the development server:
```sh
cd Wetherspooning
npm run dev
```

The app will be available at http://localhost:5173 and will automatically connect to the local emulator. You can view and manage data in the Emulator UI at http://localhost:4000.

**Note:** The emulator is ephemeral - data is lost when stopped. Re-seed after each restart using `node scripts/seedEmulator.js`.

## Troubleshooting

### Firebase Connection Issues

**Error: "Failed to load pub locations"**
1. Verify emulator is running (you should see output in the emulator terminal)
2. Check emulator is seeded: `node scripts/seedEmulator.js` from root directory
3. Verify `.env` file contains Firebase variables (even demo values for local dev)
4. Restart dev server after changing `.env`: `npm run dev`
5. Check browser console for detailed error messages

**Error: "Missing required Firebase environment variable"**
- Ensure `.env` file exists in `Wetherspooning/` directory
- Copy from `.env.example` if missing
- For local dev, use the demo values provided in setup step 4
- Restart dev server after adding environment variables

**Production Firestore permission denied**
- Verify security rules are deployed: `firebase deploy --only firestore:rules`
- Check that pubs collection exists in Firestore Console
- Ensure Firebase config in `.env` matches your Firebase project

### Emulator Issues

**Error: "Could not start Firestore Emulator, port taken"**
- Stop the existing emulator process (Ctrl+C in emulator terminal)
- Wait a few seconds for ports to be released
- Restart: `firebase emulators:start --project demo-wetherspooning`

**Error: "Could not spawn java"**
- Install Java JDK (see Prerequisites section)
- On Windows, refresh PATH: `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")`
- Verify with: `java -version`

**Error: "Cannot find module 'firebase-admin'"**
- Install firebase-admin in root directory: `npm install -D firebase-admin` (from project root)
- The seed script runs from root, not the Wetherspooning subdirectory

**No data in emulator**
- Make sure to seed the emulator: `node scripts/seedEmulator.js` (from root directory)
- The emulator is ephemeral - data is lost when stopped
- Re-seed after each emulator restart

**Emulator UI not accessible**
- Check that port 4000 is not blocked by firewall
- Access directly: http://127.0.0.1:4000
- View Firestore data: http://127.0.0.1:4000/firestoresh
npm run dev
```

The app will automatically connect to the local emulator (localhost:8080) in development mode. You can view and manage data in the Emulator UI at http://localhost:4000.

### Option 2: Production Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database in production mode
3. Get your Firebase web app credentials and add them to `.env.local`
4. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `service-account-key.json` in project root (already in .gitignore)
5. Run the migration script to upload pub data:
```sh
npx tsx ../scripts/migrateToFirestore.ts
```
6. Deploy security rules:
```sh
firebase deploy --only firestore:rules
```

### Pub Data Management

- **Local development:** Pub data is loaded from the emulator (seeded from `public/data/pubs-sample.json`)
- **Production:** Pub data is stored in Firestore `pubs` collection
- **Visit data:** Currently loaded from `public/data/visits-sample.json` (static file)

### Compile and Hot-Reload for Development

```sh
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
