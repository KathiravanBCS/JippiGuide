"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlanSheet } from "@/components/plan-sheet"
import { HeroSearch } from "@/components/hero-search"

function BgCard({
  href,
  title,
  subtitle,
  img,
}: {
  href: string
  title: string
  subtitle?: string
  img: string
}) {
  return (
    <Link 
      href={href} 
      className="group relative block h-48 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
      <Image
        src={img}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h3 className="text-xl font-bold">{title}</h3>
        {subtitle && <p className="text-sm text-white/90 mt-1">{subtitle}</p>}
      </div>
    </Link>
  )
}

export default function HomePage() {
  const cards = [
    {
      href: "/stories",
      title: "Stories",
      subtitle: "Guides and inspiration",
      img: "/images/story-2.png"
    },
    {
      href: "/gallery",
      title: "Gallery",
      subtitle: "Scenes from the mountains",
      img: "/images/gallery-1.png"
    },
    {
      href: "/packages",
      title: "Travel Packages",
      subtitle: "Hand-picked experiences",
      img: "/images/package-2.png"
    }
  ]

  return (
    <main className="flex flex-col">
      {/* Hero section */}
      <section className="relative h-screen">
        <Image
          src="/images/hero-himachal.png"
          alt="Snowy mountains of Himachal Pradesh"
          fill
          className="object-fit"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 pt-16 md:pt-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight max-w-5xl">
            JippiGuide
          </h1>
          <p className="text-white/90 text-lg mt-2">Joyful + Happy</p>
          <p className="mt-4 text-white/90 max-w-2xl text-lg">
            Welcome to JippiGuide — your joyful and happy way to plan trips. Search destinations, create a trip plan,
            and explore amazing places along your route.
          </p>
          <div className="mt-6 w-full max-w-3xl">
            <HeroSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href="/destinations">
              <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800">
                Destinations
              </Button>
            </Link>
            <Link href="/travel-planner">
              <Button size="lg" variant="outline">
                Travel Planner
              </Button>
            </Link>
            <PlanSheet />
          </div>
        </div>
      </section>

      {/* Cards section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16 w-full">
        <h2 className="text-2xl font-bold text-center mb-8">Explore More</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <BgCard
              key={card.href}
              href={card.href}
              title={card.title}
              subtitle={card.subtitle}
              img={card.img}
            />
          ))}
        </div>
      </section>
    </main>
  )
}