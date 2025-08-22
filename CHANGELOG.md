# Changelog

All notable changes to BatteryRequired will be documented in this file.

## [1.2.0] - 2025-08-21

### Added
- **Skip Analysis Feature**: New optimization tool for multi-stop trips to determine if skipping charging stops is feasible
- Skip analysis toggle (🎯) in multi-stop mode with on/off control
- Starting battery level input (only appears when skip analysis is enabled)
- Skip opportunities display showing:
  - Which charging stops can be skipped based on current efficiency
  - Required efficiency vs actual efficiency comparison
  - Visual indicators (✅ Doable / ❌ Too hard)
  - Combined distance calculations for skipped segments

### Enhanced
- **Simplified Calculation Logic**: Removed complex chaining between multi-stop legs in favor of independent per-leg calculations
- **Improved Efficiency Scenarios**: Changed from ±10% to -20% conservative efficiency reduction for more realistic planning
- **Cleaner Results Display**: 
  - Single-stop: 2-column layout (main + conservative) instead of 3-column
  - Multi-stop: Each leg shows independent efficiency scenarios
  - Removed "charge to" percentages in favor of simple "Need X%" format
- **Enhanced Trip Summary**: Added total distance and total battery requirements for multi-stop trips
- **Better Efficiency Labels**: Clear display of both percentage reduction (-20%) and actual mi/kWh values

### Removed
- **Safety Buffer Slider**: Eliminated static percentage buffer in favor of user mental math approach
- **Starting Battery Input**: Removed from standard multi-stop mode (only appears with skip analysis)
- **Battery Chaining Logic**: Simplified multi-stop calculations to be independent per-leg
- **Charge Target Calculations**: Removed complex charge percentage recommendations
- **Best Case Scenarios**: Eliminated optimistic efficiency projections, focusing on minimum requirements

### Fixed
- **Floating Point Precision**: Added tolerance for efficiency comparisons in skip analysis to handle exact matches
- **Skip Analysis Labels**: Corrected confusing labels from "Skip To [destination]" to "Skip [charging stop]"

### Technical Implementation
- Refactored multi-stop calculation engine for independent leg processing
- Added `calculateSkipAnalysis()` function for optimization scenarios
- Implemented conditional UI rendering for skip analysis features
- Enhanced state management with `showSkipAnalysis` and contextual `startingBattery` input
- Improved calculation accuracy with floating-point tolerance handling

## [1.1.0] - 2025-08-16

### Added
- **Multi-Stop Trip Calculation**: New trip planning mode for complex journeys with charging stops
- Trip type toggle between "Single Stop" and "Multi-Stop" modes
- Starting battery level input for multi-stop calculations
- Three configurable distance inputs for multi-leg journeys:
  - "To first charger" 
  - "To next charger"
  - "To destination"
- Smart battery calculation logic that chains usage across multiple legs
- Per-leg results showing:
  - Battery percentage needed for each leg
  - Charge target percentages at each stop
  - Final arrival battery percentage
- Mobile-optimized multi-stop results display with clear leg-by-leg breakdown

### Enhanced
- Preserved existing single-stop functionality with best/worst case scenarios
- Maintained mobile-first UI design principles
- Extended calculation engine to handle complex multi-leg scenarios
- Added visual distinction between charging stops and final destination

### Technical Implementation
- Refactored calculation logic to support both single and multi-stop modes
- Added state management for trip type, starting battery, and multiple stops
- Implemented conditional UI rendering based on trip mode
- Enhanced results display with dynamic leg-by-leg breakdown
- Maintained backward compatibility with existing single-stop calculations

## [1.0.0] - 2025-08-16

### Added
- Initial MVP implementation of Battery Required calculator
- React + Vite project setup with Tailwind CSS v3.4
- Core battery percentage calculation logic
- F150 Lightning (131 kWh) as default vehicle
- Custom vehicle management using localStorage
- Mobile-first card-based UI design
- Three-column results display showing worst case, calculated, and best case scenarios
- Efficiency variation scenarios (±10% of input efficiency)
- Safety buffer slider (0-20%, default 10%)
- Responsive design optimized for roadside mobile use

### Technical Implementation
- Single-page React application in `src/App.jsx`
- Tailwind CSS for styling with grey/blue color scheme
- LocalStorage persistence for custom vehicles
- Mobile-optimized touch targets and large fonts
- Clean card-based layout with proper spacing
- Efficiency numbers prominently displayed to avoid text overflow on mobile

### Features
- **Vehicle Selection**: Dropdown with F150 Lightning default + custom vehicle support
- **Efficiency Input**: Large number input for current mi/kWh from vehicle display
- **Distance Input**: Target destination distance in miles  
- **Buffer Slider**: Adjustable safety buffer percentage
- **Results Display**: Shows energy needed, battery percentage required, and charge target
- **Scenario Analysis**: Best and worst case efficiency scenarios for trip planning

### Design Decisions
- Removed text labels in results columns to prevent mobile overflow
- Used efficiency numbers as primary identifiers for each scenario
- Implemented consistent font sizing: xl for efficiency, 2xl for "Need", lg for "Charge"
- Applied blue accent color for interactive elements and calculated results
- Created balanced three-column layout with equal padding and sizing