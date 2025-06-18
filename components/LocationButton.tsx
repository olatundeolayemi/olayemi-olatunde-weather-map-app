"use client"

import { MapPin, Loader2 } from "lucide-react"
import { useGeolocation } from "../hooks/useGeolocation"
import { useToast } from "../hooks/useToast"
import type { City } from "../types"

interface LocationButtonProps {
  cities: City[]
  onLocationFound: (city: City) => void
}

export default function LocationButton({ cities, onLocationFound }: LocationButtonProps) {
  const { latitude, longitude, error, loading, getCurrentLocation } = useGeolocation()
  const { addToast } = useToast()

  const findNearestCity = (lat: number, lng: number): City => {
    let nearestCity = cities[0]
    let minDistance = Number.POSITIVE_INFINITY

    cities.forEach((city) => {
      const distance = Math.sqrt(Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2))
      if (distance < minDistance) {
        minDistance = distance
        nearestCity = city
      }
    })

    return nearestCity
  }

  const handleLocationClick = () => {
    getCurrentLocation()
  }

  // Handle location found
  if (latitude && longitude && !loading) {
    const nearestCity = findNearestCity(latitude, longitude)
    onLocationFound(nearestCity)
    addToast({
      type: "success",
      title: "Location found",
      message: `Nearest city: ${nearestCity.name}`,
      duration: 3000,
    })
  }

  // Handle location error
  if (error) {
    addToast({
      type: "error",
      title: "Location error",
      message: error,
      duration: 5000,
    })
  }

  return (
    <button
      onClick={handleLocationClick}
      disabled={loading}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      aria-label="Find my location"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
      <span className="text-sm font-medium">{loading ? "Finding..." : "My Location"}</span>
    </button>
  )
}
