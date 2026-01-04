import { 
  syncPubToFirestore, 
  getExistingPub,
  findMatchingPub,
  hasDataChanged,
  markClosedPubs,
  batchWritePubs,
  getAllPubs
} from '../../src/services/pubSyncService';
import { ScrapedPubData, Pub } from '../../src/types/pub';

// Mock Firestore
const mockSet = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn();
const mockDoc = jest.fn().mockReturnValue({ set: mockSet, get: mockGet });
const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });
const mockBatchSet = jest.fn();
const mockBatchCommit = jest.fn().mockResolvedValue(undefined);

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: mockCollection,
    batch: () => ({
      set: mockBatchSet,
      commit: mockBatchCommit,
    }),
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
      const testUuid = '550e8400-e29b-41d4-a716-446655440000';
      const pubData: ScrapedPubData = {
        id: testUuid,
        name: 'Star Light',
        url: 'https://www.jdwetherspoon.com/pubs/star-light-hounslow/',
        imageUrl: 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/7649-feature.png',
        address: 'Heathrow Airport, Terminal 4 (after security) , Hounslow, Middlesex, TW6 3XA',
        townCity: 'Hounslow',
        position: { lat: 51.46148, lng: -0.44538 },
        openState: 'Open',
        isHotel: false,
        inAirport: true, // Address contains 'Heathrow Airport'
        inTrainStation: false,
      };

      await syncPubToFirestore(pubData);

      expect(mockCollection).toHaveBeenCalledWith('pubs');
      expect(mockDoc).toHaveBeenCalledWith(testUuid);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          id: testUuid,
          name: 'Star Light',
          url: pubData.url,
          imageUrl: pubData.imageUrl,
          address: pubData.address,
          townCity: pubData.townCity,
          position: pubData.position,
          openState: pubData.openState,
          isHotel: pubData.isHotel,
          inAirport: pubData.inAirport,
          inTrainStation: pubData.inTrainStation,
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
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
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
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
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
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
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
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
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
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
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
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
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
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
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
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
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
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.openState).toBe('Opening Soon');
    });

    it('should include isHotel in written data', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'London',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Open',
        isHotel: true,
        inAirport: false,
        inTrainStation: false,
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.isHotel).toBe(true);
    });

    it('should include inAirport in written data', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'London',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Open',
        isHotel: false,
        inAirport: true,
        inTrainStation: false,
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.inAirport).toBe(true);
    });

    it('should include inTrainStation in written data', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street',
        townCity: 'London',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Open',
        isHotel: false,
        inAirport: false,
        inTrainStation: true,
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.inTrainStation).toBe(true);
    });

    it('should include country and county in written data', async () => {
      const pubData: ScrapedPubData = {
        id: 'test-pub',
        name: 'Test Pub',
        url: 'https://example.com/test-pub',
        imageUrl: 'https://example.com/image.jpg',
        address: '123 Test Street, London, SW1A 1AA',
        townCity: 'London',
        country: 'England',
        county: 'Greater London',
        position: { lat: 51.5, lng: -0.1 },
        openState: 'Open',
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
      };

      await syncPubToFirestore(pubData);

      const writtenData = mockSet.mock.calls[0][0];
      expect(writtenData.country).toBe('England');
      expect(writtenData.county).toBe('Greater London');
    });
  });

  describe('getExistingPub', () => {
    it('should return existing pub data', async () => {
      const existingData = {
        id: 'test-pub',
        name: 'Test Pub',
        country: 'England',
        county: 'Greater London',
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 },
      };

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => existingData,
      });

      const result = await getExistingPub('test-pub');

      expect(mockCollection).toHaveBeenCalledWith('pubs');
      expect(mockDoc).toHaveBeenCalledWith('test-pub');
      expect(result).toEqual(existingData);
    });

    it('should return null when pub does not exist', async () => {
      mockGet.mockResolvedValueOnce({
        exists: false,
      });

      const result = await getExistingPub('non-existent-pub');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockGet.mockRejectedValueOnce(new Error('Firestore error'));

      const result = await getExistingPub('test-pub');

      expect(result).toBeNull();
    });
  });

  describe('findMatchingPub', () => {
    const scrapedPub: ScrapedPubData = {
      id: 'new-id',
      name: 'The Moon Under Water',
      url: 'https://example.com/pubs/the-moon-under-water-london',
      imageUrl: 'https://example.com/image.png',
      address: '123 Main Street, Leicester Square, London, WC2H 7BP',
      townCity: 'London',
      position: { lat: 51.5074, lng: -0.1278 },
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
    };

    it('should match by URL (tier 1)', () => {
      const existingPubs: Pub[] = [{
        ...scrapedPub,
        id: 'existing-id',
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }];

      const result = findMatchingPub(scrapedPub, existingPubs);

      expect(result).toBeDefined();
      expect(result?.id).toBe('existing-id');
    });

    it('should match by name and townCity for open pubs (tier 2)', () => {
      const existingPubs: Pub[] = [{
        ...scrapedPub,
        id: 'existing-id',
        url: 'https://example.com/old-url',
        openState: 'Open',
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }];

      const result = findMatchingPub(scrapedPub, existingPubs);

      expect(result).toBeDefined();
      expect(result?.id).toBe('existing-id');
    });

    it('should NOT match closed pubs by name and townCity (tier 2)', () => {
      const existingPubs: Pub[] = [{
        ...scrapedPub,
        id: 'existing-id',
        url: 'https://example.com/old-url',
        openState: 'Closed',
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }];

      const result = findMatchingPub(scrapedPub, existingPubs);

      expect(result).toBeNull();
    });

    it('should match by address for open pubs (tier 3)', () => {
      const existingPubs: Pub[] = [{
        ...scrapedPub,
        id: 'existing-id',
        name: 'Old Name',
        url: 'https://example.com/old-url',
        townCity: 'Different City',
        openState: 'Open',
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }];

      const result = findMatchingPub(scrapedPub, existingPubs);

      expect(result).toBeDefined();
      expect(result?.id).toBe('existing-id');
    });

    it('should NOT match closed pubs by address (tier 3)', () => {
      const existingPubs: Pub[] = [{
        ...scrapedPub,
        id: 'existing-id',
        name: 'Old Name',
        url: 'https://example.com/old-url',
        openState: 'Closed',
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }];

      const result = findMatchingPub(scrapedPub, existingPubs);

      expect(result).toBeNull();
    });

    it('should skip tier 3 for short addresses', () => {
      const shortAddressPub = { ...scrapedPub, address: 'Short' };
      const existingPubs: Pub[] = [{
        ...scrapedPub,
        id: 'existing-id',
        name: 'Different Name',
        url: 'https://example.com/different-url',
        address: 'Short',
        openState: 'Open',
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }];

      const result = findMatchingPub(shortAddressPub, existingPubs);

      expect(result).toBeNull();
    });

    it('should return null when no match found', () => {
      const existingPubs: Pub[] = [{
        ...scrapedPub,
        id: 'existing-id',
        name: 'Different Name',
        url: 'https://example.com/different-url',
        address: 'Different Address That Is Long Enough',
        townCity: 'Different City',
        openState: 'Open',
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }];

      const result = findMatchingPub(scrapedPub, existingPubs);

      expect(result).toBeNull();
    });

    it('should prioritize URL match over name+townCity', () => {
      const existingPubs: Pub[] = [
        {
          ...scrapedPub,
          id: 'url-match-id',
          lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        },
        {
          ...scrapedPub,
          id: 'name-match-id',
          url: 'https://example.com/different-url',
          openState: 'Open',
          lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        }
      ];

      const result = findMatchingPub(scrapedPub, existingPubs);

      expect(result?.id).toBe('url-match-id');
    });
  });

  describe('hasDataChanged', () => {
    const basePub: Pub = {
      id: 'test-id',
      name: 'Test Pub',
      url: 'https://example.com/test-pub',
      imageUrl: 'https://example.com/image.png',
      address: '123 Test Street',
      townCity: 'Test City',
      position: { lat: 51.5074, lng: -0.1278 },
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
      lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    };

    const baseScraped: ScrapedPubData = {
      id: 'test-id',
      name: 'Test Pub',
      url: 'https://example.com/test-pub',
      imageUrl: 'https://example.com/image.png',
      address: '123 Test Street',
      townCity: 'Test City',
      position: { lat: 51.5074, lng: -0.1278 },
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
    };

    it('should return false when no changes detected', () => {
      const result = hasDataChanged(basePub, baseScraped);
      expect(result).toBe(false);
    });

    it('should detect name change', () => {
      const scraped = { ...baseScraped, name: 'New Name' };
      const result = hasDataChanged(basePub, scraped);
      expect(result).toBe(true);
    });

    it('should detect URL change', () => {
      const scraped = { ...baseScraped, url: 'https://example.com/new-url' };
      const result = hasDataChanged(basePub, scraped);
      expect(result).toBe(true);
    });

    it('should detect address change', () => {
      const scraped = { ...baseScraped, address: '456 New Street' };
      const result = hasDataChanged(basePub, scraped);
      expect(result).toBe(true);
    });

    it('should detect openState change', () => {
      const scraped = { ...baseScraped, openState: 'Closed' };
      const result = hasDataChanged(basePub, scraped);
      expect(result).toBe(true);
    });

    it('should detect position change', () => {
      const scraped = { ...baseScraped, position: { lat: 51.5075, lng: -0.1278 } };
      const result = hasDataChanged(basePub, scraped);
      expect(result).toBe(true);
    });

    it('should detect position null to value', () => {
      const pub = { ...basePub, position: null };
      const result = hasDataChanged(pub, baseScraped);
      expect(result).toBe(true);
    });

    it('should detect position value to null', () => {
      const scraped = { ...baseScraped, position: null };
      const result = hasDataChanged(basePub, scraped);
      expect(result).toBe(true);
    });

    it('should handle both positions null as no change', () => {
      const pub = { ...basePub, position: null };
      const scraped = { ...baseScraped, position: null };
      const result = hasDataChanged(pub, scraped);
      expect(result).toBe(false);
    });

    it('should detect country change', () => {
      const pub = { ...basePub, country: 'UK' };
      const scraped = { ...baseScraped, country: 'Ireland' };
      const result = hasDataChanged(pub, scraped);
      expect(result).toBe(true);
    });

    it('should detect multiple field changes', () => {
      const scraped = { 
        ...baseScraped, 
        name: 'New Name',
        address: '456 New Street',
        openState: 'Closed'
      };
      const result = hasDataChanged(basePub, scraped);
      expect(result).toBe(true);
    });
  });

  describe('markClosedPubs', () => {
    it('should mark unprocessed open pubs as closed', () => {
      const existingPubs: Pub[] = [
        {
          id: 'pub-1',
          name: 'Open Pub',
          url: 'https://example.com/pub-1',
          imageUrl: '',
          address: '',
          townCity: '',
          position: null,
          openState: 'Open',
          isHotel: false,
          inAirport: false,
          inTrainStation: false,
          lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        },
        {
          id: 'pub-2',
          name: 'Processed Pub',
          url: 'https://example.com/pub-2',
          imageUrl: '',
          address: '',
          townCity: '',
          position: null,
          openState: 'Open',
          isHotel: false,
          inAirport: false,
          inTrainStation: false,
          lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        }
      ];

      const processedIds = new Set(['pub-2']);
      const closedPubs = markClosedPubs(processedIds, existingPubs);

      expect(closedPubs).toHaveLength(1);
      expect(closedPubs[0].id).toBe('pub-1');
      expect(closedPubs[0].openState).toBe('Closed');
      expect(closedPubs[0].url).toBe('');
    });

    it('should skip already closed pubs', () => {
      const existingPubs: Pub[] = [
        {
          id: 'pub-1',
          name: 'Closed Pub',
          url: '',
          imageUrl: '',
          address: '',
          townCity: '',
          position: null,
          openState: 'Closed',
          isHotel: false,
          inAirport: false,
          inTrainStation: false,
          lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        }
      ];

      const processedIds = new Set<string>();
      const closedPubs = markClosedPubs(processedIds, existingPubs);

      expect(closedPubs).toHaveLength(0);
    });

    it('should skip processed pubs', () => {
      const existingPubs: Pub[] = [
        {
          id: 'pub-1',
          name: 'Processed Pub',
          url: 'https://example.com/pub-1',
          imageUrl: '',
          address: '',
          townCity: '',
          position: null,
          openState: 'Open',
          isHotel: false,
          inAirport: false,
          inTrainStation: false,
          lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        }
      ];

      const processedIds = new Set(['pub-1']);
      const closedPubs = markClosedPubs(processedIds, existingPubs);

      expect(closedPubs).toHaveLength(0);
    });

    it('should return empty array when all pubs processed', () => {
      const existingPubs: Pub[] = [
        {
          id: 'pub-1',
          name: 'Pub 1',
          url: 'https://example.com/pub-1',
          imageUrl: '',
          address: '',
          townCity: '',
          position: null,
          openState: 'Open',
          isHotel: false,
          inAirport: false,
          inTrainStation: false,
          lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        }
      ];

      const processedIds = new Set(['pub-1']);
      const closedPubs = markClosedPubs(processedIds, existingPubs);

      expect(closedPubs).toHaveLength(0);
    });
  });

  describe('batchWritePubs', () => {
    beforeEach(() => {
      mockBatchSet.mockClear();
      mockBatchCommit.mockClear();
    });

    it('should write pubs in a single batch when under 500', async () => {
      const pubs: Pub[] = Array(10).fill(null).map((_, i) => ({
        id: `pub-${i}`,
        name: `Pub ${i}`,
        url: `https://example.com/pub-${i}`,
        imageUrl: '',
        address: '',
        townCity: '',
        position: null,
        openState: 'Open',
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }));

      await batchWritePubs(pubs);

      expect(mockBatchSet).toHaveBeenCalledTimes(10);
      expect(mockBatchCommit).toHaveBeenCalledTimes(1);
    });

    it('should write pubs in multiple batches when over 500', async () => {
      const pubs: Pub[] = Array(1200).fill(null).map((_, i) => ({
        id: `pub-${i}`,
        name: `Pub ${i}`,
        url: `https://example.com/pub-${i}`,
        imageUrl: '',
        address: '',
        townCity: '',
        position: null,
        openState: 'Open',
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }));

      await batchWritePubs(pubs);

      expect(mockBatchSet).toHaveBeenCalledTimes(1200);
      expect(mockBatchCommit).toHaveBeenCalledTimes(3); // 500 + 500 + 200
    });

    it('should handle batch commit errors gracefully', async () => {
      mockBatchCommit.mockRejectedValueOnce(new Error('Batch failed'));

      const pubs: Pub[] = [{
        id: 'pub-1',
        name: 'Pub 1',
        url: 'https://example.com/pub-1',
        imageUrl: '',
        address: '',
        townCity: '',
        position: null,
        openState: 'Open',
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
        lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }];

      // Should not throw
      await expect(batchWritePubs(pubs)).resolves.toBeUndefined();
    });
  });

  describe('getAllPubs', () => {
    it('should load all pubs from Firestore', async () => {
      const mockPubs = [
        { id: 'pub-1', name: 'Pub 1' },
        { id: 'pub-2', name: 'Pub 2' }
      ];

      const mockQuerySnapshot = {
        forEach: (callback: any) => {
          mockPubs.forEach(pub => callback({ data: () => pub }));
        }
      };

      const mockGet = jest.fn().mockResolvedValue(mockQuerySnapshot);
      mockCollection.mockReturnValueOnce({ get: mockGet });

      const result = await getAllPubs();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('pub-1');
      expect(result[1].id).toBe('pub-2');
    });

    it('should throw error when Firestore query fails', async () => {
      const mockGet = jest.fn().mockRejectedValue(new Error('Query failed'));
      mockCollection.mockReturnValueOnce({ get: mockGet });

      await expect(getAllPubs()).rejects.toThrow('Query failed');
    });
  });
});
