import { reactive, readonly, toRef } from 'vue'
import { getUserVisits, createVisit, updateVisit as updateVisitService, deleteVisit, type Visit as FirebaseVisit } from '@/services/firebaseDataService'

/**
 * Visit information for a pub
 */
export interface Visit {
  id: string  // Firestore auto-generated ID
  userId: string  // Firebase UID
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

  /**
   * Add a visit for a pub, or update if already visited.
   * 
   * Creates a new visit record in Firestore with optional date and notes.
   * If the pub has already been visited, updates the existing visit instead.
   * 
   * @param pubId - The ID of the pub to mark as visited
   * @param options - Optional visit details
   * @param options.visitedAt - ISO date string (defaults to current date if not provided, can be undefined for unknown date)
   * @param options.notes - Optional notes about the visit
   * @param userId - Firebase UID of the authenticated user
   * @returns Promise that resolves when visit is created/updated
   * @throws Error if user is not authenticated or operation fails
   */
  const addVisit = async (
    pubId: number, 
    options: { visitedAt?: string, notes?: string } = {},
    userId: string
  ): Promise<void> => {
    if (!userId) {
      throw new Error('Must be authenticated to add a visit')
    }

    try {
      // Check if visit already exists for this pub
      const existingVisit = visitState.visits.find(v => v.pubId === pubId)
      
      if (existingVisit) {
        // Update existing visit
        await updateVisitService(existingVisit.id, options)
        
        // Update local state
        const visitIndex = visitState.visits.findIndex(v => v.id === existingVisit.id)
        if (visitIndex !== -1 && visitState.visits[visitIndex]) {
          const currentVisit = visitState.visits[visitIndex]!
          visitState.visits[visitIndex] = {
            ...currentVisit,
            ...options
          }
        }
      } else {
        // Create new visit
        const visitData: Omit<Visit, 'id'> = {
          userId,
          pubId
        }
        
        // Only add visitedAt if provided
        if (options.visitedAt !== undefined) {
          visitData.visitedAt = options.visitedAt
        }
        
        // Only add notes if provided
        if (options.notes) {
          visitData.notes = options.notes
        }
        
        const newVisit = await createVisit(visitData)
        
        // Update local state
        visitState.visits.push(newVisit)
        visitState.visitedPubIds.add(pubId)
      }
    } catch (error: any) {
      console.error('Failed to add visit:', error)
      throw new Error('Unable to save visit. Please try again.')
    }
  }

  /**
   * Update an existing visit's details.
   * 
   * @param pubId - The ID of the pub whose visit to update
   * @param updates - Partial visit data to update (visitedAt, notes, rating)
   * @returns Promise that resolves when visit is updated
   * @throws Error if visit doesn't exist or operation fails
   */
  const updateVisit = async (
    pubId: number,
    updates: { visitedAt?: string | null, notes?: string, rating?: number }
  ): Promise<void> => {
    const visit = visitState.visits.find(v => v.pubId === pubId)
    
    if (!visit) {
      throw new Error('Visit not found')
    }

    try {
      // Convert null to undefined for optional fields
      const cleanUpdates: any = {}
      if ('visitedAt' in updates) {
        cleanUpdates.visitedAt = updates.visitedAt === null ? undefined : updates.visitedAt
      }
      if ('notes' in updates) {
        cleanUpdates.notes = updates.notes
      }
      if ('rating' in updates) {
        cleanUpdates.rating = updates.rating
      }
      
      await updateVisitService(visit.id, cleanUpdates)
      
      // Update local state
      const visitIndex = visitState.visits.findIndex(v => v.id === visit.id)
      if (visitIndex !== -1) {
        visitState.visits[visitIndex] = {
          ...visitState.visits[visitIndex],
          ...cleanUpdates
        }
      }
    } catch (error: any) {
      console.error('Failed to update visit:', error)
      throw new Error('Unable to update visit. Please try again.')
    }
  }

  /**
   * Remove a visit for a pub.
   * 
   * Deletes the visit record from Firestore and updates local state.
   * Operation is idempotent - succeeds even if visit doesn't exist.
   * 
   * @param pubId - The ID of the pub whose visit to remove
   * @returns Promise that resolves when visit is removed
   * @throws Error if operation fails
   */
  const removeVisit = async (pubId: number): Promise<void> => {
    const visit = visitState.visits.find(v => v.pubId === pubId)
    
    // If visit doesn't exist, operation succeeds (idempotent)
    if (!visit) {
      return
    }

    try {
      await deleteVisit(visit.id)
      
      // Update local state
      visitState.visits = visitState.visits.filter(v => v.id !== visit.id)
      visitState.visitedPubIds.delete(pubId)
    } catch (error: any) {
      console.error('Failed to remove visit:', error)
      throw new Error('Unable to remove visit. Please try again.')
    }
  }

  /**
   * Get full visit details for a specific pub.
   * 
   * @param pubId - The ID of the pub
   * @returns Visit object if found, null otherwise
   */
  const getVisit = (pubId: number): Visit | null => {
    return visitState.visits.find(v => v.pubId === pubId) || null
  }

  return {
    // Readonly state to prevent direct mutations
    visitedPubIds: readonly(visitState.visitedPubIds),
    isLoading: toRef(visitState, 'isLoading'),
    error: toRef(visitState, 'error'),
    
    // Read methods
    loadVisits,
    isVisited,
    getGroupCounts,
    getVisitDate,
    getVisit,
    clearVisits,
    
    // Write methods
    addVisit,
    updateVisit,
    removeVisit
  }
}
