
import type React from "react"
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import "./globals.css"


export const metadata: Metadata = {
  title: "JippiGuide",
  description: "Welcome to JippiGuide — your joyful and happy way to plan trips. Search destinations, create a trip plan, and explore amazing places along your route.",
  generator: "JippiGuide",
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen flex flex-col bg-background">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </body>
      </html>
    </ClerkProvider>
  )
}
