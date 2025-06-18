"use client"

import { useEffect, useRef, useState } from "react"
import type { City, WeatherData } from "../types"
import { fetchWeatherData } from "../services/weatherService"
import WeatherPopup from "./WeatherPopup"
import { useWeatherCache } from "../hooks/useWeatherCache"
import { useToast } from "../hooks/useToast"

interface LeafletMapProps {
  selectedCity: City | null
  cities: City[]
}

export default function LeafletMap({ selectedCity, cities }: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [showWeatherPopup, setShowWeatherPopup] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [popupCity, setPopupCity] = useState<City | null>(null)
  const [map, setMap] = useState<any>(null)
  const [L, setL] = useState<any>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTileLayer, setCurrentTileLayer] = useState("openstreetmap")
  const markersRef = useRef<any[]>([])
  const { loading, setLoading, getCachedWeather, setCachedWeather } = useWeatherCache()
  const { addToast } = useToast()

  // Available tile layers
  const tileLayers = {
    openstreetmap: {
      name: "🗺️ OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
    },
    satellite: {
      name: "🛰️ Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "© Esri, Maxar, Earthstar Geographics",
    },
    terrain: {
      name: "🏔️ Terrain",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "© OpenTopoMap contributors",
    },
    dark: {
      name: "🌙 Dark",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "© CARTO",
    },
    light: {
      name: "☀️ Light",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: "© CARTO",
    },
  }

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        if (typeof window !== "undefined") {
          const leaflet = await import("leaflet")

          // Fix for default markers in Next.js
          delete (leaflet.Icon.Default.prototype as any)._getIconUrl
          leaflet.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          })

          setL(leaflet)
          setMapError(null)
        }
      } catch (error) {
        console.error("Error loading Leaflet:", error)
        setMapError("Failed to load Leaflet. Please check your internet connection.")
        setIsLoading(false)
        addToast({
          type: "error",
          title: "Loading Error",
          message: "Failed to load map library.",
        })
      }
    }

    loadLeaflet()
  }, [addToast])

  // Initialize map
  useEffect(() => {
    if (!L || !mapContainer.current || map || mapError) return

    try {
      setIsLoading(true)

      const newMap = L.map(mapContainer.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
        preferCanvas: true, // Better performance
      })

      // Add initial tile layer
      const tileLayer = L.tileLayer(tileLayers[currentTileLayer].url, {
        attribution: tileLayers[currentTileLayer].attribution,
        maxZoom: 18,
        className: "map-tiles",
      }).addTo(newMap)

      // Add markers for all cities
      addCityMarkers(newMap)

      setMap(newMap)
      setIsLoading(false)

      addToast({
        type: "success",
        title: "Map Loaded",
        message: "Leaflet map initialized successfully",
        duration: 3000,
      })

      return () => {
        // Cleanup markers
        markersRef.current.forEach((marker) => {
          try {
            marker.remove()
          } catch (error) {
            console.warn("Error removing marker:", error)
          }
        })
        markersRef.current = []
        newMap.remove()
      }
    } catch (error) {
      console.error("Error initializing Leaflet map:", error)
      setMapError(`Initialization Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsLoading(false)
      addToast({
        type: "error",
        title: "Initialization Error",
        message: "Failed to initialize the map",
      })
    }
  }, [L, currentTileLayer, addToast, mapError])

  // Add city markers to the map
  const addCityMarkers = (mapInstance: any) => {
    if (!mapInstance || !L) return

    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => {
        try {
          marker.remove()
        } catch (error) {
          console.warn("Error removing marker:", error)
        }
      })
      markersRef.current = []

      cities.forEach((city) => {
        try {
          // Create custom icon with responsive sizing
          const customIcon = L.divIcon({
            html: `
              <div class="relative group cursor-pointer">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 border-2 border-white transform hover:scale-110">
                  <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div class="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-5 h-5 sm:w-7 sm:h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md hover:from-orange-600 hover:to-orange-700 transition-all duration-300 cursor-pointer transform hover:scale-110" data-city-id="${city.id}">
                  <svg class="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div class="absolute top-10 sm:top-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div class="font-semibold">${city.name}</div>
                  <div class="text-2xs sm:text-xs text-gray-300">${city.country}</div>
                  <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black bg-opacity-80 rotate-45"></div>
                </div>
              </div>
            `,
            className: "custom-leaflet-marker",
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          })

          const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(mapInstance)

          // Add popup with responsive content
          marker.bindPopup(`
            <div class="text-center p-2 sm:p-3">
              <h3 class="font-bold text-gray-900 text-base sm:text-lg">${city.name}</h3>
              <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">${city.country}</p>
              <p class="text-2xs sm:text-xs text-blue-600 font-medium">Click orange icon for weather</p>
            </div>
          `)

          markersRef.current.push(marker)
        } catch (error) {
          console.warn(`Error creating marker for ${city.name}:`, error)
        }
      })

      // Add click handlers after markers are created
      setTimeout(() => {
        cities.forEach((city) => {
          const infoButton = document.querySelector(`[data-city-id="${city.id}"]`)
          if (infoButton) {
            infoButton.addEventListener("click", (e) => {
              e.stopPropagation()
              handleWeatherClick(city)
            })
          }
        })
      }, 100)
    } catch (error) {
      console.error("Error adding city markers:", error)
      addToast({
        type: "warning",
        title: "Markers Error",
        message: "Some city markers may not display correctly",
      })
    }
  }

  // Handle city selection
  useEffect(() => {
    if (selectedCity && map && !mapError) {
      try {
        map.setView([selectedCity.lat, selectedCity.lng], 10, {
          animate: true,
          duration: 1.5,
        })

        // Highlight selected city marker
        markersRef.current.forEach((marker, index) => {
          const city = cities[index]
          const markerElement = marker.getElement()
          if (markerElement) {
            if (city.id === selectedCity.id) {
              markerElement.style.transform = "scale(1.2)"
              markerElement.style.zIndex = "1000"
            } else {
              markerElement.style.transform = "scale(1)"
              markerElement.style.zIndex = "1"
            }
          }
        })
      } catch (error) {
        console.warn("Error navigating to city:", error)
      }
    }
  }, [selectedCity, map, cities, mapError])

  const handleWeatherClick = async (city: City) => {
    setPopupCity(city)

    // Check cache first
    const cachedWeather = getCachedWeather(city.lat, city.lng)
    if (cachedWeather) {
      setWeatherData(cachedWeather)
      setShowWeatherPopup(true)
      addToast({
        type: "info",
        title: "Using cached data",
        message: "Weather data loaded from cache",
        duration: 2000,
      })
      return
    }

    setLoading(true)
    try {
      const weather = await fetchWeatherData(city.lat, city.lng)
      setCachedWeather(city.lat, city.lng, weather)
      setWeatherData(weather)
      setShowWeatherPopup(true)
      addToast({
        type: "success",
        title: "Weather loaded",
        message: `Current weather for ${city.name}`,
        duration: 2000,
      })
    } catch (error) {
      console.error("Error fetching weather:", error)
      addToast({
        type: "error",
        title: "Weather unavailable",
        message: error instanceof Error ? error.message : "Failed to load weather data",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTileLayerChange = (newLayer: string) => {
    if (map && !mapError) {
      try {
        // Remove current tile layers
        map.eachLayer((layer: any) => {
          if (layer instanceof L.TileLayer) {
            map.removeLayer(layer)
          }
        })

        // Add new tile layer
        const tileLayer = L.tileLayer(tileLayers[newLayer].url, {
          attribution: tileLayers[newLayer].attribution,
          maxZoom: 18,
          className: "map-tiles",
        }).addTo(map)

        setCurrentTileLayer(newLayer)

        addToast({
          type: "info",
          title: "Map Style Changed",
          message: `Switched to ${tileLayers[newLayer].name.replace(/[🗺️🛰️🏔️🌙☀️]/gu, "").trim()}`,
          duration: 2000,
        })
      } catch (error) {
        console.error("Error changing tile layer:", error)
        addToast({
          type: "error",
          title: "Style Change Failed",
          message: "Could not change map style",
        })
      }
    }
  }

  // Render error state
  if (mapError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-xs sm:max-w-md w-full bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Map Loading Error</h3>
          <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">{mapError}</p>
          <div className="space-y-1 sm:space-y-2 text-2xs sm:text-xs text-gray-500">
            <p>• Check your internet connectivity</p>
            <p>• Try refreshing the page</p>
            <p>• Contact support if the issue persists</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading Overlay */}
      {(loading || isLoading) && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-xl flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 border-3 border-transparent border-t-blue-400 rounded-full animate-spin"
                style={{ animationDelay: "150ms" }}
              ></div>
            </div>
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              {isLoading ? "Loading map..." : "Loading weather data..."}
            </span>
          </div>
        </div>
      )}

      {/* Weather Popup */}
      {showWeatherPopup && weatherData && popupCity && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[1000]">
          <WeatherPopup
            city={popupCity}
            weatherData={weatherData}
            onClose={() => {
              setShowWeatherPopup(false)
              setWeatherData(null)
              setPopupCity(null)
            }}
          />
        </div>
      )}

      {/* Map Style Selector - Desktop */}
      {!mapError && !isLoading && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg z-[500] hidden md:block">
          <div className="p-2 sm:p-3">
            <label className="block text-2xs sm:text-xs font-semibold text-gray-700 mb-1 sm:mb-2">Map Style</label>
            <select
              value={currentTileLayer}
              onChange={(e) => handleTileLayerChange(e.target.value)}
              className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(tileLayers).map(([key, layer]) => (
                <option key={key} value={key}>
                  {layer.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Map Legend - Desktop */}
      {!mapError && !isLoading && (
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg z-[500] hidden md:block">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3">Map Legend</h4>
          <div className="space-y-1.5 sm:space-y-2 text-2xs sm:text-xs text-gray-600">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border border-white shadow-sm"></div>
              <span>City location</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full border border-white shadow-sm"></div>
              <span>Weather info</span>
            </div>
            <div className="pt-1.5 sm:pt-2 border-t border-gray-200">
              <div className="text-2xs sm:text-xs text-gray-500">🌍 Free & Open Source • 🗺️ OpenStreetMap</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Style Selector */}
      {!mapError && !isLoading && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 md:hidden bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg z-[500]">
          <select
            value={currentTileLayer}
            onChange={(e) => handleTileLayerChange(e.target.value)}
            className="p-1.5 sm:p-2 text-xs sm:text-sm border-none bg-transparent focus:outline-none"
          >
            {Object.entries(tileLayers).map(([key, layer]) => (
              <option key={key} value={key}>
                {layer.name.replace(/[🗺️🛰️🏔️🌙☀️]/gu, "").trim()}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
