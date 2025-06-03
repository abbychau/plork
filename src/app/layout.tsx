import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { PinnedUsersProviderWithAuth } from "@/lib/pinned-users-provider-with-auth";
import Script from "next/script";

import { Toaster } from "@/components/ui/toaster";
import DynamicTitle from "@/components/dynamic-title";
import BottomMenu from "@/components/bottom-menu";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import AutoPushNotificationModal from "@/components/auto-push-notification-modal";
import NetworkStatus from "@/components/network-status";
import faviconSVG from "./favicon.svg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0F172A',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Plork - ActivityPub SNS",
  description: "A minimal ActivityPub-compatible social network",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Plork",
  },
  icons: {
    icon: faviconSVG.src,
    apple: [
      { url: "/icons/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider defaultTheme="dark" storageKey="plork-theme">
            <PinnedUsersProviderWithAuth>
            <DynamicTitle />
            <div className="min-h-screen flex flex-col items-center justify-center professional-bg p-0 lg:p-4">
              <main className="w-full lg:h-[calc(100vh-50px)] h-[calc(100vh)] bg-background border border-border lg:rounded-lg rounded-none shadow-lg overflow-hidden">
                {children}
              </main>
              <BottomMenu />
              <Toaster />
              <PWAInstallPrompt />
              <AutoPushNotificationModal />
              <NetworkStatus />
            </div>
            </PinnedUsersProviderWithAuth>
          </ThemeProvider>
        </AuthProvider>
        <Script src="/sw-register.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
