import type { Pub } from './firebaseDataService'

const CACHE_KEY = 'wetherspooning_pubs_cache'

/**
 * Service for fetching pub data with sessionStorage caching.
 * 
 * Implements multi-layer caching:
 * 1. sessionStorage (5-10ms) - Browser session-scoped cache
 * 2. Firebase Hosting CDN (50-100ms) - Global edge cache
 * 3. Cloud Function (300-500ms) - Server-side Firestore query
 * 
 * Cache lifecycle:
 * - sessionStorage persists for browser session (survives logout, cleared on tab close)
 * - CDN cache expires after 24h (Cache-Control: max-age=86400)
 * - bypassCache forces fresh server fetch (still caches the result)
 */

/**
 * Get pubs from sessionStorage cache
 */
function getCachedPubs(): Pub[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (!cached) {
      return null
    }

    return JSON.parse(cached) as Pub[]
  } catch (error) {
    console.error('Error reading pub cache:', error)
    return null
  }
}

/**
 * Store pubs in sessionStorage cache
 */
function setCachedPubs(pubs: Pub[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(pubs))
  } catch (error) {
    console.error('Error storing pub cache:', error)
  }
}

/**
 * Fetch all pubs with multi-layer caching.
 * 
 * Cache flow:
 * 1. If not bypassCache, check sessionStorage (instant)
 * 2. If cache miss or bypassCache, fetch from /api/pubs (CDN or Cloud Function)
 * 3. Always cache the result in sessionStorage
 * 
 * @param bypassCache - Force fresh fetch from server (still caches the result)
 * @returns Promise resolving to array of all pubs
 */
export async function getAllPubs(bypassCache = false): Promise<Pub[]> {
  // Step 1: Check sessionStorage cache (unless bypassing)
  if (!bypassCache) {
    const cached = getCachedPubs()
    if (cached) {
      console.log('✅ Pub data loaded from sessionStorage cache')
      return cached
    }
  }

  // Step 2: Fetch from Cloud Function (via CDN)
  try {
    const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || ''
    const url = `${functionsUrl}/api/pubs`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const pubs = data.pubs as Pub[]

    // Step 3: Always cache the result
    setCachedPubs(pubs)
    console.log('✅ Pub data cached in sessionStorage')

    console.log(`✅ Loaded ${pubs.length} pubs from Cloud Function`)
    return pubs
  } catch (error) {
    console.error('Error fetching pubs:', error)
    throw new Error('Failed to load pub data. Please try again.')
  }
}

/**
 * Clear the pub data cache (for testing/admin purposes)
 */
export function clearPubCache(): void {
  sessionStorage.removeItem(CACHE_KEY)
  console.log('✅ Pub cache cleared')
}
