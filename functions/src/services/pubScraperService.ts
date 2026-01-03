import * as cheerio from 'cheerio';
import { ScrapedPubData, Position } from '../types/pub';

export async function scrapePubData(url: string, imageUrl: string): Promise<ScrapedPubData | null> {
  try {
    const html = await fetchPubPage(url);
    const name = extractPubName(html);
    
    if (!name) {
      console.warn(`Could not extract pub name from ${url}`);
      return null;
    }
    
    const address = extractAddress(html);
    if (!address) {
      console.warn(`Could not extract address from ${url}`);
      return null;
    }
    
    const id = extractIdFromUrl(url);
    const townCity = extractTownCity(url, name);
    const position = extractPosition(html);
    const openState = extractOpenState(html);
    const isHotel = extractIsHotel(html);
    const inAirport = extractInAirport(html, address);
    const inTrainStation = extractInTrainStation(html);
    
    return {
      id,
      name: name.trim(),
      url,
      imageUrl,
      address: address.trim(),
      townCity,
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

function extractIdFromUrl(url: string): string {
  // Extract the last segment of the URL path as the ID
  // e.g., "https://www.jdwetherspoon.com/pubs/star-light-hounslow/"
  // becomes "star-light-hounslow"
  const parts = url.replace(/\/$/, '').split('/');
  return parts[parts.length - 1] || parts[parts.length - 2];
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

function extractTownCity(url: string, name: string): string {
  const urlSlug = url.replace(/\/$/, '').split('/').pop() || '';
  
  // Generate slug from name (remove non-alphanumeric except spaces, then replace spaces with hyphens)
  // This matches how URLs are typically created (apostrophes removed, not replaced)
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')  // Remove all non-alphanumeric characters except spaces
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '');     // Trim hyphens from start/end
  
  // Remove the name slug from the URL slug to get the location
  // Try removing nameSlug with trailing hyphen first, then without
  let townSlug = urlSlug.replace(nameSlug + '-', '');
  if (townSlug === urlSlug) {
    // If that didn't work, try without trailing hyphen
    townSlug = urlSlug.replace(nameSlug, '');
  }
  townSlug = townSlug.replace(/^-+|-+$/g, '');
  
  // Convert to title case
  return townSlug
    .split('-')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
