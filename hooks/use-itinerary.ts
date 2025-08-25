"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Place } from "@/types/place"

type ItineraryItem = Place & { addedAt: number }

type ItineraryState = {
  items: ItineraryItem[]
  add: (p: Place) => void
  remove: (id: string) => void
  clear: () => void
}

export const useItinerary = create<ItineraryState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p) =>
        set((s) => {
          if (s.items.some((i) => i.id === p.id)) return s
          return { items: [...s.items, { ...p, addedAt: Date.now() }] }
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "travel-itinerary" },
  ),
)

// Utilities for distance calculations (kilometers)
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const c = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c))
  return R * d
}

export function totalPathDistanceKm(items: ItineraryItem[]) {
  if (items.length < 2) return 0
  let sum = 0
  for (let i = 1; i < items.length; i++) {
    sum += haversineKm(
      { lat: items[i - 1].latitude, lng: items[i - 1].longitude },
      { lat: items[i].latitude, lng: items[i].longitude },
    )
  }
  return sum
}
