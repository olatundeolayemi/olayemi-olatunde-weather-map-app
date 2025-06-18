"use client"

import { Menu, MapPin } from "lucide-react"
import type { City } from "../types"

interface MobileHeaderProps {
  selectedCity: City | null
  onMenuClick: () => void
}

export default function MobileHeader({ selectedCity, onMenuClick }: MobileHeaderProps) {
  return (
    <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
      </button>
      <div className="flex-1 text-center px-2">
        <h1 className="text-base sm:text-lg font-bold text-gray-900">Weather Map</h1>
        {selectedCity && (
          <div className="flex items-center justify-center mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-600">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
            <span className="truncate max-w-[200px] sm:max-w-none">
              {selectedCity.name}, {selectedCity.country}
            </span>
          </div>
        )}
      </div>
      <div className="w-8 sm:w-10" /> {/* Spacer for centering */}
    </div>
  )
}
