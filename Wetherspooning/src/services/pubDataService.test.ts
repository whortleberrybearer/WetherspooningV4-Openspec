import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAllPubs, clearPubCache } from '../pubDataService'
import type { Pub } from '../firebaseDataService'

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_FIREBASE_FUNCTIONS_URL: 'http://localhost:5001/test-project/europe-west2'
    }
  }
})

// Mock fetch
global.fetch = vi.fn()

describe('pubDataService', () => {
  const mockPubs: Pub[] = [
    {
      id: 'pub-1',
      name: 'The Test Pub',
      townCity: 'Test City',
      address: '123 Test St',
      county: 'Testshire',
      position: { lat: 51.5074, lng: -0.1278 }
    },
    {
      id: 'pub-2',
      name: 'Another Pub',
      townCity: 'Test Town',
      address: '456 Test Ave',
      county: 'Testshire',
      position: { lat: 51.5085, lng: -0.1289 }
    }
  ]

  beforeEach(() => {
    sessionStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('getAllPubs', () => {
    it('should fetch pubs from Cloud Function on first call', async () => {
      const mockResponse = { pubs: mockPubs }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const pubs = await getAllPubs()

      expect(pubs).toEqual(mockPubs)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/test-project/europe-west2/api/pubs'
      )
    })

    it('should return cached pubs from sessionStorage on subsequent calls', async () => {
      // First call - fetches from Cloud Function
      const mockResponse = { pubs: mockPubs }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await getAllPubs()

      // Clear fetch mock
      vi.clearAllMocks()

      // Second call - should use cache
      const cachedPubs = await getAllPubs()

      expect(cachedPubs).toEqual(mockPubs)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should bypass cache when bypassCache is true', async () => {
      // Seed cache
      sessionStorageMock.setItem('wetherspooning_pubs_cache', JSON.stringify(mockPubs))
      sessionStorageMock.setItem('wetherspooning_pubs_cache_timestamp', Date.now().toString())

      const mockResponse = { pubs: mockPubs }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await getAllPubs(true)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/test-project/europe-west2/api/pubs?nocache=1'
      )
    })

    it('should fetch fresh data if cache is expired', async () => {
      // Seed cache with old timestamp (25 hours ago)
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000
      sessionStorageMock.setItem('wetherspooning_pubs_cache', JSON.stringify(mockPubs))
      sessionStorageMock.setItem('wetherspooning_pubs_cache_timestamp', oldTimestamp.toString())

      const mockResponse = { pubs: mockPubs }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await getAllPubs()

      expect(global.fetch).toHaveBeenCalled()
    })

    it('should throw error on fetch failure', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(getAllPubs()).rejects.toThrow('Failed to load pub data')
    })
  })

  describe('clearPubCache', () => {
    it('should clear sessionStorage cache', () => {
      sessionStorageMock.setItem('wetherspooning_pubs_cache', JSON.stringify(mockPubs))
      sessionStorageMock.setItem('wetherspooning_pubs_cache_timestamp', Date.now().toString())

      clearPubCache()

      expect(sessionStorageMock.getItem('wetherspooning_pubs_cache')).toBeNull()
      expect(sessionStorageMock.getItem('wetherspooning_pubs_cache_timestamp')).toBeNull()
    })
  })
})
