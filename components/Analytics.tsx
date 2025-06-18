"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// Simple analytics tracking
export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page views
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: pathname,
      })
    }
  }, [pathname])

  useEffect(() => {
    // Track performance metrics
    if (typeof window !== "undefined" && "performance" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            const navigationEntry = entry as PerformanceNavigationTiming
            console.log("Page Load Time:", navigationEntry.loadEventEnd - navigationEntry.loadEventStart)
          }
        }
      })

      observer.observe({ entryTypes: ["navigation"] })

      return () => observer.disconnect()
    }
  }, [])

  return null
}
