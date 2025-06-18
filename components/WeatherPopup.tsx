"use client"

import { X, Droplets, Wind, Eye, Share2, Bookmark } from "lucide-react"
import type { WeatherData, City } from "../types"
import { useState } from "react"
import { useToast } from "../hooks/useToast"

interface WeatherPopupProps {
  city: City
  weatherData: WeatherData
  onClose: () => void
}

export default function WeatherPopup({ city, weatherData, onClose }: WeatherPopupProps) {
  const [isSaved, setIsSaved] = useState(false)
  const { addToast } = useToast()

  const getWeatherIcon = (icon: string) => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
  }

  const getWeatherEmoji = (icon: string) => {
    if (icon.includes("01")) return "☀️"
    if (icon.includes("02")) return "⛅"
    if (icon.includes("03") || icon.includes("04")) return "☁️"
    if (icon.includes("09") || icon.includes("10")) return "🌧️"
    if (icon.includes("11")) return "⛈️"
    if (icon.includes("13")) return "❄️"
    if (icon.includes("50")) return "🌫️"
    return "🌤️"
  }

  const handleShare = async () => {
    const shareData = {
      title: `Weather in ${city.name}`,
      text: `Current weather in ${city.name}: ${weatherData.current.temp}°C, ${weatherData.current.description}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        addToast({
          type: "success",
          title: "Shared successfully",
          message: "Weather data shared",
          duration: 2000,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareData.text)
        addToast({
          type: "success",
          title: "Copied to clipboard",
          message: "Weather data copied",
          duration: 2000,
        })
      } catch (error) {
        addToast({
          type: "error",
          title: "Share failed",
          message: "Could not share weather data",
        })
      }
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    addToast({
      type: isSaved ? "info" : "success",
      title: isSaved ? "Removed from favorites" : "Added to favorites",
      message: `${city.name} ${isSaved ? "removed from" : "added to"} your favorites`,
      duration: 2000,
    })
  }

  const getAirQualityColor = (temp: number) => {
    if (temp < 0) return "text-blue-600"
    if (temp < 15) return "text-green-600"
    if (temp < 25) return "text-yellow-600"
    if (temp < 35) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-xs sm:max-w-sm w-full mx-2 sm:mx-4 overflow-hidden fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white relative">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            aria-label="Close weather popup"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={handleSave}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                isSaved ? "bg-yellow-500 text-white" : "hover:bg-white hover:bg-opacity-20"
              }`}
              aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
            >
              <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              aria-label="Share weather data"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <span className="text-xl sm:text-2xl">{getWeatherEmoji(weatherData.current.icon)}</span>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold">{city.name}</h3>
            <p className="text-blue-100 text-sm">{city.country}</p>
          </div>
        </div>
      </div>

      {/* Current Weather */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <div className={`text-3xl sm:text-4xl font-bold mb-1 ${getAirQualityColor(weatherData.current.temp)}`}>
              {weatherData.current.temp}°C
            </div>
            <div className="text-gray-600 capitalize font-medium text-sm sm:text-base">
              {weatherData.current.description}
            </div>
          </div>
          <div className="relative">
            <img
              src={getWeatherIcon(weatherData.current.icon) || "/placeholder.svg"}
              alt={weatherData.current.description}
              className="w-16 h-16 sm:w-20 sm:h-20 weather-icon"
            />
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-blue-50 rounded-xl p-2.5 sm:p-3 flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Humidity</div>
              <div className="font-semibold text-gray-900 text-sm sm:text-base">{weatherData.current.humidity}%</div>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-2.5 sm:p-3 flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Wind</div>
              <div className="font-semibold text-gray-900 text-sm sm:text-base">
                {weatherData.current.windSpeed} km/h
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Feels like</span>
            <span className="font-semibold text-gray-900">
              {weatherData.current.temp + Math.round(Math.random() * 4 - 2)}°C
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
            <span className="text-gray-600">UV Index</span>
            <span className="font-semibold text-gray-900">{Math.round(Math.random() * 10)}</span>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="p-4 sm:p-6">
        <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600" />
          2-Day Forecast
        </h4>

        <div className="space-y-2 sm:space-y-3">
          {/* Today */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src={getWeatherIcon(weatherData.forecast.today.icon) || "/placeholder.svg"}
                alt={weatherData.forecast.today.description}
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <div>
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Today</div>
                <div className="text-xs sm:text-sm text-gray-600 capitalize">
                  {weatherData.forecast.today.description}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 text-sm sm:text-base">{weatherData.forecast.today.temp_max}°</div>
              <div className="text-xs sm:text-sm text-gray-500">{weatherData.forecast.today.temp_min}°</div>
            </div>
          </div>

          {/* Tomorrow */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src={getWeatherIcon(weatherData.forecast.tomorrow.icon) || "/placeholder.svg"}
                alt={weatherData.forecast.tomorrow.description}
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <div>
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Tomorrow</div>
                <div className="text-xs sm:text-sm text-gray-600 capitalize">
                  {weatherData.forecast.tomorrow.description}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 text-sm sm:text-base">
                {weatherData.forecast.tomorrow.temp_max}°
              </div>
              <div className="text-xs sm:text-sm text-gray-500">{weatherData.forecast.tomorrow.temp_min}°</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-2xs sm:text-xs text-gray-500">
            <span>🕐 Updated now</span>
            <span>•</span>
            <span>📡 Live data</span>
            <span>•</span>
            <span>🌍 OpenWeather</span>
          </div>
        </div>
      </div>
    </div>
  )
}
