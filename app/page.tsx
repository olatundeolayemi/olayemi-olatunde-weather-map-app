"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Sidebar from "../components/Sidebar"
import MobileHeader from "../components/MobileHeader"
import OfflineIndicator from "../components/OfflineIndicator"
import KeyboardShortcuts from "../components/KeyboardShortcuts"
import ApiKeySetup from "../components/ApiKeySetup"
import type { City } from "../types"
import { cities } from "../data/cities"
import { ErrorBoundary } from "../components/ErrorBoundary"
import { useToast } from "../hooks/useToast"
import Toast from "../components/Toast"
import LoadingSpinner from "../components/LoadingSpinner"

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import("../components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <LoadingSpinner size="xl" text="Loading interactive map..." variant="default" className="text-center" />
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-4 py-2">
          <span>🌍 Free & Open Source</span>
          <span>•</span>
          <span>🗺️ Leaflet Maps</span>
          <span>•</span>
          <span>🌤️ Real-time Weather</span>
        </div>
      </div>
    </div>
  ),
})

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showApiSetup, setShowApiSetup] = useState(false)

  const { toasts, addToast } = useToast()

  // Check API key status
  const hasApiKey = !!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)

      // Show API setup if no key is configured
      if (!hasApiKey) {
        setTimeout(() => {
          addToast({
            type: "info",
            title: "API Key Required",
            message: "Add your OpenWeatherMap API key for real-time weather data",
            duration: 5000,
          })
        }, 1000)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [hasApiKey, addToast])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false)
        setShowApiSetup(false)
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        // KeyboardShortcuts component handles this
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Initializing Weather Map..." variant="default" className="mb-8" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">Weather Map</h1>
            <p className="text-gray-600">Real-time global weather forecasts</p>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>🌍 20 Global Cities</span>
            <span>•</span>
            <span>⚡ Live Weather Data</span>
            <span>•</span>
            <span>🗺️ Interactive Maps</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Toast Container */}
        <div className="fixed top-4 right-4 z-[9999] space-y-2">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </div>

        {/* Mobile Header */}
        <MobileHeader selectedCity={selectedCity} onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="w-80">
              <Sidebar onCitySelect={handleCitySelect} selectedCity={selectedCity} />
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              />
              <div className="relative flex flex-col w-80 max-w-xs bg-white shadow-xl">
                <Sidebar
                  onCitySelect={handleCitySelect}
                  selectedCity={selectedCity}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1 relative">
            <LeafletMap selectedCity={selectedCity} cities={cities} />
          </div>
        </div>

        {/* API Key Setup Modal */}
        <ApiKeySetup isOpen={showApiSetup} onClose={() => setShowApiSetup(false)} />

        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts />

        {/* API Setup Button (if no key) */}
        {!hasApiKey && (
          <button
            onClick={() => setShowApiSetup(true)}
            className="fixed bottom-20 right-4 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-[500] flex items-center space-x-2"
          >
            <span className="text-sm font-medium">Setup API Key</span>
          </button>
        )}
      </div>
    </ErrorBoundary>
  )
}
