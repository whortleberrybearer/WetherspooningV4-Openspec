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
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.imageUrl).toBe('https://example.com/image.jpg');
    });
  });
});
