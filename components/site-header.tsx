"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';

const NavLinks = () => (
  <>
    <Link href="/" className="hover:underline">
      Home
    </Link>
    <Link href="/destinations" className="hover:underline">
      Destinations
    </Link>
    <Link href="/stories" className="hover:underline">
      Stories
    </Link>
    <Link href="/gallery" className="hover:underline">
      Gallery
    </Link>
    <Link href="/travelers" className="hover:underline">
      Travelers
    </Link>
    <Link href="/packages" className="hover:underline">
      Our Travel Packages
    </Link>
    <Link href="/trip-plan" className="hover:underline">
      Explore the Trip Plan
    </Link>
    <Link href="/travel-planner" className="hover:underline">
      Explore the Travel Plan
    </Link>
    <Link href="/explore" className="hover:underline ">
      Explore
    </Link>
  </>
);

function Brand() {
  return (
    <>  
      {/* Remove usage of 'open' here, as Brand does not have access to it */}
      <Link href="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-gradient-to-br from-emerald-500 to-amber-400 text-white grid place-items-center font-bold tracking-tight">
          tg
        </div>
        <div className="leading-tight">
          <div className="font-semibold">JippiGuide</div>
          <div className="text-[10px] text-muted-foreground">Joyful + Happy</div>
        </div>
      </Link>
    </>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user } = useUser(); // Place this inside the function
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Brand />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm flex-1 ml-8">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-6 ml-8">
          {isAdmin ? (
            <Link href="/admin" className="hover:underline font-semibold text-blue-600">Admin</Link>
          ) : (
            <Link href="/admin" className="hover:underline font-semibold text-blue-600">Admin Login</Link>
          )}
          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
        <div className="md:hidden ml-4">
          <Button variant="outline" size="icon" aria-label="Toggle menu" onClick={() => setOpen((v) => !v)}>
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t">
          <div className="mx-auto max-w-6xl px-4 py-3 grid gap-3 text-sm">
            <NavLinks />
            <div className="flex items-center gap-2 mt-2">
              {isAdmin ? (
                <Link href="/admin" className="hover:underline font-semibold text-blue-600">Admin</Link>
              ) : (
                <Link href="/admin" className="hover:underline font-semibold text-blue-600">Admin Login</Link>
              )}
              <SignedOut>
                <SignInButton mode="modal" />
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
