import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Russian Rummy Timer",
  description: "A game timer and player manager for Russian Rummy card games",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Russian Rummy Timer",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Russian Rummy Timer",
    title: "Russian Rummy Timer",
    description: "A game timer and player manager for Russian Rummy card games",
  },
  twitter: {
    card: "summary",
    title: "Russian Rummy Timer",
    description: "A game timer and player manager for Russian Rummy card games",
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Russian Rummy Timer" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        {children}
        <PWAInstallPrompt />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
