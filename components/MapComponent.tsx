"use client"

import { useEffect, useRef, useState } from "react"
import type { City, WeatherData } from "../types"
import { fetchWeatherData } from "../services/weatherService"
import WeatherPopup from "./WeatherPopup"
import { useWeatherCache } from "../hooks/useWeatherCache"
import { useToast } from "../hooks/useToast"

interface MapComponentProps {
  selectedCity: City | null
  cities: City[]
}

export default function MapComponent({ selectedCity, cities }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [showWeatherPopup, setShowWeatherPopup] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [popupCity, setPopupCity] = useState<City | null>(null)
  const [map, setMap] = useState<any>(null)
  const [L, setL] = useState<any>(null)
  const markersRef = useRef<any[]>([])
  const { loading, setLoading, getCachedWeather, setCachedWeather } = useWeatherCache()
  const { addToast } = useToast()

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
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
      }
    }

    loadLeaflet()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!L || !mapContainer.current || map) return

    const newMap = L.map(mapContainer.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    })

    // Add tile layer with better styling
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      className: "map-tiles",
    }).addTo(newMap)

    // Create enhanced custom markers
    const createCustomMarker = (city: City) => {
      const markerHtml = `
        <div class="relative group">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 border-3 border-white transform hover:scale-110">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div class="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md hover:from-orange-600 hover:to-orange-700 transition-all duration-200 cursor-pointer transform hover:scale-110" id="info-btn-${city.id}">
            <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div class="absolute top-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Click info for weather
          </div>
        </div>
      `

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      })

      return customIcon
    }

    // Add markers for all cities
    cities.forEach((city) => {
      const customIcon = createCustomMarker(city)
      const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(newMap)

      marker.bindTooltip(`${city.name}, ${city.country}`, {
        permanent: false,
        direction: "top",
        offset: [0, -45],
        className: "custom-tooltip",
      })

      markersRef.current.push(marker)
    })

    setMap(newMap)

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      newMap.remove()
    }
  }, [L, cities])

  // Add click handlers after map is created
  useEffect(() => {
    if (!map) return

    const handleInfoClick = async (cityId: number) => {
      const city = cities.find((c) => c.id === cityId)
      if (!city) return

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

    // Add event listeners to info buttons
    cities.forEach((city) => {
      const infoBtn = document.getElementById(`info-btn-${city.id}`)
      if (infoBtn) {
        infoBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          handleInfoClick(city.id)
        })
      }
    })

    return () => {
      cities.forEach((city) => {
        const infoBtn = document.getElementById(`info-btn-${city.id}`)
        if (infoBtn) {
          infoBtn.removeEventListener("click", () => {})
        }
      })
    }
  }, [map, cities, getCachedWeather, setCachedWeather, setLoading, addToast])

  // Handle city selection with smooth animation
  useEffect(() => {
    if (selectedCity && map) {
      map.setView([selectedCity.lat, selectedCity.lng], 10, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25,
      })
    }
  }, [selectedCity, map])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl p-6 shadow-xl flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">Loading weather data...</span>
          </div>
        </div>
      )}

      {/* Weather Popup */}
      {showWeatherPopup && weatherData && popupCity && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
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

      {/* Map Controls Info */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[500] hidden md:block">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>City location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Weather info</span>
          </div>
        </div>
      </div>
    </div>
  )
}
