import { reactive, readonly, toRef } from 'vue'
import { getUserVisits, type Visit as FirebaseVisit } from '@/services/firebaseDataService'

/**
 * Visit information for a pub
 */
export interface Visit {
  id: number
  userId: string  // Changed from number to string for Firebase UID
  pubId: number
  visitedAt?: string  // ISO date string
  rating?: number     // 1-5
  notes?: string
}

/**
 * Pub interface (minimal, matching existing Pub type)
 */
interface Pub {
  id: number
  [key: string]: any
}

/**
 * Visit state management
 */
interface VisitState {
  visitedPubIds: Set<number>
  visits: Visit[]  // Store full visit data for date retrieval
  isLoading: boolean
  error: string | null
}

// Global visit state
const visitState = reactive<VisitState>({
  visitedPubIds: new Set(),
  visits: [],
  isLoading: false,
  error: null
})

/**
 * Visit tracking composable for managing pub visit data.
 * 
 * Loads visit data from Firestore and provides methods to check
 * visit status and calculate visit counts for groups of pubs.
 * 
 * @example
 * ```ts
 * const { isVisited, getGroupCounts, loadVisits } = useVisits()
 * 
 * // Load visits for authenticated user
 * await loadVisits('firebase-uid-string')
 * 
 * // Check if pub is visited
 * if (isVisited(5)) {
 *   console.log('Pub 5 has been visited')
 * }
 * 
 * // Get visit counts for a group
 * const { visited, total } = getGroupCounts(countyPubs)
 * ```
 */
export function useVisits() {
  /**
   * Load visit data for a specific user from Firestore.
   * Filters visits to only those belonging to the specified user.
   * 
   * @param userId - The Firebase UID of the user to load visits for
   * @returns Promise that resolves when visits are loaded
   */
  const loadVisits = async (userId: string): Promise<void> => {
    visitState.isLoading = true
    visitState.error = null

    try {
      // Load visits from Firestore using the service
      const userVisits = await getUserVisits(userId)
      
      // Store full visit data for date retrieval
      visitState.visits = userVisits
      
      // Populate Set with visited pub IDs for O(1) lookup
      visitState.visitedPubIds.clear()
      userVisits.forEach(visit => {
        visitState.visitedPubIds.add(visit.pubId)
      })

      visitState.isLoading = false
    } catch (err) {
      const errorMsg = 'Failed to load visit data from Firestore. Visit tracking unavailable.'
      visitState.error = errorMsg
      visitState.isLoading = false
      console.warn('Error loading visits:', err)
      // Don't throw - allow app to continue with empty visit state
    }
  }

  /**
   * Check if a specific pub has been visited by the current user.
   * Uses O(1) Set lookup for performance.
   * 
   * @param pubId - The ID of the pub to check
   * @returns true if the pub has been visited, false otherwise
   */
  const isVisited = (pubId: number): boolean => {
    return visitState.visitedPubIds.has(pubId)
  }

  /**
   * Calculate the number of visited pubs within a given group.
   * 
   * @param pubs - Array of pubs to count visits for
   * @returns Object with visited count and total count
   */
  const getGroupCounts = (pubs: Pub[]): { visited: number; total: number } => {
    const visited = pubs.filter(pub => isVisited(pub.id)).length
    return {
      visited,
      total: pubs.length
    }
  }

  /**
   * Get the visit date for a specific pub.
   * 
   * @param pubId - The ID of the pub to get visit date for
   * @returns ISO date string if pub is visited and has a date, null otherwise
   */
  const getVisitDate = (pubId: number): string | null => {
    const visit = visitState.visits.find(v => v.pubId === pubId)
    return visit?.visitedAt || null
  }

  /**
   * Clear all visit data (typically called on logout).
   */
  const clearVisits = (): void => {
    visitState.visitedPubIds.clear()
    visitState.visits = []
    visitState.error = null
    visitState.isLoading = false
  }

  return {
    // Readonly state to prevent direct mutations
    visitedPubIds: readonly(visitState.visitedPubIds),
    isLoading: toRef(visitState, 'isLoading'),
    error: toRef(visitState, 'error'),
    
    // Methods
    loadVisits,
    isVisited,
    getGroupCounts,
    getVisitDate,
    clearVisits
  }
}
