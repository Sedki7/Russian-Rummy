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
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent
    const iOS = /iPad|iPhone|iPod/.test(userAgent)
    const android = /Android/.test(userAgent)

    setIsIOS(iOS)
    setIsAndroid(android)

    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check for standalone mode (PWA installed)
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true)
        return true
      }

      // Check for iOS Safari standalone
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return true
      }

      return false
    }

    if (checkIfInstalled()) {
      console.log("✅ App is already installed as PWA")
      return
    }

    // Listen for beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("🎯 beforeinstallprompt event fired - PWA installable!")
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show install prompt after a short delay
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true)
        }
      }, 3000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("✅ PWA installed successfully!")
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setShowManualInstructions(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    // Show manual instructions if no auto-prompt after delay
    const timer = setTimeout(() => {
      if (
        !deferredPrompt &&
        !isInstalled &&
        (typeof window === "undefined" || !sessionStorage.getItem("installPromptDismissed"))
      ) {
        console.log("⚠️ No auto-prompt detected, showing manual instructions")
        setShowManualInstructions(true)
      }
    }, 8000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearTimeout(timer)
    }
  }, [isInstalled, deferredPrompt])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      console.log("🚀 Triggering PWA install prompt...")
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log("📊 Install prompt outcome:", outcome)

      if (outcome === "accepted") {
        console.log("✅ User accepted PWA installation")
        setShowInstallPrompt(false)
      } else {
        console.log("❌ User dismissed PWA installation")
      }
    } catch (error) {
      console.error("❌ Install prompt error:", error)
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
  if (showManualInstructions || (isIOS && !showInstallPrompt)) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
        <Card className="shadow-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Install as App</h3>
                  <p className="text-sm text-gray-600">Get the full experience</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-sm text-gray-700 mb-4 space-y-3">
              <p className="font-medium">📱 To install as a standalone app:</p>

              {isIOS ? (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-800 mb-2">iOS Safari:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
                    <li>
                      Tap the Share button <span className="font-mono bg-blue-100 px-1 rounded">⬆️</span>
                    </li>
                    <li>
                      Scroll down and tap <strong>"Add to Home Screen"</strong>
                    </li>
                    <li>
                      Tap <strong>"Add"</strong> to install
                    </li>
                    <li>🎉 App will open without browser bars!</li>
                  </ol>
                </div>
              ) : isAndroid ? (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-800 mb-2">Android Chrome:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-green-700">
                    <li>
                      Tap the menu button <span className="font-mono bg-green-100 px-1 rounded">⋮</span>
                    </li>
                    <li>
                      Select <strong>"Add to Home screen"</strong>
                    </li>
                    <li>
                      Tap <strong>"Add"</strong> to install
                    </li>
                    <li>🎉 App will open in standalone mode!</li>
                  </ol>
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-800 mb-2">Desktop/Other:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                    <li>Look for install icon in address bar</li>
                    <li>Or use browser menu → "Install app"</li>
                    <li>Follow the installation prompts</li>
                  </ol>
                </div>
              )}

              <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800">
                <strong>💡 Tip:</strong> Once installed, the app opens without browser navigation bars for a native app
                experience!
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleDismiss} className="w-full bg-transparent">
              Got it, thanks!
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show automatic install prompt (Android Chrome with beforeinstallprompt)
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
        <Card className="shadow-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 animate-bounce">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Install App</h3>
                  <p className="text-sm text-gray-600">One-click install available!</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              🚀 Install Russian Rummy Timer as a standalone app for the best experience - no browser bars!
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Install Now
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
