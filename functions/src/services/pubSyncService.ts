import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { ScrapedPubData, Pub } from '../types/pub';

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

export async function syncPubToFirestore(pubData: ScrapedPubData): Promise<void> {
  try {
    const db = getFirestore();
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
    
    await db.collection('pubs').doc(pubData.id).set(cleanedDoc, { merge: true });
    
    console.log(`✓ Synced pub to Firestore: ${pubData.id}`);
  } catch (error) {
    console.error(`Error syncing pub ${pubData.id} to Firestore:`, error);
    throw error;
  }
}
