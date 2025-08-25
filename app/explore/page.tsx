"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/hooks/use-toast"
import type { Place as PlaceBase } from "@/types/place"

type Place = PlaceBase & {
  travel_tips?: string[]
}
import { Compass, Filter, LocateFixed, MapIcon, Plus, Search } from "lucide-react"
import { PlanSheet } from "@/components/plan-sheet"
import { useItinerary } from "@/hooks/use-itinerary"
import { usePlanUI } from "@/hooks/use-plan-ui"

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => <div className="h-[70vh] rounded-xl bg-muted animate-pulse" />,
})

type SearchPin = { lat: number; lng: number; label?: string } | null

type CategoryKey = "all" | "restaurant" | "cafe" | "hotel" | "park" | "attraction" | "transport"

const CATEGORY_CHIPS: { id: CategoryKey; label: string }[] = [
  { id: "all", label: "All" },
  { id: "restaurant", label: "Restaurants" },
  { id: "cafe", label: "Cafes" },
  { id: "hotel", label: "Hotels" },
  { id: "park", label: "Parks" },
  { id: "attraction", label: "Attractions" },
  { id: "transport", label: "Transport" },
]

// simple client-side cache to speed up repeated map interactions
const osmCache = new Map<string, Place[]>()
function cacheKey(p: { lat: number; lng: number; r: number; types: string }) {
  return `${p.lat.toFixed(4)}:${p.lng.toFixed(4)}:${p.r}:${p.types}`
}

export default function ExplorePage() {
  const params = useSearchParams()
  const initialQ = params.get("q") ?? ""

  const [query, setQuery] = useState(initialQ)
  const [category, setCategory] = useState<CategoryKey>("all")
  const [radiusKm, setRadiusKm] = useState(5)

  const [data, setData] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)

  const [selected, setSelected] = useState<Place | null>(null)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 13.0827, lng: 80.2707 }) // Chennai
  const [searchPin, setSearchPin] = useState<SearchPin>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { add: addItem } = useItinerary()
  const { setOpen: setPlanOpen } = usePlanUI()

  // Bootstrap from q
  useEffect(() => {
    let ignore = false
    async function init() {
      // If q present, geocode and center
      if (initialQ) {
        setLoading(true)
        try {
          const geo = await fetch(`/api/geocode?q=${encodeURIComponent(initialQ)}`).then((r) => r.json())
          const best = geo?.results?.[0]
          if (best) {
            const near = { lat: best.lat as number, lng: best.lng as number }
            if (!ignore) {
              setCenter(near)
              setSearchPin({ ...near, label: best.label })
              await fetchOSM(near, category, radiusKm, setData)
            }
          } else {
            await fetchOSM(center, category, radiusKm, setData)
          }
        } catch (e) {
          await fetchOSM(center, category, radiusKm, setData)
        } finally {
          if (!ignore) setLoading(false)
        }
      } else {
        await fetchOSM(center, category, radiusKm, setData)
      }
    }
    init()
    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSearch = async () => {
    if (!query.trim()) {
      toast({ title: "Enter a place to search" })
      return
    }
    setLoading(true)
    try {
      const geo = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`).then((r) => r.json())
      const best = geo?.results?.[0]
      if (best) {
        const near = { lat: best.lat as number, lng: best.lng as number }
        setCenter(near)
        setSearchPin({ ...near, label: best.label })
        await fetchOSM(near, category, radiusKm, setData)
      } else {
        toast({ title: "Place not found", description: "Try a different query" })
      }
    } finally {
      setLoading(false)
    }
  }

  const onChangeCategory = async (next: CategoryKey) => {
    setCategory(next)
    await fetchOSM(userLoc ?? center, next, radiusKm, setData)
  }

  const onChangeRadius = async (r: number) => {
    setRadiusKm(r)
    await fetchOSM(userLoc ?? center, category, r, setData)
  }

  const detectMe = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported" })
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLoc(loc)
        setCenter(loc)
        await fetchOSM(loc, category, radiusKm, setData)
        toast({ title: "Location updated" })
      },
      () => toast({ title: "Unable to get your location", variant: "destructive" }),
      { enableHighAccuracy: true, maximumAge: 30000 },
    )
  }

  const resultsCount = data.length
  const nearby = useMemo(() => {
    if (!userLoc) return []
    return data
      .map((p) => ({ p, d: haversine(userLoc.lat, userLoc.lng, p.latitude, p.longitude) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 10)
      .map((x) => x.p)
  }, [data, userLoc])

  function handleAdd(p: Place, openAfter = false) {
    addItem(p)
    if (openAfter) setPlanOpen(true)
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-3">
          <MapIcon className="w-5 h-5" />
          <h1 className="text-2xl font-bold">Explore</h1>
        </div>

        <div className="mt-4 grid lg:grid-cols-[360px_1fr] gap-4">
          {/* Left panel */}
          <div className="border rounded-xl p-3">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a city or area (e.g., Chennai)"
                aria-label="Search places"
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
              />
              <Button onClick={onSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="mt-3">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Categories
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORY_CHIPS.map((c) => (
                  <Button
                    key={c.id}
                    size="sm"
                    variant={category === c.id ? "default" : "outline"}
                    className={category === c.id ? "bg-neutral-900 hover:bg-neutral-800" : ""}
                    onClick={() => onChangeCategory(c.id)}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-3" />

            <div className="grid gap-2">
              <Label className="text-sm">Nearby radius: {radiusKm} km</Label>
              <Slider
                defaultValue={[radiusKm]}
                min={1}
                max={30}
                step={1}
                onValueChange={(v) => setRadiusKm(v[0] ?? 5)}
                onValueCommit={(v) => onChangeRadius(v[0] ?? 5)}
              />
              <div className="flex gap-2 mt-3">
                <Button variant="outline" onClick={detectMe}>
                  <LocateFixed className="w-4 h-4 mr-2" />
                  Near me
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await fetchOSM(center, category, radiusKm, setData)
                  }}
                >
                  <Compass className="w-4 h-4 mr-2" />
                  Use map center
                </Button>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{loading ? "Loading..." : `${resultsCount} results`}</div>
              <PlanSheet showTrigger />
            </div>

            <Separator className="my-3" />
            <div className="text-sm font-medium mb-2">Results</div>
            <ScrollArea className="h-[45vh]" ref={listRef}>
              <div className="grid gap-2">
                {data.map((p) => (
                  <Card key={p.id}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {p.category}
                        </Badge>
                        {userLoc && (
                          <span>{haversine(userLoc.lat, userLoc.lng, p.latitude, p.longitude).toFixed(1)} km away</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between py-2">
                      <div className="text-sm line-clamp-2 text-muted-foreground">{p.description}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelected(p)}>
                          Details
                        </Button>
                        <Button size="sm" onClick={() => handleAdd(p)}>
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {data.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground">No places found. Try expanding your search.</p>
                )}
              </div>
            </ScrollArea>

            {userLoc && (
              <>
                <Separator className="my-3" />
                <div>
                  <div className="text-sm font-medium mb-2">Nearby for you</div>
                  <div className="grid gap-2">
                    {nearby.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <div className="truncate">{p.name}</div>
                        <Button size="sm" variant="ghost" onClick={() => setSelected(p)}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Map */}
          <div>
            <MapView
              places={data}
              center={center}
              radiusKm={radiusKm}
              user={userLoc ?? undefined}
              searchPin={searchPin ?? undefined}
              onMove={(c) => setCenter(c)}
              onSelect={(p) => {
                setSelected(p)
                listRef.current?.scrollTo({ top: 0, behavior: "smooth" })
              }}
            />
          </div>
        </div>
      </div>

      {/* Selected details drawer */}
      <DetailsDrawer
        place={selected}
        onClose={() => setSelected(null)}
        onAdd={(p) => {
          handleAdd(p, true)
        }}
      />
    </div>
  )
}

function DetailsDrawer({
  place,
  onClose,
  onAdd,
}: {
  place: Place | null
  onClose: () => void
  onAdd: (p: Place) => void
}) {
  const open = !!place
  if (!open || !place) return null
  const scheduleUrl =
    place.category === "transport"
      ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=transit`
      : undefined
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1400] bg-black/40 p-4 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[85vh] overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-lg font-semibold">
          <MapIcon className="w-5 h-5" />
          {place.name}
        </div>
        <div className="mt-2 text-sm text-muted-foreground capitalize">Category: {place.category}</div>
        {place.address && <div className="text-sm">{place.address}</div>}
        <div className="mt-3 text-sm leading-relaxed">{place.description}</div>
        {place.travel_tips && place.travel_tips.length > 0 && (
          <ul className="text-sm list-disc pl-5 mt-2">
            {place.travel_tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex gap-2">
          <Button onClick={() => onAdd(place)}>
            <Plus className="w-4 h-4 mr-2" /> Add to Plan
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
                "_blank",
              )
            }
          >
            Navigate
          </Button>
          {scheduleUrl && (
            <Button variant="secondary" onClick={() => window.open(scheduleUrl, "_blank")}>
              Schedules/Timings
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

async function fetchOSM(
  near: { lat: number; lng: number },
  category: CategoryKey,
  radiusKm: number,
  setData: (p: Place[]) => void,
) {
  const types =
    category === "all" ? "restaurant,cafe,hotel,park,attraction,transport" : (category as Exclude<CategoryKey, "all">)
  const key = cacheKey({ lat: near.lat, lng: near.lng, r: radiusKm, types })
  if (osmCache.has(key)) {
    setData(osmCache.get(key)!)
    return
  }
  const url = `/api/osm?lat=${near.lat}&lng=${near.lng}&radiusKm=${radiusKm}&types=${encodeURIComponent(types)}`
  const res = await fetch(url)
  if (!res.ok) {
    setData([])
    return
  }
  const json = (await res.json()) as { data: Place[] }
  osmCache.set(key, json.data)
  setData(json.data)
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
