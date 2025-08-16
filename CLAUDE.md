# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BatteryRequired is a mobile-first web application for electric vehicle road trips. It calculates the battery percentage needed to reach charging destinations based on real-time efficiency data from the vehicle's onboard computer.

**Core Use Case:** Driver towing a trailer with an F150 Lightning gets real-time efficiency (e.g., 1.3 mi/kWh) from the truck's display and needs to know what percentage to charge to for the next stop.

**Core Calculation:** 
- Distance ÷ Efficiency = Energy needed (kWh)
- Energy needed ÷ Battery capacity = Percentage needed
- Add buffer percentage for charging target

## Current Implementation Status

### Phase 1: Frontend-Only MVP (COMPLETED)
**Tech Stack:**
- React + Vite (initialized and working)
- Tailwind CSS v3.4 (configured and working)
- LocalStorage for vehicle data persistence
- Ready for Railway deployment

**Implemented Features:**
- ✅ Vehicle management with F150 Lightning default (131 kWh)
- ✅ Custom vehicle addition via localStorage
- ✅ Trip calculator with efficiency, distance, buffer inputs
- ✅ Best/worst case scenarios (±10% efficiency variation)
- ✅ Mobile-optimized card-based UI design
- ✅ Responsive three-column results display

### Phase 2: Backend Integration (Future)
**Tech Stack:**
- Add Express.js API to existing Vite setup
- SQLite database for user data and trip history
- Migrate from localStorage to API calls
- Keep Railway deployment

**Additional Features:**
- User accounts and cross-device sync
- Trip history and efficiency tracking
- Multi-stop route planning
- Trip log with charger locations, actual efficiency, and battery usage
- Historical data analysis and efficiency trends

## Development Commands

Once initialized:
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run test        # Run tests (when added)
```

## Current UI Design

**Implemented Design:**
- Clean grey/blue color scheme with subtle accents
- Card-based layout with distinct sections for each input
- Large, readable fonts optimized for roadside use
- Three-column results display: worst case | calculated | best case
- Each result shows: efficiency number (top), "Need" %, "Charge to" %

**Mobile-First Requirements (IMPLEMENTED):**
- ✅ Large touch targets and readable fonts
- ✅ Card-based sections with clear visual separation
- ✅ Prominent efficiency numbers at top of result columns
- ✅ Consistent padding and spacing across all elements
- ✅ Mobile-responsive three-column grid layout

## Vehicle Database

### Phase 1 (localStorage):
**Default vehicle:** F150 Lightning (131 kWh) - pre-selected for immediate use

**Custom vehicles:** Users can add vehicles with custom battery capacity, stored in browser localStorage (device-specific, no sync)

### Phase 2 (Backend):
**All vehicles:** Stored in database with user accounts, allowing full sync across devices and sharing of custom vehicles between users.

## Deployment

**Workflow:** GitHub Codespace → GitHub Repository → Railway Auto-Deploy

1. **Development:** Build and test in GitHub Codespace
2. **Push to GitHub:** Commit and push changes to main branch
3. **Railway Auto-Deploy:** Railway connected to GitHub repo, auto-deploys on push
4. **Build Settings:** Railway runs `npm run build` and serves static files

**Railway Configuration:**
- Build Command: `npm run build`
- Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`
- Deploy from GitHub repository (auto-deploy on push to main)

## Technical Notes

**Important Setup Details:**
- Tailwind CSS v3.4 is required (v4 has configuration issues in this environment)
- PostCSS config uses standard `tailwindcss: {}` plugin format
- Main calculation logic in `App.jsx` calculate() function
- Custom vehicles stored with key `batteryRequired_customVehicles` in localStorage

**File Structure:**
- `src/App.jsx` - Main application component with all logic
- `src/index.css` - Tailwind directives only
- `tailwind.config.js` - Standard v3 configuration
- `postcss.config.js` - Tailwind + Autoprefixer setup

**Key Implementation Details:**
- F150 Lightning (131 kWh) is hardcoded as default vehicle
- Efficiency scenarios: ±10% of input efficiency
- Buffer slider: 0-20% range, default 10%
- All inputs center-aligned for mobile use
- Results display efficiency number prominently to avoid text overflow

## Future Features (Phase 3+)

### Trip Log & Historical Data
**Purpose:** Learn from past trips to improve future planning accuracy

**Data to Track:**
- Trip segments: start/end charger locations
- Predicted vs actual efficiency for each segment
- Battery percentage at departure/arrival
- Weather conditions, trailer usage, terrain
- Charging session details (speed, cost, duration)

**Value Propositions:**
- "Last time this route gave you 1.1 mi/kWh with trailer"
- Efficiency trends by season, weather, route type
- Charger reliability and speed tracking
- Personal efficiency baselines for different driving conditions

**Implementation:**
- Trip recording interface (start/end trip buttons)
- GPS integration for automatic route tracking
- Weather API integration for conditions
- Charger database with user ratings and speeds