"use client"

import { useState } from "react"
import { Search, Clock, MapPin } from "lucide-react"
import type { City } from "../types"
import { useLocalStorage } from "../hooks/useLocalStorage"

interface SearchSuggestionsProps {
  searchTerm: string
  cities: City[]
  onCitySelect: (city: City) => void
  onSearchChange: (term: string) => void
}

export default function SearchSuggestions({
  searchTerm,
  cities,
  onCitySelect,
  onSearchChange,
}: SearchSuggestionsProps) {
  const [recentSearches, setRecentSearches] = useLocalStorage<City[]>("recent-searches", [])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredCities = cities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addToRecentSearches = (city: City) => {
    const updated = [city, ...recentSearches.filter((c) => c.id !== city.id)].slice(0, 5)
    setRecentSearches(updated)
  }

  const handleCitySelect = (city: City) => {
    addToRecentSearches(city)
    onCitySelect(city)
    setShowSuggestions(false)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search cities or countries..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
          aria-label="Search cities"
          autoComplete="off"
        />
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {searchTerm === "" && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Recent Searches
                </h4>
                <button onClick={clearRecentSearches} className="text-xs text-blue-600 hover:text-blue-800">
                  Clear
                </button>
              </div>
              {recentSearches.map((city) => (
                <button
                  key={`recent-${city.id}`}
                  onClick={() => handleCitySelect(city)}
                  className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {city.name}, {city.country}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchTerm !== "" && (
            <div className="p-2">
              {filteredCities.length > 0 ? (
                filteredCities.slice(0, 8).map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-500">{city.country}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No cities found for "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
