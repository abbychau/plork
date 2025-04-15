import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import Header from "@/components/header";

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
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-8">
                {children}
              </main>
              <footer className="py-8 border-t">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">Plork</span>
                      <span className="text-sm text-muted-foreground">A minimal ActivityPub SNS</span>
                    </div>

                    <div className="flex space-x-6 text-sm">
                      <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                        About
                      </Link>
                      <Link href="/explore" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                        Explore
                      </Link>
                      <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                        GitHub
                      </a>
                      <a href="https://activitypub.rocks/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                        ActivityPub
                      </a>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      &copy; {new Date().getFullYear()} Plork. All rights reserved.
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Built with Next.js, React, and Shadcn UI
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
