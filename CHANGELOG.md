# Changelog

All notable changes to BatteryRequired will be documented in this file.

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