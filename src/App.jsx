import { useState, useEffect } from 'react'

const VEHICLES = [
  { id: 'f150-lightning', name: 'F150 Lightning', capacity: 131 }
]

function App() {
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0])
  const [customVehicles, setCustomVehicles] = useState([])
  const [efficiency, setEfficiency] = useState('')
  const [singleDistance, setSingleDistance] = useState('')
  const [buffer, setBuffer] = useState(10)
  const [isMultiStop, setIsMultiStop] = useState(false)
  const [stops, setStops] = useState([
    { id: 1, distance: '', label: 'To first charger' },
    { id: 2, distance: '', label: 'To next charger' },
    { id: 3, distance: '', label: 'To destination' }
  ])
  const [startingBattery, setStartingBattery] = useState(80)
  
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
    const chargeTarget = percentageNeeded + buffer
    
    return {
      energyNeeded: energyNeeded.toFixed(1),
      percentageNeeded: percentageNeeded.toFixed(1),
      chargeTarget: Math.min(chargeTarget, 100).toFixed(1)
    }
  }

  const calculate = () => {
    const efficiencyNum = parseFloat(efficiency)
    
    if (!efficiencyNum || efficiencyNum <= 0) {
      return null
    }

    if (isMultiStop) {
      // Multi-stop calculation
      const validStops = stops.filter(stop => stop.distance && parseFloat(stop.distance) > 0)
      if (validStops.length === 0) return null

      let currentBattery = startingBattery
      const legs = []

      validStops.forEach((stop, index) => {
        const distance = parseFloat(stop.distance)
        
        // Calculate energy needed for this leg
        const energyNeeded = distance / efficiencyNum
        const percentageNeeded = (energyNeeded / selectedVehicle.capacity) * 100
        
        // For last leg, just show what's needed
        // For charging stops, calculate what to charge to for next leg
        let chargeTarget = null
        if (index < validStops.length - 1) {
          // Not the last leg - calculate charge target
          chargeTarget = Math.min(percentageNeeded + buffer, 100)
        }
        
        const batteryAfter = currentBattery - percentageNeeded
        
        legs.push({
          label: stop.label,
          distance,
          percentageNeeded: percentageNeeded.toFixed(1),
          batteryAfter: batteryAfter.toFixed(1),
          chargeTarget: chargeTarget ? chargeTarget.toFixed(1) : null,
          efficiencyUsed: efficiencyNum.toFixed(1)
        })

        // Update current battery for next iteration (if charging)
        if (chargeTarget) {
          currentBattery = chargeTarget
        }
      })

      return { isMultiStop: true, legs }
    } else {
      // Single stop calculation
      const distanceNum = parseFloat(singleDistance)
      
      if (!distanceNum || distanceNum <= 0) {
        return null
      }
      
      // Calculate for current efficiency
      const main = calculateSingleStop(distanceNum, efficiencyNum)
      
      // Calculate best case (10% better efficiency)
      const bestEfficiency = efficiencyNum * 1.1
      const best = {
        efficiency: bestEfficiency.toFixed(1),
        ...calculateSingleStop(distanceNum, bestEfficiency)
      }
      
      // Calculate worst case (10% worse efficiency)
      const worstEfficiency = efficiencyNum * 0.9
      const worst = {
        efficiency: worstEfficiency.toFixed(1),
        ...calculateSingleStop(distanceNum, worstEfficiency)
      }
      
      return {
        isMultiStop: false,
        ...main,
        best,
        worst
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
            {/* Starting Battery */}
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

        {/* Buffer Slider */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="bg-blue-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
            <label className="flex items-center justify-between text-sm font-medium text-gray-700">
              <span className="flex items-center"><span className="mr-2">🛡️</span> Safety Buffer</span>
              <span className="text-blue-600 font-semibold">{buffer}%</span>
            </label>
          </div>
          <div className="p-4">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={buffer}
              onChange={(e) => setBuffer(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                       slider accent-blue-600"
            />
          </div>
        </div>

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
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">{leg.label}</h4>
                      <span className="text-sm text-gray-500">{leg.distance} miles</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          Need: {leg.percentageNeeded}%
                        </div>
                        <div className="text-sm text-gray-500">Battery used</div>
                      </div>
                      <div className="text-center">
                        {leg.chargeTarget ? (
                          <>
                            <div className="text-lg font-bold text-green-600">
                              Charge to: {leg.chargeTarget}%
                            </div>
                            <div className="text-sm text-gray-500">For next leg</div>
                          </>
                        ) : (
                          <>
                            <div className="text-lg font-bold text-gray-600">
                              Arrive: {leg.batteryAfter}%
                            </div>
                            <div className="text-sm text-gray-500">Final destination</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Single Stop Results */
              <div className="grid grid-cols-3 gap-2">
                {/* Worst Case */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-700 mb-1">
                      {result.worst.efficiency}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      mi/kWh
                    </div>
                    <div className="text-2xl font-black text-gray-700 mb-2">
                      Need: {result.worst.percentageNeeded}%
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      Charge: {result.worst.chargeTarget}%
                    </div>
                  </div>
                </div>

                {/* Calculated Result */}
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-700 mb-1">
                      {efficiency}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      mi/kWh
                    </div>
                    <div className="text-2xl font-black text-blue-700 mb-2">
                      Need: {result.percentageNeeded}%
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      Charge: {result.chargeTarget}%
                    </div>
                  </div>
                </div>

                {/* Best Case */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-700 mb-1">
                      {result.best.efficiency}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      mi/kWh
                    </div>
                    <div className="text-2xl font-black text-gray-700 mb-2">
                      Need: {result.best.percentageNeeded}%
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      Charge: {result.best.chargeTarget}%
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
