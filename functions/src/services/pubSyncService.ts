import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { ScrapedPubData, Pub } from '../types/pub';

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
      position: pubData.position,
      openState: pubData.openState,
      isHotel: pubData.isHotel,
      inAirport: pubData.inAirport,
      inTrainStation: pubData.inTrainStation,
      lastSyncedAt: Timestamp.now(),
    };
    
    await db.collection('pubs').doc(pubData.id).set(pubDoc, { merge: true });
    
    console.log(`✓ Synced pub to Firestore: ${pubData.id}`);
  } catch (error) {
    console.error(`Error syncing pub ${pubData.id} to Firestore:`, error);
    throw error;
  }
}
