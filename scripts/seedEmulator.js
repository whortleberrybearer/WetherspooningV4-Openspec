const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const fs = require('fs')
const path = require('path')

// Connect to emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'

// Initialize with a dummy project ID (emulator doesn't need real credentials)
const app = initializeApp({ projectId: 'demo-wetherspooning' })
const db = getFirestore(app)

async function seedData() {
  try {
    console.log('🌱 Seeding Firestore emulator with pub data...')
    
    // Read pubs data
    const pubsPath = path.join(__dirname, '../Wetherspooning/public/data/pubs-sample.json')
    const pubsData = JSON.parse(fs.readFileSync(pubsPath, 'utf8'))
    
    // Batch write pubs
    const batch = db.batch()
    let count = 0
    
    pubsData.forEach(pub => {
      const docRef = db.collection('pubs').doc(pub.id.toString())
      batch.set(docRef, pub)
      count++
    })
    
    await batch.commit()
    console.log(`✅ Seeded ${count} pubs to Firestore emulator`)
    
    // Verify
    const snapshot = await db.collection('pubs').get()
    console.log(`📊 Verified ${snapshot.size} documents in 'pubs' collection`)
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedData().then(() => {
  console.log('🎉 Seeding complete!')
  process.exit(0)
})
