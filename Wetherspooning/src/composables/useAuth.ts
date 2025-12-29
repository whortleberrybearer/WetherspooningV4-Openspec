import { reactive, readonly, toRef } from 'vue'

/**
 * User information
 */
export interface User {
  username: string
  email?: string
}

/**
 * Test account information
 */
interface TestAccount {
  username: string
  email: string
  password: string
}

/**
 * Authentication state
 */
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  error: string | null
}

// Test accounts for initial implementation
const TEST_ACCOUNTS: TestAccount[] = [
  {
    username: 'test',
    email: 'test@example.com',
    password: 'password123'
  }
]

// Global authentication state
const authState = reactive<AuthState>({
  user: null,
  isAuthenticated: false,
  error: null
})

/**
 * Authentication composable for managing user login/logout/registration state.
 * 
 * Currently uses test accounts. Future versions will integrate with backend API.
 * 
 * @example
 * ```ts
 * const { user, isAuthenticated, error, login, logout, register } = useAuth()
 * 
 * // Register
 * await register('newuser', 'newuser@example.com', 'password123')
 * 
 * // Login
 * await login('test@example.com', 'password123')
 * 
 * // Logout
 * logout()
 * ```
 */
export function useAuth() {
  /**
   * Authenticate user with email and password.
   * Currently validates against test accounts (case-sensitive).
   * 
   * @param email - User's email
   * @param password - User's password
   * @returns Promise that resolves on successful login or rejects with error message
   */
  const login = (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Clear previous errors
      authState.error = null

      // Find account with matching email and password (case-sensitive)
      const account = TEST_ACCOUNTS.find(
        acc => acc.email === email && acc.password === password
      )

      if (account) {
        // Successful login
        authState.user = {
          username: account.username,
          email: account.email
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
   * Register a new user account.
   * Currently adds to test accounts array (no persistent storage).
   * 
   * @param username - User's username
   * @param email - User's email
   * @param password - User's password
   * @returns Promise that resolves on successful registration or rejects with error message
   */
  const register = (username: string, email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Clear previous errors
      authState.error = null

      // Check if email already exists
      const existingAccount = TEST_ACCOUNTS.find(acc => acc.email === email)
      
      if (existingAccount) {
        // Email already registered
        authState.error = 'Email already registered. Please log in.'
        reject(new Error(authState.error))
      } else {
        // Add new account
        TEST_ACCOUNTS.push({
          username,
          email,
          password
        })
        resolve()
      }
    })
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
