import { computeSitemapHash, diffSitemaps } from '../../src/services/sitemapStateService';
import type { SitemapEntry } from '../../src/types/pub';

describe('sitemapStateService', () => {
  describe('computeSitemapHash', () => {
    it('is deterministic and order-independent', () => {
      const a: SitemapEntry = {
        url: 'https://example.com/a',
        imageUrl: 'https://example.com/a.png',
        lastmod: '2026-01-01T00:00:00.000Z',
      };
      const b: SitemapEntry = {
        url: 'https://example.com/b',
        imageUrl: '',
        lastmod: '2026-01-02T00:00:00.000Z',
      };

      const hash1 = computeSitemapHash([a, b]);
      const hash2 = computeSitemapHash([b, a]);

      expect(hash1).toBe(hash2);
    });

    it('changes when a relevant field changes', () => {
      const base: SitemapEntry = {
        url: 'https://example.com/a',
        imageUrl: 'https://example.com/a.png',
        lastmod: '2026-01-01T00:00:00.000Z',
      };

      const hash1 = computeSitemapHash([base]);
      const hash2 = computeSitemapHash([{ ...base, imageUrl: 'https://example.com/changed.png' }]);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('diffSitemaps', () => {
    it('categorizes added/removed/changed/unchanged', () => {
      const previous = [
        { url: 'https://example.com/unchanged', imageUrl: '1', lastmod: '1' },
        { url: 'https://example.com/removed', imageUrl: '1', lastmod: '1' },
        { url: 'https://example.com/changed', imageUrl: '1', lastmod: '1' },
      ];

      const current = [
        { url: 'https://example.com/unchanged', imageUrl: '1', lastmod: '1' },
        { url: 'https://example.com/changed', imageUrl: '2', lastmod: '1' },
        { url: 'https://example.com/added', imageUrl: '1', lastmod: '1' },
      ];

      const diff = diffSitemaps(previous, current);

      expect(diff.added.map((e) => e.url)).toEqual(['https://example.com/added']);
      expect(diff.removed.map((e) => e.url)).toEqual(['https://example.com/removed']);
      expect(diff.changed.map((e) => e.url)).toEqual(['https://example.com/changed']);
      expect(diff.unchanged.map((e) => e.url)).toEqual(['https://example.com/unchanged']);
    });
  });
});
