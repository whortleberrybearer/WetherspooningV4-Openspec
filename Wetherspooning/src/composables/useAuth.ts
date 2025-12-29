import { reactive, readonly, toRef } from 'vue'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

/**
 * User information
 */
export interface User {
  username: string
  email?: string
  uid?: string
}

/**
 * Authentication state
 */
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  error: string | null
}

// Global authentication state
const authState = reactive<AuthState>({
  user: null,
  isAuthenticated: false,
  error: null
})

/**
 * Map Firebase Auth error codes to user-friendly messages
 */
function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email already registered. Please log in.'
    case 'auth/invalid-email':
      return 'Invalid email address format.'
    case 'auth/weak-password':
      return 'Password must be at least 8 characters long.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    default:
      return 'An error occurred. Please try again.'
  }
}

// Set up auth state observer to persist sessions
onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
  if (firebaseUser) {
    authState.user = {
      username: firebaseUser.email?.split('@')[0] || 'user',
      email: firebaseUser.email || undefined,
      uid: firebaseUser.uid
    }
    authState.isAuthenticated = true
  } else {
    authState.user = null
    authState.isAuthenticated = false
  }
})

/**
 * Authentication composable for managing user login/logout/registration state.
 * 
 * Uses Firebase Authentication for secure user management.
 * 
 * @example
 * ```ts
 * const { user, isAuthenticated, error, login, logout, register } = useAuth()
 * 
 * // Register
 * await register('newuser', 'newuser@example.com', 'password123')
 * 
 * // Login
 * await login('user@example.com', 'password123')
 * 
 * // Logout
 * logout()
 * ```
 */
export function useAuth() {
  /**
   * Authenticate user with email and password using Firebase Auth.
   * 
   * @param email - User's email
   * @param password - User's password
   * @returns Promise that resolves on successful login or rejects with error message
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Clear previous errors
      authState.error = null

      await signInWithEmailAndPassword(auth, email, password)
      // Auth state will be updated by onAuthStateChanged observer
    } catch (error: any) {
      // Map Firebase error to user-friendly message
      authState.error = mapFirebaseError(error.code)
      throw new Error(authState.error)
    }
  }

  /**
   * Log out the current user using Firebase Auth.
   */
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
      // Auth state will be updated by onAuthStateChanged observer
      authState.error = null
    } catch (error: any) {
      authState.error = 'Failed to log out. Please try again.'
      throw new Error(authState.error)
    }
  }

  /**
   * Register a new user account using Firebase Auth.
   * User is automatically logged in after successful registration.
   * 
   * @param username - User's username (currently not stored, derived from email)
   * @param email - User's email
   * @param password - User's password
   * @returns Promise that resolves on successful registration or rejects with error message
   */
  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      // Clear previous errors
      authState.error = null

      await createUserWithEmailAndPassword(auth, email, password)
      // User is automatically logged in by Firebase
      // Auth state will be updated by onAuthStateChanged observer
    } catch (error: any) {
      // Map Firebase error to user-friendly message
      authState.error = mapFirebaseError(error.code)
      throw new Error(authState.error)
    }
  }

  /**
   * Clear any authentication errors.
   */
  const clearError = (): void => {
    authState.error = null
  }

  return {
    // Readonly state to prevent direct mutations
    user: readonly(toRef(authState, 'user')),
    isAuthenticated: readonly(toRef(authState, 'isAuthenticated')),
    error: readonly(toRef(authState, 'error')),
    // Actions
    login,
    logout,
    register,
    clearError
  }
}
