# Enhance InfoWindow Display

## Metadata
- **ID**: 2025-12-31-enhance-infowindow-display
- **Type**: enhancement
- **Status**: proposed
- **Created**: 2025-12-31

## Problem Statement
The current Google Maps InfoWindow displaying pub information uses basic HTML string styling which creates inconsistency with the rest of the application's UI components and provides a less polished user experience. The design doesn't match the modern Card-based components used elsewhere in the application (like ProximityVisitPrompt).

## Proposed Solution
Enhance the InfoWindow display to use a Card-based layout with proper component styling, matching the visual design patterns established in ProximityVisitPrompt. The enhanced InfoWindow will display pub information in a structured, visually consistent format with image, name, details, badges, link, and action button.

## Scope
### In Scope
- Redesign InfoWindow content layout to use Card-style structure
- Display pub image at top (if available)
- Show pub name as title
- Display formatted address with proper line breaks
- Include status badges (Open/Closed) and visit badges (Visited with date)
- Show "View on Wetherspoons website" link
- Display authentication-aware action button (Visit/Update Visit/Sign in to track visit)
- Conditional image attribution for JD Wetherspoon images
- Maintain existing button click handlers for PubDetailSheet or sign-in dialog

### Out of Scope
- Replacing InfoWindow with custom overlay component or third-party InfoBox library
- Changing proximity visit prompt component
- Modifying PubDetailSheet component
- Adding new badges beyond existing Open/Closed and Visited badges

## Requirements
### REQ-EID-001: Card-Style Layout
**Priority**: MUST  
The InfoWindow must use a Card-based visual structure with consistent spacing, shadows, and rounded corners matching shadcn/vue Card component design patterns.

### REQ-EID-002: Image Display
**Priority**: MUST  
When a pub has an imageUrl, the InfoWindow must display the image at the top with rounded corners, proper aspect ratio (object-fit: cover), and conditional attribution text for JD Wetherspoon images.

### REQ-EID-003: Pub Name and Address
**Priority**: MUST  
The InfoWindow must display the pub name as a prominent title and the full address with proper formatting and line breaks for readability.

### REQ-EID-004: Status and Visit Badges
**Priority**: MUST  
The InfoWindow must display:
- Open/Closed status badge based on pub.openState
- Visited badge with formatted date (DD/MM/YY) when authenticated and pub is visited
- Badges must use consistent styling matching shadcn/vue Badge component design

### REQ-EID-005: Website Link
**Priority**: MUST  
When a pub has a url property, the InfoWindow must display a "View on Wetherspoons website" link that opens in a new tab with proper security attributes (rel="noopener noreferrer").

### REQ-EID-006: Authentication-Aware Action Button
**Priority**: MUST  
The InfoWindow must display different action buttons based on authentication state:
- Authenticated + not visited: "Visit" button → opens PubDetailSheet
- Authenticated + visited: "Update Visit" button → opens PubDetailSheet  
- Not authenticated: "Sign in to track visit" button → opens LoginDialog

### REQ-EID-007: Responsive Layout
**Priority**: SHOULD  
The InfoWindow content should be mobile-friendly with appropriate max-width constraints and responsive text sizing.

### REQ-EID-008: Accessibility
**Priority**: SHOULD  
The InfoWindow content should maintain proper heading hierarchy, ARIA labels for links, and keyboard navigation support for interactive elements.

## Impact
- **Users**: Improved visual consistency and more professional appearance when viewing pub details
- **Codebase**: Consolidates styling patterns, reduces inline HTML string complexity
- **Performance**: Minimal impact - same number of DOM elements, better structured markup

## Dependencies
- Existing shadcn/vue Card, Badge, and Button component styles (already in codebase)
- Google Maps JavaScript API InfoWindow (no changes required)
- useAuth composable for authentication state
- useVisits composable for visit tracking state

## Alternatives Considered
1. **Custom Overlay Component**: Rejected - adds complexity and may have positioning/interaction issues with Google Maps
2. **Third-party InfoBox Library**: Rejected - unnecessary dependency for what can be achieved with native InfoWindow styling
3. **Keep Current HTML String Implementation**: Rejected - doesn't address visual consistency issues

## Success Criteria
- InfoWindow displays with Card-style visual design
- All pub information elements (image, name, address, badges, link, button) render correctly
- Button interactions work as expected (PubDetailSheet for authenticated, LoginDialog for guests)
- Visual design is consistent with ProximityVisitPrompt component
- TypeScript compilation passes with no errors
- No regression in marker click behavior or InfoWindow positioning
