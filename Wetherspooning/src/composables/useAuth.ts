import { reactive, readonly, toRef } from 'vue'

/**
 * User information
 */
export interface User {
  username: string
  email?: string
}

/**
 * Authentication state
 */
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  error: string | null
}

// Test credentials for initial implementation
const TEST_CREDENTIALS = {
  username: 'test',
  password: 'password123',
  email: 'test@example.com'
}

// Global authentication state
const authState = reactive<AuthState>({
  user: null,
  isAuthenticated: false,
  error: null
})

/**
 * Authentication composable for managing user login/logout state.
 * 
 * Currently uses test credentials. Future versions will integrate with backend API.
 * 
 * @example
 * ```ts
 * const { user, isAuthenticated, error, login, logout } = useAuth()
 * 
 * // Login
 * await login('test', 'password123')
 * 
 * // Logout
 * logout()
 * ```
 */
export function useAuth() {
  /**
   * Authenticate user with username and password.
   * Currently validates against test credentials (case-sensitive).
   * 
   * @param username - User's username
   * @param password - User's password
   * @returns Promise that resolves on successful login or rejects with error message
   */
  const login = (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Clear previous errors
      authState.error = null

      // Validate credentials (case-sensitive)
      if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
        // Successful login
        authState.user = {
          username: TEST_CREDENTIALS.username,
          email: TEST_CREDENTIALS.email
        }
        authState.isAuthenticated = true
        resolve()
      } else {
        // Failed login
        authState.error = 'Invalid username or password'
        authState.isAuthenticated = false
        authState.user = null
        reject(new Error(authState.error))
      }
    })
  }

  /**
   * Log out the current user and clear authentication state.
   */
  const logout = (): void => {
    authState.user = null
    authState.isAuthenticated = false
    authState.error = null
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
    clearError
  }
}
