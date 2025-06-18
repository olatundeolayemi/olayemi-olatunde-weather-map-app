"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, X, Globe, Settings, Info, Key, CheckCircle, AlertCircle } from "lucide-react"
import type { City } from "../types"
import { cities } from "../data/cities"
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation"
import SearchSuggestions from "./SearchSuggestions"
import LocationButton from "./LocationButton"

interface SidebarProps {
  onCitySelect: (city: City) => void
  selectedCity: City | null
  onClose?: () => void
}

export default function Sidebar({ onCitySelect, selectedCity, onClose }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useKeyboardNavigation({
    cities: filteredCities,
    selectedCity,
    onCitySelect,
    isSearchFocused,
  })

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isSearchFocused) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSearchFocused])

  const handleLocationFound = (city: City) => {
    onCitySelect(city)
  }

  const hasApiKey = !!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  return (
    <div className="h-full bg-white shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Weather Map</h1>
              <p className="text-blue-100 text-xs sm:text-sm">Real-time global weather</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* API Status Banner */}
      <div className={`p-2 sm:p-3 ${hasApiKey ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border-b`}>
        <div className="flex items-center space-x-2">
          {hasApiKey ? (
            <>
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-green-800">Live Weather Data Active</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-red-800">API Key Required</span>
            </>
          )}
        </div>
        {!hasApiKey && (
          <p className="text-2xs sm:text-xs text-red-600 mt-1">
            Add NEXT_PUBLIC_OPENWEATHER_API_KEY to get real-time weather data
          </p>
        )}
      </div>

      {/* Search and Location */}
      <div className="p-3 sm:p-4 border-b border-gray-200 space-y-2 sm:space-y-3">
        <SearchSuggestions
          searchTerm={searchTerm}
          cities={cities}
          onCitySelect={onCitySelect}
          onSearchChange={setSearchTerm}
        />
        <LocationButton cities={cities} onLocationFound={handleLocationFound} />
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Settings
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Auto-location</span>
              <input type="checkbox" className="rounded w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Temperature unit</span>
              <select className="text-xs sm:text-sm border rounded px-1 py-0.5 sm:px-2 sm:py-1">
                <option>Celsius</option>
                <option>Fahrenheit</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">Theme</span>
              <select className="text-xs sm:text-sm border rounded px-1 py-0.5 sm:px-2 sm:py-1">
                <option>Light</option>
                <option>Dark</option>
                <option>Auto</option>
              </select>
            </div>
          </div>

          {/* API Configuration */}
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
            <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-1 sm:mb-2 flex items-center">
              <Key className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              API Configuration
            </h4>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xs sm:text-sm text-blue-700">OpenWeatherMap</span>
                <span
                  className={`text-2xs px-1.5 py-0.5 sm:text-xs sm:px-2 sm:py-1 rounded-full ${
                    hasApiKey ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {hasApiKey ? "Connected" : "Not Connected"}
                </span>
              </div>
              {!hasApiKey && (
                <div className="text-2xs sm:text-xs text-blue-600 space-y-0.5 sm:space-y-1">
                  <p>To get real-time weather data:</p>
                  <ol className="list-decimal list-inside space-y-0.5 ml-1 sm:ml-2">
                    <li>Get free API key from openweathermap.org</li>
                    <li>Add as NEXT_PUBLIC_OPENWEATHER_API_KEY</li>
                    <li>Restart your application</li>
                  </ol>
                </div>
              )}
              {hasApiKey && (
                <p className="text-2xs sm:text-xs text-green-600">✓ Real-time weather data from OpenWeatherMap</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cities List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-1 sm:p-2">
          {filteredCities.length > 0 ? (
            <div className="space-y-0.5 sm:space-y-1">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => onCitySelect(city)}
                  className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-200 group ${
                    selectedCity?.id === city.id
                      ? "bg-blue-50 border-2 border-blue-200 shadow-md"
                      : "hover:bg-gray-50 border-2 border-transparent hover:border-gray-200"
                  }`}
                  aria-pressed={selectedCity?.id === city.id}
                  aria-label={`Select ${city.name}, ${city.country}`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors ${
                        selectedCity?.id === city.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}
                    >
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-semibold truncate text-sm sm:text-base ${
                          selectedCity?.id === city.id ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {city.name}
                      </div>
                      <div
                        className={`text-xs sm:text-sm truncate ${
                          selectedCity?.id === city.id ? "text-blue-600" : "text-gray-500"
                        }`}
                      >
                        {city.country}
                      </div>
                    </div>
                    {selectedCity?.id === city.id && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No cities found</h3>
              <p className="text-gray-500 text-xs sm:text-sm">
                Try searching for "{searchTerm}" with different keywords
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-2xs sm:text-xs text-gray-500 mb-1 sm:mb-2">{cities.length} cities worldwide</p>
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-2xs sm:text-xs text-gray-400 mb-1 sm:mb-2">
            <span>🌍 Global Coverage</span>
            <span>⚡ Real-time Data</span>
            <span>🗺️ Leaflet Maps</span>
          </div>
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-2xs sm:text-xs text-gray-400">
            <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Press ? for keyboard shortcuts</span>
          </div>
        </div>
      </div>
    </div>
  )
}
