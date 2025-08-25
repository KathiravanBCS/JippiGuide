"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Place } from "@/types/place"

export function ItinerarySummary({ items }: { items: Place[] }) {
  if (!items || items.length < 2) {
    return (
      <Card>
        <CardContent className="py-3 text-sm text-muted-foreground">
          {"Add at least two places to estimate route distance."}
        </CardContent>
      </Card>
    )
  }
  let total = 0
  for (let i = 1; i < items.length; i++) {
    total += haversine(items[i - 1].latitude, items[i - 1].longitude, items[i].latitude, items[i].longitude)
  }
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Estimated route distance</CardTitle>
        <CardDescription>Simple straight-line estimate</CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        <div className="text-lg font-semibold">{total.toFixed(1)} km</div>
      </CardContent>
    </Card>
  )
}

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
