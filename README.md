# Wetherspooning

Wetherspooning is a website that displays the locations of Wetherspoons pubs and allows users to track visits to them.

## Features

- **Pub Location Map** - Interactive map showing all Wetherspoon's pub locations
- **Visit Tracking** - Track which pubs you've visited
- **User Authentication** - Secure login and signup with Firebase Auth
- **Automated Data Sync** - Daily scheduled sync of pub data from Wetherspoon's website

## Project Structure

- `/Wetherspooning` - Vue.js frontend application
- `/functions` - Firebase Cloud Functions for backend services ([README](functions/README.md))
- `/openspec` - Project specifications and change proposals

## Getting Started

See the [functions README](functions/README.md) for information about the scheduled pub sync feature.

## Deployment

Deployment to Firebase Hosting, Functions, and Firestore is automated via GitHub Actions.

- On every push to main, the site and backend are built and deployed automatically.
- Environment variables are securely injected from GitHub secrets during the build and deploy steps.
- No manual deployment is required—just push your changes to GitHub.