import * as cheerio from 'cheerio';
import { ScrapedPubData } from '../types/pub';

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
    
    return {
      id,
      name: name.trim(),
      url,
      imageUrl,
      address: address.trim(),
      townCity,
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
  
  // Generate slug from name (convert to lowercase, replace spaces/special chars with hyphens)
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
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
