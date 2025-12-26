# Wetherspooning

Wetherspooning is a website that displays the locations of Wetherspoons pubs and allows users to track visits to them.

## Features

- Interactive Google Maps visualization of Wetherspoons pub locations
- Click on markers to view pub details (name, address, location)
- Mobile-first responsive design
- Fast loading with async Google Maps API

## Tech Stack

- **Frontend:** Vue.js 3, Vue Router
- **Build Tool:** Vite
- **Maps:** Google Maps JavaScript API

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Maps API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd WetherspooningV4-Openspec
```

2. Install dependencies
```bash
npm install
```

3. Configure Google Maps API

Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
```

Add your Google Maps API key to the `.env` file:
```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**How to get a Google Maps API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Maps JavaScript API"
4. Go to Credentials and create an API key
5. (Recommended) Restrict the API key to your domain and the Maps JavaScript API

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
WetherspooningV4-Openspec/
├── data/
│   └── pubs-sample.json       # Sample pub location data
├── src/
│   ├── components/
│   │   └── PubLocationsMap.vue # Main map component
│   ├── App.vue                # Root component
│   └── main.js                # Application entry point
├── index.html
├── vite.config.js
├── package.json
└── .env                       # Environment variables (create this)
```

## Sample Data Format

The pub locations are stored in `data/pubs-sample.json`. Each pub entry includes:

```json
{
  "id": 1,
  "name": "The Moon Under Water",
  "townCity": "Manchester",
  "address": "68-74 Deansgate",
  "county": "Greater Manchester",
  "region": "North West England",
  "country": "England",
  "lat": 53.4823,
  "lng": -2.2459,
  "url": "https://...",
  "imageUrl": "",
  "openState": "Open"
}
```

**Required fields:**
- `id`: Unique identifier
- `name`: Pub name
- `lat`: Latitude coordinate
- `lng`: Longitude coordinate

**Optional fields:**
- `townCity`, `address`, `county`, `region`, `country`: Location details
- `url`: Link to pub details page
- `imageUrl`: Pub image URL
- `openState`: Operating status

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Add your license here]