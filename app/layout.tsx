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
    statusBarStyle: "black-translucent",
    title: "Russian Rummy Timer",
    startupImage: [
      {
        url: "/icon-512x512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
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
        {/* Essential PWA meta tags */}
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />

        {/* iOS PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Russian Rummy Timer" />

        {/* Android PWA support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Russian Rummy Timer" />

        {/* Windows PWA support */}
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Prevent zoom and ensure full screen */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* PWA Debug and Detection Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // PWA Detection and Debug
              window.addEventListener('load', function() {
                console.log('=== PWA Debug Info ===');
                console.log('User Agent:', navigator.userAgent);
                console.log('Display Mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser');
                console.log('Service Worker Support:', 'serviceWorker' in navigator);
                console.log('Is PWA:', window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
                console.log('Screen:', screen.width + 'x' + screen.height);
                console.log('Viewport:', window.innerWidth + 'x' + window.innerHeight);
                
                // Check if running as PWA
                if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
                  document.body.classList.add('pwa-mode');
                  console.log('✅ Running as PWA - Standalone mode active');
                } else {
                  console.log('❌ Running in browser - Not installed as PWA');
                }
              });
              
              // Prevent default browser behaviors in PWA mode
              if (window.matchMedia('(display-mode: standalone)').matches) {
                // Prevent pull-to-refresh
                document.addEventListener('touchstart', function(e) {
                  if (e.touches.length > 1) {
                    e.preventDefault();
                  }
                }, { passive: false });
                
                // Prevent zoom
                document.addEventListener('touchmove', function(e) {
                  if (e.scale !== 1) {
                    e.preventDefault();
                  }
                }, { passive: false });
              }
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
