"use client"

import { useEffect, useMemo, useRef } from "react"
import { MapContainer, TileLayer, CircleMarker, Tooltip, Circle } from "react-leaflet"
import type { Map as LeafletMap } from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Place } from "@/types/place"

type Props = {
  places: Place[]
  center: { lat: number; lng: number }
  user?: { lat: number; lng: number }
  searchPin?: { lat: number; lng: number; label?: string }
  radiusKm: number
  onSelect?: (p: Place) => void
  onMove?: (c: { lat: number; lng: number }) => void
}

const categoryColor: Record<string, string> = {
  restaurant: "#ef4444",
  cafe: "#f97316",
  hotel: "#a855f7",
  park: "#22c55e",
  attraction: "#06b6d4",
  transport: "#3b82f6",
  landmark: "#06b6d4",
  adventure: "#16a34a",
}

export default function MapView({ places, center, user, searchPin, radiusKm, onSelect, onMove }: Props) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Ensure map resizes correctly (fixes gray area)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const id = setTimeout(() => map.invalidateSize(), 50)
    const ro = new ResizeObserver(() => map.invalidateSize())
    if (containerRef.current) ro.observe(containerRef.current)
    const handler = () => map.invalidateSize()
    window.addEventListener("resize", handler)
    return () => {
      clearTimeout(id)
      ro.disconnect()
      window.removeEventListener("resize", handler)
    }
  }, [])

  // Center updates
  useEffect(() => {
    const map = mapRef.current
    if (map) map.setView([center.lat, center.lng])
  }, [center])

  // Listen to pan end
  useEffect(() => {
    const map = mapRef.current
    if (!map || !onMove) return
    const onMoveEnd = () => {
      const c = map.getCenter()
      onMove({ lat: c.lat, lng: c.lng })
    }
    map.on("moveend", onMoveEnd)
    return () => {
      map.off("moveend", onMoveEnd)
    }
  }, [onMove])

  const markers = useMemo(() => places ?? [], [places])

  return (
    <div ref={containerRef} className="relative z-0">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom
        className="h-[70vh] w-full rounded-xl"
        ref={(m) => {
          // @ts-expect-error react-leaflet gives Leaflet Map instance here
          mapRef.current = m
        }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="Leaflet | Map data © OpenStreetMap contributors"
        />

        {/* Search center pin */}
        {searchPin && (
          <CircleMarker center={[searchPin.lat, searchPin.lng]} pathOptions={{ color: "#111827" }} radius={8}>
            <Tooltip permanent direction="top" offset={[0, -8]}>
              {searchPin.label || "Search center"}
            </Tooltip>
          </CircleMarker>
        )}

        {/* User location with radius */}
        {user && (
          <>
            <CircleMarker center={[user.lat, user.lng]} pathOptions={{ color: "#10b981" }} radius={8}>
              <Tooltip permanent direction="top" offset={[0, -8]}>
                You are here
              </Tooltip>
            </CircleMarker>
            <Circle
              center={[user.lat, user.lng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: "#10b981", opacity: 0.2 }}
            />
          </>
        )}

        {/* POIs */}
        {markers.map((p) => {
          const color = categoryColor[p.category] || "#0ea5e9"
          return (
            <CircleMarker
              key={p.id}
              center={[p.latitude, p.longitude]}
              radius={7}
              pathOptions={{ color }}
              eventHandlers={{
                click: () => onSelect?.(p),
              }}
            >
              <Tooltip>
                <div className="text-xs">
                  <div className="font-medium">{p.name}</div>
                  <div className="capitalize">{p.category}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
