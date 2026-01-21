import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, QueryDocumentSnapshot, orderBy, limit, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Pub {
  /** Unique identifier (UUID format) */
  id: string
  name: string
  townCity: string
  address: string
  county: string
  /** Region (optional - may be unknown for some pubs) */
  region?: string
  /** Country (optional - may be unknown for some pubs) */
  country?: string
  /** Geographic position (optional - some pubs may not have location data) */
  position: {
    lat: number
    lng: number
  } | null
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
 * User profile information
 * 
 * Represents a user's public profile data.
 * Stored in Firestore `users` collection with document ID matching Firebase UID.
 */
export interface UserProfile {
  /** Firebase UID (matches document ID) */
  uid: string
  /** Unique username for shareable URLs */
  username: string
  /** User's email address */
  email: string
  /** Privacy toggle - whether visits are publicly shareable */
  visitsPublic: boolean
  /** ISO 8601 timestamp of when profile was created */
  createdAt: string
}

/**
 * Visit information for a pub
 * 
 * Represents a single visit by a user to a Wetherspoon pub.
 * Stored in Firestore `visits` collection.
 * 
 * Note: Optional fields can be `null` (from Firestore) or `undefined` (not set).
 * Both values should be treated identically in application logic.
 */
export interface Visit {
  /** Unique identifier for the visit (Firestore auto-generated) */
  id: string
  /** Firebase UID of the user who made the visit */
  userId: string
  /** GUID of the pub that was visited */
  pubId: string
  /** ISO 8601 timestamp of when the pub was visited (optional, can be null or undefined) */
  visitedAt?: string | null
  /** User's rating of the visit, 1-5 stars (optional, can be null or undefined) */
  rating?: number | null
  /** User's notes about the visit (optional, can be null or undefined) */
  notes?: string | null
}

/**
 * Validate a pub document from Firestore
 */
function validatePub(docId: string, data: any): data is Pub {
  const requiredFields = ['id', 'name']
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.warn(`Invalid pub document ${docId}: missing required field '${field}'`)
      return false
    }
  }
  
  // Validate ID is a non-empty string
  if (typeof data.id !== 'string' || data.id.trim() === '') {
    console.warn(`Invalid pub document ${docId}: id must be a non-empty string`)
    return false
  }
  
  // Validate position if present
  if (data.position !== null && data.position !== undefined) {
    if (typeof data.position !== 'object') {
      console.warn(`Invalid pub document ${docId}: position must be an object or null`)
      return false
    }
    
    if (!('lat' in data.position) || !('lng' in data.position)) {
      console.warn(`Invalid pub document ${docId}: position must have both lat and lng`)
      return false
    }
    
    if (typeof data.position.lat !== 'number' || typeof data.position.lng !== 'number') {
      console.warn(`Invalid pub document ${docId}: position lat/lng must be numbers`)
      return false
    }
    
    if (data.position.lat < -90 || data.position.lat > 90) {
      console.warn(`Invalid pub document ${docId}: position lat must be between -90 and 90`)
      return false
    }
    
    if (data.position.lng < -180 || data.position.lng > 180) {
      console.warn(`Invalid pub document ${docId}: position lng must be between -180 and 180`)
      return false
    }
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
 * @param pubId - The GUID of the pub
 * @returns Promise resolving to Pub object or null if not found
 * @throws Error if network fails or timeout occurs
 */
export async function getPubById(pubId: string): Promise<Pub | null> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timed out: getPubById')), 10000)
    })
    
    const fetchPromise = async () => {
      const docRef = doc(db, 'pubs', pubId)
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
  
  // Validate pubId is non-empty string (UUID)
  if (typeof data.pubId !== 'string' || data.pubId.trim() === '') {
    console.warn(`Invalid visit document ${docId}: pubId must be a non-empty string (UUID)`)
    return false
  }
  
  // Validate id is a non-empty string
  if (typeof data.id !== 'string' || data.id.trim() === '') {
    console.warn(`Invalid visit document ${docId}: id must be a non-empty string`)
    return false
  }
  
  // Validate optional rating field (if present and not null)
  if ('rating' in data && data.rating !== null && data.rating !== undefined) {
    if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
      console.warn(`Invalid visit document ${docId}: rating must be between 1 and 5`)
      return false
    }
  }
  
  // Validate optional visitedAt field (if present and not null)
  if ('visitedAt' in data && data.visitedAt !== null && data.visitedAt !== undefined) {
    if (typeof data.visitedAt !== 'string' || !data.visitedAt) {
      console.warn(`Invalid visit document ${docId}: visitedAt must be a non-empty string`)
      return false
    }
  }
  
  // Validate optional notes field (if present and not null)
  if ('notes' in data && data.notes !== null && data.notes !== undefined) {
    if (typeof data.notes !== 'string') {
      console.warn(`Invalid visit document ${docId}: notes must be a string`)
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
 * Accepts both null and undefined for optional fields (rating, notes, visitedAt).
 * Both values are considered valid for optional fields.
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
    
    if (!data.pubId || typeof data.pubId !== 'string' || data.pubId.trim() === '') {
      throw new Error('pubId must be a non-empty string (UUID)')
    }
  }
  
  // Optional rating validation (null and undefined are both valid)
  if ('rating' in data && data.rating !== undefined && data.rating !== null) {
    if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
      throw new Error('rating must be between 1 and 5')
    }
  }
  
  // Optional visitedAt validation (null and undefined are both valid)
  if ('visitedAt' in data && data.visitedAt !== undefined && data.visitedAt !== null) {
    if (typeof data.visitedAt !== 'string' || data.visitedAt.trim() === '') {
      throw new Error('visitedAt must be a valid ISO 8601 date string')
    }
  }
  
  // Optional notes validation (null and undefined are both valid)
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

/**
 * Validate a user profile document from Firestore
 * 
 * @param docId - Firestore document ID (should match UID)
 * @param data - The document data to validate
 * @returns true if valid, false otherwise
 */
function validateUserProfile(docId: string, data: any): data is UserProfile {
  const requiredFields = ['uid', 'username', 'email', 'visitsPublic', 'createdAt']
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.warn(`Invalid user profile document ${docId}: missing required field '${field}'`)
      return false
    }
  }
  
  if (typeof data.uid !== 'string' || data.uid.trim() === '') {
    console.warn(`Invalid user profile document ${docId}: uid must be a non-empty string`)
    return false
  }
  
  if (typeof data.username !== 'string' || data.username.trim() === '') {
    console.warn(`Invalid user profile document ${docId}: username must be a non-empty string`)
    return false
  }
  
  if (typeof data.email !== 'string' || data.email.trim() === '') {
    console.warn(`Invalid user profile document ${docId}: email must be a non-empty string`)
    return false
  }
  
  if (typeof data.visitsPublic !== 'boolean') {
    console.warn(`Invalid user profile document ${docId}: visitsPublic must be a boolean`)
    return false
  }
  
  if (typeof data.createdAt !== 'string') {
    console.warn(`Invalid user profile document ${docId}: createdAt must be a string`)
    return false
  }
  
  return true
}

/**
 * Create a user profile in Firestore
 * 
 * @param uid - Firebase UID
 * @param username - Unique username
 * @param email - User's email address
 * @returns Promise resolving when profile is created
 * @throws Error if creation fails or username already exists
 */
export async function createUserProfile(uid: string, username: string, email: string): Promise<void> {
  try {
    const profile: UserProfile = {
      uid,
      username: username.toLowerCase(),
      email,
      visitsPublic: false,
      createdAt: new Date().toISOString()
    }
    
    const docRef = doc(db, 'users', uid)
    await setDoc(docRef, profile)
  } catch (error: any) {
    console.error('Failed to create user profile:', error)
    throw new Error('Failed to create user profile. Please try again.')
  }
}

/**
 * Get a user profile by UID from Firestore
 * 
 * @param uid - Firebase UID
 * @returns Promise resolving to UserProfile or null if not found
 * @throws Error if network fails
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    const data = docSnap.data()
    if (!validateUserProfile(docSnap.id, data)) {
      return null
    }
    
    return data as UserProfile
  } catch (error: any) {
    console.error(`Failed to load user profile ${uid}:`, error)
    throw error
  }
}

/**
 * Get a user profile by username from Firestore
 * 
 * @param username - Username to search for (case-insensitive)
 * @returns Promise resolving to UserProfile or null if not found
 * @throws Error if network fails or multiple users found
 */
export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  try {
    const q = query(
      collection(db, 'users'), 
      where('username', '==', username.toLowerCase()),
      limit(1)
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const docSnap = querySnapshot.docs[0]
    const data = docSnap.data()
    
    if (!validateUserProfile(docSnap.id, data)) {
      return null
    }
    
    return data as UserProfile
  } catch (error: any) {
    console.error(`Failed to load user profile for username ${username}:`, error)
    throw error
  }
}

/**
 * Update user's visit privacy setting
 * 
 * @param uid - Firebase UID
 * @param visitsPublic - New privacy setting
 * @returns Promise resolving when update completes
 * @throws Error if update fails
 */
export async function updateUserPrivacy(uid: string, visitsPublic: boolean): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid)
    await updateDoc(docRef, { visitsPublic })
  } catch (error: any) {
    console.error('Failed to update user privacy setting:', error)
    throw new Error('Failed to update privacy setting. Please try again.')
  }
}

/**
 * Check if a username is available
 * 
 * @param username - Username to check (case-insensitive)
 * @returns Promise resolving to true if available, false if taken
 * @throws Error if network fails
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    const profile = await getUserProfileByUsername(username)
    return profile === null
  } catch (error: any) {
    console.error(`Failed to check username availability:`, error)
    throw error
  }
}

/**
 * Get public visits for a user (for shared visit viewing)
 * Notes field is excluded for privacy
 * 
 * @param userId - Firebase UID of user whose visits to load
 * @returns Promise resolving to array of Visit objects (without notes)
 * @throws Error if user has private visits or network fails
 */
export async function getPublicVisits(userId: string): Promise<Visit[]> {
  try {
    // First check if user has public visits enabled
    const profile = await getUserProfile(userId)
    if (!profile) {
      throw new Error('User not found')
    }
    
    if (!profile.visitsPublic) {
      throw new Error('This user\'s visits are private')
    }
    
    // Load visits (same as getUserVisits but explicitly for public access)
    const q = query(collection(db, 'visits'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    const visits: Visit[] = []
    querySnapshot.forEach((doc) => {
      const visit = docToVisit(doc)
      if (visit) {
        // Explicitly remove notes for privacy (defense in depth)
        const { notes, ...publicVisit } = visit
        visits.push(publicVisit as Visit)
      }
    })
    
    return visits
  } catch (error: any) {
    if (error.message === 'User not found' || error.message.includes('private')) {
      throw error
    }
    console.error(`Failed to load public visits for user ${userId}:`, error)
    throw new Error('Failed to load visits. Please try again.')
  }
}
