"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showManualInstructions, setShowManualInstructions] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true)
        return true
      }

      // Check for iOS Safari
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return true
      }
      return false
    }

    if (checkIfInstalled()) return

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt fired")
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show install prompt after a delay
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true)
        }
      }, 2000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("App installed")
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setShowManualInstructions(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Show manual instructions after some time if no prompt appeared
    const timer = setTimeout(() => {
      if (
        !deferredPrompt &&
        !isInstalled &&
        (typeof window === "undefined" || !sessionStorage.getItem("installPromptDismissed"))
      ) {
        setShowManualInstructions(true)
      }
    }, 5000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearTimeout(timer)
    }
  }, [isInstalled, deferredPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log("Install prompt outcome:", outcome)

      if (outcome === "accepted") {
        setShowInstallPrompt(false)
      }
    } catch (error) {
      console.error("Install prompt error:", error)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    setShowManualInstructions(false)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("installPromptDismissed", "true")
    }
  }

  const handleShowManualInstructions = () => {
    setShowInstallPrompt(false)
    setShowManualInstructions(true)
  }

  // Don't show if already installed or dismissed
  if (isInstalled || (typeof window !== "undefined" && sessionStorage.getItem("installPromptDismissed"))) {
    return null
  }

  // Show manual instructions for iOS or when auto-prompt failed
  if (showManualInstructions || isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
        <Card className="shadow-lg border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Install App</h3>
                  <p className="text-sm text-gray-600">Add to home screen</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-sm text-gray-700 mb-4 space-y-2">
              <p className="font-medium">To install this app:</p>
              {isIOS ? (
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>
                    Tap the Share button <span className="font-mono">⬆️</span>
                  </li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Tap the menu button (⋮) in Chrome</li>
                  <li>Select "Add to Home screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={handleDismiss} className="w-full bg-transparent">
              Got it
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show automatic install prompt
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <Card className="shadow-lg border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Install App</h3>
                  <p className="text-sm text-gray-600">Add to home screen</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-700 mb-4">Install Russian Rummy Timer for quick access and offline play!</p>

            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Install
              </Button>
              <Button variant="outline" size="sm" onClick={handleShowManualInstructions}>
                Help
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
