# Specification: Pub Locations Map

**Capability ID:** `pub-locations-map`  
**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** 2025-12-26

## Overview

The Pub Locations Map capability provides an interactive Google Maps-based visualization of Wetherspoons pub locations as the home page, allowing users to discover and explore pubs geographically.

## ADDED Requirements

### Requirement: Map Display (REQ-PLM-001)
**Priority:** MUST  
**Category:** Functional

The system MUST display an interactive Google Map centered on the UK showing Wetherspoons pub locations as markers.

**Acceptance Criteria:**
- Map initializes with center coordinates (54.0, -2.0) at zoom level 6
- Map displays standard roadmap view
- Map includes zoom controls and fullscreen option
- Map is responsive and fills available viewport
- Map is displayed as the home page at route `/`

#### Scenario: User Accesses Home Page
**Given** the user navigates to the home page  
**When** the page loads  
**Then** an interactive Google Map is displayed  
**And** the map is centered on the UK  
**And** zoom controls are visible and functional

---

### Requirement: Pub Markers (REQ-PLM-002)
**Priority:** MUST  
**Category:** Functional

The system MUST display a marker on the map for each pub location loaded from the data source.

**Acceptance Criteria:**
- Each pub with valid lat/lng coordinates has a corresponding marker
- Markers are positioned accurately at pub coordinates
- Markers display pub name on hover
- Markers are visually distinct and easily clickable
- Invalid/missing coordinates are handled gracefully (logged, skipped)

#### Scenario: Display All Pub Markers
**Given** the map has loaded  
**And** pub data contains 15 sample pubs  
**When** the markers are rendered  
**Then** 15 markers appear on the map  
**And** each marker is positioned at the correct coordinates  
**And** hovering over a marker shows the pub name

#### Scenario: Handle Missing Coordinates
**Given** the pub data contains a pub without lat/lng coordinates  
**When** the markers are rendered  
**Then** the pub without coordinates is skipped  
**And** a warning is logged to the console  
**And** other valid pubs are still displayed

---

### Requirement: Data Source (REQ-PLM-003)
**Priority:** MUST  
**Category:** Functional

The system MUST load pub location data from a static JSON file.

**Acceptance Criteria:**
- Data is loaded from `/data/pubs-sample.json`
- JSON file contains array of pub objects
- Each pub object includes: id, name, lat, lng
- Optional fields: address, townCity, county, region, country, url, imageUrl, openState
- Loading errors are caught and logged
- Empty or invalid JSON is handled gracefully

#### Scenario: Load Sample Pub Data
**Given** the `/data/pubs-sample.json` file exists  
**And** contains valid JSON with pub array  
**When** the map component initializes  
**Then** the JSON file is fetched successfully  
**And** pub data is parsed into JavaScript objects  
**And** the data is used to create map markers

#### Scenario: Handle Data Load Failure
**Given** the `/data/pubs-sample.json` file is missing or invalid  
**When** the map component attempts to load data  
**Then** an error is caught and logged  
**And** a user-friendly error message is displayed  
**And** the map still initializes without markers

---

### Requirement: Pub Information Display (REQ-PLM-004)
**Priority:** MUST  
**Category:** Functional

The system MUST display detailed pub information when a user clicks on a map marker.

**Acceptance Criteria:**
- Clicking a marker opens an info window
- Info window displays: pub name, address, town/city, county
- If available, info window includes link to pub details page
- Only one info window is open at a time
- Info window can be closed by clicking the X or clicking another marker

#### Scenario: View Pub Details
**Given** the map displays pub markers  
**When** the user clicks on a specific marker  
**Then** an info window opens above that marker  
**And** the info window displays the pub name as heading  
**And** the info window shows the full address  
**And** the info window shows town/city and county  
**And** if a URL exists, a "View Details" link is shown

#### Scenario: Switch Between Pubs
**Given** an info window is currently open for Pub A  
**When** the user clicks on a marker for Pub B  
**Then** the info window for Pub A closes  
**And** a new info window opens for Pub B  
**And** the new info window displays Pub B's information

---

### Requirement: Mobile Responsiveness (REQ-PLM-005)
**Priority:** MUST  
**Category:** Non-Functional

The map view MUST be fully functional and optimized for mobile devices.

**Acceptance Criteria:**
- Map container uses full viewport width on all screen sizes
- Map height adapts appropriately (full viewport on mobile, contained on desktop)
- Touch gestures work correctly (pinch zoom, pan)
- Markers are touch-friendly (minimum 44x44px tap target)
- Info windows are readable on small screens
- Map controls are accessible on mobile

#### Scenario: View Map on Mobile Device
**Given** the user accesses the map on a mobile device (screen width < 768px)  
**When** the map renders  
**Then** the map fills the full viewport width  
**And** the map is at least 80% of viewport height  
**And** pinch-to-zoom gestures work correctly  
**And** markers can be easily tapped with a finger  
**And** info windows display properly without overflow

---

### Requirement: Google Maps Integration (REQ-PLM-006)
**Priority:** MUST  
**Category:** Technical

The system MUST integrate with Google Maps JavaScript API securely and efficiently.

**Acceptance Criteria:**
- Google Maps API key is stored in environment variable
- API script is loaded asynchronously
- Map initializes only after API is ready
- API requests are minimized to reduce costs
- No API key is exposed in client-side code (use environment variables)

#### Scenario: Initialize Google Maps API
**Given** the map component is mounted  
**When** the Google Maps API script loads  
**Then** the API key from environment variable is used  
**And** the map initializes successfully  
**And** no console errors related to API key appear  
**And** the map is interactive and functional

---

### Requirement: Performance (REQ-PLM-007)
**Priority:** MUST  
**Category:** Non-Functional

The map view MUST load and become interactive within 3 seconds on a standard connection.

**Acceptance Criteria:**
- Initial map render occurs within 2 seconds
- All markers appear within 3 seconds
- Map is interactive (pannable, zoomable) within 2 seconds
- No blocking JavaScript delays user interaction

#### Scenario: Fast Map Loading
**Given** the user navigates to the map view  
**When** the page starts loading  
**Then** the map container appears within 1 second  
**And** the map becomes interactive within 2 seconds  
**And** all markers are visible within 3 seconds  
**And** the user can interact with the map immediately after it loads

---

## Data Requirements

### Sample Data File Format

**Location:** `/data/pubs-sample.json`

**Schema:**
```json
[
  {
    "id": number,              // Required: Unique identifier
    "name": string,            // Required: Pub name
    "lat": number,             // Required: Latitude (-90 to 90)
    "lng": number,             // Required: Longitude (-180 to 180)
    "townCity": string,        // Optional: Town or city
    "address": string,         // Optional: Street address
    "county": string,          // Optional: County
    "region": string,          // Optional: Region
    "country": string,         // Optional: Country
    "url": string,             // Optional: Link to pub details
    "imageUrl": string,        // Optional: Pub image URL
    "openState": string        // Optional: Operating status
  }
]
```

**Sample Entry:**
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
  "url": "https://www.jdwetherspoon.com/pubs/all-pubs/england/greater-manchester/the-moon-under-water-manchester",
  "imageUrl": "https://example.com/moon-under-water.jpg",
  "openState": "Open"
}
```

---

## Dependencies

### External Services
- Google Maps JavaScript API (requires API key)

### Environment Variables
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key

### Browser Requirements
- Modern browsers with JavaScript enabled
- Support for ES6+ features
- Geolocation API (optional, for future enhancements)

---

## Future Enhancements (Out of Scope)

The following features are not included in this specification but may be considered for future iterations:

1. **Search and Filtering:** Filter pubs by region, county, or name
2. **User Location:** Detect user's current location and center map accordingly
3. **Directions:** Integrate with Google Maps Directions API
4. **Marker Clustering:** Group nearby markers for better performance with large datasets
5. **Custom Styling:** Apply custom map themes/colors
6. **Favorites:** Allow users to save favorite pub locations
7. **Real-time Data:** Connect to backend API instead of static JSON file

---

## Constraints

1. **API Costs:** Google Maps API usage must be monitored to avoid unexpected costs
2. **Data Accuracy:** Sample data coordinates must be verified for accuracy
3. **Browser Support:** Must support latest 2 versions of major browsers (Chrome, Firefox, Safari, Edge)
4. **Mobile-First:** Design must prioritize mobile experience

---

## Success Metrics

- Map loads successfully for 99%+ of users
- Average time to interactive < 3 seconds
- Mobile bounce rate < 20% on map view
- Click-through rate on pub markers > 30%
- Zero critical errors in production

---

## Non-Functional Requirements

### Security
- API key stored securely in environment variables
- No sensitive data exposed in client-side code
- HTTPS required for production deployment

### Accessibility
- Keyboard navigation support for map controls
- Screen reader compatible info window content
- Sufficient color contrast for UI elements
- Alternative text for marker icons

### Maintainability
- Code follows Vue.js best practices
- Component is modular and reusable
- Clear inline comments for complex logic
- Sample data format is documented

---

## Glossary

- **Marker:** A visual indicator on the map representing a pub location
- **Info Window:** A popup that appears when clicking a marker, showing pub details
- **Viewport:** The visible area of the map in the browser window
- **Geocoordinates:** Latitude and longitude values defining a location
