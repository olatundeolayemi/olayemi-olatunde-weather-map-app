import Head from "next/head"

interface SEOHeadProps {
  title?: string
  description?: string
  city?: string
  temperature?: number
}

export default function SEOHead({ title, description, city, temperature }: SEOHeadProps) {
  const defaultTitle = "Weather Map - Global Weather Forecast"
  const defaultDescription =
    "Interactive weather map showing current conditions and forecasts for 20 major cities worldwide"

  const pageTitle = city && temperature ? `${city} Weather: ${temperature}°C | Weather Map` : title || defaultTitle

  const pageDescription =
    city && temperature
      ? `Current weather in ${city}: ${temperature}°C. View detailed forecasts and conditions on our interactive weather map.`
      : description || defaultDescription

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />

      {city && (
        <>
          <meta name="geo.placename" content={city} />
          <meta name="geo.region" content={city} />
        </>
      )}

      <link rel="canonical" href={typeof window !== "undefined" ? window.location.href : ""} />
    </Head>
  )
}
