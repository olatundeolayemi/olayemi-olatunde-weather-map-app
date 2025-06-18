"use client"

import { useEffect, useCallback } from "react"
import type { City } from "../types"

interface UseKeyboardNavigationProps {
  cities: City[]
  selectedCity: City | null
  onCitySelect: (city: City) => void
  isSearchFocused: boolean
}

export function useKeyboardNavigation({
  cities,
  selectedCity,
  onCitySelect,
  isSearchFocused,
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isSearchFocused) return

      const currentIndex = selectedCity ? cities.findIndex((city) => city.id === selectedCity.id) : -1

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault()
          const nextIndex = currentIndex < cities.length - 1 ? currentIndex + 1 : 0
          onCitySelect(cities[nextIndex])
          break

        case "ArrowUp":
          event.preventDefault()
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : cities.length - 1
          onCitySelect(cities[prevIndex])
          break

        case "Home":
          event.preventDefault()
          onCitySelect(cities[0])
          break

        case "End":
          event.preventDefault()
          onCitySelect(cities[cities.length - 1])
          break
      }
    },
    [cities, selectedCity, onCitySelect, isSearchFocused],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}
