"use client"

import { useState, useCallback } from "react"
import type { WeatherData } from "../types"

interface CacheEntry {
  data: WeatherData
  timestamp: number
}

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
const weatherCache = new Map<string, CacheEntry>()

export function useWeatherCache() {
  const [loading, setLoading] = useState(false)

  const getCachedWeather = useCallback((lat: number, lng: number): WeatherData | null => {
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`
    const cached = weatherCache.get(key)

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    if (cached) {
      weatherCache.delete(key)
    }

    return null
  }, [])

  const setCachedWeather = useCallback((lat: number, lng: number, data: WeatherData) => {
    const key = `${lat.toFixed(2)},${lng.toFixed(2)}`
    weatherCache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }, [])

  return {
    loading,
    setLoading,
    getCachedWeather,
    setCachedWeather,
  }
}
