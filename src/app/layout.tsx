import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { PinnedUsersProviderWithAuth } from "@/lib/pinned-users-provider-with-auth";

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
            <PinnedUsersProviderWithAuth>
            <DynamicTitle />
            <div className="min-h-screen flex flex-col items-center justify-center professional-bg p-0 lg:p-4">
              <main className="w-full lg:h-[calc(100vh-50px)] h-[calc(100vh)] bg-background border border-border lg:rounded-lg rounded-none shadow-lg overflow-y-auto ">
                {children}
              </main>
              <BottomMenu />
              <Toaster />
            </div>
            </PinnedUsersProviderWithAuth>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
