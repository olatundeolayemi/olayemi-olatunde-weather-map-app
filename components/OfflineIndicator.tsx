"use client"

import { Wifi, WifiOff, CheckCircle } from "lucide-react"
import { useOfflineDetection } from "../hooks/useOfflineDetection"
import { useEffect, useState } from "react"

export default function OfflineIndicator() {
  const { isOnline, wasOffline } = useOfflineDetection()
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true)
      const timer = setTimeout(() => setShowReconnected(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  if (isOnline && !showReconnected) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]">
      <div
        className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
          isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        {isOnline ? (
          showReconnected ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Back online!</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Online</span>
            </>
          )
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline</span>
          </>
        )}
      </div>
    </div>
  )
}
