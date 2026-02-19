const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

// Connect to emulators
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

// Initialize with a dummy project ID (emulator doesn't need real credentials)
const app = initializeApp({ projectId: 'demo-wetherspooning' })
const auth = getAuth(app)
const db = getFirestore(app)

// Sample users to create
const sampleUsers = [
  {
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User',
    username: 'testuser',
    visitsPublic: true
  },
  {
    email: 'alice@example.com',
    password: 'password123',
    displayName: 'Alice Smith',
    username: 'alice_smith',
    visitsPublic: true
  },
  {
    email: 'bob@example.com',
    password: 'password123',
    displayName: 'Bob Jones',
    username: 'bobjones',
    visitsPublic: false
  }
]

async function seedUsers() {
  try {
    console.log('👤 Seeding Firebase Auth emulator with users...')
    
    let created = 0
    let skipped = 0
    
    for (const userData of sampleUsers) {
      try {
        const user = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true // Auto-verify emails in emulator
        })
        
        // Create user profile document in Firestore
        await db.collection('users').doc(user.uid).set({
          uid: user.uid,
          username: userData.username,
          email: userData.email,
          visitsPublic: userData.visitsPublic,
          createdAt: new Date().toISOString()
        })
        
        console.log(`✅ Created user: ${userData.email} (uid: ${user.uid}, username: @${userData.username})`)
        created++
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`⏭️  User already exists: ${userData.email}`)
          skipped++
        } else {
          throw error
        }
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`   Created: ${created} users`)
    console.log(`   Skipped: ${skipped} users (already exist)`)
    console.log(`   Total: ${sampleUsers.length} users`)
    
    // List all users
    const listUsersResult = await auth.listUsers()
    console.log(`\n👥 Total users in Auth emulator: ${listUsersResult.users.length}`)
    
  } catch (error) {
    console.error('❌ Error seeding users:', error)
    process.exit(1)
  }
}

seedUsers().then(() => {
  console.log('\n🎉 User seeding complete!')
  process.exit(0)
})
