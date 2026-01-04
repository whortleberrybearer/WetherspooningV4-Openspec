import * as cheerio from 'cheerio';
import { randomUUID } from 'crypto';
import { ScrapedPubData, Position } from '../types/pub';
import { geocodePostcode } from './geocodingService';

export async function scrapePubData(url: string, imageUrl: string): Promise<ScrapedPubData | null> {
  try {
    const html = await fetchPubPage(url);
    let name = extractPubName(html);
    
    if (!name) {
      console.warn(`Could not extract pub name from ${url}`);
      return null;
    }
    
    const address = extractAddress(html);
    if (!address) {
      console.warn(`Could not extract address from ${url}`);
      return null;
    }
    
    const id = generatePubId();
    // Extract townCity first, passing the raw name and address
    const townCity = extractTownCity(url, name, address);
    
    // Clean the name by removing location suffix if it matches townCity
    name = cleanPubName(name, townCity);
    
    const position = extractPosition(html);
    const openState = extractOpenState(html);
    const isHotel = extractIsHotel(html);
    const inAirport = extractInAirport(html, address);
    const inTrainStation = extractInTrainStation(html);
    
    // Extract country and county
    let country: string | undefined;
    let county: string | undefined;
    
    const postcode = extractPostcode(address);
    if (postcode) {
      const geocodeResult = await geocodePostcode(postcode);
      if (geocodeResult) {
        country = geocodeResult.country;
        
        // Special cases: Use geocoding result for Greater London and Greater Manchester
        if (geocodeResult.county === 'Greater London' || geocodeResult.county === 'Greater Manchester') {
          county = geocodeResult.county;
        } else {
          // For other cases, use penultimate part of address
          county = extractCountyFromAddress(address) || undefined;
        }
      } else {
        console.warn(`Failed to geocode postcode: ${postcode}`);
        // Fallback to address parsing if geocoding fails
        county = extractCountyFromAddress(address) || undefined;
      }
    } else {
      console.warn(`No postcode found in address: ${address}`);
      // Fallback to address parsing if no postcode
      county = extractCountyFromAddress(address) || undefined;
    }
    
    return {
      id,
      name: name.trim(),
      url,
      imageUrl,
      address: address.trim(),
      townCity,
      country,
      county,
      position,
      openState,
      isHotel,
      inAirport,
      inTrainStation,
    };
  } catch (error) {
    console.error(`Error scraping pub ${url}:`, error);
    return null;
  }
}

async function fetchPubPage(url: string): Promise<string> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pub page: ${response.status} ${response.statusText}`);
  }
  
  return response.text();
}

function extractPubName(html: string): string | null {
  const $ = cheerio.load(html);
  
  // Use the specific selector from the C# function
  const headingNode = $('h1.wp-block-heading').first();
  
  if (headingNode.length === 0) {
    return null;
  }
  
  let text = headingNode.text().trim();
  
  // Decode HTML entities as per C# function
  text = text.replace(/&#038;/g, '&').replace(/&amp;/g, '&');
  
  return text || null;
}

function cleanPubName(name: string, townCity: string): string {
  // Some pub names include the location as a suffix separated by comma
  // e.g., "The Moon Under Water, Hounslow"
  // If the name contains a comma, check if the part after the comma matches townCity
  if (name.includes(',')) {
    const parts = name.split(',').map(part => part.trim());
    if (parts.length === 2) {
      // Compare ignoring case
      const suffix = parts[1].toLowerCase();
      const town = townCity.toLowerCase();
      
      // If the suffix matches the town/city, use only the first part
      if (suffix === town) {
        return parts[0];
      }
    }
  }
  
  return name;
}

function generatePubId(): string {
  // Generate a unique GUID for the pub
  return randomUUID();
}

function extractAddress(html: string): string | null {
  const $ = cheerio.load(html);
  
  // Select the address from the pub-address-inner div's span element
  const addressNode = $('div.pub-address-inner span').first();
  
  if (addressNode.length === 0) {
    return null;
  }
  
  return addressNode.text().trim();
}

/**
 * Extracts the postcode from an address string.
 * Assumes the postcode is the last component when split by commas.
 * 
 * @param address - The full address string (e.g., "123 High Street, London, SW1A 1AA")
 * @returns The extracted postcode or null if not found
 */
export function extractPostcode(address: string): string | null {
  if (!address) {
    return null;
  }
  
  const parts = address.split(',');
  if (parts.length === 0) {
    return null;
  }
  
  const lastPart = parts[parts.length - 1].trim();
  return lastPart || null;
}

/**
 * Extracts the county from an address by taking the penultimate (second-to-last) part.
 * Address parts are separated by commas.
 * 
 * Example: "59 Lagland Street, Poole, Dorset, BH15 1QD" -> "Dorset"
 * Example: "283–288 High Holborn, Holborn, Camden, WC1V 7HP" -> "Camden"
 * 
 * @param address - Full address string
 * @returns County name or null if address doesn't have enough parts
 */
export function extractCountyFromAddress(address: string): string | null {
  if (!address) {
    return null;
  }
  
  const parts = address.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  // Need at least 2 parts to get penultimate
  if (parts.length < 2) {
    return null;
  }
  
  // Return second-to-last part
  return parts[parts.length - 2];
}

function extractTownCity(url: string, name: string, address: string): string {
  let urlSlug = url.replace(/\/$/, '').split('/').pop() || '';
  
  // Remove trailing numbers and hyphens from URL slug (e.g., "emersons-green-bristol-2" -> "emersons-green-bristol")
  urlSlug = urlSlug.replace(/-\d+$/, '');
  
  // If name contains a comma, use only the part before the comma for slug generation
  // e.g., "The Moon Under Water, Hounslow" -> "The Moon Under Water"
  let baseName = name;
  if (name.includes(',')) {
    baseName = name.split(',')[0].trim();
  }
  
  // Generate slug from name to match URL format
  // Process: fullstops -> hyphens, other special chars removed, spaces -> hyphens, collapse multiple hyphens
  // e.g., "J.J. Moon's" -> "j.j. moon's" -> "j-j- moon-s" -> "j-j-moons" -> "j-j-moons"
  const nameSlug = baseName
    .toLowerCase()
    .replace(/\./g, '-')          // Replace fullstops with hyphens first
    .replace(/[^a-z0-9 -]/g, '')  // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Collapse multiple consecutive hyphens into one
    .replace(/^-+|-+$/g, '');     // Trim hyphens from start/end
  
  // Remove the name slug from the URL slug to get the location
  // Edge case: If the URL slug starts with "the-" but the name doesn't start with "The",
  // the nameSlug won't include "the-", so try removing "the-" + nameSlug first
  // Example: URL "the-sir-alec-rose-portsmouth", name "Sir Alec Rose" -> nameSlug "sir-alec-rose"
  let townSlug = urlSlug;
  if (urlSlug.startsWith('the-') && !nameSlug.startsWith('the-')) {
    townSlug = urlSlug.replace('the-' + nameSlug + '-', '');
    if (townSlug === urlSlug) {
      townSlug = urlSlug.replace('the-' + nameSlug, '');
    }
  }
  
  // If the edge case didn't apply, try removing nameSlug normally
  if (townSlug === urlSlug) {
    townSlug = urlSlug.replace(nameSlug + '-', '');
    if (townSlug === urlSlug) {
      // If that didn't work, try without trailing hyphen
      townSlug = urlSlug.replace(nameSlug, '');
    }
  }
  
  townSlug = townSlug.replace(/^-+|-+$/g, '');
  
  // For multi-word town names (with hyphens), use address-based matching
  // to get the exact formatting with proper hyphenation and capitalization
  if (townSlug.includes('-')) {
    // Split address by commas to get parts
    const addressParts = address.split(',').map(p => p.trim());
    
    // Remove all hyphens from townSlug for matching
    const townSlugNoHyphens = townSlug.replace(/-/g, '').toLowerCase();
    
    // Search each address part for a match
    for (const part of addressParts) {
      // Remove hyphens and spaces from the address part for comparison
      const partNormalized = part.replace(/[-\s]/g, '').toLowerCase();
      
      // If the slug matches this part (ignoring hyphens and spaces), use the original part
      if (partNormalized === townSlugNoHyphens) {
        return part;
      }
    }
  }
  
  // For single-word town names, just convert to title case
  return townSlug.charAt(0).toUpperCase() + townSlug.slice(1);
}

function extractPosition(html: string): Position | null {
  const $ = cheerio.load(html);
  
  // Select the map image and extract the center parameter from src
  const mapNode = $('img.pub-map').first();
  
  if (mapNode.length === 0) {
    console.warn('Map node not found in HTML document');
    return null;
  }
  
  const src = mapNode.attr('src');
  if (!src) {
    return null;
  }
  
  // Extract center parameter: center=51.46148,-0.44538
  // Handle both regular & and &#038; encoded ampersands
  const centerMatch = src.match(/center=([0-9.-]+),([0-9.-]+)/);
  
  if (!centerMatch) {
    return null;
  }
  
  return {
    lat: parseFloat(centerMatch[1]),
    lng: parseFloat(centerMatch[2]),
  };
}

function extractOpenState(html: string): string {
  const $ = cheerio.load(html);
  
  // Select the open status paragraph
  const openStatusNode = $('p.open-status').first();
  
  if (openStatusNode.length === 0) {
    console.warn('Open status node not found in HTML document');
    return 'Unknown';
  }
  
  const statusText = openStatusNode.text().trim();
  
  if (statusText.toLowerCase() === 'opening soon') {
    // Look for opening date in sibling paragraph
    const openingDateNode = $('p.opening-closing-time').not('.open-status').first();
    
    if (openingDateNode.length > 0) {
      const dateText = openingDateNode.text().trim();
      // Try to parse the date
      const date = new Date(dateText);
      if (!isNaN(date.getTime())) {
        // Format as dd/MM/yyyy
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `Opening ${day}/${month}/${year}`;
      }
    }
    return 'Opening Soon';
  } else if (statusText.toLowerCase() === 'closed temporarily') {
    return 'Temporary Closed';
  }
  
  // Default to Open for all other cases
  return 'Open';
}

function extractIsHotel(html: string): boolean {
  const $ = cheerio.load(html);
  
  // Select all facility spans and check for "Accommodation"
  const facilityNodes = $('div.pub-facilities-list span');
  
  for (let i = 0; i < facilityNodes.length; i++) {
    const text = $(facilityNodes[i]).text().trim();
    if (text.toLowerCase() === 'accommodation') {
      return true;
    }
  }
  
  return false;
}

function extractInAirport(html: string, address: string): boolean {
  const $ = cheerio.load(html);
  
  // Check if address contains "Airport"
  if (address.toLowerCase().includes('airport')) {
    return true;
  }
  
  // Select all facility spans and check for "Airport Pub" or "Airport after security"
  const facilityNodes = $('div.pub-facilities-list span');
  
  for (let i = 0; i < facilityNodes.length; i++) {
    const text = $(facilityNodes[i]).text().trim().toLowerCase();
    if (text === 'airport pub' || text === 'airport after security') {
      return true;
    }
  }
  
  return false;
}

function extractInTrainStation(html: string): boolean {
  const $ = cheerio.load(html);
  
  // Select all facility spans and check for "Train Station"
  const facilityNodes = $('div.pub-facilities-list span');
  
  for (let i = 0; i < facilityNodes.length; i++) {
    const text = $(facilityNodes[i]).text().trim();
    if (text.toLowerCase() === 'train station') {
      return true;
    }
  }
  
  return false;
}
