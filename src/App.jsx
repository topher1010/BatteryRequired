import { useState, useEffect } from 'react'

const VEHICLES = [
  { id: 'f150-lightning', name: 'F150 Lightning', capacity: 131 }
]

function App() {
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0])
  const [customVehicles, setCustomVehicles] = useState([])
  const [efficiency, setEfficiency] = useState('')
  const [distance, setDistance] = useState('')
  const [buffer, setBuffer] = useState(10)
  
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

  const calculate = () => {
    const efficiencyNum = parseFloat(efficiency)
    const distanceNum = parseFloat(distance)
    
    if (!efficiencyNum || !distanceNum || efficiencyNum <= 0 || distanceNum <= 0) {
      return null
    }
    
    // Calculate for current efficiency
    const energyNeeded = distanceNum / efficiencyNum
    const percentageNeeded = (energyNeeded / selectedVehicle.capacity) * 100
    const chargeTarget = percentageNeeded + buffer
    
    // Calculate best case (10% better efficiency)
    const bestEfficiency = efficiencyNum * 1.1
    const bestEnergyNeeded = distanceNum / bestEfficiency
    const bestPercentageNeeded = (bestEnergyNeeded / selectedVehicle.capacity) * 100
    const bestChargeTarget = bestPercentageNeeded + buffer
    
    // Calculate worst case (10% worse efficiency)
    const worstEfficiency = efficiencyNum * 0.9
    const worstEnergyNeeded = distanceNum / worstEfficiency
    const worstPercentageNeeded = (worstEnergyNeeded / selectedVehicle.capacity) * 100
    const worstChargeTarget = worstPercentageNeeded + buffer
    
    return {
      energyNeeded: energyNeeded.toFixed(1),
      percentageNeeded: percentageNeeded.toFixed(1),
      chargeTarget: Math.min(chargeTarget, 100).toFixed(1),
      best: {
        efficiency: bestEfficiency.toFixed(1),
        percentageNeeded: bestPercentageNeeded.toFixed(1),
        chargeTarget: Math.min(bestChargeTarget, 100).toFixed(1)
      },
      worst: {
        efficiency: worstEfficiency.toFixed(1),
        percentageNeeded: worstPercentageNeeded.toFixed(1),
        chargeTarget: Math.min(worstChargeTarget, 100).toFixed(1)
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

        {/* Distance Input */}
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
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 text-lg font-semibold
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center"
            />
          </div>
        </div>

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
