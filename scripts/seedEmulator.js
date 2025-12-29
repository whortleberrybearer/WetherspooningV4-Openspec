const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')
const fs = require('fs')
const path = require('path')

// Connect to emulators
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

// Initialize with a dummy project ID (emulator doesn't need real credentials)
const app = initializeApp({ projectId: 'demo-wetherspooning' })
const db = getFirestore(app)
const auth = getAuth(app)

// Sample users to create
const sampleUsers = [
  {
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User',
    visitProfile: { min: 35, max: 55, type: 'heavy' } // Frequent visitor
  },
  {
    email: 'alice@example.com',
    password: 'password123',
    displayName: 'Alice Smith',
    visitProfile: { min: 15, max: 35, type: 'moderate' } // Moderate visitor
  },
  {
    email: 'bob@example.com',
    password: 'password123',
    displayName: 'Bob Jones',
    visitProfile: { min: 5, max: 15, type: 'light' } // Light visitor
  }
]

/**
 * Generate realistic visit data for a user
 * @param {string} userId - Firebase UID of the user
 * @param {number} visitCount - Number of visits to generate
 * @param {number[]} pubIds - Array of available pub IDs
 * @param {string} userType - User type (heavy, moderate, light)
 * @returns {Array} Array of visit objects
 */
function generateVisits(userId, visitCount, pubIds, userType) {
  const visits = []
  const now = new Date()
  const eighteenMonthsAgo = new Date(now.getTime() - (18 * 30 * 24 * 60 * 60 * 1000))
  
  // Select random pubs for this user (with some overlap between users)
  const userPubIds = []
  const shuffled = [...pubIds].sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < visitCount; i++) {
    // Allow some duplicate visits for heavy users
    if (userType === 'heavy' && Math.random() < 0.2 && userPubIds.length > 0) {
      userPubIds.push(userPubIds[Math.floor(Math.random() * userPubIds.length)])
    } else if (shuffled.length > 0) {
      userPubIds.push(shuffled.shift())
    }
  }
  
  for (let i = 0; i < userPubIds.length; i++) {
    const pubId = userPubIds[i]
    
    // Generate visit date (weighted toward more recent)
    const daysAgo = Math.pow(Math.random(), 1.5) * 18 * 30 // Power function for recency bias
    const visitDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
    
    // Ensure date is within range
    const finalDate = visitDate < eighteenMonthsAgo ? eighteenMonthsAgo : visitDate
    
    // Generate rating (90% chance of having a rating, weighted toward 4-5)
    let rating = undefined
    if (Math.random() < 0.9) {
      const rand = Math.random()
      if (rand < 0.5) rating = 5
      else if (rand < 0.8) rating = 4
      else if (rand < 0.95) rating = 3
      else rating = Math.random() < 0.5 ? 2 : 1
    }
    
    // Generate notes (30% chance)
    let notes = undefined
    if (Math.random() < 0.3) {
      const noteOptions = [
        "Great atmosphere and good beer selection!",
        "Nice historic building",
        "Friendly staff",
        "Good value for money",
        "Lovely interior",
        "Bit crowded but enjoyable",
        "Perfect for a quick lunch",
        "Beautiful architecture",
        "Central location, very convenient",
        "Could be cleaner",
        "Food was decent",
        "Excellent Sunday roast",
        "Quiet and peaceful",
        "Great for meeting friends",
        "Impressive building conversion"
      ]
      notes = noteOptions[Math.floor(Math.random() * noteOptions.length)]
    }
    
    visits.push({
      id: visits.length + 1, // Will be reassigned globally
      userId,
      pubId,
      visitedAt: finalDate.toISOString(),
      ...(rating !== undefined && { rating }),
      ...(notes !== undefined && { notes })
    })
  }
  
  return visits
}

async function seedData() {
  try {
    console.log('🌱 Seeding Firestore emulator with data...\n')
    
    // ========== SEED AUTH USERS ==========
    console.log('👤 Seeding Firebase Auth users...')
    const userUids = {}
    let createdUsers = 0
    let skippedUsers = 0
    
    for (const userData of sampleUsers) {
      try {
        const user = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true
        })
        
        userUids[userData.email] = user.uid
        console.log(`   ✅ Created user: ${userData.email} (uid: ${user.uid})`)
        createdUsers++
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          // Get existing user UID
          const existingUser = await auth.getUserByEmail(userData.email)
          userUids[userData.email] = existingUser.uid
          console.log(`   ⏭️  User already exists: ${userData.email} (uid: ${existingUser.uid})`)
          skippedUsers++
        } else {
          throw error
        }
      }
    }
    
    console.log(`   📊 Auth Summary: Created ${createdUsers}, Skipped ${skippedUsers}\n`)
    
    // ========== SEED PUBS ==========
    console.log('🍺 Seeding pubs...')
    const pubsPath = path.join(__dirname, '../data/pubs-sample.json')
    const pubsData = JSON.parse(fs.readFileSync(pubsPath, 'utf8'))
    
    const pubBatch = db.batch()
    pubsData.forEach(pub => {
      const docRef = db.collection('pubs').doc(pub.id.toString())
      pubBatch.set(docRef, pub)
    })
    
    await pubBatch.commit()
    console.log(`   ✅ Seeded ${pubsData.length} pubs\n`)
    
    // ========== SEED VISITS ==========
    console.log('📍 Generating and seeding visits...')
    const allVisits = []
    let visitId = 1
    
    for (const userData of sampleUsers) {
      const uid = userUids[userData.email]
      const visitCount = Math.floor(Math.random() * (userData.visitProfile.max - userData.visitProfile.min + 1)) + userData.visitProfile.min
      const pubIds = pubsData.map(p => p.id)
      
      const userVisits = generateVisits(uid, visitCount, pubIds, userData.visitProfile.type)
      
      // Reassign global visit IDs
      userVisits.forEach(visit => {
        visit.id = visitId++
        allVisits.push(visit)
      })
      
      console.log(`   👤 ${userData.displayName}: ${userVisits.length} visits`)
    }
    
    // Batch write visits (max 500 per batch)
    const batchSize = 500
    for (let i = 0; i < allVisits.length; i += batchSize) {
      const visitBatch = db.batch()
      const chunk = allVisits.slice(i, i + batchSize)
      
      chunk.forEach(visit => {
        const docRef = db.collection('visits').doc()
        visitBatch.set(docRef, visit)
      })
      
      await visitBatch.commit()
    }
    
    console.log(`   ✅ Seeded ${allVisits.length} total visits\n`)
    
    // ========== VERIFY ==========
    console.log('📊 Verification:')
    const pubsSnapshot = await db.collection('pubs').get()
    const visitsSnapshot = await db.collection('visits').get()
    const authUsers = await auth.listUsers()
    
    console.log(`   🍺 Pubs: ${pubsSnapshot.size}`)
    console.log(`   📍 Visits: ${visitsSnapshot.size}`)
    console.log(`   👤 Users: ${authUsers.users.length}`)
    
  } catch (error) {
    console.error('\n❌ Error seeding data:', error)
    process.exit(1)
  }
}

seedData().then(() => {
  console.log('\n🎉 Seeding complete!')
  process.exit(0)
})
