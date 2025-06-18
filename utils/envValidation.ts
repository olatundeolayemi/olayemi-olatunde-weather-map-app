export function validateEnvironment() {
  const requiredEnvVars = {
    NEXT_PUBLIC_OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
  }

  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`)
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Please add your OpenWeatherMap API key.`,
    )
  }

  return {
    isValid: missing.length === 0,
    missing,
    hasApiKey: !!requiredEnvVars.NEXT_PUBLIC_OPENWEATHER_API_KEY,
  }
}
