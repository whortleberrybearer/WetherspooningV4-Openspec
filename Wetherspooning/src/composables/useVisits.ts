import { reactive, readonly, toRef } from 'vue'

/**
 * Visit information for a pub
 */
export interface Visit {
  id: number
  userId: number
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
  isLoading: boolean
  error: string | null
}

// Global visit state
const visitState = reactive<VisitState>({
  visitedPubIds: new Set(),
  isLoading: false,
  error: null
})

/**
 * Visit tracking composable for managing pub visit data.
 * 
 * Loads visit data from static JSON file and provides methods to check
 * visit status and calculate visit counts for groups of pubs.
 * 
 * @example
 * ```ts
 * const { isVisited, getGroupCounts, loadVisits } = useVisits()
 * 
 * // Load visits for authenticated user
 * await loadVisits(1)
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
   * Load visit data for a specific user from the static JSON file.
   * Filters visits to only those belonging to the specified user.
   * 
   * @param userId - The ID of the user to load visits for
   * @returns Promise that resolves when visits are loaded
   */
  const loadVisits = async (userId: number): Promise<void> => {
    visitState.isLoading = true
    visitState.error = null

    try {
      const response = await fetch('/data/visits-sample.json')
      if (!response.ok) {
        throw new Error('Failed to load visit data')
      }

      const data: Visit[] = await response.json()
      
      // Filter to current user's visits and extract pub IDs
      const userVisits = data.filter(visit => {
        // Validate visit structure
        if (!visit.id || !visit.userId || !visit.pubId) {
          console.warn('Skipping invalid visit entry:', visit)
          return false
        }
        return visit.userId === userId
      })

      // Populate Set with visited pub IDs for O(1) lookup
      visitState.visitedPubIds.clear()
      userVisits.forEach(visit => {
        visitState.visitedPubIds.add(visit.pubId)
      })

      visitState.isLoading = false
    } catch (err) {
      const errorMsg = 'Failed to load visit data. Visit tracking unavailable.'
      visitState.error = errorMsg
      visitState.isLoading = false
      console.error('Error loading visits:', err)
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
   * Clear all visit data (typically called on logout).
   */
  const clearVisits = (): void => {
    visitState.visitedPubIds.clear()
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
    clearVisits
  }
}
