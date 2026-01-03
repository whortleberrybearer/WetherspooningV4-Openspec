import { scrapePubData, extractPostcode } from '../../src/services/pubScraperService';
import * as geocodingService from '../../src/services/geocodingService';
import * as fs from 'fs';
import * as path from 'path';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the geocoding service
jest.mock('../../src/services/geocodingService');

describe('pubScraperService', () => {
  const samplePubHtml = fs.readFileSync(
    path.join(__dirname, '../fixtures/star-light-hounslow-sample.html'),
    'utf-8'
  );

  const redRocksHtml = fs.readFileSync(
    path.join(__dirname, '../fixtures/the-red-rocks-exmouth-sample.html'),
    'utf-8'
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scrapePubData', () => {
    it('should scrape pub name successfully', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/star-light-hounslow/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/7649-feature.png';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => samplePubHtml,
      });

      // Mock geocoding to return null (API not configured or failed)
      (geocodingService.geocodePostcode as jest.Mock).mockResolvedValue(null);

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('star-light-hounslow');
      expect(result?.name).toBe('Star Light');
      expect(result?.url).toBe(url);
      expect(result?.imageUrl).toBe(imageUrl);
      expect(result?.address).toBe('Heathrow Airport, Terminal 4 (after security) , Hounslow, Middlesex, TW6 3XA');
      expect(result?.townCity).toBe('Hounslow');
      expect(result?.position).toEqual({ lat: 51.46148, lng: -0.44538 });
      expect(result?.openState).toBe('Open');
      expect(result?.isHotel).toBe(false);
      expect(result?.inAirport).toBe(true); // Address contains 'Heathrow Airport'
      expect(result?.inTrainStation).toBe(false);
      expect(result?.country).toBeUndefined();
      expect(result?.region).toBeUndefined();
    });

    it('should include country and region when geocoding succeeds', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/star-light-hounslow/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/7649-feature.png';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => samplePubHtml,
      });

      // Mock successful geocoding
      (geocodingService.geocodePostcode as jest.Mock).mockResolvedValue({
        country: 'England',
        region: 'Greater London',
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.country).toBe('England');
      expect(result?.region).toBe('Greater London');
      expect(geocodingService.geocodePostcode).toHaveBeenCalledWith('TW6 3XA');
    });

    it('should handle gracefully when geocoding fails', async () => {
      const htmlWithAddress = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Test Pub</h1>
        <div class="pub-address-inner"><span>123 Test Street, Test City, XX9 9XX</span></div>
      </body></html>`;
      const url = 'https://www.jdwetherspoon.com/pubs/test-pub/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithAddress,
      });

      // Mock geocoding to fail
      (geocodingService.geocodePostcode as jest.Mock).mockResolvedValue(null);

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.country).toBeUndefined();
      expect(result?.region).toBeUndefined();
      // Geocoding should be called but return null
      expect(geocodingService.geocodePostcode).toHaveBeenCalledWith('XX9 9XX');
    });

    it('should extract ID from URL correctly', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/the-standing-order/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => samplePubHtml,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.id).toBe('the-standing-order');
    });

    it('should handle HTML entities in pub name', async () => {
      const htmlWithEntities = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">The Cock &#038; Bull</h1>
        <div class="pub-address-inner"><span>123 Test St, London</span></div>
      </body></html>`;
      const url = 'https://www.jdwetherspoon.com/pubs/the-cock-and-bull-london/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithEntities,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.name).toBe('The Cock & Bull');
    });

    it('should handle &amp; HTML entity', async () => {
      const htmlWithEntities = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">The Crown &amp; Anchor</h1>
        <div class="pub-address-inner"><span>456 Test Ave, Manchester</span></div>
      </body></html>`;
      const url = 'https://www.jdwetherspoon.com/pubs/the-crown-and-anchor-manchester/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithEntities,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.name).toBe('The Crown & Anchor');
    });

    it('should strip location suffix from pub name when separated by comma', async () => {
      const htmlWithLocationSuffix = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">The Moon Under Water, Hounslow</h1>
        <div class="pub-address-inner"><span>123 High Street, Hounslow</span></div>
      </body></html>`;
      const url = 'https://www.jdwetherspoon.com/pubs/the-moon-under-water-hounslow/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithLocationSuffix,
      });

      const result = await scrapePubData(url, imageUrl);

      // Name should have location suffix removed
      expect(result?.name).toBe('The Moon Under Water');
      expect(result?.townCity).toBe('Hounslow');
    });

    it('should handle pubs with fullstops in name (J.J. Moon\'s, Wembley)', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/j-j-moons-wembley/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/1234-feature.png';
      const jjMoonsHtml = fs.readFileSync(
        path.join(__dirname, '../fixtures/j-j-moons-wembley-sample.html'),
        'utf-8'
      );
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => jjMoonsHtml,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('j-j-moons-wembley');
      expect(result?.name).toBe('J.J. Moon\'s');
      expect(result?.townCity).toBe('Wembley');
      expect(result?.url).toBe(url);
      expect(result?.imageUrl).toBe(imageUrl);
      expect(result?.address).toBe('397 High Road, Wembley, Middlesex, HA9 6AA');
      expect(result?.position).toEqual({ lat: 51.5525, lng: -0.2962 });
      expect(result?.openState).toBe('Open');
      expect(result?.isHotel).toBe(false);
      expect(result?.inAirport).toBe(false);
      expect(result?.inTrainStation).toBe(false);
    });

    it('should handle pubs with trailing numbers in URL (Emersons Green, Bristol)', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/emersons-green-bristol-2/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/5678-feature.png';
      const emersonsGreenHtml = fs.readFileSync(
        path.join(__dirname, '../fixtures/emersons-green-bristol-sample.html'),
        'utf-8'
      );
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => emersonsGreenHtml,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('emersons-green-bristol-2');
      expect(result?.name).toBe('Emersons Green');
      expect(result?.townCity).toBe('Bristol');
      expect(result?.url).toBe(url);
      expect(result?.imageUrl).toBe(imageUrl);
      expect(result?.address).toBe('Westerleigh Road, Emersons Green, Bristol, BS16 7AN');
      expect(result?.position).toEqual({ lat: 51.5092, lng: -2.4918 });
      expect(result?.openState).toBe('Open');
      expect(result?.isHotel).toBe(false);
      expect(result?.inAirport).toBe(false);
      expect(result?.inTrainStation).toBe(false);
    });

    it('should handle townCity with "under" (Ashton-under-Lyne)', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/the-ash-tree-ashton-under-lyne/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/9012-feature.png';
      const ashtonUnderLyneHtml = fs.readFileSync(
        path.join(__dirname, '../fixtures/the-ash-tree-ashton-under-lyne-sample.html'),
        'utf-8'
      );
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => ashtonUnderLyneHtml,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('The Ash Tree');
      expect(result?.townCity).toBe('Ashton-under-Lyne');
    });

    it('should handle townCity with "of" (City of London)', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/the-crosse-keys-city-of-london/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/3456-feature.png';
      const cityOfLondonHtml = fs.readFileSync(
        path.join(__dirname, '../fixtures/the-crosse-keys-city-of-london-sample.html'),
        'utf-8'
      );
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => cityOfLondonHtml,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('The Crosse Keys');
      expect(result?.townCity).toBe('City of London');
    });

    it('should handle townCity with "upon" (Kingston upon Thames)', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/the-druids-head-kingston-upon-thames/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/7890-feature.png';
      const kingstonUponThamesHtml = fs.readFileSync(
        path.join(__dirname, '../fixtures/the-druids-head-kingston-upon-thames-sample.html'),
        'utf-8'
      );
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => kingstonUponThamesHtml,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('The Druid\'s Head');
      expect(result?.townCity).toBe('Kingston upon Thames');
    });

    it('should handle townCity with "on" (Stockton-on-Tees)', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/the-thomas-sheraton-stockton-on-tees/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/1357-feature.png';
      const stocktonOnTeesHtml = fs.readFileSync(
        path.join(__dirname, '../fixtures/the-thomas-sheraton-stockton-on-tees-sample.html'),
        'utf-8'
      );
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => stocktonOnTeesHtml,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('The Thomas Sheraton');
      expect(result?.townCity).toBe('Stockton-on-Tees');
    });

    it('should handle townCity with "in" (Barrow-in-Furness)', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/the-furness-railway-barrow-in-furness/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/2468-feature.png';
      const barrowInFurnessHtml = fs.readFileSync(
        path.join(__dirname, '../fixtures/the-furness-railway-barrow-in-furness-sample.html'),
        'utf-8'
      );
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => barrowInFurnessHtml,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('The Furness Railway');
      expect(result?.townCity).toBe('Barrow-in-Furness');
    });

    it('should return null when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await scrapePubData('https://example.com/pub', 'https://example.com/image.jpg');

      expect(result).toBeNull();
    });

    it('should return null when name cannot be extracted', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => '<html><body><p>No name here</p></body></html>',
      });

      const result = await scrapePubData('https://example.com/pub', imageUrl);

      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await scrapePubData('https://example.com/pub', 'https://example.com/image.jpg');

      expect(result).toBeNull();
    });

    it('should trim whitespace from pub name', async () => {
      const htmlWithWhitespace = `<html><body>
        <h1 class="wp-block-heading">  Star Light  </h1>
        <div class="pub-address-inner"><span>789 Test Rd, Birmingham</span></div>
      </body></html>`;
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithWhitespace,
      });

      const result = await scrapePubData('https://example.com/pubs/star-light-birmingham/', imageUrl);

      expect(result?.name).toBe('Star Light');
    });

    it('should extract townCity by removing name slug from URL', async () => {
      const htmlWithName = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Star Light</h1>
        <div class="pub-address-inner"><span>Heathrow Airport, Terminal 4, Hounslow</span></div>
      </body></html>`;
      const url = 'https://www.jdwetherspoon.com/pubs/star-light-hounslow/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithName,
      });

      const result = await scrapePubData(url, imageUrl);

      // URL slug: star-light-hounslow
      // Name slug: star-light
      // Town slug: hounslow
      expect(result?.townCity).toBe('Hounslow');
    });

    it('should extract townCity when pub name contains apostrophe', async () => {
      const htmlWithApostrophe = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Luther's Bar</h1>
        <div class="pub-address-inner"><span>123 Grey Street, Newcastle upon Tyne</span></div>
      </body></html>`;
      const url = 'https://www.jdwetherspoon.com/pubs/luthers-bar-newcastle-upon-tyne/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithApostrophe,
      });

      const result = await scrapePubData(url, imageUrl);

      // URL slug: luthers-bar-newcastle-upon-tyne
      // Name: Luther's Bar (apostrophe is removed in URL, not replaced)
      // Name slug should be: luthers-bar
      // Town slug: newcastle-upon-tyne
      expect(result?.name).toBe("Luther's Bar");
      expect(result?.townCity).toBe('Newcastle upon Tyne');
    });

    it('should return null when address cannot be extracted', async () => {
      const htmlWithoutAddress = '<html><body><h1 class="wp-block-heading">Star Light</h1></body></html>';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithoutAddress,
      });

      const result = await scrapePubData('https://example.com/pub', imageUrl);

      expect(result).toBeNull();
    });

    it('should extract position from map image', async () => {
      const htmlWithMap = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Test Pub</h1>
        <div class="pub-address-inner"><span>123 Test St</span></div>
        <img class="pub-map" src="https://snapshot.apple-mapkit.com/api/v1/snapshot?center=51.5074,-0.1278&#038;z=13" />
        <p class="open-status">Open</p>
      </body></html>`;
      const url = 'https://example.com/pubs/test-pub-london/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithMap,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.position).toEqual({ lat: 51.5074, lng: -0.1278 });
    });

    it('should return null position when map not found', async () => {
      const htmlWithoutMap = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Test Pub</h1>
        <div class="pub-address-inner"><span>123 Test St</span></div>
        <p class="open-status">Open</p>
      </body></html>`;
      const url = 'https://example.com/pubs/test-pub/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithoutMap,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.position).toBeNull();
    });

    it('should extract openState as Open', async () => {
      const htmlWithOpen = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Test Pub</h1>
        <div class="pub-address-inner"><span>123 Test St</span></div>
        <p class="open-status">Open</p>
      </body></html>`;
      const url = 'https://example.com/pubs/test-pub/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithOpen,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.openState).toBe('Open');
    });

    it('should extract openState as Opening Soon', async () => {
      const htmlWithOpeningSoon = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Test Pub</h1>
        <div class="pub-address-inner"><span>123 Test St</span></div>
        <p class="open-status">Opening soon</p>
      </body></html>`;
      const url = 'https://example.com/pubs/test-pub/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithOpeningSoon,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.openState).toBe('Opening Soon');
    });

    it('should extract openState as Temporary Closed', async () => {
      const htmlWithClosed = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Test Pub</h1>
        <div class="pub-address-inner"><span>123 Test St</span></div>
        <p class="open-status">Closed temporarily</p>
      </body></html>`;
      const url = 'https://example.com/pubs/test-pub/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithClosed,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.openState).toBe('Temporary Closed');
    });

    it('should extract isHotel as true when Accommodation facility exists', async () => {
      const htmlWithHotel = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Test Pub</h1>
        <div class="pub-address-inner"><span>123 Test St</span></div>
        <div class="pub-facilities-list">
          <span>Accommodation</span>
          <span>Beer Garden</span>
        </div>
      </body></html>`;
      const url = 'https://example.com/pubs/test-pub/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithHotel,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.isHotel).toBe(true);
    });

    it('should extract inAirport as true when Airport Pub facility exists', async () => {
      const htmlWithAirport = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Test Pub</h1>
        <div class="pub-address-inner"><span>123 Test St, London</span></div>
        <div class="pub-facilities-list">
          <span>Airport Pub</span>
          <span>Wi-Fi</span>
        </div>
      </body></html>`;
      const url = 'https://example.com/pubs/test-pub/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithAirport,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.inAirport).toBe(true);
    });

    it('should extract inTrainStation as true when Train Station facility exists', async () => {
      const htmlWithTrainStation = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Test Pub</h1>
        <div class="pub-address-inner"><span>123 Test St</span></div>
        <div class="pub-facilities-list">
          <span>Train Station</span>
          <span>Parking</span>
        </div>
      </body></html>`;
      const url = 'https://example.com/pubs/test-pub/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithTrainStation,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.inTrainStation).toBe(true);
    });

    it('should extract all facility flags as false when no facilities exist', async () => {
      const htmlWithoutFacilities = `<!DOCTYPE html><html><body>
        <h1 class="wp-block-heading">Test Pub</h1>
        <div class="pub-address-inner"><span>123 Test St</span></div>
      </body></html>`;
      const url = 'https://example.com/pubs/test-pub/';
      const imageUrl = 'https://example.com/image.jpg';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => htmlWithoutFacilities,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result?.isHotel).toBe(false);
      expect(result?.inAirport).toBe(false);
      expect(result?.inTrainStation).toBe(false);
    });

    it('should handle special townCity case with "cum" (Chorlton-cum-Hardy)', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/the-royal-oak-chorlton-cum-hardy/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/1234-feature.png';
      const chorltonCumHardyHtml = await fs.promises.readFile(
        path.join(__dirname, '../fixtures/the-royal-oak-chorlton-cum-hardy-sample.html'),
        'utf-8'
      );
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => chorltonCumHardyHtml,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.townCity).toBe('Chorlton-cum-Hardy');
      expect(result?.name).toBe('The Royal Oak');
    });

    it('should handle pubs without map location (The Red Rocks Exmouth)', async () => {
      const url = 'https://www.jdwetherspoon.com/pubs/the-red-rocks-exmouth/';
      const imageUrl = 'https://www.jdwetherspoon.com/wp-content/uploads/2024/06/5667-feature.png';
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: async () => redRocksHtml,
      });

      const result = await scrapePubData(url, imageUrl);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('the-red-rocks-exmouth');
      expect(result?.name).toBe('The Red Rocks');
      expect(result?.url).toBe(url);
      expect(result?.imageUrl).toBe(imageUrl);
      expect(result?.townCity).toBe('Exmouth');
      expect(result?.position).toBeNull(); // This pub does not have a map location in the HTML
      expect(result?.address).toBe('Haven, Devon Cliffs Holiday Park, Sandy Bay, Exmouth, Devon, EX8 5BT');
      expect(result?.openState).toBe('Open');
      expect(result?.isHotel).toBe(false);
      expect(result?.inAirport).toBe(false);
      expect(result?.inTrainStation).toBe(false);
    });
  });

  describe('extractPostcode', () => {
    it('should extract postcode from standard UK address', () => {
      const address = '123 High Street, London, SW1A 1AA';
      const result = extractPostcode(address);
      expect(result).toBe('SW1A 1AA');
    });

    it('should extract postcode from address with multiple commas', () => {
      const address = 'Heathrow Airport, Terminal 4 (after security), Hounslow, Middlesex, TW6 3XA';
      const result = extractPostcode(address);
      expect(result).toBe('TW6 3XA');
    });

    it('should return null for address without commas', () => {
      const address = 'SingleLineAddress';
      const result = extractPostcode(address);
      expect(result).toBe('SingleLineAddress');
    });

    it('should return null for empty address', () => {
      const address = '';
      const result = extractPostcode(address);
      expect(result).toBeNull();
    });

    it('should handle address with trailing whitespace', () => {
      const address = '123 High Street, London,  SW1A 1AA  ';
      const result = extractPostcode(address);
      expect(result).toBe('SW1A 1AA');
    });

    it('should handle address with single comma', () => {
      const address = '123 High Street, SW1A 1AA';
      const result = extractPostcode(address);
      expect(result).toBe('SW1A 1AA');
    });

    it('should handle address ending with comma', () => {
      const address = '123 High Street,';
      const result = extractPostcode(address);
      expect(result).toBeNull();
    });

    it('should extract postcode from real example (Star Light Hounslow)', () => {
      const address = 'Heathrow Airport, Terminal 4 (after security) , Hounslow, Middlesex, TW6 3XA';
      const result = extractPostcode(address);
      expect(result).toBe('TW6 3XA');
    });

    it('should extract postcode from real example (J.J. Moon\'s Wembley)', () => {
      const address = '397 High Road, Wembley, Middlesex, HA9 6AA';
      const result = extractPostcode(address);
      expect(result).toBe('HA9 6AA');
    });

    it('should extract postcode from real example (The Red Rocks Exmouth)', () => {
      const address = 'Haven, Devon Cliffs Holiday Park, Sandy Bay, Exmouth, Devon, EX8 5BT';
      const result = extractPostcode(address);
      expect(result).toBe('EX8 5BT');
    });
  });
});
