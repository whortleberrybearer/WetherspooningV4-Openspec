import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { ScrapedPubData, Pub } from '../types/pub';

export async function syncPubToFirestore(pubData: ScrapedPubData): Promise<void> {
  try {
    const db = getFirestore();
    const pubDoc: Omit<Pub, 'lastSyncedAt'> & { lastSyncedAt: Timestamp } = {
      id: pubData.id,
      name: pubData.name,
      url: pubData.url,
      lastSyncedAt: Timestamp.now(),
    };
    
    await db.collection('pubs').doc(pubData.id).set(pubDoc, { merge: true });
    
    console.log(`✓ Synced pub to Firestore: ${pubData.id}`);
  } catch (error) {
    console.error(`Error syncing pub ${pubData.id} to Firestore:`, error);
    throw error;
  }
}
