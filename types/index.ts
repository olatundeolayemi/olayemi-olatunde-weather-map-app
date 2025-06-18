export interface City {
  id: number
  name: string
  country: string
  lat: number
  lng: number
}

export interface WeatherData {
  current: {
    temp: number
    description: string
    icon: string
    humidity: number
    windSpeed: number
  }
  forecast: {
    today: {
      temp_max: number
      temp_min: number
      description: string
      icon: string
    }
    tomorrow: {
      temp_max: number
      temp_min: number
      description: string
      icon: string
    }
  }
}
