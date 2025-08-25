"use client"

import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { useEffect, useMemo, useRef } from "react"
import type { Place } from "@/types/place"

const COLORS: Record<string, string> = {
  restaurant: "#dc2626",
  cafe: "#f59e0b",
  hotel: "#0ea5e9",
  park: "#16a34a",
  attraction: "#7c3aed",
  fuel: "#ea580c",
  transport: "#111827",
  default: "#334155",
}

export type RouteMapProps = {
  routeCoords?: [number, number][]
  pois?: Place[]
  userMarker?: { lat: number; lng: number } | null
  searchMarker?: { lat: number; lng: number } | null
}

export default function RouteMap({ routeCoords = [], pois = [], userMarker, searchMarker }: RouteMapProps) {
  const routeLatLngs = useMemo(() => routeCoords.map(([lng, lat]) => [lat, lng]) as [number, number][], [routeCoords])

  // Default center: India-ish
  const center: [number, number] = searchMarker
    ? [searchMarker.lat, searchMarker.lng]
    : userMarker
      ? [userMarker.lat, userMarker.lng]
      : [22.3511148, 78.6677428]

  return (
    <div className="h-[70vh] rounded-xl overflow-hidden border z-0">
      <MapContainer center={center} zoom={6} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitAndResize route={routeLatLngs} user={userMarker} search={searchMarker} />

        {routeLatLngs.length > 1 && <Polyline positions={routeLatLngs} color="#2563eb" weight={5} opacity={0.85} />}

        {userMarker && (
          <CircleMarker
            center={[userMarker.lat, userMarker.lng]}
            radius={9}
            pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.9 }}
          >
            <Popup>Your location</Popup>
          </CircleMarker>
        )}
        {searchMarker && (
          <CircleMarker
            center={[searchMarker.lat, searchMarker.lng]}
            radius={9}
            pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.9 }}
          >
            <Popup>Search center</Popup>
          </CircleMarker>
        )}

        {pois.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.latitude, p.longitude]}
            radius={8}
            pathOptions={{
              color: COLORS[p.category] ?? COLORS.default,
              fillColor: COLORS[p.category] ?? COLORS.default,
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium">{p.name}</div>
                <div className="capitalize">{p.category}</div>
                {p.address && <div className="opacity-80">{p.address}</div>}
                {p.opening_hours && <div className="opacity-80">Hours: {p.opening_hours}</div>}
                {p.transport?.type && <div className="opacity-80">Type: {p.transport.type}</div>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

function FitAndResize({
  route,
  user,
  search,
}: {
  route: [number, number][]
  user: { lat: number; lng: number } | null
  search: { lat: number; lng: number } | null
}) {
  const map = useMap()
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Invalidate size when container resizes to prevent gray areas
  useEffect(() => {
    const target = map.getContainer()
    containerRef.current = target
    const ro = new ResizeObserver(() => {
      setTimeout(() => map.invalidateSize(), 50)
    })
    ro.observe(target)
    return () => ro.disconnect()
  }, [map])

  useEffect(() => {
    const pts: [number, number][] = []
    if (route.length > 1) pts.push(...route)
    if (user) pts.push([user.lat, user.lng])
    if (search) pts.push([search.lat, search.lng])

    if (pts.length >= 1) {
      const bounds = L.latLngBounds(pts as any)
      map.fitBounds(bounds.pad(0.2))
    }
  }, [map, route, user, search])

  return null
}
