import { onRequest } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import type { Pub } from '../types/pub'

/**
 * Cloud Function to serve pub data with CDN caching enabled.
 * 
 * Returns all pubs from Firestore with Cache-Control headers for Firebase Hosting CDN.
 * Cache duration: 24 hours (86400 seconds)
 * 
 * Supports cache bypass via ?nocache=1 query parameter for admin/testing.
 * 
 * @example
 * GET /api/pubs -> Returns all pubs (cached by CDN for 24h)
 * GET /api/pubs?nocache=1 -> Bypasses cache, queries Firestore directly
 */
export const getPubs = onRequest(
  {
    cors: true,
    region: 'europe-west2'
  },
  async (req, res) => {
    try {
      const db = getFirestore()
      const nocache = req.query.nocache === '1'

      // Query all pubs from Firestore
      const pubsSnapshot = await db.collection('pubs').get()
      const pubs: Pub[] = pubsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Pub))

      // Set cache headers
      // Cache for 24 hours unless nocache parameter is set
      if (nocache) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400')
      }

      res.status(200).json({ pubs })
    } catch (error) {
      console.error('Error fetching pubs:', error)
      res.status(500).json({ error: 'Failed to fetch pubs' })
    }
  }
)
