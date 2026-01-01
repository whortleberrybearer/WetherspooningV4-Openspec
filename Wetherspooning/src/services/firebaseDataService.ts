import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, QueryDocumentSnapshot, orderBy, limit, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Pub {
  id: number
  name: string
  townCity: string
  address: string
  county: string
  region: string
  country: string
  lat: number
  lng: number
  url?: string
  imageUrl?: string
  openState?: string
  /** Indicates the pub is located within a hotel */
  isHotel?: boolean
  /** Indicates the pub is located in an airport */
  inAirport?: boolean
  /** Indicates the pub is located in a train station */
  inTrainStation?: boolean
}

/**
 * Visit information for a pub
 * 
 * Represents a single visit by a user to a Wetherspoon pub.
 * Stored in Firestore `visits` collection.
 */
export interface Visit {
  /** Unique identifier for the visit (Firestore auto-generated) */
  id: string
  /** Firebase UID of the user who made the visit */
  userId: string
  /** Numeric ID of the pub that was visited */
  pubId: number
  /** ISO 8601 timestamp of when the pub was visited (optional) */
  visitedAt?: string
  /** User's rating of the visit, 1-5 stars (optional) */
  rating?: number
  /** User's notes about the visit (optional) */
  notes?: string
}

/**
 * Validate a pub document from Firestore
 */
function validatePub(docId: string, data: any): data is Pub {
  const requiredFields = ['id', 'name', 'lat', 'lng']
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.warn(`Invalid pub document ${docId}: missing required field '${field}'`)
      return false
    }
  }
  
  if (typeof data.lat !== 'number' || typeof data.lng !== 'number') {
    console.warn(`Invalid pub document ${docId}: lat/lng must be numbers`)
    return false
  }
  
  return true
}

/**
 * Convert Firestore document to Pub object
 */
function docToPub(docSnap: QueryDocumentSnapshot): Pub | null {
  const data = docSnap.data()
  
  if (!validatePub(docSnap.id, data)) {
    return null
  }
  
  return data as Pub
}

/**
 * Get all pubs from Firestore
 * @returns Promise resolving to array of Pub objects
 * @throws Error if network fails or timeout occurs
 */
export async function getAllPubs(): Promise<Pub[]> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timed out: getAllPubs')), 10000)
    })
    
    const fetchPromise = async () => {
      const q = query(collection(db, 'pubs'))
      const querySnapshot = await getDocs(q)
      
      const pubs: Pub[] = []
      querySnapshot.forEach((doc) => {
        const pub = docToPub(doc)
        if (pub) {
          pubs.push(pub)
        }
      })
      
      if (pubs.length === 0) {
        console.warn('No pubs found in Firestore')
      }
      
      return pubs
    }
    
    return await Promise.race([fetchPromise(), timeoutPromise])
  } catch (error: any) {
    console.error('Failed to load pubs from Firestore:', error)
    throw error
  }
}

/**
 * Get a single pub by ID from Firestore
 * @param pubId - The numeric ID of the pub
 * @returns Promise resolving to Pub object or null if not found
 * @throws Error if network fails or timeout occurs
 */
export async function getPubById(pubId: number): Promise<Pub | null> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timed out: getPubById')), 10000)
    })
    
    const fetchPromise = async () => {
      const docRef = doc(db, 'pubs', pubId.toString())
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        return null
      }
      
      const data = docSnap.data()
      if (!validatePub(docSnap.id, data)) {
        return null
      }
      
      return data as Pub
    }
    
    return await Promise.race([fetchPromise(), timeoutPromise])
  } catch (error: any) {
    console.error(`Failed to load pub ${pubId} from Firestore:`, error)
    throw error
  }
}

/**
 * Validate a visit document from Firestore
 * 
 * Checks that the visit document has all required fields and that
 * optional fields have valid values.
 * 
 * @param docId - Firestore document ID (for logging)
 * @param data - The document data to validate
 * @returns true if valid, false otherwise
 */
function validateVisit(docId: string, data: any): data is Visit {
  const requiredFields = ['id', 'userId', 'pubId']
  
  // Check required fields exist
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.warn(`Invalid visit document ${docId}: missing required field '${field}'`)
      return false
    }
  }
  
  // Validate userId is non-empty string
  if (typeof data.userId !== 'string' || data.userId.trim() === '') {
    console.warn(`Invalid visit document ${docId}: userId must be a non-empty string`)
    return false
  }
  
  // Validate pubId is positive number
  if (typeof data.pubId !== 'number' || data.pubId <= 0) {
    console.warn(`Invalid visit document ${docId}: pubId must be a positive number`)
    return false
  }
  
  // Validate id is a non-empty string
  if (typeof data.id !== 'string' || data.id.trim() === '') {
    console.warn(`Invalid visit document ${docId}: id must be a non-empty string`)
    return false
  }
  
  // Validate optional rating field (if present)
  if ('rating' in data) {
    if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
      console.warn(`Invalid visit document ${docId}: rating must be between 1 and 5`)
      return false
    }
  }
  
  // Validate optional visitedAt field (if present)
  if ('visitedAt' in data) {
    if (typeof data.visitedAt !== 'string' || !data.visitedAt) {
      console.warn(`Invalid visit document ${docId}: visitedAt must be a non-empty string`)
      return false
    }
  }
  
  return true
}

/**
 * Convert Firestore document to Visit object
 */
function docToVisit(docSnap: QueryDocumentSnapshot): Visit | null {
  const data = docSnap.data()
  
  if (!validateVisit(docSnap.id, data)) {
    return null
  }
  
  return data as Visit
}

/**
 * Get all visits for a specific user from Firestore
 * 
 * Retrieves all visit documents where the userId field matches
 * the provided userId. Invalid documents are skipped with warnings.
 * 
 * @param userId - Firebase UID of the user
 * @returns Promise resolving to array of Visit objects
 * @throws Error if network fails or timeout occurs
 */
export async function getUserVisits(userId: string): Promise<Visit[]> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timed out: getUserVisits')), 10000)
    })
    
    const fetchPromise = async () => {
      const q = query(collection(db, 'visits'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      const visits: Visit[] = []
      querySnapshot.forEach((doc) => {
        const visit = docToVisit(doc)
        if (visit) {
          visits.push(visit)
        }
      })
      
      return visits
    }
    
    return await Promise.race([fetchPromise(), timeoutPromise])
  } catch (error: any) {
    console.error(`Failed to load visits for user ${userId} from Firestore:`, error)
    // Return empty array on error to allow app to continue
    return []
  }
}

/**
 * Generate the next unique visit ID
 * 
 * Queries the visits collection for the maximum ID and returns maxId + 1.
 * If the collection is empty, returns 1.
 * 
 * @returns Promise resolving to the next available visit ID
 * @throws Error if network fails or timeout occurs
 */
async function generateNextVisitId(): Promise<number> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timed out: generateNextVisitId')), 10000)
    })
    
    const fetchPromise = async () => {
      const q = query(collection(db, 'visits'), orderBy('id', 'desc'), limit(1))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return 1
      }
      
      const maxDoc = querySnapshot.docs[0]
      if (!maxDoc) {
        return 1
      }
      const maxId = maxDoc.data().id
      return maxId + 1
    }
    
    return await Promise.race([fetchPromise(), timeoutPromise])
  } catch (error: any) {
    console.error('Failed to generate next visit ID:', error)
    throw error
  }
}

/**
 * Validate visit data before creating or updating
 * 
 * @param data - The visit data to validate
 * @param isUpdate - Whether this is an update operation (allows partial data)
 * @throws Error if validation fails with descriptive message
 */
function validateVisitMutation(data: any, isUpdate: boolean = false): void {
  if (!isUpdate) {
    // Required fields for create
    if (!data.userId || typeof data.userId !== 'string' || data.userId.trim() === '') {
      throw new Error('userId must be a non-empty string')
    }
    
    if (!data.pubId || typeof data.pubId !== 'number' || data.pubId <= 0) {
      throw new Error('pubId must be a positive number')
    }
  }
  
  // Optional rating validation
  if ('rating' in data && data.rating !== undefined && data.rating !== null) {
    if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
      throw new Error('rating must be between 1 and 5')
    }
  }
  
  // Optional visitedAt validation
  if ('visitedAt' in data && data.visitedAt !== undefined && data.visitedAt !== null) {
    if (typeof data.visitedAt !== 'string' || data.visitedAt.trim() === '') {
      throw new Error('visitedAt must be a valid ISO 8601 date string')
    }
  }
  
  // Optional notes validation
  if ('notes' in data && data.notes !== undefined && data.notes !== null) {
    if (typeof data.notes !== 'string') {
      throw new Error('notes must be a string')
    }
  }
}

/**
 * Create a new visit in Firestore
 * 
 * Generates a unique ID, validates the visit data, and creates a new document
 * in the visits collection. Retries with incremented ID if collision occurs.
 * 
 * @param visit - Visit data without ID
 * @returns Promise resolving to complete Visit object with generated ID
 * @throws Error if validation fails, network fails, or max retries exceeded
 */
export async function createVisit(visit: Omit<Visit, 'id'>): Promise<Visit> {
  validateVisitMutation(visit, false)
  
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timed out: createVisit')), 10000)
    })
    
    const createPromise = async () => {
      // Use Firestore auto-generated ID
      const docRef = doc(collection(db, 'visits'))
      const newVisit: Visit = {
        ...visit,
        id: docRef.id
      }
      
      await setDoc(docRef, newVisit)
      
      return newVisit
    }
    
    return await Promise.race([createPromise(), timeoutPromise])
  } catch (error: any) {
    console.error('Failed to create visit:', error)
    throw error
  }
}

/**
 * Update an existing visit in Firestore
 * 
 * Merges the provided updates with the existing visit document.
 * Allows updating optional fields like visitedAt and notes.
 * 
 * @param visitId - The numeric ID of the visit to update
 * @param updates - Partial visit data to update
 * @throws Error if validation fails or network fails
 */
export async function updateVisit(visitId: string, updates: Partial<Visit>): Promise<void> {
  validateVisitMutation(updates, true)
  
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timed out: updateVisit')), 10000)
    })
    
    const updatePromise = async () => {
      const docRef = doc(db, 'visits', visitId)
      
      // Remove undefined values and convert null to deleteField equivalent
      const cleanUpdates: any = {}
      for (const [key, value] of Object.entries(updates)) {
        // Skip id and userId - these should never be updated
        if (key === 'id' || key === 'userId') continue
        
        if (value !== undefined) {
          cleanUpdates[key] = value
        }
      }
      
      await updateDoc(docRef, cleanUpdates)
    }
    
    await Promise.race([updatePromise(), timeoutPromise])
  } catch (error: any) {
    console.error(`Failed to update visit ${visitId}:`, error)
    throw error
  }
}

/**
 * Delete a visit from Firestore
 * 
 * Removes the visit document from the visits collection.
 * Operation is idempotent - does not error if document doesn't exist.
 * 
 * @param visitId - The numeric ID of the visit to delete
 * @throws Error if network fails
 */
export async function deleteVisit(visitId: string): Promise<void> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timed out: deleteVisit')), 10000)
    })
    
    const deletePromise = async () => {
      const docRef = doc(db, 'visits', visitId)
      await deleteDoc(docRef)
    }
    
    await Promise.race([deletePromise(), timeoutPromise])
  } catch (error: any) {
    // Ignore "not found" errors - operation is idempotent
    if (error.code === 'not-found') {
      return
    }
    
    console.error(`Failed to delete visit ${visitId}:`, error)
    throw error
  }
}

/**
 * Delete all user data from Firestore
 * 
 * Removes all visit documents associated with the specified user.
 * Uses batch operations to ensure atomic deletion within each batch.
 * Handles large numbers of visits by splitting into multiple batches.
 * 
 * @param userId - Firebase UID of the user whose data should be deleted
 * @returns Promise that resolves when all data is deleted
 * @throws Error if userId is invalid, query fails, or batch commit fails
 */
export async function deleteUserData(userId: string): Promise<void> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('Invalid user ID provided.')
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timed out: deleteUserData')), 10000)
    })
    
    const deletePromise = async () => {
      // Query all visits for this user
      const q = query(collection(db, 'visits'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        // No visits to delete - succeed without error
        return
      }
      
      // Firestore batch limit is 500 operations
      const BATCH_SIZE = 500
      const docs = querySnapshot.docs
      
      // Process in batches
      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db)
        const batchDocs = docs.slice(i, Math.min(i + BATCH_SIZE, docs.length))
        
        batchDocs.forEach((doc) => {
          batch.delete(doc.ref)
        })
        
        try {
          await batch.commit()
        } catch (batchError: any) {
          console.error(`Failed to delete batch of user data (batch ${Math.floor(i / BATCH_SIZE) + 1}):`, batchError)
          
          // If this is not the first batch, some data has already been deleted
          if (i > 0) {
            throw new Error('Failed to delete all user data. Some data may remain. Please try again.')
          } else {
            throw new Error('Failed to delete user data. Please check your connection and try again.')
          }
        }
      }
    }
    
    await Promise.race([deletePromise(), timeoutPromise])
  } catch (error: any) {
    // If it's already our formatted error, rethrow it
    if (error.message?.includes('Invalid user ID') || 
        error.message?.includes('Failed to delete')) {
      throw error
    }
    
    // Handle query failures
    console.error(`Failed to retrieve user data for deletion:`, error)
    throw new Error('Failed to retrieve user data for deletion. Please try again.')
  }
}
