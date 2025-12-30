# Enhance InfoWindow Display

## Problem Statement
The current InfoWindow implementation has styling issues due to the Google Maps close button interfering with card layout, and it lacks important pub information that users need, including postcode, Wetherspoons website link, and pub image.

## Current Behavior
- InfoWindow uses card styling that conflicts with Google Maps' default close button
- Displays only: name, address, town/city, county, status badge, visit badge, and track visit button
- No postcode displayed (field doesn't exist in Pub interface)
- No link to the Wetherspoons pub page (even though `url` field exists)
- No pub image displayed (even though `imageUrl` field exists)
- No attribution for Wetherspoons images

## Proposed Solution
Update the InfoWindow to:
1. Fix card styling to work properly with Google Maps close button
2. Add postcode field to Pub interface and display it in the InfoWindow
3. Display a link to the Wetherspoons pub page when `url` is defined
4. Display pub image when `imageUrl` is defined
5. Add attribution text for images from Wetherspoons domain

## User Value
- **Better usability**: Fixed styling makes the InfoWindow more readable and professional
- **Complete information**: Users can see the full postal address including postcode
- **External navigation**: Users can visit the official Wetherspoons page for menu, facilities, and opening hours
- **Visual recognition**: Images help users identify pubs they're looking for
- **Legal compliance**: Proper attribution for Wetherspoons images

## Scope
This change modifies:
- `pub-locations-map` spec (InfoWindow display requirements)
- Pub interface in `firebaseDataService.ts` (add postcode field)
- InfoWindow rendering in `PubLocationsMap.vue`

This change does NOT modify:
- Data migration (postcode field will be optional, can be populated later)
- Visit tracking functionality
- Marker clustering or visual states
- Sidebar display

## Dependencies
- None (standalone enhancement)

## Risks & Mitigations
- **Risk**: Postcode field doesn't exist in current data
  - **Mitigation**: Make field optional, display only when present
- **Risk**: Large images could slow InfoWindow rendering
  - **Mitigation**: Use CSS to constrain image size, consider lazy loading
- **Risk**: Attribution text might clutter the UI
  - **Mitigation**: Use small, subtle text below the image

## Open Questions
None - requirements are clear from user request.
