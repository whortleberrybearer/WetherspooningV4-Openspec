# Implementation Tasks: Add Navigation Sidebar for Pub Browsing

**Change ID:** `add-pub-navigation-sidebar`

## Pre-Implementation

- [ ] Review and approve proposal.md
- [ ] Review and approve design.md
- [ ] Review and approve spec deltas

## Component Development

- [ ] Create `PubSidebar.vue` component
  - Set up component props (pubs, isOpen)
  - Define component events (close, select-pub)
  - Create reactive state for expanded groups (countries, counties)
  - Implement grouping computed property
    - Group pubs by country → county
    - Sort countries alphabetically
    - Sort counties alphabetically within each country
    - Sort pubs by town/city within each county
  - Implement toggle methods for expand/collapse
  - Build template structure (header, scrollable content, groups)
  - Add Tailwind CSS styling using shadcn-vue tokens
  - Add chevron rotation animations
  - Add hover states for interactive elements

## Integration

- [ ] Modify `PubLocationsMap.vue` to integrate sidebar
  - Import PubSidebar component
  - Add sidebarOpen state variable
  - Create toggleSidebar method
  - Create handlePubSelect method
    - Find marker matching selected pub
    - Pan map to pub location
    - Display info window for pub
  - Add burger menu button to template
  - Add PubSidebar component to template with props/events
  - Add mobile backdrop overlay
  - Wire up event handlers (close, select-pub)

## Styling & Responsiveness

- [ ] Implement sidebar positioning and animations
  - Fixed positioning on left side
  - Slide-in/out transform transition
  - Proper z-index layering (burger: 60, sidebar: 50, backdrop: 40)
  - Width responsive to breakpoints (320px → 384px on md+)
- [ ] Implement mobile-specific styles
  - Full-height overlay on mobile
  - Semi-transparent backdrop
  - Sidebar max-width 80% on small screens
  - Backdrop dismisses sidebar on tap
- [ ] Verify touch interactions
  - Expand/collapse groups work on touch
  - Pub selection works on touch
  - Burger menu button is touch-friendly (44x44px min)

## Testing

- [ ] Test grouping logic
  - Verify countries sorted alphabetically
  - Verify counties sorted alphabetically within countries
  - Verify pubs sorted by town/city within counties
  - Verify pub counts are accurate at each level
- [ ] Test expand/collapse functionality
  - Individual groups can be expanded independently
  - Individual groups can be collapsed independently
  - Chevron icons rotate correctly
  - State persists during session
- [ ] Test sidebar toggle
  - Burger menu opens sidebar
  - Close button closes sidebar
  - Animation is smooth
  - Sidebar state persists during session
- [ ] Test pub selection
  - Clicking pub focuses map on correct location
  - Info window opens for selected pub
  - Map pans smoothly to pub location
  - Works from any current map position
- [ ] Test mobile responsiveness
  - Sidebar overlays map on mobile
  - Backdrop appears on mobile
  - Tapping backdrop closes sidebar
  - Sidebar is scrollable on small screens
  - Touch interactions work correctly
- [ ] Test accessibility
  - Keyboard navigation through sidebar
  - All buttons have proper ARIA labels
  - Focus indicators are visible
  - Tab order is logical

## Documentation

- [ ] Update README if necessary (likely no changes needed)
- [ ] Add JSDoc comments to complex functions
  - Grouping logic in computed property
  - Toggle methods
  - Pub count calculation

## Validation

- [ ] Run `openspec validate add-pub-navigation-sidebar --strict`
- [ ] Run TypeScript type check (`npm run type-check`)
- [ ] Run linter (`npm run lint`)
- [ ] Test in dev server (`npm run dev`)
- [ ] Visual regression testing on desktop and mobile

## Completion Checklist

- [ ] All requirements from specs implemented
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Ready for deployment
