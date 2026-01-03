/**
 * Geocoding Service
 * 
 * Provides geocoding functionality using Google Geocoding API to extract
 * country and region information from postcodes.
 */

export interface GeocodeResult {
  country: string | undefined;
  county: string | undefined;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodeResponse {
  results: Array<{
    address_components: AddressComponent[];
  }>;
  status: string;
}

/**
 * Geocodes a postcode to extract country and county information.
 * 
 * @param postcode - The postcode to geocode (e.g., "M1 1AA")
 * @returns GeocodeResult with country and county, or null if geocoding fails
 */
export async function geocodePostcode(postcode: string): Promise<GeocodeResult | null> {
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;

  if (!apiKey) {
    console.error('Google Geocoding API key not configured');
    return null;
  }

  if (!postcode || postcode.trim() === '') {
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(postcode)}&key=${apiKey}`;
    
    // Set up timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Geocoding API error (${response.status}) for postcode: ${postcode}`);
      return null;
    }

    const data: GoogleGeocodeResponse = await response.json();

    if (data.status === 'ZERO_RESULTS') {
      return null;
    }

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn(`Geocoding API returned status ${data.status} for postcode: ${postcode}`);
      return null;
    }

    const addressComponents = data.results[0].address_components;
    const result = parseAddressComponents(addressComponents);
    
    // Return null if parsing failed to extract valid data
    if (!result.country && !result.county) {
      return null;
    }
    
    return result;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`Geocoding API timeout for postcode: ${postcode}`);
    } else {
      console.warn(`Geocoding API error for postcode: ${postcode}`, error.message);
    }
    return null;
  }
}

/**
 * Parses Google Geocoding API address components to extract country and county.
 * 
 * For UK addresses:
 * - country = administrative_area_level_1 (England, Scotland, Wales, Northern Ireland)
 * - county = administrative_area_level_2 OR postal_town (fallback)
 * 
 * For non-UK addresses:
 * - country = country component
 * - county = administrative_area_level_1
 * 
 * @param addressComponents - Array of address components from Google Geocoding API
 * @returns GeocodeResult with extracted country and county
 */
export function parseAddressComponents(components: AddressComponent[]): GeocodeResult {
  if (!components || components.length === 0) {
    return { country: undefined, county: undefined };
  }

  // Find the country component
  const countryComponent = components.find(c => c.types.includes('country'));
  
  if (!countryComponent) {
    return { country: undefined, county: undefined };
  }

  const isUK = countryComponent.short_name === 'GB';

  if (isUK) {
    // For UK: country is admin_level_1, county is admin_level_2 or postal_town
    const adminLevel1 = components.find(c => c.types.includes('administrative_area_level_1'));
    const adminLevel2 = components.find(c => c.types.includes('administrative_area_level_2'));
    const postalTown = components.find(c => c.types.includes('postal_town'));

    const country = adminLevel1?.long_name;
    const county = adminLevel2?.long_name || postalTown?.long_name;

    return { country, county };
  } else {
    // For non-UK: country is country, county is admin_level_1
    const adminLevel1 = components.find(c => c.types.includes('administrative_area_level_1'));

    const country = countryComponent.long_name;
    const county = adminLevel1?.long_name;

    return { country, county };
  }
}
