import { geocodePostcode } from '../../src/services/geocodingService';

// Mock fetch globally
global.fetch = jest.fn();

describe('geocodingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.setTimeout(10000);
    // Set up environment variable
    process.env.GOOGLE_GEOCODING_API_KEY = 'test-api-key';
  });

  describe('geocodePostcode', () => {
    it('should return null when API key is not configured', async () => {
      delete process.env.GOOGLE_GEOCODING_API_KEY;
      
      const result = await geocodePostcode('SW1A 1AA');
      
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should return null for empty postcode', async () => {
      const result = await geocodePostcode('');
      
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should successfully geocode UK postcode and parse as UK', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            address_components: [
              { long_name: 'England', short_name: 'England', types: ['administrative_area_level_1', 'political'] },
              { long_name: 'Greater London', short_name: 'Greater London', types: ['administrative_area_level_2', 'political'] },
              { long_name: 'United Kingdom', short_name: 'GB', types: ['country', 'political'] },
            ],
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodePostcode('SW1A 1AA');

      expect(result).toEqual({
        country: 'England',
        region: 'Greater London',
      });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://maps.googleapis.com/maps/api/geocode/json'),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('should use postal_town as fallback when admin_level_2 is not available for UK', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            address_components: [
              { long_name: 'Scotland', short_name: 'Scotland', types: ['administrative_area_level_1', 'political'] },
              { long_name: 'Edinburgh', short_name: 'Edinburgh', types: ['postal_town'] },
              { long_name: 'United Kingdom', short_name: 'GB', types: ['country', 'political'] },
            ],
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodePostcode('EH1 1YZ');

      expect(result).toEqual({
        country: 'Scotland',
        region: 'Edinburgh',
      });
    });

    it('should successfully geocode non-UK postcode and parse correctly', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            address_components: [
              { long_name: 'California', short_name: 'CA', types: ['administrative_area_level_1', 'political'] },
              { long_name: 'Los Angeles County', short_name: 'Los Angeles County', types: ['administrative_area_level_2', 'political'] },
              { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
            ],
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodePostcode('90001');

      expect(result).toEqual({
        country: 'United States',
        region: 'California',
      });
    });

    it('should return null when API returns non-OK status', async () => {
      const mockResponse = {
        status: 'ZERO_RESULTS',
        results: [],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodePostcode('INVALID');

      expect(result).toBeNull();
    });

    it('should return null when API request fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await geocodePostcode('SW1A 1AA');

      expect(result).toBeNull();
    });

    it('should return null when fetch throws an error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await geocodePostcode('SW1A 1AA');

      expect(result).toBeNull();
    });

    it('should return null on timeout', async () => {
      // Mock fetch to simulate abort/timeout
      (fetch as jest.Mock).mockImplementationOnce(() => 
        Promise.reject({ name: 'AbortError', message: 'The operation was aborted' })
      );

      const result = await geocodePostcode('SW1A 1AA');

      expect(result).toBeNull();
    });

    it('should handle Wales correctly as UK', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            address_components: [
              { long_name: 'Wales', short_name: 'Wales', types: ['administrative_area_level_1', 'political'] },
              { long_name: 'Cardiff', short_name: 'Cardiff', types: ['administrative_area_level_2', 'political'] },
              { long_name: 'United Kingdom', short_name: 'GB', types: ['country', 'political'] },
            ],
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodePostcode('CF10 1AA');

      expect(result).toEqual({
        country: 'Wales',
        region: 'Cardiff',
      });
    });

    it('should handle Northern Ireland correctly as UK', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            address_components: [
              { long_name: 'Northern Ireland', short_name: 'Northern Ireland', types: ['administrative_area_level_1', 'political'] },
              { long_name: 'Belfast', short_name: 'Belfast', types: ['administrative_area_level_2', 'political'] },
              { long_name: 'United Kingdom', short_name: 'GB', types: ['country', 'political'] },
            ],
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodePostcode('BT1 1AA');

      expect(result).toEqual({
        country: 'Northern Ireland',
        region: 'Belfast',
      });
    });

    it('should return null when no address_components are present', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            address_components: [],
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodePostcode('SW1A 1AA');

      expect(result).toBeNull();
    });

    it('should return null when results array is empty', async () => {
      const mockResponse = {
        status: 'OK',
        results: [],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodePostcode('SW1A 1AA');

      expect(result).toBeNull();
    });

    it('should handle UK postcode without admin_level_2 or postal_town gracefully', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            address_components: [
              { long_name: 'England', short_name: 'England', types: ['administrative_area_level_1', 'political'] },
              { long_name: 'United Kingdom', short_name: 'GB', types: ['country', 'political'] },
            ],
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodePostcode('SW1A 1AA');

      expect(result).toEqual({
        country: 'England',
        region: undefined,
      });
    });

    it('should handle non-UK postcode without admin_level_1 gracefully', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            address_components: [
              { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
            ],
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocodePostcode('90001');

      expect(result).toEqual({
        country: 'United States',
        region: undefined,
      });
    });

    it('should properly encode postcode in URL', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'OK',
          results: [
            {
              address_components: [
                { long_name: 'England', short_name: 'England', types: ['administrative_area_level_1', 'political'] },
                { long_name: 'Greater London', short_name: 'Greater London', types: ['administrative_area_level_2', 'political'] },
                { long_name: 'United Kingdom', short_name: 'GB', types: ['country', 'political'] },
              ],
            },
          ],
        }),
      });

      await geocodePostcode('SW1A 1AA');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('address=SW1A%201AA'),
        expect.any(Object)
      );
    });
  });
});
