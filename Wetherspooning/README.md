# Wetherspooning

A Vue 3 application for exploring Wetherspoons pub locations across the UK using an interactive Google Maps interface.

## Features

- Interactive map display of Wetherspoons pub locations
- Click markers to view pub details (name, address, location)
- Mobile-responsive design
- Sample data with 15+ pub locations across the UK

## Prerequisites

- Node.js (^20.19.0 || >=22.12.0)
- Google Maps API key

## Google Maps API Setup

1. Visit the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Create an API key under **Credentials**
5. (Optional) Restrict your API key:
   - Add HTTP referrers for production domains
   - Limit to Maps JavaScript API only

## Project Setup

```sh
npm install
```

### Environment Configuration

1. Copy the example environment file:
```sh
cp .env.example .env
```

2. Edit `.env` and add your Google Maps API key:
```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important:** Never commit your `.env` file with the actual API key to version control.

### Sample Data Format

The application loads pub data from `data/pubs-sample.json`. Each pub entry includes:

- `id`: Unique identifier
- `name`: Pub name
- `lat`, `lng`: Geographic coordinates (required)
- `address`: Street address
- `townCity`: Town or city
- `county`: County
- `region`: Region
- `country`: Country
- `url`: Link to pub details (optional)
- `imageUrl`: Pub image URL (optional)
- `openState`: Current status (optional)

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
