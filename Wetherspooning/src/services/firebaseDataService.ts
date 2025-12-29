import { collection, getDocs, doc, getDoc, query, QueryDocumentSnapshot } from 'firebase/firestore'
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
