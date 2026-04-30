import {
  getBaseSlug,
  isNumericSuffixVariant,
  pickCanonicalSitemapEntry,
  toBaseUrl,
} from '../../src/services/pubDedupeService';

describe('pubDedupeService', () => {
  describe('getBaseSlug', () => {
    it('strips trailing numeric suffix from slug', () => {
      expect(getBaseSlug('https://www.jdwetherspoon.com/pubs/the-five-stones-filey-2/')).toBe(
        'the-five-stones-filey'
      );
    });

    it('returns slug unchanged when no numeric suffix', () => {
      expect(getBaseSlug('https://www.jdwetherspoon.com/pubs/the-five-stones-filey/')).toBe(
        'the-five-stones-filey'
      );
    });
  });

  describe('isNumericSuffixVariant', () => {
    it('returns true when slug ends with -<number>', () => {
      expect(isNumericSuffixVariant('https://www.jdwetherspoon.com/pubs/the-five-stones-filey-3/')).toBe(true);
    });

    it('returns false when slug has no numeric suffix', () => {
      expect(isNumericSuffixVariant('https://www.jdwetherspoon.com/pubs/the-five-stones-filey/')).toBe(false);
    });
  });

  describe('toBaseUrl', () => {
    it('converts numeric-suffix URL to base URL', () => {
      expect(toBaseUrl('https://www.jdwetherspoon.com/pubs/the-five-stones-filey-2/')).toBe(
        'https://www.jdwetherspoon.com/pubs/the-five-stones-filey/'
      );
    });

    it('returns original URL when already base', () => {
      expect(toBaseUrl('https://www.jdwetherspoon.com/pubs/the-five-stones-filey/')).toBe(
        'https://www.jdwetherspoon.com/pubs/the-five-stones-filey/'
      );
    });
  });

  describe('pickCanonicalSitemapEntry', () => {
    it('prefers entry with imageUrl', () => {
      const current = { url: 'https://example.com/pub/', imageUrl: '' };
      const candidate = { url: 'https://example.com/pub-2/', imageUrl: 'https://example.com/img.png' };
      expect(pickCanonicalSitemapEntry(current, candidate)).toEqual(candidate);
    });

    it('prefers non-suffixed URL when image presence is equal', () => {
      const current = { url: 'https://example.com/pub-2/', imageUrl: '' };
      const candidate = { url: 'https://example.com/pub/', imageUrl: '' };
      expect(pickCanonicalSitemapEntry(current, candidate)).toEqual(candidate);
    });

    it('keeps current when tied', () => {
      const current = { url: 'https://example.com/pub/', imageUrl: '' };
      const candidate = { url: 'https://example.com/pub/', imageUrl: '' };
      expect(pickCanonicalSitemapEntry(current, candidate)).toEqual(current);
    });
  });
});
