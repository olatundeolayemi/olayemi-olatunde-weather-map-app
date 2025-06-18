import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "Weather Map - Global Weather Forecast",
    template: "%s | Weather Map",
  },
  description:
    "Interactive weather map showing current conditions and forecasts for 20 major cities worldwide. Built with React, TypeScript, Next.js, and Leaflet. Free, fast, and reliable weather data.",
  keywords: [
    "weather",
    "map",
    "forecast",
    "cities",
    "global",
    "interactive",
    "leaflet",
    "react",
    "typescript",
    "nextjs",
    "real-time",
    "mobile-friendly",
    "responsive",
  ],
  authors: [{ name: "Iyanu Olayemi", url: "https://iyanuolayemi.dev" }],
  creator: "Iyanu Olayemi",
  publisher: "Iyanu Olayemi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-weather-map.vercel.app",
    title: "Weather Map - Global Weather Forecast",
    description:
      "Interactive weather map showing current conditions and forecasts for 20 major cities worldwide. Free, fast, and reliable.",
    siteName: "Weather Map",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Weather Map - Global Weather Forecast",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weather Map - Global Weather Forecast",
    description: "Interactive weather map showing current conditions and forecasts for 20 major cities worldwide.",
    images: ["/og-image.png"],
    creator: "@iyanuolayemi",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  category: "weather",
  classification: "Weather Application",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//api.openweathermap.org" />
        <link rel="dns-prefetch" href="//unpkg.com" />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Weather Map",
              description:
                "Interactive weather map showing current conditions and forecasts for 20 major cities worldwide",
              url: "https://your-weather-map.vercel.app",
              applicationCategory: "Weather",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Iyanu Olayemi",
                url: "https://iyanuolayemi.dev",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <noscript>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                backgroundColor: "white",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h1>JavaScript Required</h1>
              <p>This weather map application requires JavaScript to function properly.</p>
              <p>Please enable JavaScript in your browser and refresh the page.</p>
            </div>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  )
}
