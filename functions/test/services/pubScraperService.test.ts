import { scrapePubData } from '../../src/services/pubScraperService';
import * as fs from 'fs';
import * as path from 'path';

// Mock fetch globally
global.fetch = jest.fn();

describe('pubScraperService', () => {
  const samplePubHtml = fs.readFileSync(
    path.join(__dirname, '../fixtures/pub-page-sample.html'),
    'utf-8'
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scrapePubData', () => {
    it('should scrape pub name successfully', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/all-pubs/england/london/the-moon-under-water-leicester-square';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => samplePubHtml,
      });

      const result = await scrapePubData(url);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('the-moon-under-water-leicester-square');
      expect(result?.name).toBe('The Moon Under Water');
      expect(result?.url).toBe(url);
    });

    it('should extract ID from URL correctly', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/all-pubs/scotland/edinburgh/the-standing-order';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => samplePubHtml,
      });

      const result = await scrapePubData(url);

      expect(result?.id).toBe('the-standing-order');
    });

    it('should return null when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await scrapePubData('https://example.com/pub');

      expect(result).toBeNull();
    });

    it('should return null when name cannot be extracted', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => '<html><body><p>No name here</p></body></html>',
      });

      const result = await scrapePubData('https://example.com/pub');

      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await scrapePubData('https://example.com/pub');

      expect(result).toBeNull();
    });

    it('should trim whitespace from pub name', async () => {
      const htmlWithWhitespace = '<html><body><h1>  The Moon Under Water  </h1></body></html>';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithWhitespace,
      });

      const result = await scrapePubData('https://example.com/pub');

      expect(result?.name).toBe('The Moon Under Water');
    });
  });
});
