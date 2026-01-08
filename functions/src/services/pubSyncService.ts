import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { ScrapedPubData, Pub, Position } from '../types/pub';

/**
 * Finds a matching existing pub using a three-tier matching strategy.
 * @param scrapedPub The scraped pub data to match
 * @param existingPubs Array of existing pubs to search through
 * @returns The matched pub or null if no match found
 */
export function findMatchingPub(
  scrapedPub: ScrapedPubData,
  existingPubs: Pub[]
): Pub | null {
  // Tier 1: URL match (most reliable)
  let match = existingPubs.find(p => p.url === scrapedPub.url);
  if (match) return match;
  
  // Tier 2: Name + TownCity match for open pubs (handles URL changes)
  match = existingPubs.find(p => 
    p.openState === 'Open' &&
    p.name === scrapedPub.name &&
    p.townCity === scrapedPub.townCity
  );
  if (match) return match;
  
  // Tier 3: Address match for open pubs (handles name and URL changes)
  // Only use if address is non-empty and meaningful
  if (scrapedPub.address && scrapedPub.address.length > 10) {
    match = existingPubs.find(p => 
      p.openState === 'Open' &&
      p.address === scrapedPub.address
    );
    if (match) return match;
  }
  
  return null; // No match found - new pub
}

/**
 * Compares two Position objects for equality.
 * @param pos1 First position
 * @param pos2 Second position
 * @returns true if positions are equal, false otherwise
 */
function positionsEqual(
  pos1: Position | null,
  pos2: Position | null
): boolean {
  if (pos1 === null && pos2 === null) return true;
  if (pos1 === null || pos2 === null) return false;
  return pos1.lat === pos2.lat && pos1.lng === pos2.lng;
}

/**
 * Checks if scraped pub data differs from existing pub data.
 * Only compares scraped fields - override fields are ignored in change detection.
 * @param existing The existing pub record
 * @param scraped The scraped pub data
 * @returns true if any field has changed, false if all fields are identical
 */
export function hasDataChanged(
  existing: Pub,
  scraped: ScrapedPubData
): boolean {
  return (
    existing.name !== scraped.name ||
    existing.url !== scraped.url ||
    existing.imageUrl !== scraped.imageUrl ||
    existing.address !== scraped.address ||
    existing.townCity !== scraped.townCity ||
    existing.openState !== scraped.openState ||
    existing.isHotel !== scraped.isHotel ||
    existing.inAirport !== scraped.inAirport ||
    existing.inTrainStation !== scraped.inTrainStation ||
    !positionsEqual(existing.position, scraped.position) ||
    existing.country !== scraped.country ||
    existing.county !== scraped.county
  );
}

export async function getExistingPub(pubId: string): Promise<Pub | null> {
  try {
    const db = getFirestore();
    const docSnapshot = await db.collection('pubs').doc(pubId).get();
    
    if (!docSnapshot.exists) {
      return null;
    }
    
    return docSnapshot.data() as Pub;
  } catch (error) {
    console.error(`Error fetching existing pub ${pubId}:`, error);
    return null;
  }
}

export async function getExistingPubByUrl(url: string): Promise<Pub | null> {
  try {
    const db = getFirestore();
    const querySnapshot = await db.collection('pubs').where('url', '==', url).limit(1).get();
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].data() as Pub;
  } catch (error) {
    console.error(`Error fetching existing pub by URL ${url}:`, error);
    return null;
  }
}

export async function syncPubToFirestore(pubData: ScrapedPubData): Promise<void> {
  try {
    const db = getFirestore();
    // Only include scraped fields - override fields (countyOverride, townCityOverride) 
    // are not set here and will be preserved by merge: true
    const pubDoc: Omit<Pub, 'lastSyncedAt'> & { lastSyncedAt: Timestamp } = {
      id: pubData.id,
      name: pubData.name,
      url: pubData.url,
      imageUrl: pubData.imageUrl,
      address: pubData.address,
      townCity: pubData.townCity,
      country: pubData.country,
      county: pubData.county,
      position: pubData.position,
      openState: pubData.openState,
      isHotel: pubData.isHotel,
      inAirport: pubData.inAirport,
      inTrainStation: pubData.inTrainStation,
      lastSyncedAt: Timestamp.now(),
    };
    
    // Remove undefined values to avoid Firestore errors
    const cleanedDoc = Object.fromEntries(
      Object.entries(pubDoc).filter(([_, value]) => value !== undefined)
    );
    
    // merge: true preserves existing fields not in cleanedDoc (e.g., countyOverride, townCityOverride)
    await db.collection('pubs').doc(pubData.id).set(cleanedDoc, { merge: true });
    
    console.log(`✓ Synced pub to Firestore: ${pubData.id}`);
  } catch (error) {
    console.error(`Error syncing pub ${pubData.id} to Firestore:`, error);
    throw error;
  }
}

/**
 * Loads all pubs from Firestore.
 * @returns Array of all pubs
 */
export async function getAllPubs(): Promise<Pub[]> {
  try {
    const db = getFirestore();
    const querySnapshot = await db.collection('pubs').get();
    
    const pubs: Pub[] = [];
    querySnapshot.forEach(doc => {
      pubs.push(doc.data() as Pub);
    });
    
    console.log(`📍 Loaded ${pubs.length} existing pubs from Firestore`);
    return pubs;
  } catch (error) {
    console.error('Error loading all pubs from Firestore:', error);
    throw error;
  }
}

/**
 * Marks unprocessed open pubs as closed.
 * @param processedPubIds Set of pub IDs that were matched during sync
 * @param allExistingPubs Array of all existing pubs
 * @returns Array of pubs that need to be marked as closed
 */
export function markClosedPubs(
  processedPubIds: Set<string>,
  allExistingPubs: Pub[]
): Pub[] {
  const pubsToClose = allExistingPubs.filter(pub => 
    pub.openState === 'Open' && 
    !processedPubIds.has(pub.id)
  );
  
  const now = Timestamp.now();
  
  for (const pub of pubsToClose) {
    console.log(`Marked pub as closed: ${pub.id} - ${pub.name}`);
    pub.openState = 'Closed';
    pub.url = '';
    pub.lastSyncedAt = now;
  }
  
  if (pubsToClose.length === 0) {
    console.log('No pubs marked as closed');
  }
  
  return pubsToClose;
}

/**
 * Helper function to sleep for a specified duration.
 * @param ms Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Writes pubs to Firestore in batches.
 * @param pubs Array of pubs to write
 * @param batchSize Number of operations per batch (default: 500, Firestore's limit)
 */
export async function batchWritePubs(
  pubs: Pub[],
  batchSize: number = 500
): Promise<void> {
  const db = getFirestore();
  
  for (let i = 0; i < pubs.length; i += batchSize) {
    const batch = db.batch();
    const chunk = pubs.slice(i, i + batchSize);
    
    for (const pub of chunk) {
      const docRef = db.collection('pubs').doc(pub.id);
      
      // Remove undefined values to avoid Firestore errors
      const cleanedDoc = Object.fromEntries(
        Object.entries(pub).filter(([_, value]) => value !== undefined)
      );
      
      batch.set(docRef, cleanedDoc, { merge: true });
    }
    
    try {
      await batch.commit();
      console.log(`✓ Committed batch ${Math.floor(i / batchSize) + 1}: ${chunk.length} pubs`);
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} commit failed:`, error);
    }
    
    // Rate limiting: small delay between batches
    if (i + batchSize < pubs.length) {
      await sleep(100);
    }
  }
}
