# Technical Design: Add Navigation Sidebar for Pub Browsing

**Change ID:** `add-pub-navigation-sidebar`

## Architecture Overview

This feature adds a collapsible sidebar component to the existing pub locations map, providing a hierarchical navigation interface alongside the map visualization.

```
┌──────────────────────────────────────────────────────────────┐
│                    PubLocationsMap.vue                       │
│  ┌────────────┐  ┌────────────────────────────────────────┐ │
│  │  Burger    │  │                                        │ │
│  │  Menu Btn  │  │        Google Maps Container          │ │
│  └────────────┘  │                                        │ │
│                  │          (Markers)                     │ │
│  ┌────────────┐  │                                        │ │
│  │            │  │                                        │ │
│  │  Sidebar   │  └────────────────────────────────────────┘ │
│  │            │                                              │
│  │  Country   │  ← Data Flow: pubs[] array                 │
│  │    County  │  → Events: select-pub(pub)                 │
│  │      Pub   │                                              │
│  │            │                                              │
│  └────────────┘                                              │
└──────────────────────────────────────────────────────────────┘
```

## Component Structure

### PubSidebar.vue (New)

**Props:**
- `pubs: Pub[]` - Array of pub objects to display
- `isOpen: boolean` - Controls sidebar visibility

**Events:**
- `close()` - Emitted when user closes sidebar
- `select-pub(pub: Pub)` - Emitted when user clicks a pub in the list

**State:**
- `expandedCountries: Set<string>` - Tracks which countries are expanded
- `expandedCounties: Set<string>` - Tracks which counties are expanded (keyed as `"${country}-${county}"`)

**Computed:**
- `groupedPubs` - Hierarchical structure of pubs grouped by country → county → pub, all sorted alphabetically

**Template Structure:**
```
- Header (title + close button)
- Scrollable Content
  - For each Country:
    - Country button (name + total count + chevron)
    - If expanded:
      - For each County in Country:
        - County button (name + count + chevron)
        - If expanded:
          - For each Pub in County:
            - Pub button (name + town/city)
```

### PubLocationsMap.vue (Modified)

**New State:**
- `sidebarOpen: boolean` - Controls sidebar visibility

**New Methods:**
- `toggleSidebar()` - Opens/closes the sidebar
- `handlePubSelect(pub: Pub)` - Focuses map on selected pub and shows info window

**New Template Elements:**
- Burger menu button (fixed position, high z-index)
- PubSidebar component
- Overlay div (mobile only, closes sidebar on click)

## Data Flow

### Grouping Algorithm

```typescript
1. Initialize nested object: { [country]: { [county]: Pub[] } }
2. For each pub in pubs array:
   - Add to grouped[pub.country][pub.county][]
3. Sort countries alphabetically
4. For each country:
   - Sort counties alphabetically
   - For each county:
     - Sort pubs by townCity alphabetically
5. Return sorted nested structure
```

### Pub Selection Flow

```
User clicks pub in sidebar
  ↓
selectPub event emitted with pub object
  ↓
handlePubSelect() called
  ↓
Find marker for pub (match by pub.id)
  ↓
Pan map to marker position
  ↓
Show info window for pub
  ↓
(Optional) Close sidebar on mobile
```

## UI/UX Design

### Desktop Layout
- Sidebar: 320px width (md:384px)
- Fixed positioning on left side
- Slides in/out with transform transition
- Map remains visible behind sidebar
- Burger menu in top-left corner

### Mobile Layout
- Sidebar: 320px width (80% of small screens)
- Full-height overlay
- Semi-transparent backdrop when open
- Clicking backdrop closes sidebar
- Burger menu remains accessible

### Interaction States
- **Collapsed groups:** Chevron pointing right →
- **Expanded groups:** Chevron pointing down ↓
- **Hover:** Subtle background color change (accent)
- **Active pub:** (Future enhancement: highlight selected pub)

## Styling Approach

Using Tailwind CSS utility classes with shadcn-vue theme variables:
- `bg-background` - Sidebar background
- `border-border` - Dividers and outlines
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text (counts, town/city)
- `hover:bg-accent` - Interactive hover states

## Accessibility Considerations

- Keyboard navigation: Tab through interactive elements
- ARIA labels on icon-only buttons ("Close sidebar", "Toggle sidebar")
- Semantic HTML: `<button>` elements for all interactive items
- Focus management: Trap focus in sidebar when open (future enhancement)

## Performance Considerations

- **Grouping:** Computed property caches result, only re-computes when pubs array changes
- **Large datasets:** Current approach suitable for hundreds of pubs; thousands may need virtualization
- **Animations:** CSS transitions use `transform` (GPU-accelerated)
- **Mobile:** Sidebar overlay prevents accidental map interactions

## State Management

No global state management needed. Component state is sufficient:
- Sidebar open/closed: Local state in PubLocationsMap
- Expanded groups: Local state in PubSidebar
- Pub selection: Event-driven communication

## Integration Points

### Existing pub-locations-map Capability
- Reuses existing `pubs` data array
- Leverages existing marker infrastructure
- Extends existing `showPubInfo()` method
- Maintains existing map interaction patterns

### Future Enhancements
- Filter pubs by search query
- Highlight selected pub's marker
- Sync expanded state with URL params
- Add pub visit tracking integration (when available)

## Testing Strategy

### Component Tests
- PubSidebar grouping logic
- Expand/collapse state management
- Pub count calculations

### Integration Tests
- Sidebar toggle functionality
- Pub selection updates map
- Mobile overlay behavior

### Visual Tests
- Responsive breakpoints
- Animation smoothness
- Z-index layering
