# Wetherspooning

Wetherspooning is a website that displays the locations of Wetherspoons pubs and allows users to track visits to them.

## Features

- **Pub Location Map** - Interactive map showing all Wetherspoon's pub locations
- **Visit Tracking** - Track which pubs you've visited
- **User Authentication** - Secure login and signup with Firebase Auth
- **Automated Data Sync** - Daily scheduled sync of pub data (sitemap diff sync with a monthly full-sync backstop)
- **Caching Architecture** - Multi-layer caching with CDN and browser storage for optimal performance

## Project Structure

- `/Wetherspooning` - Vue.js frontend application
- `/functions` - Firebase Cloud Functions for backend services ([README](functions/README.md))
- `/openspec` - Project specifications and change proposals
- `/scripts` - Development and deployment scripts

## Local Development

**📖 [Complete Development Guide](DEVELOPMENT.md)** | **⚡ [Quick Reference](QUICKSTART.md)**

Quick start:
```bash
# Install dependencies
npm install
cd functions && npm install
cd ../Wetherspooning && npm install
cd ..

# Build functions
npm run functions:build

# Start emulators (Terminal 1)
npm run dev

# Seed test data (Terminal 2, first time only)
npm run seed

# Start frontend (Terminal 3)
cd Wetherspooning && npm run dev
```

Open http://localhost:5173 and login with `test@example.com` / `password123`

## Documentation

- **[Development Guide](DEVELOPMENT.md)** - Complete local setup and workflow
- **[Quick Reference](QUICKSTART.md)** - Cheat sheet for daily development
- **[Functions README](functions/README.md)** - Cloud Functions documentation

## Getting Started

For first-time setup, see the [Development Guide](DEVELOPMENT.md).

## Deployment

Deployment to Firebase Hosting, Functions, and Firestore is automated via GitHub Actions.

- On every push to main, the site and backend are built and deployed automatically.
- Environment variables are securely injected from GitHub secrets during the build and deploy steps.
- No manual deployment is required—just push your changes to GitHub.

### Required GitHub Secrets

The following secrets must be configured in your GitHub repository (Settings > Secrets and variables > Actions):

- `FIREBASE_SERVICE_ACCOUNT_WETHERSPOONING` - Firebase service account JSON key
- `GOOGLE_GEOCODING_API_KEY` - Google Geocoding API key for pub data sync
- `WETHERSPOONING_ADMIN_USER_ID` - Firebase Auth UID for on-demand pub sync authorization

### Required GitHub Variables

The following variables must be configured:

- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key for the frontend
- `VITE_GOOGLE_MAPS_MAP_ID` - Google Maps Map ID for the frontend
- `VITE_FIREBASE_API_KEY` - Firebase API key for the frontend
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase Auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase App ID