import { syncPubToFirestore } from '../../src/services/pubSyncService';
import { ScrapedPubData } from '../../src/types/pub';

// Mock Firestore
const mockSet = jest.fn().mockResolvedValue(undefined);
const mockDoc = jest.fn().mockReturnValue({ set: mockSet });
const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: mockCollection,
  })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
}));

describe('pubSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncPubToFirestore', () => {
    it('should write pub data to Firestore', async () => {
      const pubData: ScrapedPubData = {
        id: 'star-light-hounslow',
        name: 'Star Light',
        url: 'https://www.jdwetherspoon.com/pubs/star-light-hounslow/',
        imageUrl: 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/7649-feature.png',
        address: 'Heathrow Airport, Terminal 4 (after security) , Hounslow, Middlesex, TW6 3XA',
        townCity: 'Hounslow',
        position: { lat: 51.46148, lng: -0.44538 },
        openState: 'Open',
      };

      await syncPubToFirestore(pubData);

      expect(mockCollection).toHaveBeenCalledWith('pubs');
      expect(mockDoc).toHaveBeenCalledWith('star-light-hounslow');
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'star-light-hounslow',
          name: 'Star Light',
          url: pubData.url,
          imageUrl: pubData.imageUrl,
          address: pubData.address,
          townCity: pubData.townCity,
          position: pubData.position,
          openState: pubData.openState,
          lastSyncedAt: expect.any(Object),
        }),
        { merge: true }
      );
    });

    it('should use merge option when writing', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'Test City',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Open',
      };

      await syncPubToFirestore(pubData);

      expect(mockSet).toHaveBeenCalledWith(
        expect.any(Object),
        { merge: true }
      );
    });

    it('should throw error when Firestore write fails', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'Test City',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Open',
      };

      mockSet.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(syncPubToFirestore(pubData)).rejects.toThrow('Firestore error');
    });

    it('should include timestamp in written data', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'Test City',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Open',
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.lastSyncedAt).toBeDefined();
      expect(writtenData.lastSyncedAt.seconds).toBe(1234567890);
    });

    it('should include imageUrl in written data', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'Test City',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Open',
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should include address in written data', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street, Test Town, AB1 2CD',
        townCity: 'Test Town',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Open',
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.address).toBe('123 Test Street, Test Town, AB1 2CD');
    });

    it('should include townCity in written data', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'London',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Open',
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.townCity).toBe('London');
    });

    it('should include position in written data', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'London',
        position: { lat: 51.5074, lng: -0.1278 },
        openState: 'Open',
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.position).toEqual({ lat: 51.5074, lng: -0.1278 });
    });

    it('should include null position when not available', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'London',
        position: null,
        openState: 'Open',
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.position).toBeNull();
    });

    it('should include openState in written data', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'London',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Opening Soon',
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.openState).toBe('Opening Soon');
    });
  });
});
