import { initializeApp, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface Pub {
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

async function migrateToFirestore() {
  let app: App
  let db: Firestore

  try {
    console.log('🚀 Starting Firestore migration...')

    // Check for service account key
    const serviceAccountPath = path.join(__dirname, '../service-account-key.json')
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ Service account key not found at:', serviceAccountPath)
      console.log('\n📝 To generate a service account key:')
      console.log('1. Go to Firebase Console > Project Settings > Service Accounts')
      console.log('2. Click "Generate New Private Key"')
      console.log('3. Save as service-account-key.json in project root')
      console.log('4. Add service-account-key.json to .gitignore\n')
      process.exit(1)
    }

    // Initialize Firebase Admin
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
    app = initializeApp({
      credential: cert(serviceAccount)
    })
    db = getFirestore(app)

    // Read pubs data
    const pubsPath = path.join(__dirname, '../Wetherspooning/public/data/pubs-sample.json')
    console.log('📖 Reading pubs data from:', pubsPath)
    
    const pubsData: Pub[] = JSON.parse(fs.readFileSync(pubsPath, 'utf8'))
    console.log(`✅ Loaded ${pubsData.length} pubs from JSON`)

    // Batch write pubs to Firestore
    console.log('📤 Uploading pubs to Firestore...')
    const batch = db.batch()
    let count = 0

    for (const pub of pubsData) {
      const docRef = db.collection('pubs').doc(pub.id.toString())
      batch.set(docRef, pub)
      count++
    }

    await batch.commit()
    console.log(`✅ Successfully uploaded ${count} pubs to Firestore`)

    // Verify migration
    console.log('🔍 Verifying migration...')
    const snapshot = await db.collection('pubs').get()
    console.log(`📊 Firestore 'pubs' collection contains ${snapshot.size} documents`)

    // Sample a few pubs
    const sampleDocs = snapshot.docs.slice(0, 3)
    console.log('\n📋 Sample pubs:')
    sampleDocs.forEach(doc => {
      const data = doc.data()
      console.log(`  - ${data.name} (${data.townCity})`)
    })

    console.log('\n🎉 Migration completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateToFirestore().then(() => process.exit(0))
