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
    startupImage: "/icon-512x512.png",
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
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Russian Rummy Timer" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="application-name" content="Russian Rummy Timer" />

        {/* PWA Debug Info */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('PWA Debug Info:');
              console.log('User Agent:', navigator.userAgent);
              console.log('Display Mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
              console.log('Service Worker Support:', 'serviceWorker' in navigator);
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <PWAInstallPrompt />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
