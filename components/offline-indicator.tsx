"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
      } else {
        // Hide indicator after a delay when back online
        setTimeout(() => setShowIndicator(false), 3000)
      }
    }

    // Set initial status
    updateOnlineStatus()

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-64">
      <Card className={`shadow-lg ${isOnline ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
        <CardContent className="p-3">
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <WifiOff className="w-5 h-5 text-orange-600 mr-2" />
            )}
            <div>
              <p className={`text-sm font-medium ${isOnline ? "text-green-800" : "text-orange-800"}`}>
                {isOnline ? "Back Online" : "Offline Mode"}
              </p>
              <p className={`text-xs ${isOnline ? "text-green-600" : "text-orange-600"}`}>
                {isOnline ? "All features available" : "App works offline"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
