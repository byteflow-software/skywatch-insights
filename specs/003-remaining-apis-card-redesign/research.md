# Research: Remaining API Integrations + Home Card Redesign

**Date**: 2026-03-13

## API Research Results

### 1. Eclipses (ECLIPSE_SOLAR, ECLIPSE_LUNAR)

**Selected: USNO Astronomical Applications API**
- Endpoint: `https://aa.usno.navy.mil/api/eclipses/solar/year?year=YYYY`
- Endpoint: `https://aa.usno.navy.mil/api/eclipses/lunar/year?year=YYYY`
- Free, no authentication, JSON response
- Coverage: 1800-2050 (eclipse lists)
- Returns: eclipse type (total/partial/annular/penumbral), date, time
- Solar endpoint also supports local circumstances by coordinates
- Already using USNO for moon data (UsnoMoonClient) — extend pattern

**Alternatives rejected:**
- AstronomyAPI.com Events endpoint — requires auth, eclipse support unconfirmed
- Radiant Drift API — great for paths/GeoJSON but overkill for event creation
- NASA eclipse.gsfc.nasa.gov — static HTML, no REST API

### 2. Meteor Showers (METEOR_SHOWER)

**Selected: Stellarium showers.json (static embedded catalog)**
- Source: https://github.com/Stellarium/stellarium-addons — GPLv2
- Well-structured JSON keyed by IAU 3-letter code (PER, GEM, QUA, etc.)
- Contains: designation, radiant RA/Dec, drift, speed (km/s), population index, ZHR, active period (start/finish/peak dates)
- 100+ showers, including all major ones
- No runtime API call needed — embed as classpath resource

**Alternatives rejected:**
- IMO Calendar — PDF only, no API
- AMS REST API — paid membership required, fireball-focused
- Global Meteor Network — raw observation data, not a calendar
- IAU MDC — CSV export only, no ZHR/activity data
- NASA — no meteor shower API exists

### 3. Aurora (AURORA)

**Selected: NOAA SWPC Kp Index Forecast**
- Endpoint: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json`
- Free, no authentication, JSON response
- Returns: 3-day forecast of Kp values in 3-hour windows
- Updated every ~3 hours
- Kp >= 5 = geomagnetic storm = aurora visible at mid-latitudes
- Kp >= 7 = strong storm = aurora visible at lower latitudes

**Supplementary: NOAA SWPC Observed Kp**
- Endpoint: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json`
- Real-time observed Kp values

**Note**: DONKI already syncs geomagnetic storms (GEOMAGNETIC_STORM type). Aurora events are distinct — they represent the visual phenomenon, created only when Kp forecast indicates aurora visibility.

### 4. Transits (TRANSIT)

**Selected: Static embedded catalog**
- Transits are extremely rare — hardcode known future dates
- Mercury transits: 2032-Nov-13, 2039-Nov-07, 2049-May-07
- Venus transits: 2117-Dec-10, 2125-Dec-08
- Source: NASA/USNO transit catalogs (verified)
- No API call needed — these dates are known centuries in advance

### 5. Occultations (OCCULTATION)

**Selected: Static yearly catalog + USNO data**
- No single good API exists for occultation predictions
- IOTA (International Occultation Timing Association) is authoritative but no REST API
- Strategy: maintain a yearly static catalog of notable lunar occultations of bright planets
- Can be supplemented with USNO rise/set/transit data for timing
- Update catalog annually from IOTA publications

### 6. Home Card Redesign

**Inspiration: Twitter/X and Threads**
- Text-first, no hero images
- Compact vertical card layout
- Type badge with color as visual differentiator (replaces image)
- Event icon per type (SVG inline icons)
- Relative date prominently displayed
- Description truncated to 2-3 lines
- Action bar (favorite, share, "ver mais") at bottom
- Dark theme consistent with existing design

**Key changes from current design:**
- Remove `<img>` and image aspect-ratio container from EventFeedCard
- Remove getEventImage() dependency from card
- Add type-specific SVG icon (small, inline)
- Make title more prominent (larger font)
- Add relative time as primary date display
- Compact the card height significantly
