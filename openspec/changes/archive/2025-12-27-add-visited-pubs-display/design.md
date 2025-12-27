# Design: Add Visited Pubs Display

## Architecture Overview

This change introduces visit tracking display by adding a new composable for visit data management and extending existing map and sidebar components to show visit status.

### Component Structure

```
┌─────────────────────────────────────┐
│      PubSidebar.vue                 │
│  - Uses useAuth                     │
│  - Uses useVisits (new)             │
│  - Shows progress per group         │
└─────────────────────────────────────┘
              │
              ├──> useAuth (existing)
              │    - isAuthenticated
              │
              └──> useVisits (new)
                   - loadVisits()
                   - isVisited(pubId)
                   - getGroupCounts(pubs)
                   - visitedPubIds: Set<number>

┌─────────────────────────────────────┐
│    PubLocationsMap.vue              │
│  - Uses useAuth                     │
│  - Uses useVisits (new)             │
│  - Creates markers with 4 states    │
└─────────────────────────────────────┘
```

## Data Flow

### Visit Data Loading
1. User authenticates via useAuth
2. Components watch `isAuthenticated` state
3. When `isAuthenticated` becomes `true`, call `useVisits().loadVisits(userId)`
4. Visit data fetched from `/data/visits-sample.json`
5. Data filtered to current user's visits
6. Visit pub IDs stored in reactive `Set<number>`

### Visit Status Check (Map Markers)
1. Map component iterates over pubs to create markers
2. For each pub, call `isVisited(pub.id)` and check `pub.openState`
3. Determine marker style based on 4 states:
   - `!visited && open`: Red (#ea4335) at 100% opacity
   - `!visited && closed`: Gray (#9ca3af) at 60% opacity
   - `visited && open`: Green (#34a853) at 100% opacity (new)
   - `visited && closed`: Blue (#4285f4) at 60% opacity (new)

### Visit Counts (Sidebar Groups)
1. Sidebar groups pubs by country → county
2. For each group, call `getGroupCounts(pubsInGroup)`
3. Returns `{ visited: number, total: number }`
4. Display as "Visited X/Y" with optional progress bar

## File Structure

### New Files
- `Wetherspooning/src/composables/useVisits.ts`
  - Export `useVisits()` composable
  - Manage visit state: `visitedPubIds`, `isLoading`, `error`
  - Methods: `loadVisits(userId)`, `isVisited(pubId)`, `getGroupCounts(pubs)`

- `Wetherspooning/public/data/visits-sample.json`
  - Array of Visit objects
  - Structure: `{ id, userId, pubId, visitedAt?, rating?, notes? }`
  - Sample data for test user (userId: 1)

### Modified Files
- `Wetherspooning/src/views/PubLocationsMap.vue`
  - Import and use `useVisits`
  - Watch `isAuthenticated` to load visits
  - Update `createMarkers()` to check visit status
  - Add 2 new marker styles (visited+open, visited+closed)

- `Wetherspooning/src/components/PubSidebar.vue`
  - Import and use `useVisits`
  - Watch `isAuthenticated` to load visits
  - Update group display to show visit counts
  - Add progress indicator component/element

## State Management

### useVisits Composable Pattern

```typescript
interface Visit {
  id: number
  userId: number
  pubId: number
  visitedAt?: string  // ISO date string
  rating?: number     // 1-5
  notes?: string
}

interface VisitState {
  visitedPubIds: Set<number>
  isLoading: boolean
  error: string | null
}

const visitState = reactive<VisitState>({
  visitedPubIds: new Set(),
  isLoading: false,
  error: null
})

export function useVisits() {
  const loadVisits = async (userId: number) => {
    // Fetch from /data/visits-sample.json
    // Filter to userId
    // Populate visitedPubIds Set
  }
  
  const isVisited = (pubId: number): boolean => {
    return visitState.visitedPubIds.has(pubId)
  }
  
  const getGroupCounts = (pubs: Pub[]) => {
    const visited = pubs.filter(p => isVisited(p.id)).length
    return { visited, total: pubs.length }
  }
  
  return {
    visitedPubIds: readonly(visitState.visitedPubIds),
    isLoading: toRef(visitState, 'isLoading'),
    error: toRef(visitState, 'error'),
    loadVisits,
    isVisited,
    getGroupCounts
  }
}
```

## Visual Design

### Map Marker Colors
Following Google's Material Design color palette for consistency:

| State | Color | Hex | Opacity | Use Case |
|-------|-------|-----|---------|----------|
| Unvisited + Open | Red | #ea4335 | 100% | Default open pub |
| Unvisited + Closed | Gray | #9ca3af | 60% | Closed pub (existing) |
| Visited + Open | Green | #34a853 | 100% | Completed visit |
| Visited + Closed | Blue | #4285f4 | 60% | Visited but now closed |

**Rationale:**
- Green: Universal color for completion/success
- Blue: Distinct from both red and green, indicates "past state"
- Opacity: Closed pubs remain at 60% regardless of visit status for visual hierarchy

### Sidebar Progress Display

Option A: Text with count
```
✓ Visited 3/10
```

Option B: Text with progress bar
```
Visited 3/10
[████████░░░░░░░░░░░░] 30%
```

**Decision:** Use Option A for MVP (simpler, less visual clutter). Progress bar can be added later if users request more visual feedback.

## Integration Points

### Authentication Dependency
- Visit data only loads when `isAuthenticated === true`
- When user logs out, visit data is cleared
- Unauthenticated users see only 2 marker states (open/closed)

### Sidebar Filter Integration
- Existing "Show Closed Pubs" toggle works with visit states
- When toggle OFF, hide all closed pubs (visited or not)
- Visit counts reflect filtered pubs (only count visible pubs)

## Error Handling

### Visit Data Load Failure
- If `/data/visits-sample.json` fails to fetch:
  - Log error to console
  - Set `visitState.error` message
  - Continue with empty visit set (all pubs shown as unvisited)
  - Don't block map/sidebar functionality

### Invalid Visit Data
- If JSON is malformed or has unexpected structure:
  - Log warning for invalid entries
  - Skip invalid visits
  - Process valid visits

### Missing User Visits
- If authenticated user has no visits in data:
  - Show all pubs as unvisited (normal state)
  - No error message needed

## Performance Considerations

### Visit Lookup Optimization
- Use `Set<number>` for O(1) visit lookups instead of array search
- Single fetch on authentication, cached until logout
- No additional network requests per marker or group

### Marker Recreation
- Existing implementation already recreates all markers when toggle changes
- Adding visit state check adds minimal overhead (Set lookup is O(1))
- No additional watch needed beyond existing `showClosedPubs` watch

### Sidebar Rendering
- Group count calculation happens once per group render
- `getGroupCounts()` is O(n) where n = pubs in group (typically <20)
- Results could be memoized if performance issues arise

## Testing Strategy

### Unit Tests
- `useVisits` composable:
  - `loadVisits()` fetches and parses data correctly
  - `isVisited()` returns correct boolean
  - `getGroupCounts()` calculates accurate counts
  - Error handling for fetch failures

### Component Tests
- `PubLocationsMap.vue`:
  - Markers show correct colors for 4 states
  - Markers update when visit data loads
  
- `PubSidebar.vue`:
  - Visit counts display correctly per group
  - Counts update after authentication
  - Filtered counts reflect toggle state

### E2E Tests
- Complete flow: login → visit data loads → map shows green markers → sidebar shows counts

## Future Extensibility

This design supports future enhancements:

1. **Add Visit Action:** Button in info window to mark pub as visited
   - POST to backend API
   - Update local `visitedPubIds` Set
   - Recreate markers to show new state

2. **Visit Details:** Click visited marker to see visit date, rating, notes
   - Extend info window with visit data
   - Fetch from `visits` array instead of just checking Set

3. **Visit Filtering:** Toggle to show only visited/unvisited pubs
   - Add to existing filter controls
   - Update `filteredPubsForMap` computed

4. **Backend Integration:** Replace static JSON with API calls
   - Minimal changes to `loadVisits()` implementation
   - Same interface for components

5. **Persistent Visit Updates:** Save visits to localStorage or backend
   - Add `addVisit()` method to composable
   - Sync with backend on authentication
