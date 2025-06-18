import type { WeatherData } from "../types"
import { validateEnvironment } from "../utils/envValidation"

const { hasApiKey } = validateEnvironment()
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY!
const BASE_URL = "https://api.openweathermap.org/data/2.5"

// Rate limiting
const requestQueue: Array<() => Promise<any>> = []
let isProcessing = false

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return

  isProcessing = true
  const request = requestQueue.shift()

  if (request) {
    try {
      await request()
    } catch (error) {
      console.error("Request failed:", error)
    }

    // Wait 100ms between requests to respect API limits
    setTimeout(() => {
      isProcessing = false
      processQueue()
    }, 100)
  } else {
    isProcessing = false
  }
}

export const fetchWeatherData = async (lat: number, lng: number): Promise<WeatherData> => {
  return new Promise((resolve, reject) => {
    const executeRequest = async () => {
      try {
        if (!hasApiKey || !API_KEY) {
          throw new Error(
            "OpenWeatherMap API key is required. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to your environment variables.",
          )
        }

        // Fetch current weather with timeout
        const currentController = new AbortController()
        const currentTimeout = setTimeout(() => currentController.abort(), 10000)

        const currentResponse = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`, {
          signal: currentController.signal,
        })
        clearTimeout(currentTimeout)

        if (!currentResponse.ok) {
          if (currentResponse.status === 401) {
            throw new Error("Invalid API key. Please check your OpenWeatherMap API key.")
          }
          if (currentResponse.status === 429) {
            throw new Error("API rate limit exceeded. Please try again later.")
          }
          throw new Error(`Weather API error: ${currentResponse.status} - ${currentResponse.statusText}`)
        }

        const currentData = await currentResponse.json()

        // Fetch 5-day forecast with timeout
        const forecastController = new AbortController()
        const forecastTimeout = setTimeout(() => forecastController.abort(), 10000)

        const forecastResponse = await fetch(
          `${BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`,
          { signal: forecastController.signal },
        )
        clearTimeout(forecastTimeout)

        if (!forecastResponse.ok) {
          if (forecastResponse.status === 401) {
            throw new Error("Invalid API key. Please check your OpenWeatherMap API key.")
          }
          if (forecastResponse.status === 429) {
            throw new Error("API rate limit exceeded. Please try again later.")
          }
          throw new Error(`Forecast API error: ${forecastResponse.status} - ${forecastResponse.statusText}`)
        }

        const forecastData = await forecastResponse.json()

        // Process forecast data for today and tomorrow
        const today = new Date().toDateString()
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString()

        const todayForecast =
          forecastData.list.find((item: any) => new Date(item.dt * 1000).toDateString() === today) ||
          forecastData.list[0]

        const tomorrowForecast =
          forecastData.list.find((item: any) => new Date(item.dt * 1000).toDateString() === tomorrow) ||
          forecastData.list[8] // Approximate tomorrow

        const weatherData: WeatherData = {
          current: {
            temp: Math.round(currentData.main.temp),
            description: currentData.weather[0].description,
            icon: currentData.weather[0].icon,
            humidity: currentData.main.humidity,
            windSpeed: Math.round(currentData.wind?.speed * 3.6 || 0), // Convert m/s to km/h
          },
          forecast: {
            today: {
              temp_max: Math.round(todayForecast.main.temp_max),
              temp_min: Math.round(todayForecast.main.temp_min),
              description: todayForecast.weather[0].description,
              icon: todayForecast.weather[0].icon,
            },
            tomorrow: {
              temp_max: Math.round(tomorrowForecast.main.temp_max),
              temp_min: Math.round(tomorrowForecast.main.temp_min),
              description: tomorrowForecast.weather[0].description,
              icon: tomorrowForecast.weather[0].icon,
            },
          },
        }

        resolve(weatherData)
      } catch (error) {
        console.error("Error fetching weather data:", error)

        if (error instanceof Error && error.name === "AbortError") {
          reject(new Error("Request timeout - please try again"))
        } else if (error instanceof Error) {
          reject(error)
        } else {
          reject(new Error("Failed to fetch weather data. Please check your internet connection and API key."))
        }
      }
    }

    requestQueue.push(executeRequest)
    processQueue()
  })
}
