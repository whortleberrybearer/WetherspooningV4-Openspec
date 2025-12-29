# Wetherspooning

A Vue 3 application for exploring Wetherspoons pub locations across the UK using an interactive Google Maps interface.

## Features

- Interactive map display of Wetherspoons pub locations
- Click markers to view pub details (name, address, location)
- Mobile-responsive design
- Firebase Firestore backend for pub data
- Visit tracking with static JSON data (authentication to be added later)
- Local Firebase emulator support for development

## Prerequisites

- Node.js (^20.19.0 || >=22.12.0)
- Google Maps API key
- Firebase project (for production) or Firebase Emulator (for local development)

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

## Project Setup

```sh
npm install
```

### Environment Configuration

1. Copy the example environment file:
```sh
cp .env.example .env.local
```

2. Edit `.env.local` and add your API credentials:
```
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

**Important:** Never commit your `.env.local` file with actual credentials to version control.

## Firebase Setup

### Option 1: Local Development with Emulator (Recommended)

1. Install Firebase CLI globally:
```sh
npm install -g firebase-tools
```

2. Login to Firebase (one-time setup):
```sh
firebase login
```

3. Start the Firebase emulator:
```sh
npm run emulator
```

4. In a separate terminal, seed the emulator with test data:
```sh
node ../scripts/seedEmulator.js
```

5. Start the development server:
```

## Troubleshooting

### Firebase Connection Issues

**Error: "Failed to load pub locations"**
- Check that Firebase emulator is running: `npm run emulator`
- Verify emulator is seeded with data: `node ../scripts/seedEmulator.js`
- Check browser console for detailed error messages

**Error: "Missing required Firebase environment variable"**
- Ensure `.env.local` exists and contains all Firebase variables
- Restart dev server after adding environment variables

**Production Firestore permission denied**
- Verify security rules are deployed: `firebase deploy --only firestore:rules`
- Check that pubs collection exists in Firestore Console
- Ensure API key in `.env.local` matches your Firebase project

### Emulator Issues

**Emulator won't start**
- Check if port 8080 or 4000 is already in use
- Run `firebase emulators:start --project demo-wetherspooning` directly to see detailed errors

**No data in emulator**
- Make sure to seed the emulator: `node ../scripts/seedEmulator.js`
- The emulator is ephemeral - data is lost when stopped
- Re-seed after each emulator restartsh
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
