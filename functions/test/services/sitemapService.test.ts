import { getSitemapUrls } from '../../src/services/sitemapService';
import * as fs from 'fs';
import * as path from 'path';

// Mock fetch globally
global.fetch = jest.fn();

describe('sitemapService', () => {
  const sampleSitemapXml = fs.readFileSync(
    path.join(__dirname, '../fixtures/sitemap-sample.xml'),
    'utf-8'
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSitemapUrls', () => {
    it('should fetch and parse sitemap successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => sampleSitemapXml,
      });

      const entries = await getSitemapUrls();

      // Actual sitemap has 814 entries
      expect(entries.length).toBeGreaterThan(800);
      expect(entries[0]).toEqual({
        url: 'https://www.jdwetherspoon.com/pubs/the-sir-thomas-haggerston-berwick-upon-tweed/',
        imageUrl: 'https://www.jdwetherspoon.com/wp-content/uploads/2024/12/7906_4.jpg',
        lastmod: '2025-10-09T15:00:41+00:00',
      });
      expect(entries[5]).toEqual({
        url: 'https://www.jdwetherspoon.com/pubs/the-falcon-high-wycombe/',
        imageUrl: 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/167-feature.png',
        lastmod: '2025-10-15T14:56:30+00:00',
      });
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(getSitemapUrls()).rejects.toThrow('Failed to fetch sitemap: 404 Not Found');
    });

    it('should throw error when XML is invalid', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => '<invalid>xml</invalid>',
      });

      await expect(getSitemapUrls()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(getSitemapUrls()).rejects.toThrow('Network error');
    });
  });
});
