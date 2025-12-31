# Design: Proximity Visit Prompt

## Overview

Add a location-aware feature that prompts users to log visits when they are physically near (within 100 metres) of an open Wetherspoon pub. The prompt appears automatically when geolocation is available and shows the pub's details, allowing quick visit logging without manual search.

## Architecture

### Component Structure

```
PubLocationsMap.vue
├── Geolocation watch
├── Proximity detection logic
└── ProximityVisitPrompt.vue (child component)
    ├── Pub details display
    ├── Authentication-aware buttons
    └── Visit creation handler
```

### Data Flow

```
┌─────────────────────────┐
│  User location update   │
│  (geolocation event)    │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Calculate distances to  │
│ all open pubs           │
└──────────┬──────────────┘
           │
           ▼
      ┌────────┐
      │ < 100m?│
      └───┬────┘
          │
    Yes   │   No
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌─────────┐  ┌──────────┐
│ Already │  │ No prompt│
│ visited?│  └──────────┘
└───┬─────┘
    │
No  │  Yes
┌───┴────────┐
│            │
▼            ▼
┌──────────┐ ┌──────────┐
│ Show     │ │ No prompt│
│ Prompt   │ └──────────┘
└────┬─────┘
     │
     ▼
┌─────────────────────────┐
│ User: "Yes" or dismiss  │
└──────────┬──────────────┘
           │
      "Yes"│
           ▼
┌─────────────────────────┐
│ Create visit with       │
│ current date            │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Show pub info window    │
└─────────────────────────┘
```

## Key Design Decisions

### 1. Distance Calculation

Use the **Haversine formula** to calculate distance between user coordinates and pub coordinates:

```typescript
function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371e3 // Earth's radius in metres
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in metres
}
```

**Rationale:** Haversine provides accurate distance for short distances (<100km) and is simple to implement without external libraries.

### 2. When to Check Proximity

**Trigger:** Only when geolocation position updates (not continuously)

**Geolocation watch options:**
```typescript
navigator.geolocation.watchPosition(
  onPositionUpdate,
  onError,
  {
    enableHighAccuracy: true,  // More accurate for proximity detection
    maximumAge: 10000,         // Fresher positions (10 seconds)
    timeout: 5000
  }
)
```

**Rationale:** 
- Checking on every render would be inefficient
- `watchPosition` provides automatic updates when user moves
- Only recalculate when position actually changes

### 3. Filtering Logic

**Only show prompt when ALL conditions are met:**
1. User location is known (geolocation succeeded)
2. Closest pub is within 100 metres
3. Closest pub is **open** (not closed)
4. User is authenticated **OR** prompt shows "Sign in to track" link
5. If authenticated: User has NOT already visited this pub
6. Prompt for this pub has not been dismissed in current session

**Rationale:** Prevents spam, respects user preferences, maintains data quality.

### 4. Prompt UI Design

**Mobile-first approach** - appears at bottom of screen:

```
┌────────────────────────────────┐
│  [Pub Image]                   │
│  The Moon Under Water          │
│  123 High St, Manchester, M1.. │
│  ─────────────────────────     │
│  Image: JD Wetherspoon         │
│                                │
│  [Yes, I'm here]  [Not now]    │  <- Authenticated
│                                │
│  OR                            │
│                                │
│  [Sign in to track visits]     │  <- Unauthenticated
└────────────────────────────────┘
```

**Component:** Dialog/Card component with:
- Pub image (if available) with attribution
- Pub name and address
- Action buttons based on auth state
- Dismiss option

### 5. Session State Management

**Track dismissed prompts in session storage:**

```typescript
const dismissedPromptsInSession = ref<Set<number>>(new Set())

const dismissPrompt = (pubId: number) => {
  dismissedPromptsInSession.value.add(pubId)
  sessionStorage.setItem(
    'dismissedPrompts', 
    JSON.stringify([...dismissedPromptsInSession.value])
  )
}
```

**Rationale:** 
- Prevents re-prompting for same pub in same session
- Session storage clears on browser close (fresh start next visit)
- Set data structure for O(1) lookup

### 6. Visit Creation

**Use existing `useVisits` composable:**

```typescript
const { addVisit } = useVisits()
const { user } = useAuth()

const handleConfirmVisit = async () => {
  if (!user.value?.uid || !nearbyPub.value) return
  
  await addVisit(
    nearbyPub.value.id,
    { visitedAt: new Date().toISOString() },
    user.value.uid
  )
  
  // Show info window
  showPubInfo(nearbyPub.value, marker)
}
```

**Rationale:** Reuse existing visit creation logic, no duplication.

## Performance Considerations

### Optimization Strategies

1. **Throttle distance calculations:** Only recalculate when position changes significantly (>10m)
2. **Filter pubs before calculation:** Only calculate distance to open pubs within viewport
3. **Early exit:** Stop searching once closest pub >100m is found
4. **Reactive state:** Use Vue reactivity for efficient re-renders

### Expected Performance

- Distance calculation: ~0.1ms per pub
- For 100 pubs: ~10ms total (negligible)
- Memory: ~100 bytes per dismissed prompt

## Error Handling

| Error Scenario | Behavior |
|----------------|----------|
| Geolocation denied | No prompt shown, feature disabled |
| Geolocation timeout | No prompt shown, retry on next update |
| No open pubs nearby | No prompt shown |
| Visit creation fails | Show error message, prompt remains |
| Pub missing image | Show placeholder or text-only prompt |
| Session storage full | Clear old entries, continue |

## Accessibility

- Prompt is keyboard navigable
- Screen reader announces pub name and distance
- Focus trapped within prompt when open
- ESC key dismisses prompt
- High contrast text for readability

## Privacy & Security

- Location data never sent to server
- All distance calculations happen client-side
- No tracking of location history
- Respects browser geolocation permissions
- Session storage only (no persistent tracking)

## Testing Strategy

### Unit Tests
- Distance calculation accuracy
- Filtering logic (all conditions)
- Session storage management

### Integration Tests
- Visit creation flow
- Auth state transitions
- Info window display after visit

### Manual Tests
- GPS accuracy in real-world conditions
- Multiple nearby pubs (select closest)
- Prompt dismissal behavior
- Mobile browser compatibility
