# Enhance InfoWindow Display

## Problem Statement
The current InfoWindow implementation has styling issues due to the Google Maps close button interfering with card layout, and it lacks important pub information that users need, including postcode, Wetherspoons website link, and pub image.

## Current Behavior
- InfoWindow uses card styling that conflicts with Google Maps' default close button
- Displays only: name, address (street only), town/city, county, status badge, visit badge, and track visit button
- Address is split across multiple lines (street, then town/county)
- No postcode included in address
- No link to the Wetherspoons pub page (even though `url` field exists)
- No pub image displayed (even though `imageUrl` field exists)
- No attribution for Wetherspoons images

## Proposed Solution
Update the InfoWindow to:
1. Fix card styling to work properly with Google Maps close button
2. Display full postal address in format: "Street, Town, County, Postcode" (e.g., "15–19 Darwen Street, Blackburn, Lancashire, BB2 2BY")
3. Display a link to the Wetherspoons pub page when `url` is defined
4. Display pub image when `imageUrl` is defined
5. Add attribution text for images from Wetherspoons domain

## User Value
- **Better usability**: Fixed styling makes the InfoWindow more readable and professional
- **Complete information**: Users see the full postal address in a single line (street, town, county, postcode)
- **External navigation**: Users can visit the official Wetherspoons page for menu, facilities, and opening hours
- **Visual recognition**: Images help users identify pubs they're looking for
- **Legal compliance**: Proper attribution for Wetherspoons images

## Scope
This change modifies:
- `pub-locations-map` spec (InfoWindow display requirements)
- Address format in data generation (`generatePubsData.js`)
- InfoWindow rendering in `PubLocationsMap.vue`

This change does NOT modify:
- Pub interface structure (address field already exists)
- Data migration (address format updated in seed data)
- Visit tracking functionality
- Marker clustering or visual states
- Sidebar display

## Dependencies
- None (standalone enhancement)

## Risks & Mitigations
- **Risk**: Full address format might be too long for mobile InfoWindow
  - **Mitigation**: Test on mobile, use responsive text wrapping
- **Risk**: Large images could slow InfoWindow rendering
  - **Mitigation**: Use CSS to constrain image size, consider lazy loading
- **Risk**: Attribution text might clutter the UI
  - **Mitigation**: Use small, subtle text below the image

## Open Questions
None - requirements are clear from user request.
