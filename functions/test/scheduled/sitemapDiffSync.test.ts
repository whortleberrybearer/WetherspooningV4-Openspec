import { runSitemapDiffSync } from '../../src/scheduled/syncPubs';
import type { SitemapEntry, Pub, ScrapedPubData } from '../../src/types/pub';

jest.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
  getFirestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
      })),
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(async () => ({ docs: [] })),
        })),
      })),
      limit: jest.fn(() => ({
        get: jest.fn(async () => ({ docs: [] })),
      })),
      get: jest.fn(async () => ({ docs: [] })),
    })),
  })),
}));

jest.mock('../../src/services/sitemapService', () => ({
  getSitemapUrls: jest.fn(),
}));

jest.mock('../../src/services/pubScraperService', () => ({
  scrapePubData: jest.fn(),
}));

jest.mock('../../src/services/sitemapStateService', () => {
  const actual = jest.requireActual('../../src/services/sitemapStateService');
  return {
    ...actual,
    getStoredSitemapSnapshot: jest.fn(),
    storeSitemapSnapshot: jest.fn(),
  };
});

jest.mock('../../src/services/pubSyncService', () => {
  const actual = jest.requireActual('../../src/services/pubSyncService');
  return {
    ...actual,
    getExistingPubByUrl: jest.fn(),
    batchWritePubs: jest.fn(),
    findMatchingPubInFirestore: jest.fn(),
    getAllPubs: jest.fn(),
  };
});

const { getSitemapUrls } = jest.requireMock('../../src/services/sitemapService') as {
  getSitemapUrls: jest.Mock;
};

const { scrapePubData } = jest.requireMock('../../src/services/pubScraperService') as {
  scrapePubData: jest.Mock;
};

const { getStoredSitemapSnapshot, storeSitemapSnapshot, buildSnapshot } = jest.requireMock('../../src/services/sitemapStateService') as {
  getStoredSitemapSnapshot: jest.Mock;
  storeSitemapSnapshot: jest.Mock;
  buildSnapshot: (entries: SitemapEntry[]) => any;
};

const { getExistingPubByUrl, batchWritePubs, findMatchingPubInFirestore } = jest.requireMock('../../src/services/pubSyncService') as {
  getExistingPubByUrl: jest.Mock;
  batchWritePubs: jest.Mock;
  findMatchingPubInFirestore: jest.Mock;
};

describe('scheduled syncPubs - sitemap diff sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips scraping and writes when sitemap hash is unchanged', async () => {
    const entries: SitemapEntry[] = [
      { url: 'https://example.com/a', imageUrl: '', lastmod: '2026-01-01T00:00:00.000Z' },
    ];

    getSitemapUrls.mockResolvedValue(entries);

    const snapshot = buildSnapshot(entries);
    getStoredSitemapSnapshot.mockResolvedValue({ ...snapshot });

    await runSitemapDiffSync();

    expect(scrapePubData).not.toHaveBeenCalled();
    expect(batchWritePubs).not.toHaveBeenCalled();
    expect(storeSitemapSnapshot).not.toHaveBeenCalled();
  });

  it('marks removed pubs as closed (when not a rename)', async () => {
    const removedUrl = 'https://example.com/removed';

    const previousEntries: SitemapEntry[] = [
      { url: removedUrl, imageUrl: '', lastmod: '2026-01-01T00:00:00.000Z' },
      { url: 'https://example.com/still-here', imageUrl: '', lastmod: '2026-01-01T00:00:00.000Z' },
    ];

    const currentEntries: SitemapEntry[] = [
      { url: 'https://example.com/still-here', imageUrl: '', lastmod: '2026-01-01T00:00:00.000Z' },
    ];

    getStoredSitemapSnapshot.mockResolvedValue(buildSnapshot(previousEntries));
    getSitemapUrls.mockResolvedValue(currentEntries);

    const existingRemoved: Pub = {
      id: 'pub-1',
      name: 'Removed Pub',
      url: removedUrl,
      imageUrl: '',
      address: '1 Main St',
      townCity: 'Town',
      position: null,
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
      lastSyncedAt: { seconds: 111, nanoseconds: 0 } as any,
    };

    getExistingPubByUrl.mockImplementation(async (url: string) => {
      if (url === removedUrl) return existingRemoved;
      return null;
    });

    await runSitemapDiffSync();

    expect(scrapePubData).not.toHaveBeenCalled();

    expect(batchWritePubs).toHaveBeenCalledTimes(1);
    const pubsWritten = batchWritePubs.mock.calls[0][0] as Pub[];
    expect(pubsWritten).toHaveLength(1);
    expect(pubsWritten[0].id).toBe('pub-1');
    expect(pubsWritten[0].openState).toBe('Closed');
    expect(pubsWritten[0].url).toBe('');

    expect(storeSitemapSnapshot).toHaveBeenCalledTimes(1);
  });

  it('treats add+remove as rename when matching pub is found and does not close old URL', async () => {
    const oldUrl = 'https://example.com/old-url';
    const newUrl = 'https://example.com/new-url';

    const previousEntries: SitemapEntry[] = [
      { url: oldUrl, imageUrl: '', lastmod: '2026-01-01T00:00:00.000Z' },
    ];

    const currentEntries: SitemapEntry[] = [
      { url: newUrl, imageUrl: '', lastmod: '2026-01-02T00:00:00.000Z' },
    ];

    getStoredSitemapSnapshot.mockResolvedValue(buildSnapshot(previousEntries));
    getSitemapUrls.mockResolvedValue(currentEntries);

    const scraped: ScrapedPubData = {
      id: 'new-id',
      name: 'The Pub',
      url: newUrl,
      imageUrl: '',
      address: '1 Main St',
      townCity: 'Town',
      position: null,
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
    };

    scrapePubData.mockResolvedValue(scraped);
    getExistingPubByUrl.mockResolvedValue(null);

    const existingPub: Pub = {
      id: 'pub-1',
      name: 'The Pub',
      url: oldUrl,
      imageUrl: '',
      address: '1 Main St',
      townCity: 'Town',
      position: null,
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
      lastSyncedAt: { seconds: 111, nanoseconds: 0 } as any,
    };

    findMatchingPubInFirestore.mockResolvedValue(existingPub);

    await runSitemapDiffSync();

    expect(batchWritePubs).toHaveBeenCalledTimes(1);
    const pubsWritten = batchWritePubs.mock.calls[0][0] as Pub[];
    expect(pubsWritten).toHaveLength(1);
    expect(pubsWritten[0].id).toBe('pub-1');
    expect(pubsWritten[0].url).toBe(newUrl);
    expect(pubsWritten[0].openState).toBe('Open');

    // If the old URL had been treated as a deletion, we'd see a second write closing it.
    expect(pubsWritten.some((p) => p.url === '')).toBe(false);
  });
});
