import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { PinnedUsersProvider } from "@/lib/pinned-users-context";

import { Toaster } from "@/components/ui/toaster";
import DynamicTitle from "@/components/dynamic-title";
import BottomMenu from "@/components/bottom-menu";
import faviconSVG from "./favicon.svg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plork - ActivityPub SNS",
  description: "A minimal ActivityPub-compatible social network",
  icons: {
    icon: faviconSVG.src,
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
          <ThemeProvider defaultTheme="system" storageKey="plork-theme">
            <PinnedUsersProvider>
            <DynamicTitle />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
              <main className="w-full max-w-6xl h-[800px] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                {children}
              </main>
              <BottomMenu />
              <Toaster />
            </div>
            </PinnedUsersProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
