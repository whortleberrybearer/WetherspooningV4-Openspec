// Generate 100 realistic Wetherspoon pubs for seed data
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Sample Wetherspoon pub images
const wetherspoonImages = [
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/03/5243-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/6335-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/185-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/03/246-feature.jpg",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/6255-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/7426-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/5647-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/280-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/5504-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/1040-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/2520-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/03/176-feature.jpg",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/91-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/03/5285-feature.jpg",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/42-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/5480-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/541-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/1233-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/89-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/27-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/20-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/39-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/5-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/7087-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/6919-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/7381-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/03/2194-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/04/7905-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/03/6041-feature.png",
  "https://www.jdwetherspoon.com/wp-content/uploads/2024/06/438-feature.png"
];

// UK postcode patterns by region
const postcodePatterns = {
  "Greater Manchester": ["M", "OL", "BL", "SK", "WN"],
  "Greater London": ["E", "EC", "N", "NW", "SE", "SW", "W", "WC"],
  "West Midlands": ["B", "CV", "DY", "WS", "WV"],
  "West Yorkshire": ["LS", "BD", "HX", "WF"],
  "Merseyside": ["L", "CH", "WA"],
  "Tyne and Wear": ["NE", "SR", "DH"],
  "Bristol": ["BS"],
  "South Yorkshire": ["S", "DN", "S"],
  "Leicestershire": ["LE"],
  "Nottinghamshire": ["NG"],
  "Cambridgeshire": ["CB", "PE"],
  "Hampshire": ["SO", "PO", "GU"],
  "East Sussex": ["BN"],
  "Oxfordshire": ["OX"],
  "North Yorkshire": ["YO", "HG", "DL"],
  "Devon": ["EX", "PL", "TQ"],
  "Norfolk": ["NR"],
  "Kent": ["CT", "ME", "TN"],
  "Edinburgh": ["EH"],
  "Glasgow": ["G"],
  "Aberdeenshire": ["AB"],
  "Dundee": ["DD"],
  "Highland": ["IV"],
  "Cardiff": ["CF"],
  "Swansea": ["SA"],
  "Newport": ["NP"],
  "Wrexham": ["LL"],
  "County Antrim": ["BT"],
  "County Londonderry": ["BT"]
};

function generatePostcode(county) {
  const patterns = postcodePatterns[county] || ["XX"];
  const prefix = patterns[Math.floor(Math.random() * patterns.length)];
  const area = Math.floor(Math.random() * 99) + 1;
  const sector = Math.floor(Math.random() * 9) + 1;
  const unit = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
               String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${prefix}${area} ${sector}${unit}`;
}

function getOpenState(index) {
  // Distribute opening states:
  // 70% Open, 10% Closed, 8% Temporary Closed, 5% Opening Soon, 4% Opening [date], 3% Reopening [date]
  const rand = Math.random();
  
  if (rand < 0.70) return "Open";
  if (rand < 0.80) return "Closed";
  if (rand < 0.88) return "Temporary Closed";
  if (rand < 0.93) return "Opening Soon";
  if (rand < 0.97) {
    // Opening with specific date (next 1-30 days)
    const daysAhead = Math.floor(Math.random() * 30) + 1;
    const openingDate = new Date(2026, 0, 9 + daysAhead); // January 9, 2026 + days
    const day = String(openingDate.getDate()).padStart(2, '0');
    const month = String(openingDate.getMonth() + 1).padStart(2, '0');
    const year = openingDate.getFullYear();
    return `Opening ${day}/${month}/${year}`;
  }
  
  // Reopening with specific date (next 1-30 days)
  const daysAhead = Math.floor(Math.random() * 30) + 1;
  const reopeningDate = new Date(2026, 0, 9 + daysAhead);
  const day = String(reopeningDate.getDate()).padStart(2, '0');
  const month = String(reopeningDate.getMonth() + 1).padStart(2, '0');
  const year = reopeningDate.getFullYear();
  return `Reopening ${day}/${month}/${year}`;
}

function getImageUrl(openState, imageIndex) {
  // Closed pubs never have images
  if (openState === "Closed") {
    return "";
  }
  
  // Open pubs: 70% chance of having an image
  // Other states: 50% chance
  const threshold = openState === "Open" ? 0.7 : 0.5;
  if (Math.random() < threshold) {
    return wetherspoonImages[imageIndex % wetherspoonImages.length];
  }
  
  return "";
}

// UK cities and towns with realistic coordinates
const locations = [
  // England - Major Cities
  { name: "Manchester", county: "Greater Manchester", region: "North West England", country: "England", lat: 53.4808, lng: -2.2426 },
  { name: "London", county: "Greater London", region: "London", country: "England", lat: 51.5074, lng: -0.1278 },
  { name: "Birmingham", county: "West Midlands", region: "West Midlands", country: "England", lat: 52.4862, lng: -1.8904 },
  { name: "Leeds", county: "West Yorkshire", region: "Yorkshire and the Humber", country: "England", lat: 53.8008, lng: -1.5491 },
  { name: "Liverpool", county: "Merseyside", region: "North West England", country: "England", lat: 53.4084, lng: -2.9916 },
  { name: "Newcastle", county: "Tyne and Wear", region: "North East England", country: "England", lat: 54.9783, lng: -1.6178 },
  { name: "Bristol", county: "Bristol", region: "South West England", country: "England", lat: 51.4545, lng: -2.5879 },
  { name: "Sheffield", county: "South Yorkshire", region: "Yorkshire and the Humber", country: "England", lat: 53.3811, lng: -1.4701 },
  { name: "Leicester", county: "Leicestershire", region: "East Midlands", country: "England", lat: 52.6369, lng: -1.1398 },
  { name: "Nottingham", county: "Nottinghamshire", region: "East Midlands", country: "England", lat: 52.9548, lng: -1.1581 },
  
  // England - Secondary Cities
  { name: "Cambridge", county: "Cambridgeshire", region: "East of England", country: "England", lat: 52.2053, lng: 0.1218 },
  { name: "Southampton", county: "Hampshire", region: "South East England", country: "England", lat: 50.9097, lng: -1.4044 },
  { name: "Brighton", county: "East Sussex", region: "South East England", country: "England", lat: 50.8225, lng: -0.1372 },
  { name: "Oxford", county: "Oxfordshire", region: "South East England", country: "England", lat: 51.7520, lng: -1.2577 },
  { name: "York", county: "North Yorkshire", region: "Yorkshire and the Humber", country: "England", lat: 53.9599, lng: -1.0873 },
  { name: "Exeter", county: "Devon", region: "South West England", country: "England", lat: 50.7184, lng: -3.5339 },
  { name: "Norwich", county: "Norfolk", region: "East of England", country: "England", lat: 52.6309, lng: 1.2974 },
  { name: "Plymouth", county: "Devon", region: "South West England", country: "England", lat: 50.3755, lng: -4.1427 },
  { name: "Portsmouth", county: "Hampshire", region: "South East England", country: "England", lat: 50.8198, lng: -1.0880 },
  { name: "Canterbury", county: "Kent", region: "South East England", country: "England", lat: 51.2802, lng: 1.0789 },
  
  // Scotland
  { name: "Edinburgh", county: "Edinburgh", region: "Scotland", country: "Scotland", lat: 55.9533, lng: -3.1883 },
  { name: "Glasgow", county: "Glasgow", region: "Scotland", country: "Scotland", lat: 55.8642, lng: -4.2518 },
  { name: "Aberdeen", county: "Aberdeenshire", region: "Scotland", country: "Scotland", lat: 57.1497, lng: -2.0943 },
  { name: "Dundee", county: "Dundee", region: "Scotland", country: "Scotland", lat: 56.4620, lng: -2.9707 },
  { name: "Inverness", county: "Highland", region: "Scotland", country: "Scotland", lat: 57.4778, lng: -4.2247 },
  
  // Wales
  { name: "Cardiff", county: "Cardiff", region: "Wales", country: "Wales", lat: 51.4816, lng: -3.1791 },
  { name: "Swansea", county: "Swansea", region: "Wales", country: "Wales", lat: 51.6214, lng: -3.9436 },
  { name: "Newport", county: "Newport", region: "Wales", country: "Wales", lat: 51.5842, lng: -2.9977 },
  { name: "Wrexham", county: "Wrexham", region: "Wales", country: "Wales", lat: 53.0462, lng: -2.9930 },
  
  // Northern Ireland
  { name: "Belfast", county: "County Antrim", region: "Northern Ireland", country: "Northern Ireland", lat: 54.5973, lng: -5.9301 },
  { name: "Derry", county: "County Londonderry", region: "Northern Ireland", country: "Northern Ireland", lat: 54.9966, lng: -7.3086 },
];

// Wetherspoon-style pub names
const pubNames = [
  "The Moon Under Water", "The Standing Order", "The Regal", "The White Swan",
  "The Opera House", "The Royal Victoria Pavilion", "The Golden Lion",
  "The Sir John Stirling Maxwell", "The Robert Pocock", "The Knights Templar",
  "The Imperial", "The Admiral Sir Lucius Curtis", "The Caley Picture House",
  "The Postal Order", "The Great North Eastern", "The Mile Castle", "The Livery",
  "The Regal Moon", "The Hudson Bay", "The Sir John Boynton", "The Counting House",
  "The Lloyds No. 1", "The Sir Daniel Arms", "The Babington Arms", "The Palladium",
  "The Wicket Gate", "The Joseph Morton", "The Edmund Halley", "The Society Rooms",
  "The Water House", "The William Jameson", "The Lord Rosebery", "The Bright Helm",
  "The Samuel Peto", "The Sir Norman Rae", "The Willow Grove", "The Thomas Frost",
  "The Picture House", "The Elk", "The North & South Wales Bank", "The Felix Holt",
  "The Corn Exchange", "The Wouldhave", "The Rising Sun", "The Captain Alexander",
  "The Widow Frost", "The Saltoun Inn", "The Velvet Coaster", "The Resolution",
  "The Quay", "The Sir John Arderne", "The Bell", "The Gate House",
  "The Sir John Barleycorn", "The Ritz", "The Wheatsheaf", "The Coliseum Picture Theatre",
  "The Bank Statement", "The Raven", "The Bankers Draft", "The Regent",
  "The Pillar of Rock", "The Crossed Shuttle", "The Gatekeeper", "The Sir Daniel",
  "The Hall", "The Airth Castle", "The Society Bar", "The Justice House",
  "The Colosseum", "The White Lion", "The Coronation Hall", "The Carisbrooke",
  "The Moon & Bell", "The Central Bar", "The Ice Wharf", "The Sir John Fitzgerald",
  "The Diamond", "The Spirit Merchant", "The Bottle & Cork", "The Worlds End",
  "The Booking Office", "The Nightjar", "The Moon & Sixpence", "The Sir Titus Salt",
  "The Moon & Mushroom", "The Water Poet", "The Forum", "The Samuel Hall",
  "The Westbourne", "The Coronet", "The Prince of Wales", "The Crown & Sceptre",
  "The George", "The Swan", "The Red Lion", "The King's Head", "The Angel"
];

function generatePubs() {
  const pubs = [];
  let imageIndex = 0;
  
  // Generate ~70 pubs for England (spread across locations)
  for (let i = 0; i < 70 && pubs.length < 100; i++) {
    const location = locations[Math.floor(Math.random() * 20)]; // England locations
    const pubName = pubNames[pubs.length % pubNames.length];
    const openState = getOpenState(i);
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    const streetName = ["High Street", "Market Place", "Church Street", "Bridge Street", "Station Road"][Math.floor(Math.random() * 5)];
    const postcode = generatePostcode(location.county);
    
    // 10% chance of pub having no position (e.g., temporarily closed, under construction)
    const hasPosition = Math.random() > 0.1;
    // 12% chance of missing country or region data
    const hasCountry = Math.random() > 0.12;
    const hasRegion = Math.random() > 0.12;
    
    pubs.push({
      id: crypto.randomUUID(),
      name: pubName,
      townCity: location.name,
      address: `${streetNumber} ${streetName}, ${location.name}, ${location.county}, ${postcode}`,
      county: location.county,
      ...(hasRegion && { region: location.region }),
      ...(hasCountry && { country: location.country }),
      position: hasPosition ? {
        lat: parseFloat((location.lat + (Math.random() - 0.5) * 0.05).toFixed(4)),
        lng: parseFloat((location.lng + (Math.random() - 0.5) * 0.05).toFixed(4))
      } : null,
      url: `https://www.jdwetherspoon.com/pubs/all-pubs/${location.country.toLowerCase().replace(/ /g, '-')}/${location.county.toLowerCase().replace(/ /g, '-')}/${pubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      imageUrl: getImageUrl(openState, imageIndex++),
      openState
    });
  }
  
  // Generate ~15 pubs for Scotland
  for (let i = 0; i < 15 && pubs.length < 100; i++) {
    const location = locations[20 + (i % 5)]; // Scotland locations
    const pubName = pubNames[pubs.length % pubNames.length];
    const openState = getOpenState(i + 70);
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    const streetName = ["George Street", "High Street", "Princes Street", "Union Street"][Math.floor(Math.random() * 4)];
    const postcode = generatePostcode(location.county);
    
    const hasPosition = Math.random() > 0.1;
    const hasCountry = Math.random() > 0.12;
    const hasRegion = Math.random() > 0.12;
    
    pubs.push({
      id: crypto.randomUUID(),
      name: pubName,
      townCity: location.name,
      address: `${streetNumber} ${streetName}, ${location.name}, ${location.county}, ${postcode}`,
      county: location.county,
      ...(hasRegion && { region: location.region }),
      ...(hasCountry && { country: location.country }),
      position: hasPosition ? {
        lat: parseFloat((location.lat + (Math.random() - 0.5) * 0.05).toFixed(4)),
        lng: parseFloat((location.lng + (Math.random() - 0.5) * 0.05).toFixed(4))
      } : null,
      url: `https://www.jdwetherspoon.com/pubs/all-pubs/scotland/${location.county.toLowerCase().replace(/ /g, '-')}/${pubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      imageUrl: getImageUrl(openState, imageIndex++),
      openState
    });
  }
  
  // Generate ~10 pubs for Wales
  for (let i = 0; i < 10 && pubs.length < 100; i++) {
    const location = locations[25 + (i % 4)]; // Wales locations
    const pubName = pubNames[pubs.length % pubNames.length];
    const openState = getOpenState(i + 85);
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    const streetName = ["High Street", "St Mary Street", "Queen Street"][Math.floor(Math.random() * 3)];
    const postcode = generatePostcode(location.county);
    
    const hasPosition = Math.random() > 0.1;
    const hasCountry = Math.random() > 0.12;
    const hasRegion = Math.random() > 0.12;
    
    pubs.push({
      id: crypto.randomUUID(),
      name: pubName,
      townCity: location.name,
      address: `${streetNumber} ${streetName}, ${location.name}, ${location.county}, ${postcode}`,
      county: location.county,
      ...(hasRegion && { region: location.region }),
      ...(hasCountry && { country: location.country }),
      position: hasPosition ? {
        lat: parseFloat((location.lat + (Math.random() - 0.5) * 0.05).toFixed(4)),
        lng: parseFloat((location.lng + (Math.random() - 0.5) * 0.05).toFixed(4))
      } : null,
      url: `https://www.jdwetherspoon.com/pubs/all-pubs/wales/${location.county.toLowerCase().replace(/ /g, '-')}/${pubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      imageUrl: getImageUrl(openState, imageIndex++),
      openState
    });
  }
  
  // Generate ~5 pubs for Northern Ireland
  for (let i = 0; i < 5 && pubs.length < 100; i++) {
    const location = locations[29 + (i % 2)]; // Northern Ireland locations
    const pubName = pubNames[pubs.length % pubNames.length];
    const openState = getOpenState(i + 95);
    const streetNumber = Math.floor(Math.random() * 200) + 1;
    const streetName = ["High Street", "Royal Avenue", "Donegall Place"][Math.floor(Math.random() * 3)];
    const postcode = generatePostcode(location.county);
    
    const hasPosition = Math.random() > 0.1;
    const hasCountry = Math.random() > 0.12;
    const hasRegion = Math.random() > 0.12;
    
    pubs.push({
      id: crypto.randomUUID(),
      name: pubName,
      townCity: location.name,
      address: `${streetNumber} ${streetName}, ${location.name}, ${location.county}, ${postcode}`,
      county: location.county,
      ...(hasRegion && { region: location.region }),
      ...(hasCountry && { country: location.country }),
      position: hasPosition ? {
        lat: parseFloat((location.lat + (Math.random() - 0.5) * 0.05).toFixed(4)),
        lng: parseFloat((location.lng + (Math.random() - 0.5) * 0.05).toFixed(4))
      } : null,
      url: `https://www.jdwetherspoon.com/pubs/all-pubs/northern-ireland/${location.county.toLowerCase().replace(/ /g, '-')}/${pubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      imageUrl: getImageUrl(openState, imageIndex++),
      openState
    });
  }
  
  return pubs;
}

// Generate and write to file
const pubs = generatePubs();
const outputPath = path.join(__dirname, '../data/pubs-sample.json');
fs.writeFileSync(outputPath, JSON.stringify(pubs, null, 2));

const withCountry = pubs.filter(p => p.country).length;
const withoutCountry = pubs.length - withCountry;
const withRegion = pubs.filter(p => p.region).length;
const withoutRegion = pubs.length - withRegion;

console.log(`✅ Generated ${pubs.length} pubs to ${outputPath}`);
console.log(`\nOpening States:`);
console.log(`   Open: ${pubs.filter(p => p.openState === 'Open').length}`);
console.log(`   Closed: ${pubs.filter(p => p.openState === 'Closed').length}`);
console.log(`   Temporary Closed: ${pubs.filter(p => p.openState === 'Temporary Closed').length}`);
console.log(`   Opening Soon: ${pubs.filter(p => p.openState === 'Opening Soon').length}`);
console.log(`   Opening [date]: ${pubs.filter(p => p.openState.startsWith('Opening ') && p.openState !== 'Opening Soon').length}`);
console.log(`   Reopening [date]: ${pubs.filter(p => p.openState.startsWith('Reopening ')).length}`);
console.log(`\nData Quality:`);
console.log(`   With position: ${pubs.filter(p => p.position !== null).length}, Without position: ${pubs.filter(p => p.position === null).length}`);
console.log(`   With country: ${withCountry}, Without country: ${withoutCountry}`);
console.log(`   With region: ${withRegion}, Without region: ${withoutRegion}`);
