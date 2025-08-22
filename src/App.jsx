import { useState, useEffect } from 'react'

const VEHICLES = [
  { id: 'f150-lightning', name: 'F150 Lightning', capacity: 131 }
]

function App() {
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0])
  const [customVehicles, setCustomVehicles] = useState([])
  const [efficiency, setEfficiency] = useState('')
  const [singleDistance, setSingleDistance] = useState('')
  const [isMultiStop, setIsMultiStop] = useState(false)
  const [showSkipAnalysis, setShowSkipAnalysis] = useState(false)
  const [startingBattery, setStartingBattery] = useState(80)
  const [stops, setStops] = useState([
    { id: 1, distance: '', label: 'To first charger' },
    { id: 2, distance: '', label: 'To next charger' },
    { id: 3, distance: '', label: 'To destination' }
  ])
  
  // Load custom vehicles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('batteryRequired_customVehicles')
    if (saved) {
      try {
        setCustomVehicles(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load custom vehicles:', e)
      }
    }
  }, [])

  // Save custom vehicles to localStorage
  useEffect(() => {
    localStorage.setItem('batteryRequired_customVehicles', JSON.stringify(customVehicles))
  }, [customVehicles])

  const allVehicles = [...VEHICLES, ...customVehicles]

  const calculateSingleStop = (distance, efficiencyNum) => {
    const energyNeeded = distance / efficiencyNum
    const percentageNeeded = (energyNeeded / selectedVehicle.capacity) * 100
    
    return {
      energyNeeded: energyNeeded.toFixed(1),
      percentageNeeded: percentageNeeded.toFixed(1)
    }
  }

  const calculateSkipAnalysis = (validStops, efficiencyNum) => {
    if (validStops.length < 2) return []
    
    const skipOptions = []
    
    // For each intermediate stop (not the last one), calculate what efficiency is needed to skip it
    for (let skipIndex = 0; skipIndex < validStops.length - 1; skipIndex++) {
      // Calculate combined distance from start through the skipped stop to the next stop
      let combinedDistance = 0
      for (let i = 0; i <= skipIndex + 1; i++) {
        combinedDistance += parseFloat(validStops[i].distance)
      }
      
      // What efficiency do we need to travel this combined distance?
      // Battery available = starting battery - buffer for safety (assume 10%)
      const availableBattery = Math.max(startingBattery - 10, 10) // minimum 10% buffer
      const availableEnergy = (availableBattery / 100) * selectedVehicle.capacity
      const requiredEfficiency = combinedDistance / availableEnergy
      
      const isDoable = requiredEfficiency <= (efficiencyNum + 0.01) // Add small tolerance for floating point precision
      
      skipOptions.push({
        skipStopLabel: validStops[skipIndex].label.replace('To ', ''),
        combinedDistance,
        requiredEfficiency: requiredEfficiency.toFixed(1),
        isDoable,
        batterySavings: parseFloat(validStops[skipIndex].distance) / efficiencyNum / selectedVehicle.capacity * 100
      })
    }
    
    return skipOptions
  }

  const calculate = () => {
    const efficiencyNum = parseFloat(efficiency)
    
    if (!efficiencyNum || efficiencyNum <= 0) {
      return null
    }

    if (isMultiStop) {
      // Multi-stop calculation - each leg independent
      const validStops = stops.filter(stop => stop.distance && parseFloat(stop.distance) > 0)
      if (validStops.length === 0) return null

      const legs = []
      let totalDistance = 0
      let totalPercentageNeeded = 0
      let totalConservativeNeeded = 0

      validStops.forEach((stop) => {
        const distance = parseFloat(stop.distance)
        
        // Calculate for current efficiency
        const main = calculateSingleStop(distance, efficiencyNum)
        
        // Calculate conservative (20% worse efficiency)
        const conservativeEfficiency = efficiencyNum * 0.8
        const conservative = {
          efficiency: conservativeEfficiency.toFixed(1),
          ...calculateSingleStop(distance, conservativeEfficiency)
        }
        
        legs.push({
          label: stop.label,
          distance,
          main: {
            efficiency: efficiencyNum.toFixed(1),
            ...main
          },
          conservative
        })

        totalDistance += distance
        totalPercentageNeeded += parseFloat(main.percentageNeeded)
        totalConservativeNeeded += parseFloat(conservative.percentageNeeded)
      })

      // Calculate skip analysis if enabled
      const skipAnalysis = showSkipAnalysis ? calculateSkipAnalysis(validStops, efficiencyNum) : []

      return { 
        isMultiStop: true, 
        legs,
        summary: {
          totalDistance,
          totalPercentageNeeded: totalPercentageNeeded.toFixed(1),
          totalConservativeNeeded: totalConservativeNeeded.toFixed(1)
        },
        skipAnalysis
      }
    } else {
      // Single stop calculation
      const distanceNum = parseFloat(singleDistance)
      
      if (!distanceNum || distanceNum <= 0) {
        return null
      }
      
      // Calculate for current efficiency
      const main = calculateSingleStop(distanceNum, efficiencyNum)
      
      // Calculate conservative case (20% worse efficiency)
      const conservativeEfficiency = efficiencyNum * 0.8
      const conservative = {
        efficiency: conservativeEfficiency.toFixed(1),
        ...calculateSingleStop(distanceNum, conservativeEfficiency)
      }
      
      return {
        isMultiStop: false,
        efficiency: efficiencyNum.toFixed(1),
        ...main,
        conservative
      }
    }
  }

  const result = calculate()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-3">
            <span className="text-xl text-white font-bold">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Battery Required
          </h1>
          <p className="text-gray-500 text-sm">EV Trip Calculator</p>
        </div>
        
        {/* Vehicle Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="bg-gray-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <span className="mr-2">🚗</span> Vehicle
            </label>
          </div>
          <div className="p-4">
            <select 
              value={selectedVehicle.id}
              onChange={(e) => {
                const vehicle = allVehicles.find(v => v.id === e.target.value)
                setSelectedVehicle(vehicle)
              }}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {allVehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} ({vehicle.capacity} kWh)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trip Type Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="bg-blue-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <span className="mr-2">🛣️</span> Trip Type
            </label>
          </div>
          <div className="p-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsMultiStop(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isMultiStop 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Single Stop
              </button>
              <button
                onClick={() => setIsMultiStop(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isMultiStop 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Multi-Stop
              </button>
            </div>
          </div>
        </div>

        {/* Efficiency Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="bg-blue-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <span className="mr-2">⚡</span> Current Efficiency (mi/kWh)
            </label>
          </div>
          <div className="p-4">
            <input
              type="number"
              step="0.1"
              placeholder="1.3"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 text-lg font-semibold
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center"
            />
          </div>
        </div>

        {/* Conditional Input Based on Trip Type */}
        {!isMultiStop ? (
          /* Single Distance Input */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="bg-gray-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <span className="mr-2">📍</span> Distance to Destination (miles)
              </label>
            </div>
            <div className="p-4">
              <input
                type="number"
                step="1"
                placeholder="100"
                value={singleDistance}
                onChange={(e) => setSingleDistance(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 text-lg font-semibold
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center"
              />
            </div>
          </div>
        ) : (
          /* Multi-Stop Inputs */
          <div className="mb-4">
            {/* Skip Analysis Toggle */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="bg-purple-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <span className="mr-2">🎯</span> Skip Analysis
                </label>
              </div>
              <div className="p-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setShowSkipAnalysis(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      !showSkipAnalysis 
                        ? 'bg-white text-purple-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Off
                  </button>
                  <button
                    onClick={() => setShowSkipAnalysis(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      showSkipAnalysis 
                        ? 'bg-white text-purple-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    On
                  </button>
                </div>
              </div>
            </div>

            {/* Starting Battery (only shown when skip analysis is on) */}
            {showSkipAnalysis && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
                <div className="bg-green-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <span className="mr-2">🔋</span> Starting Battery Level (%)
                  </label>
                </div>
                <div className="p-4">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="80"
                    value={startingBattery}
                    onChange={(e) => setStartingBattery(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 text-lg font-semibold
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center"
                  />
                </div>
              </div>
            )}
            
            {/* Stop Distance Inputs */}
            {stops.map((stop, index) => (
              <div key={stop.id} className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3">
                <div className="bg-gray-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <span className="mr-2">📍</span> {stop.label} (miles)
                  </label>
                </div>
                <div className="p-4">
                  <input
                    type="number"
                    step="1"
                    placeholder={index === 0 ? "90" : index === 1 ? "77" : "80"}
                    value={stop.distance}
                    onChange={(e) => {
                      const newStops = [...stops]
                      newStops[index].distance = e.target.value
                      setStops(newStops)
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 text-lg font-semibold
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Results */}
        {result && (
          <div className="mb-6">
            {result.isMultiStop ? (
              /* Multi-Stop Results */
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
                  Trip Breakdown
                </h3>
                {result.legs.map((leg, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-700">{leg.label}</h4>
                      <span className="text-sm text-gray-500">{leg.distance} miles</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Main Calculation */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-center">
                          <div className="text-sm text-blue-600 mb-1">
                            {leg.main.efficiency} mi/kWh
                          </div>
                          <div className="text-lg font-bold text-blue-700">
                            Need: {leg.main.percentageNeeded}%
                          </div>
                        </div>
                      </div>
                      {/* Conservative Calculation */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">
                            {leg.conservative.efficiency} mi/kWh (-20%)
                          </div>
                          <div className="text-lg font-bold text-gray-700">
                            Need: {leg.conservative.percentageNeeded}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Trip Summary */}
                <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-4 mt-6">
                  <h4 className="text-lg font-semibold text-blue-800 text-center mb-3">
                    Trip Overview
                  </h4>
                  <div className="space-y-2 text-center">
                    <div className="text-sm text-blue-600">
                      Total Distance: <span className="font-semibold">{result.summary.totalDistance} miles</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      Total Battery Needed: <span className="font-bold">{result.summary.totalPercentageNeeded}%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Conservative Total: <span className="font-bold">{result.summary.totalConservativeNeeded}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Skip Analysis Results */}
                {result.skipAnalysis && result.skipAnalysis.length > 0 && (
                  <div className="bg-purple-50 rounded-lg border-2 border-purple-200 p-4 mt-6">
                    <h4 className="text-lg font-semibold text-purple-800 text-center mb-3">
                      🎯 Skip Opportunities
                    </h4>
                    <div className="space-y-3">
                      {result.skipAnalysis.map((skip, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          skip.isDoable ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              Skip {skip.skipStopLabel}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              skip.isDoable 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {skip.isDoable ? '✅ Doable' : '❌ Too hard'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Need <span className="font-semibold">{skip.requiredEfficiency} mi/kWh</span>
                            {skip.isDoable && (
                              <span className="text-green-600 ml-2">
                                (vs your {efficiency} mi/kWh)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {skip.combinedDistance} miles combined distance
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Single Stop Results */
              <div className="grid grid-cols-2 gap-4">
                {/* Main Calculation */}
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-700 mb-1">
                      {result.efficiency}
                    </div>
                    <div className="text-sm text-blue-600 mb-2">
                      mi/kWh
                    </div>
                    <div className="text-2xl font-black text-blue-700">
                      Need: {result.percentageNeeded}%
                    </div>
                  </div>
                </div>

                {/* Conservative Case */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-700 mb-1">
                      {result.conservative.efficiency}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      mi/kWh (-20%)
                    </div>
                    <div className="text-2xl font-black text-gray-700">
                      Need: {result.conservative.percentageNeeded}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Custom Vehicle Button */}
        <button 
          onClick={() => {
            const name = prompt('Vehicle name:')
            const capacity = prompt('Battery capacity (kWh):')
            if (name && capacity && !isNaN(capacity)) {
              const newVehicle = {
                id: `custom-${Date.now()}`,
                name: name.trim(),
                capacity: parseFloat(capacity)
              }
              setCustomVehicles(prev => [...prev, newVehicle])
              setSelectedVehicle(newVehicle)
            }
          }}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 
                   rounded-lg transition-colors font-medium border border-gray-200
                   flex items-center justify-center"
        >
          <span className="mr-2">🚙</span> Add Custom Vehicle
        </button>
      </div>
    </div>
  )
}

export default App
