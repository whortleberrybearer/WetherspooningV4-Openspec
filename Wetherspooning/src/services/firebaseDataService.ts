import { collection, getDocs, doc, getDoc, query, where, QueryDocumentSnapshot } from 'firebase/firestore'
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
}

/**
 * Visit information for a pub
 * 
 * Represents a single visit by a user to a Wetherspoon pub.
 * Stored in Firestore `visits` collection.
 */
export interface Visit {
  /** Unique numeric identifier for the visit */
  id: number
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
  
  // Validate id is positive number
  if (typeof data.id !== 'number' || data.id <= 0) {
    console.warn(`Invalid visit document ${docId}: id must be a positive number`)
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
