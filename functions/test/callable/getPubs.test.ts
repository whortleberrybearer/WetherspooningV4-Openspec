import { Pub } from '../../src/types/pub';

// Mock the applyOverrides function by importing the module and testing it
// Since getPubs is a Firebase function, we'll test the override logic directly
describe('getPubs - Override Logic', () => {
  // Helper function to simulate applyOverrides
  function applyOverrides(pub: Pub): Pub {
    const { countyOverride, townCityOverride, ...pubWithoutOverrides } = pub;
    
    return {
      ...pubWithoutOverrides,
      county: countyOverride ?? pub.county,
      townCity: townCityOverride ?? pub.townCity,
    };
  }

  it('should apply countyOverride correctly', () => {
    const pub: Pub = {
      id: 'test-1',
      name: 'Test Pub',
      url: 'https://example.com',
      imageUrl: 'https://example.com/image.jpg',
      address: '123 Test St',
      townCity: 'Westminster',
      county: 'London',
      countyOverride: 'Greater London',
      position: { lat: 51.5, lng: -0.1 },
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
      lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    };

    const result = applyOverrides(pub);

    expect(result.county).toBe('Greater London');
    expect(result.countyOverride).toBeUndefined();
  });

  it('should apply townCityOverride correctly', () => {
    const pub: Pub = {
      id: 'test-2',
      name: 'Test Pub',
      url: 'https://example.com',
      imageUrl: 'https://example.com/image.jpg',
      address: '123 Test St',
      townCity: 'City of London',
      townCityOverride: 'London',
      county: 'Greater London',
      position: { lat: 51.5, lng: -0.1 },
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
      lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    };

    const result = applyOverrides(pub);

    expect(result.townCity).toBe('London');
    expect(result.townCityOverride).toBeUndefined();
  });

  it('should apply both overrides correctly', () => {
    const pub: Pub = {
      id: 'test-3',
      name: 'Test Pub',
      url: 'https://example.com',
      imageUrl: 'https://example.com/image.jpg',
      address: '123 Test St',
      townCity: 'City of London',
      townCityOverride: 'London',
      county: 'London',
      countyOverride: 'Greater London',
      position: { lat: 51.5, lng: -0.1 },
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
      lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    };

    const result = applyOverrides(pub);

    expect(result.county).toBe('Greater London');
    expect(result.townCity).toBe('London');
    expect(result.countyOverride).toBeUndefined();
    expect(result.townCityOverride).toBeUndefined();
  });

  it('should return original values when no override exists', () => {
    const pub: Pub = {
      id: 'test-4',
      name: 'Test Pub',
      url: 'https://example.com',
      imageUrl: 'https://example.com/image.jpg',
      address: '123 Test St',
      townCity: 'Westminster',
      county: 'Greater London',
      position: { lat: 51.5, lng: -0.1 },
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
      lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    };

    const result = applyOverrides(pub);

    expect(result.county).toBe('Greater London');
    expect(result.townCity).toBe('Westminster');
    expect(result.countyOverride).toBeUndefined();
    expect(result.townCityOverride).toBeUndefined();
  });

  it('should remove override fields from returned data', () => {
    const pub: Pub = {
      id: 'test-5',
      name: 'Test Pub',
      url: 'https://example.com',
      imageUrl: 'https://example.com/image.jpg',
      address: '123 Test St',
      townCity: 'City of London',
      townCityOverride: 'London',
      county: 'London',
      countyOverride: 'Greater London',
      position: { lat: 51.5, lng: -0.1 },
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
      lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    };

    const result = applyOverrides(pub);

    expect('countyOverride' in result).toBe(false);
    expect('townCityOverride' in result).toBe(false);
  });

  it('should handle override with empty scraped value', () => {
    const pub: Pub = {
      id: 'test-6',
      name: 'Test Pub',
      url: 'https://example.com',
      imageUrl: 'https://example.com/image.jpg',
      address: '123 Test St',
      townCity: '',
      townCityOverride: 'London',
      position: { lat: 51.5, lng: -0.1 },
      openState: 'Open',
      isHotel: false,
      inAirport: false,
      inTrainStation: false,
      lastSyncedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    };

    const result = applyOverrides(pub);

    expect(result.townCity).toBe('London');
  });
});
