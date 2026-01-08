import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import type { Pub } from '../types/pub'

/**
 * Applies override values for county and townCity fields.
 * Override fields take precedence over scraped values when present.
 * Returns a new pub object with overrides applied and override fields removed.
 */
function applyOverrides(pub: Pub): Pub {
  const { countyOverride, townCityOverride, ...pubWithoutOverrides } = pub
  
  return {
    ...pubWithoutOverrides,
    county: countyOverride ?? pub.county,
    townCity: townCityOverride ?? pub.townCity,
  }
}

/**
 * Cloud Function to serve pub data.
 * 
 * Returns all pubs from Firestore. Cache-Control headers are configured
 * in firebase.json for Firebase Hosting CDN.
 * 
 * @example
 * GET /api/pubs -> Returns all pubs (cached by CDN for 24h via firebase.json)
 */
export const getPubs = onRequest(
  {
    cors: true,
    region: 'europe-west2'
  },
  async (req, res) => {
    try {
      const db = getFirestore()

      // Query all pubs from Firestore
      const pubsSnapshot = await db.collection('pubs').get()
      const pubs: Pub[] = pubsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Pub))

      // Apply overrides to each pub before returning
      const pubsWithOverrides = pubs.map(applyOverrides)

      res.status(200).json({ pubs: pubsWithOverrides })
    } catch (error) {
      console.error('Error fetching pubs:', error)
      res.status(500).json({ error: 'Failed to fetch pubs' })
    }
  }
)
