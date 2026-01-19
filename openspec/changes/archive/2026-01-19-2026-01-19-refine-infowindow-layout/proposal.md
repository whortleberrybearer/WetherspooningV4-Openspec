# Proposal: Refine InfoWindow Layout

**Change ID:** 2026-01-19-refine-infowindow-layout  
**Status:** Draft  
**Created:** 2026-01-19  
**Author:** AI Assistant

## Problem Statement

The current Google Maps InfoWindow implementation has several UX issues that negatively impact the user experience:

1. **Excessive Borders and Spacing**: The InfoWindow has excessive borders around the content, particularly caused by the default close button that creates a large amount of blank space above the content
2. **Inconsistent Width**: The InfoWindow sizing is inconsistent and appears to be based on content width (especially address length), creating an unpredictable visual experience
3. **Poor Mobile Responsiveness**: On mobile devices with narrow viewports, the InfoWindow can be wider than the available screen width, causing poor display
4. **Not Ideal for Custom Content**: The standard Google Maps InfoWindow may not be the best solution for the rich, card-style content we're displaying

## Proposed Solution

Replace the standard Google Maps InfoWindow with a custom overlay that provides:

1. **Custom Styling Control**: Complete control over borders, padding, spacing, and close button positioning
2. **Consistent Fixed Width**: A fixed, predictable width that adapts responsively to screen size
3. **Mobile-First Responsive Design**: Width constraints that ensure the overlay never exceeds viewport width on mobile devices
4. **Enhanced Layout**: Better visual integration with the map, similar to modern map experiences (Google Maps native app, Airbnb, etc.)

The custom overlay will:
- Use Google Maps OverlayView class for positioning relative to map coordinates
- Maintain the existing card-style design with pub information
- Have a consistent maximum width (e.g., 400px) with mobile breakpoints (320px for small screens)
- Include a properly positioned close button that doesn't create excessive spacing
- Ensure the overlay is always visible within viewport bounds with appropriate margins

## Impact Assessment

### User-Facing Changes
- **Visual**: InfoWindow appearance changes from Google's default styling to custom-styled overlay
- **Behavior**: Close button repositioned; overlay may animate/position slightly differently
- **Mobile**: Significantly improved mobile experience with proper width constraints

### Technical Changes
- Replace `google.maps.InfoWindow` with custom `google.maps.OverlayView` implementation
- Add new component/composable for custom overlay management
- Update `showPubInfo` function to use custom overlay instead of InfoWindow
- Add responsive CSS for mobile breakpoints

### Breaking Changes
None - this is purely a visual/UX refinement maintaining the same functional behavior

## Scope

This change modifies the `enhanced-infowindow-display` capability.

### In Scope
- Custom overlay implementation replacing InfoWindow
- Responsive width constraints for mobile and desktop
- Improved close button positioning and styling
- Consistent fixed-width layout
- Viewport boundary detection and positioning

### Out of Scope
- Changes to InfoWindow content structure (image, badges, buttons remain the same)
- New features or functionality beyond layout improvements
- Animation/transition effects (can be added in future enhancement)

## Dependencies

- Depends on: Google Maps JavaScript API (existing dependency)
- Blocks: None
- Related: None

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|---------|-----------|
| Custom overlay positioning bugs on edge cases | Medium | Medium | Thorough testing across zoom levels, map boundaries, and screen sizes |
| Browser compatibility issues with OverlayView | Low | Medium | Test on major browsers (Chrome, Firefox, Safari, Edge) |
| Performance degradation with custom overlay | Low | Low | Use efficient DOM manipulation; reuse overlay instance |
| Accessibility regression | Medium | Medium | Ensure keyboard navigation, focus management, and ARIA attributes are maintained |

## Alternatives Considered

1. **Continue with Google InfoWindow + CSS overrides**: Limited control, difficult to override Google's default styles reliably
2. **Third-party overlay library**: Adds dependency, may be over-engineered for our needs
3. **Modal/sheet-style display**: More intrusive, doesn't feel like a natural map interaction

## Success Criteria

- [ ] InfoWindow has consistent width across all pubs
- [ ] No excessive borders or spacing around content
- [ ] Close button positioned without creating blank space
- [ ] Mobile viewport: Overlay never exceeds screen width
- [ ] Desktop viewport: Overlay has fixed maximum width (400px)
- [ ] All existing functionality (visit tracking, authentication, badges) works unchanged
- [ ] Passes accessibility checks (keyboard navigation, ARIA labels)
- [ ] No visual regression in pub info display (content looks the same or better)

## Open Questions

None - solution is well-defined based on the problem statement.
