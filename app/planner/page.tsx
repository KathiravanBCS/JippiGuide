"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { Place, Category } from "@/types/place"
import { useItinerary } from "@/hooks/use-itinerary"
import { usePlanUI } from "@/hooks/use-plan-ui"
import { PlanSheet } from "@/components/plan-sheet"
import { Bike, Car, Footprints, MapPin, Route, Star } from "lucide-react"
import Image from "next/image"

const RouteMap = dynamic(() => import("@/components/route-map"), {
  ssr: false,
  loading: () => <div className="h-[70vh] rounded-xl bg-muted animate-pulse" />,
})

type GeoPoint = { lat: number; lng: number; label?: string }

const TYPE_OPTS: { id: Category; label: string }[] = [
  { id: "restaurant", label: "Restaurants" },
  { id: "cafe", label: "Cafes" },
  { id: "hotel", label: "Hotels" },
  { id: "park", label: "Parks" },
  { id: "attraction", label: "Attractions" },
  { id: "fuel", label: "Fuel" },
  { id: "transport", label: "Transport" },
]

export default function PlannerPage() {
  const [profile, setProfile] = useState<"driving" | "cycling" | "foot">("driving")
  const [from, setFrom] = useState<GeoPoint | null>(null)
  const [to, setTo] = useState<GeoPoint | null>(null)
  const [qFrom, setQFrom] = useState("")
  const [qTo, setQTo] = useState("")
  const [suggestFrom, setSuggestFrom] = useState<GeoPoint[]>([])
  const [suggestTo, setSuggestTo] = useState<GeoPoint[]>([])
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [route, setRoute] = useState<{ coords: [number, number][]; distanceKm: number; durationHrs: number } | null>(
    null,
  )

  const [poiTypes, setPoiTypes] = useState<Category[]>(["restaurant", "cafe", "hotel", "park", "attraction", "fuel"])
  const [minRating, setMinRating] = useState(4.0)
  const [pois, setPois] = useState<Place[]>([])
  const [loadingPois, setLoadingPois] = useState(false)

  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)

  const { add } = useItinerary()
  const { setOpen } = usePlanUI()


  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => void 0,
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
    )
  }, [])

  // Autocomplete
  useEffect(() => {
    const t = setTimeout(async () => {
      if (qFrom.trim().length < 2) return setSuggestFrom([])
      const r = await geocode(qFrom)
      setSuggestFrom(r)
    }, 220)
    return () => clearTimeout(t)
  }, [qFrom])

  useEffect(() => {
    const t = setTimeout(async () => {
      if (qTo.trim().length < 2) return setSuggestTo([])
      const r = await geocode(qTo)
      setSuggestTo(r)
    }, 220)
    return () => clearTimeout(t)
  }, [qTo])

  async function geocode(q: string): Promise<GeoPoint[]> {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&limit=5`)
    if (!res.ok) return []
    const json = (await res.json()) as { results: { lat: number; lng: number; label: string }[] }
    return json.results
  }

  async function buildRoute() {
    if (!from && qFrom) {
      const r = await geocode(qFrom)
      if (r[0]) setFrom(r[0])
    }
    if (!to && qTo) {
      const r = await geocode(qTo)
      if (r[0]) setTo(r[0])
    }
    const a = from ?? suggestFrom[0] ?? null
    const b = to ?? suggestTo[0] ?? null
    if (!a || !b) {
      toast({ title: "Pick both origin and destination", variant: "destructive" })
      return
    }

    setLoadingRoute(true)
    try {
      const params = new URLSearchParams()
      params.set("profile", profile)
      params.set("from", `${a.lat},${a.lng}`)
      params.set("to", `${b.lat},${b.lng}`)
      const res = await fetch(`/api/route?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to route")
      const data = (await res.json()) as {
        geometry: { coordinates: [number, number][] }
        distance_km: number
        duration_hr: number
      }
      setRoute({ coords: data.geometry.coordinates, distanceKm: data.distance_km, durationHrs: data.duration_hr })
    } catch (e: any) {
      toast({ title: "Route error", description: e?.message || "Unable to create route", variant: "destructive" })
    } finally {
      setLoadingRoute(false)
    }
  }

  async function findPois() {
    if (!route) {
      toast({ title: "Create a route first", variant: "destructive" });
      return;
    }
    setLoadingPois(true);
    // Sample points every 10 steps along the route
    const sampledPoints = [];
    for (let i = 0; i < route.coords.length; i += 3214 ) {
      sampledPoints.push(route.coords[i]);
    }
    // Always include the destination
    if (route.coords.length > 0) sampledPoints.push(route.coords[route.coords.length - 1]);
    // Prepare payload for POST request
    const payload = {
      points: sampledPoints.map(([lng, lat]) => ({ lat, lng })),
      types: poiTypes,
      minRating,
    };
    try {
      const res = await fetch("/api/pois", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to fetch places");
      const json = (await res.json()) as { data: Place[] };
      setPois(json.data);
    } catch (e: any) {
      toast({ title: "Places error", description: e?.message || "Unable to fetch places", variant: "destructive" });
    } finally {
      setLoadingPois(false);
    }
  }

  const filteredPois = useMemo(() => {
    const set = new Set(poiTypes)
    return pois.filter((p) => set.has(p.category))
  }, [pois, poiTypes])

  function addToPlan(p: Place) {
    add(p)
    setOpen(true)
    // TODO: Replace with actual traveler_id from your auth/session
    const traveler_id = "demo-traveler-id"
    fetch("/api/plans", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ traveler_id, place_id: p.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast({ title: "Added to plan", description: p.name })
        } else {
          toast({ title: "Plan save error", description: data.error || "Failed to save plan", variant: "destructive" })
        }
      })
      .catch(() => {
        toast({ title: "Plan save error", description: "Failed to save plan", variant: "destructive" })
      })
  }

// AddToPlanButton component for UI feedback
function AddToPlanButton({ place, add, setOpen }: { place: Place, add: (p: Place) => void, setOpen: (v: boolean) => void }) {
  const [loading, setLoading] = useState(false)
  const handleAdd = async () => {
    setLoading(true)
    // TODO: Replace with actual traveler_id from your auth/session
    const traveler_id = "demo-traveler-id"
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ traveler_id, place_id: place.id }),
      })
      const data = await res.json()
      if (data.success) {
        add(place)
        setOpen(true)
        toast({ title: "Added to plan", description: place.name })
      } else {
        toast({ title: "Plan save error", description: data.error || "Failed to save plan", variant: "destructive" })
      }
    } catch {
      toast({ title: "Plan save error", description: "Failed to save plan", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button size="sm" onClick={handleAdd} disabled={loading}>
      {loading ? "Adding..." : "Add"}
    </Button>
  )
}

  return (
    <main>
      <div className="mt-4 grid lg:grid-cols-[380px_1fr] gap-4">
        {/* Left controls */}
        <div className="border rounded-xl p-3">
          <div className="grid gap-3">
            <Label>Travel mode</Label>
            <div className="flex gap-2">
              <Button
                variant={profile === "driving" ? "default" : "outline"}
                onClick={() => setProfile("driving")}
                className={cn(profile === "driving" && "bg-neutral-900 hover:bg-neutral-800")}
              >
                <Car className="w-4 h-4 mr-2" />
                Car
              </Button>
              <Button
                variant={profile === "cycling" ? "default" : "outline"}
                onClick={() => setProfile("cycling")}
                className={cn(profile === "cycling" && "bg-neutral-900 hover:bg-neutral-800")}
              >
                <Bike className="w-4 h-4 mr-2" />
                Bike
              </Button>
              <Button
                variant={profile === "foot" ? "default" : "outline"}
                onClick={() => setProfile("foot")}
                className={cn(profile === "foot" && "bg-neutral-900 hover:bg-neutral-800")}
              >
                <Footprints className="w-4 h-4 mr-2" />
                Walk
              </Button>
            </div>

            {/* Origin / Destination */}
            <div className="grid gap-2">
              <Label>Origin</Label>
              <Input
                value={qFrom}
                onChange={(e) => setQFrom(e.target.value)}
                placeholder="City, address, or coordinates"
              />
              {suggestFrom.length > 0 && (
                <div className="rounded-md border max-h-44 overflow-auto">
                  {suggestFrom.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setFrom(s)
                        setQFrom(s.label || `${s.lat}, ${s.lng}`)
                        setSuggestFrom([])
                      }}
                      className="block w-full px-2 py-1 text-left text-sm hover:bg-muted"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
              <Label>Destination</Label>
              <Input value={qTo} onChange={(e) => setQTo(e.target.value)} placeholder="Where to?" />
              {suggestTo.length > 0 && (
                <div className="rounded-md border max-h-44 overflow-auto">
                  {suggestTo.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTo(s)
                        setQTo(s.label || `${s.lat}, ${s.lng}`)
                        setSuggestTo([])
                      }}
                      className="block w-full px-2 py-1 text-left text-sm hover:bg-muted"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-2">
                <Button onClick={buildRoute} disabled={loadingRoute}>
                  <Route className="w-4 h-4 mr-2" />
                  {loadingRoute ? "Routing..." : "Create Route"}
                </Button>
                {route && (
                  <div className="text-sm text-muted-foreground">
                    {route.distanceKm.toFixed(0)} km • {route.durationHrs.toFixed(1)} hr
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-2" />

            {/* POI filters */}
            <Label>Show along route</Label>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTS.map((t) => {
                const active = poiTypes.includes(t.id)
                return (
                  <Button
                    key={t.id}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className={cn(active && "bg-neutral-900 hover:bg-neutral-800")}
                    onClick={() => setPoiTypes((prev) => (active ? prev.filter((p) => p !== t.id) : [...prev, t.id]))}
                  >
                    {t.label}
                  </Button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Rating</Label>
              <Select value={String(minRating)} onValueChange={(v) => setMinRating(Number.parseFloat(v))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Min rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Above 3.0</SelectItem>
                  <SelectItem value="3.5">Above 3.5</SelectItem>
                  <SelectItem value="4">Above 4.0</SelectItem>
                  <SelectItem value="4.5">Above 4.5</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={findPois} disabled={!route || loadingPois}>
                {loadingPois ? "Searching..." : "Find places"}
              </Button>
            </div>

            <Separator className="my-2" />

            <div className="text-sm font-medium">Results ({filteredPois.length})</div>
            <ScrollArea className="h-[40vh] rounded-md border">
              <div className="p-2 grid gap-2">
                {filteredPois.map((p) => (
                  <Card key={p.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="relative w-28 h-20 shrink-0">
                        <Image
                          src={
                            p.images?.[0] ||
                            "/placeholder.svg?height=80&width=112&query=travel location thumbnail scenic" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <CardHeader className="py-2">
                          <CardTitle className="text-base">{p.name}</CardTitle>
                          <CardDescription className="capitalize">{p.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-4 h-4",
                                  (p.rating ?? 4) >= i + 1 ? "fill-yellow-500 text-yellow-500" : "text-gray-300",
                                )}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">{(p.rating ?? 4).toFixed(1)}</span>
                            {p.transport?.type && <Badge className="ml-2">{p.transport.type}</Badge>}
                          </div>
                        </CardContent>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(navigateUrl(p), "_blank")}>
                            <MapPin className="w-4 h-4 mr-1" />
                            Navigate
                          </Button>
                          <AddToPlanButton place={p} add={add} setOpen={setOpen} />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {filteredPois.length === 0 && (
                  <div className="text-sm text-muted-foreground p-2">No places found for the current filters.</div>
                )}
              </div>
            </ScrollArea>
            <div className="flex items-center justify-between">
              <PlanSheet showTrigger />
            </div>
          </div>
        </div>

        {/* Map */}
        <div>
          <RouteMap
            routeCoords={route?.coords ?? []}
            pois={filteredPois}
            userMarker={userLoc}
            searchMarker={(from ?? to) ? (from ?? to) : null}
          />
        </div>
      </div>
    </main>
  )
}

function sampleEvery<T>(arr: T[], step: number): T[] {
  const out: T[] = []
  for (let i = 0; i < arr.length; i += step) out.push(arr[i])
  if (arr.length) out.push(arr[arr.length - 1] as T)
  return out
}

function navigateUrl(p: Place) {
  const q = encodeURIComponent(`${p.latitude},${p.longitude}`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}
// (removed unused sampleEvery function)
