# improve-location-search-ux

## Summary
Improve the location search widget's mobile responsiveness, theme integration, and geographic targeting to enhance usability on thin mobile devices and ensure better search results for UK and Ireland locations.

## Motivation
Current issues with the location search widget:
1. **Mobile Width**: The search box has a fixed `max-width: 20rem` (320px) which is too wide for thin mobile devices (e.g., iPhone SE at 375px width), leaving insufficient margin and creating layout issues
2. **Theme Integration**: The search widget does not properly respond to the application's light/dark mode toggle, always displaying with a black background regardless of the theme setting
3. **Geographic Scope**: The search is currently restricted to UK only (`country: 'uk'`), but should include Ireland to match the application's scope of Wetherspoons pub locations

These issues negatively impact user experience, particularly for mobile users who represent a significant portion of the user base for a location-based pub finder application.

## Proposed Solution
Update the LocationSearch component to:
1. Make the search box responsive using `max-width: 100%` with appropriate container constraints, allowing it to adapt to any screen width while maintaining proper margins
2. Implement proper theme styling that responds to the `isDark` prop, ensuring the widget background and text colors match the current theme
3. Expand the geographic restriction to include both UK and Ireland (`country: ['uk', 'ie']`) to align with the application's pub coverage

## Impact Assessment
**Benefits:**
- Improved mobile UX on narrow devices (< 400px width)
- Consistent visual theming across light/dark modes
- More accurate search results for users looking for pubs in Ireland
- Better alignment with mobile-first design principles

**Risks:**
- Minimal risk; changes are isolated to the LocationSearch component
- Theme changes may require testing Google Places widget CSS customization capabilities

**Scope:**
- Frontend only: Single component modification
- No database or backend changes required
- No breaking changes to existing functionality

## Alternatives Considered
1. **Width Only Fix**: Could address just the width issue, but leaving theme and geographic issues would be incomplete
2. **Custom Autocomplete**: Could build a custom autocomplete instead of using Google Places widget, but this would be significantly more complex and costly (API usage)
3. **Media Queries**: Could use media queries for width only, but responsive container approach is more flexible

## Dependencies
- No new dependencies
- Relies on existing Google Places Autocomplete widget customization capabilities
- Depends on `isDark` prop already being passed from parent component

## Open Questions
None - issues are well-defined and solution is straightforward.
