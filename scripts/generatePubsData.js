// Generate 100 realistic Wetherspoon pubs for seed data
const fs = require('fs');
const path = require('path');

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
  let pubId = 1;
  
  // Generate ~70 pubs for England (spread across locations)
  for (let i = 0; i < 70 && pubId <= 100; i++) {
    const location = locations[Math.floor(Math.random() * 20)]; // England locations
    const pubName = pubNames[(pubId - 1) % pubNames.length];
    const openState = Math.random() < 0.85 ? "Open" : "Closed"; // 85% open
    
    pubs.push({
      id: pubId++,
      name: pubName,
      townCity: location.name,
      address: `${Math.floor(Math.random() * 200) + 1} ${["High Street", "Market Place", "Church Street", "Bridge Street", "Station Road"][Math.floor(Math.random() * 5)]}`,
      county: location.county,
      region: location.region,
      country: location.country,
      lat: parseFloat((location.lat + (Math.random() - 0.5) * 0.05).toFixed(4)),
      lng: parseFloat((location.lng + (Math.random() - 0.5) * 0.05).toFixed(4)),
      url: `https://www.jdwetherspoon.com/pubs/all-pubs/${location.country.toLowerCase().replace(/ /g, '-')}/${location.county.toLowerCase().replace(/ /g, '-')}/${pubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      imageUrl: "",
      openState
    });
  }
  
  // Generate ~15 pubs for Scotland
  for (let i = 0; i < 15 && pubId <= 100; i++) {
    const location = locations[20 + (i % 5)]; // Scotland locations
    const pubName = pubNames[(pubId - 1) % pubNames.length];
    const openState = Math.random() < 0.85 ? "Open" : "Closed";
    
    pubs.push({
      id: pubId++,
      name: pubName,
      townCity: location.name,
      address: `${Math.floor(Math.random() * 200) + 1} ${["George Street", "High Street", "Princes Street", "Union Street"][Math.floor(Math.random() * 4)]}`,
      county: location.county,
      region: location.region,
      country: location.country,
      lat: parseFloat((location.lat + (Math.random() - 0.5) * 0.05).toFixed(4)),
      lng: parseFloat((location.lng + (Math.random() - 0.5) * 0.05).toFixed(4)),
      url: `https://www.jdwetherspoon.com/pubs/all-pubs/scotland/${location.county.toLowerCase().replace(/ /g, '-')}/${pubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      imageUrl: "",
      openState
    });
  }
  
  // Generate ~10 pubs for Wales
  for (let i = 0; i < 10 && pubId <= 100; i++) {
    const location = locations[25 + (i % 4)]; // Wales locations
    const pubName = pubNames[(pubId - 1) % pubNames.length];
    const openState = Math.random() < 0.85 ? "Open" : "Closed";
    
    pubs.push({
      id: pubId++,
      name: pubName,
      townCity: location.name,
      address: `${Math.floor(Math.random() * 200) + 1} ${["High Street", "St Mary Street", "Queen Street"][Math.floor(Math.random() * 3)]}`,
      county: location.county,
      region: location.region,
      country: location.country,
      lat: parseFloat((location.lat + (Math.random() - 0.5) * 0.05).toFixed(4)),
      lng: parseFloat((location.lng + (Math.random() - 0.5) * 0.05).toFixed(4)),
      url: `https://www.jdwetherspoon.com/pubs/all-pubs/wales/${location.county.toLowerCase().replace(/ /g, '-')}/${pubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      imageUrl: "",
      openState
    });
  }
  
  // Generate ~5 pubs for Northern Ireland
  for (let i = 0; i < 5 && pubId <= 100; i++) {
    const location = locations[29 + (i % 2)]; // Northern Ireland locations
    const pubName = pubNames[(pubId - 1) % pubNames.length];
    const openState = Math.random() < 0.85 ? "Open" : "Closed";
    
    pubs.push({
      id: pubId++,
      name: pubName,
      townCity: location.name,
      address: `${Math.floor(Math.random() * 200) + 1} ${["High Street", "Royal Avenue", "Donegall Place"][Math.floor(Math.random() * 3)]}`,
      county: location.county,
      region: location.region,
      country: location.country,
      lat: parseFloat((location.lat + (Math.random() - 0.5) * 0.05).toFixed(4)),
      lng: parseFloat((location.lng + (Math.random() - 0.5) * 0.05).toFixed(4)),
      url: `https://www.jdwetherspoon.com/pubs/all-pubs/northern-ireland/${location.county.toLowerCase().replace(/ /g, '-')}/${pubName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      imageUrl: "",
      openState
    });
  }
  
  return pubs;
}

// Generate and write to file
const pubs = generatePubs();
const outputPath = path.join(__dirname, '../data/pubs-sample.json');
fs.writeFileSync(outputPath, JSON.stringify(pubs, null, 2));
console.log(`✅ Generated ${pubs.length} pubs to ${outputPath}`);
console.log(`   Open: ${pubs.filter(p => p.openState === 'Open').length}`);
console.log(`   Closed: ${pubs.filter(p => p.openState === 'Closed').length}`);
