import { runUpdateSync } from '../../src/scheduled/syncPubs';
import { toBaseUrl } from '../../src/services/pubDedupeService';
import type { SitemapEntry, ScrapedPubData, Pub } from '../../src/types/pub';

jest.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(async () => ({ docs: [] })),
        })),
      })),
    })),
  })),
}));

jest.mock('../../src/services/sitemapService', () => ({
  getSitemapUrls: jest.fn(),
}));

jest.mock('../../src/services/pubScraperService', () => ({
  scrapePubData: jest.fn(),
}));

jest.mock('../../src/services/pubSyncService', () => {
  const actual = jest.requireActual('../../src/services/pubSyncService');
  return {
    ...actual,
    getExistingPubByUrl: jest.fn(),
    batchWritePubs: jest.fn(),
  };
});

const { getSitemapUrls } = jest.requireMock('../../src/services/sitemapService') as {
  getSitemapUrls: jest.Mock;
};

const { scrapePubData } = jest.requireMock('../../src/services/pubScraperService') as {
  scrapePubData: jest.Mock;
};

const { getExistingPubByUrl, batchWritePubs } = jest.requireMock('../../src/services/pubSyncService') as {
  getExistingPubByUrl: jest.Mock;
  batchWritePubs: jest.Mock;
};

describe('scheduled syncPubs - update sync dedupe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dedupes numeric-suffix URL by base URL address match and prefers URL with image', async () => {
    const suffixedUrl = 'https://www.jdwetherspoon.com/pubs/the-five-stones-filey-2/';
    const baseUrl = toBaseUrl(suffixedUrl);

    const entries: SitemapEntry[] = [
      {
        url: suffixedUrl,
        imageUrl: 'https://example.com/feature.png',
        lastmod: new Date().toISOString(),
      },
    ];

    getSitemapUrls.mockResolvedValue(entries);

    const scraped: ScrapedPubData = {
      id: 'new-id',
      name: 'The Five Stones',
      url: suffixedUrl,
      imageUrl: 'https://example.com/feature.png',
      address: '123 Test Street, Filey, AB1 2CD',
      townCity: 'Filey',
      position: null,
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
    };

    scrapePubData.mockResolvedValue(scraped);

    const existingBasePub: Pub = {
      id: 'pub-1',
      name: 'The Five Stones',
      url: baseUrl,
      imageUrl: '',
      address: '123 Test Street, Filey, AB1 2CD',
      townCity: 'Filey',
      position: null,
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
      lastSyncedAt: { seconds: 111, nanoseconds: 0 } as any,
    };

    getExistingPubByUrl.mockImplementation(async (url: string) => {
      if (url === suffixedUrl) return null;
      if (url === baseUrl) return existingBasePub;
      return null;
    });

    await runUpdateSync(new Date('2000-01-01T00:00:00Z'));

    expect(getExistingPubByUrl).toHaveBeenCalledWith(suffixedUrl);
    expect(getExistingPubByUrl).toHaveBeenCalledWith(baseUrl);

    expect(batchWritePubs).toHaveBeenCalledTimes(1);
    const pubsWritten = batchWritePubs.mock.calls[0][0] as Pub[];
    expect(pubsWritten).toHaveLength(1);
    expect(pubsWritten[0].id).toBe('pub-1');
    expect(pubsWritten[0].url).toBe(suffixedUrl);
    expect(pubsWritten[0].imageUrl).toBe('https://example.com/feature.png');
  });

  it('does not create two records when base and suffixed entries appear in the same invocation', async () => {
    const baseUrl = 'https://www.jdwetherspoon.com/pubs/the-five-stones-filey/';
    const suffixedUrl = 'https://www.jdwetherspoon.com/pubs/the-five-stones-filey-2/';

    const entries: SitemapEntry[] = [
      {
        url: baseUrl,
        imageUrl: '',
        lastmod: new Date().toISOString(),
      },
      {
        url: suffixedUrl,
        imageUrl: 'https://example.com/feature.png',
        lastmod: new Date().toISOString(),
      },
    ];

    getSitemapUrls.mockResolvedValue(entries);

    scrapePubData.mockImplementation(async (url: string, imageUrl: string) => {
      const id = url === baseUrl ? 'pub-new-1' : 'pub-new-2';
      return {
        id,
        name: 'The Five Stones',
        url,
        imageUrl,
        address: '123 Test Street, Filey, AB1 2CD',
        townCity: 'Filey',
        position: null,
        openState: 'Open',
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
      } as ScrapedPubData;
    });

    getExistingPubByUrl.mockResolvedValue(null);

    await runUpdateSync(new Date('2000-01-01T00:00:00Z'));

    expect(batchWritePubs).toHaveBeenCalledTimes(1);
    const pubsWritten = batchWritePubs.mock.calls[0][0] as Pub[];
    expect(pubsWritten).toHaveLength(1);
    expect(pubsWritten[0].id).toBe('pub-new-1');
    expect(pubsWritten[0].url).toBe(suffixedUrl);
    expect(pubsWritten[0].imageUrl).toBe('https://example.com/feature.png');
  });

  it('does not dedupe when addresses differ', async () => {
    const baseUrl = 'https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub/';
    const suffixedUrl = 'https://www.jdwetherspoon.com/pubs/example-town/the-sample-pub-2/';

    const entries: SitemapEntry[] = [
      {
        url: baseUrl,
        imageUrl: '',
        lastmod: new Date().toISOString(),
      },
      {
        url: suffixedUrl,
        imageUrl: '',
        lastmod: new Date().toISOString(),
      },
    ];

    getSitemapUrls.mockResolvedValue(entries);

    scrapePubData.mockImplementation(async (url: string, imageUrl: string) => {
      return {
        id: url === baseUrl ? 'id-1' : 'id-2',
        name: 'The Sample Pub',
        url,
        imageUrl,
        address: url === baseUrl ? '1 Main St, Example Town, ZZ1 1ZZ' : '2 Main St, Example Town, ZZ1 1ZZ',
        townCity: 'Example Town',
        position: null,
        openState: 'Open',
        isHotel: false,
        inAirport: false,
        inTrainStation: false,
      } as ScrapedPubData;
    });

    getExistingPubByUrl.mockResolvedValue(null);

    await runUpdateSync(new Date('2000-01-01T00:00:00Z'));

    expect(batchWritePubs).toHaveBeenCalledTimes(1);
    const pubsWritten = batchWritePubs.mock.calls[0][0] as Pub[];
    expect(pubsWritten).toHaveLength(2);
    const ids = pubsWritten.map(p => p.id).sort();
    expect(ids).toEqual(['id-1', 'id-2']);
  });
});
