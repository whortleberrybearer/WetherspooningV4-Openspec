# firebase-data-integration Spec Delta

**Change:** `2026-01-02-add-pub-location-types`

## MODIFIED Requirements

### Requirement: Pub Data Structure (REQ-FDI-003)
**Priority:** MUST  
**Category:** Data Model

**Changes:**
- ADD: Location type properties to Pub interface

The Pub data structure MUST include location type indicators to specify whether a pub is located in a hotel, airport, or train station.

**Updated Acceptance Criteria:**
- Pub interface includes all existing properties (id, name, townCity, address, county, region, country, lat, lng, url, imageUrl, openState)
- **ADDED:** Pub interface includes optional `isHotel?: boolean` property
- **ADDED:** Pub interface includes optional `inAirport?: boolean` property
- **ADDED:** Pub interface includes optional `inTrainStation?: boolean` property
- **ADDED:** Location type properties default to undefined or false when not specified
- **ADDED:** At most one location type property should be true for any pub
- Pub data is serializable to/from JSON
- Pub data can be stored in and retrieved from Firestore

#### Scenario: Standard Pub Without Location Type
**ADDED:**
**Given** a pub is not in a hotel, airport, or train station  
**When** the pub data is loaded  
**Then** `isHotel`, `inAirport`, and `inTrainStation` are undefined or false  
**And** the pub displays without location type indicators

#### Scenario: Hotel Pub Location
**ADDED:**
**Given** a pub is located within a hotel  
**When** the pub data is loaded  
**Then** `isHotel` is true  
**And** `inAirport` and `inTrainStation` are undefined or false  
**And** the pub displays with hotel location indicator

#### Scenario: Airport Pub Location
**ADDED:**
**Given** a pub is located in an airport  
**When** the pub data is loaded  
**Then** `inAirport` is true  
**And** `isHotel` and `inTrainStation` are undefined or false  
**And** the pub displays with airport location indicator

#### Scenario: Train Station Pub Location
**ADDED:**
**Given** a pub is located in a train station  
**When** the pub data is loaded  
**Then** `inTrainStation` is true  
**And** `isHotel` and `inAirport` are undefined or false  
**And** the pub displays with train station location indicator
