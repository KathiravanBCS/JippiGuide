"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useItinerary } from "@/hooks/use-itinerary"
import type { Place } from "@/types/place"
import { Separator } from "@/components/ui/separator"

const ItineraryMap = dynamic(() => import("@/components/itinerary-map"), { ssr: false })

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function TripPlanPage() {
  const { items, clear, remove } = useItinerary()

  const stats = useMemo(() => {
    let distance = 0
    for (let i = 1; i < items.length; i++) {
      const a = items[i - 1]
      const b = items[i]
      distance += haversine(a.latitude, a.longitude, b.latitude, b.longitude)
    }
    return { count: items.length, distance }
  }, [items])

  return (
    <main className="max-w-6xl mx-auto p-4 pt-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Trip Plan</h1>
        <div className="text-sm text-muted-foreground">
          {stats.count} items • Approx distance: {stats.distance.toFixed(1)} km
        </div>
      </div>

      <div className="mt-4">
        <ItineraryMap items={items} />
      </div>

      <Separator className="my-6" />

      <div className="grid md:grid-cols-2 gap-4">
        {items.length === 0 && <p className="text-muted-foreground">No items in your plan yet.</p>}

        {items.map((p: Place, idx) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {idx + 1}. {p.name}
                </CardTitle>
                <CardDescription className="capitalize">
                  {p.category}
                  {p.city ? ` • ${p.city}` : ""}
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => remove(p.id)}>
                Remove
              </Button>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              {p.description}
              <div className="mt-2">
                <a
                  className="underline"
                  target="_blank"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`}
                  rel="noreferrer"
                >
                  Navigate
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="destructive" onClick={clear}>
          Clear Plan
        </Button>
      </div>
    </main>
  )
}
