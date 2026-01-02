import * as cheerio from 'cheerio';
import { ScrapedPubData } from '../types/pub';

export async function scrapePubData(url: string): Promise<ScrapedPubData | null> {
  try {
    const html = await fetchPubPage(url);
    const name = extractPubName(html);
    
    if (!name) {
      console.warn(`Could not extract pub name from ${url}`);
      return null;
    }
    
    const id = extractIdFromUrl(url);
    
    return {
      id,
      name: name.trim(),
      url,
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
  
  // Try multiple selectors to find the pub name
  const selectors = [
    'h1.pub-name',
    'h1',
    '.pub-details h1',
    'title',
  ];
  
  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      let text = element.text().trim();
      
      // If using title tag, clean it up
      if (selector === 'title') {
        text = text.replace(/\s*\|\s*JD Wetherspoon.*$/i, '');
      }
      
      if (text) {
        return text;
      }
    }
  }
  
  return null;
}

function extractIdFromUrl(url: string): string {
  // Extract the last segment of the URL path as the ID
  // e.g., "https://www.jdwetherspoon.com/pubs/all-pubs/england/london/the-moon-under-water-leicester-square"
  // becomes "the-moon-under-water-leicester-square"
  const parts = url.split('/');
  return parts[parts.length - 1] || parts[parts.length - 2];
}
