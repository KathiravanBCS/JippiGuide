"use client"

import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-emerald-500 to-amber-400 text-white grid place-items-center text-[11px] font-bold">
              tg
            </div>
            <span>© {new Date().getFullYear()} JippiGuide — Joyful + Happy travel planning</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/destinations" className="hover:underline">
              Destinations
            </Link>
            <Link href="/stories" className="hover:underline">
              Stories
            </Link>
            <Link href="/gallery" className="hover:underline">
              Gallery
            </Link>
            <Link href="/packages" className="hover:underline">
              Packages
            </Link>
            <Link href="/explore" className="hover:underline">
              Explore
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
