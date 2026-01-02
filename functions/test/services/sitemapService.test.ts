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

      const urls = await getSitemapUrls();

      expect(urls).toHaveLength(10);
      expect(urls[0]).toBe('https://www.jdwetherspoon.com/pubs/all-pubs/england/london/the-moon-under-water-leicester-square');
      expect(urls[9]).toBe('https://www.jdwetherspoon.com/pubs/all-pubs/england/nottingham/the-roebuck-inn');
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
