"use client"

import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"
import type { Place } from "@/types/place"
import type L from "leaflet"

type Props = {
  items: Place[]
}

export default function ItineraryMap({ items }: Props) {
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    setTimeout(() => m.invalidateSize(), 50)
  }, [items])

  // sensible default center (India)
  const center: [number, number] =
    items.length > 0 ? [items[0].latitude, items[0].longitude] : ([20.5937, 78.9629] as [number, number])
  const path: [number, number][] = items.map((p) => [p.latitude, p.longitude])

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: "60vh", width: "100%", borderRadius: 12 }}
      whenCreated={(m) => (mapRef.current = m)}
      scrollWheelZoom
      attributionControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="Leaflet | Map data © OpenStreetMap contributors"
      />

      {/* Route line */}
      {path.length >= 2 && <Polyline positions={path} color="#111827" weight={4} opacity={0.8} />}

      {/* Stops */}
      {items.map((p, idx) => (
        <CircleMarker
          key={p.id}
          center={[p.latitude, p.longitude]}
          radius={10}
          pathOptions={{ color: "#111827", fillColor: "#111827", fillOpacity: 0.9 }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>
            <div className="text-xs">
              <div className="font-semibold">
                {idx + 1}. {p.name}
              </div>
              {p.city && <div>{p.city}</div>}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
