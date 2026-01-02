import { XMLParser } from 'fast-xml-parser';

const SITEMAP_URL = 'https://www.jdwetherspoon.com/pubs-sitemap.xml';

export async function getSitemapUrls(): Promise<string[]> {
  try {
    const xml = await fetchSitemap();
    return parseSitemapXml(xml);
  } catch (error) {
    console.error('Error getting sitemap URLs:', error);
    throw error;
  }
}

async function fetchSitemap(): Promise<string> {
  const response = await fetch(SITEMAP_URL);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
  }
  
  return response.text();
}

function parseSitemapXml(xml: string): string[] {
  const parser = new XMLParser();
  const result = parser.parse(xml);
  
  if (!result.urlset || !result.urlset.url) {
    throw new Error('Invalid sitemap format: missing urlset or url elements');
  }
  
  const urls = Array.isArray(result.urlset.url) 
    ? result.urlset.url 
    : [result.urlset.url];
  
  return urls.map((entry: { loc: string }) => entry.loc).filter(Boolean);
}
