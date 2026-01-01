import { reactive, readonly, toRef } from 'vue'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  updatePassword,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { deleteUserData } from '@/services/firebaseDataService'

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
      return 'Invalid email address'
    case 'auth/weak-password':
      return 'Password must be at least 8 characters long.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password'
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later.'
    case 'auth/requires-recent-login':
      return 'Please log in again to complete this action.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
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
   * Re-authenticate the current user with their password.
   * Required before performing sensitive operations like account deletion.
   * 
   * @param password - User's current password
   * @returns Promise that resolves on successful re-authentication
   * @throws Error if user is not logged in, password is incorrect, or network fails
   */
  const reauthenticate = async (password: string): Promise<void> => {
    try {
      const currentUser = auth.currentUser

      if (!currentUser || !currentUser.email) {
        throw new Error('No user is currently logged in.')
      }

      const credential = EmailAuthProvider.credential(currentUser.email, password)
      await reauthenticateWithCredential(currentUser, credential)
    } catch (error: any) {
      if (error.message === 'No user is currently logged in.') {
        throw error
      }

      // Handle network errors
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.')
      }

      // Handle wrong password
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Incorrect password. Please try again.')
      }

      // Default error
      throw new Error(mapFirebaseError(error.code))
    }
  }

  /**
   * Permanently delete the current user's account and all associated data.
   * Deletes all visit data from Firestore, then deletes the Firebase Auth account.
   * User will be logged out after successful deletion.
   * 
   * @returns Promise that resolves on successful deletion
   * @throws Error if user is not logged in, data deletion fails, or auth deletion fails
   */
  const deleteAccount = async (): Promise<void> => {
    try {
      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error('No user is currently logged in.')
      }

      const userId = currentUser.uid

      // Step 1: Delete all user data from Firestore
      try {
        await deleteUserData(userId)
      } catch (error: any) {
        // If Firestore deletion fails, stop and report error
        throw new Error(error.message || 'Failed to delete account data. Please check your connection and try again.')
      }

      // Step 2: Delete Firebase Auth account
      try {
        await deleteUser(currentUser)
      } catch (error: any) {
        // Auth deletion failed after Firestore deletion succeeded
        console.error('Failed to delete auth account after Firestore deletion:', error)
        throw new Error('Failed to delete account. Please try again or contact support.')
      }

      // Auth state will be updated by onAuthStateChanged observer
      // Clear error state
      authState.error = null
    } catch (error: any) {
      // Re-throw formatted errors
      throw error
    }
  }

  /**
   * Change the current user's password.
   * Requires re-authentication with current password before updating.
   * 
   * @param currentPassword - User's current password
   * @param newPassword - New password to set
   * @returns Promise that resolves on successful password change
   * @throws Error if user is not logged in, current password is incorrect, or update fails
   */
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const currentUser = auth.currentUser

      if (!currentUser) {
        throw new Error('No user is currently logged in.')
      }

      // Step 1: Re-authenticate with current password
      await reauthenticate(currentPassword)

      // Step 2: Update password
      try {
        await updatePassword(currentUser, newPassword)
      } catch (error: any) {
        // Handle network errors
        if (error.code === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your connection and try again.')
        }

        // Map Firebase errors to user-friendly messages
        throw new Error(mapFirebaseError(error.code))
      }
    } catch (error: any) {
      // Re-throw formatted errors
      throw error
    }
  }

  /**
   * Clear any authentication errors.
   */
  const clearError = (): void => {
    authState.error = null
  }

  /**
   * Send a password reset email to the specified email address.
   * Uses Firebase Authentication's password reset flow.
   * 
   * @param email - User's email address
   * @returns Promise that resolves when email is sent
   * @throws Error with user-friendly message if send fails
   */
  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email)
      // Firebase sends the reset email
      // Note: Firebase doesn't reveal if the email exists or not (security feature)
    } catch (error: any) {
      // Map Firebase error to user-friendly message
      const errorMessage = mapFirebaseError(error.code)
      throw new Error(errorMessage)
    }
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
    reauthenticate,
    deleteAccount,
    changePassword,
    sendPasswordReset,
    clearError
  }
}
