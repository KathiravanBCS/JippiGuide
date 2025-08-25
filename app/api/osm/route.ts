import type { NextRequest } from "next/server"
import type { Place } from "@/types/place"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get("lat"))
  const lng = Number(searchParams.get("lng"))
  const radiusKm = Number(searchParams.get("radiusKm") || "5")
  const typesParam = (searchParams.get("types") || "restaurant,cafe,hotel,park,attraction,transport")
    .split(",")
    .map((s) => s.trim())

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ data: [] as Place[] })
  }

  const radius = Math.max(200, Math.min(30000, Math.round(radiusKm * 1000)))

  const q: string[] = []

  if (typesParam.includes("restaurant") || typesParam.includes("cafe")) {
    q.push(`
      node["amenity"="restaurant"](around:${radius},${lat},${lng});
      node["amenity"="cafe"](around:${radius},${lat},${lng});
    `)
  }
  if (typesParam.includes("hotel")) {
    q.push(`
      node["tourism"="hotel"](around:${radius},${lat},${lng});
      node["tourism"="guest_house"](around:${radius},${lat},${lng});
      node["tourism"="motel"](around:${radius},${lat},${lng});
    `)
  }
  if (typesParam.includes("park")) {
    q.push(`
      node["leisure"="park"](around:${radius},${lat},${lng});
    `)
  }
  if (typesParam.includes("attraction")) {
    q.push(`
      node["tourism"="attraction"](around:${radius},${lat},${lng});
      node["historic"](around:${radius},${lat},${lng});
      node["amenity"="place_of_worship"](around:${radius},${lat},${lng});
    `)
  }
  if (typesParam.includes("transport")) {
    q.push(`
      node["amenity"="bus_station"](around:${radius},${lat},${lng});
      node["highway"="bus_stop"](around:${radius},${lat},${lng});
      node["railway"="station"](around:${radius},${lat},${lng});
      node["public_transport"="platform"](around:${radius},${lat},${lng});
    `)
  }

  const overpass = `
    [out:json][timeout:25];
    (
      ${q.join("\n")}
    );
    out body;
  `

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: new URLSearchParams({ data: overpass }).toString(),
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return new Response(JSON.stringify({ data: [] as Place[] }), {
      headers: { "content-type": "application/json", "cache-control": "s-maxage=30, stale-while-revalidate=120" },
    })
  }

  const json = (await res.json()) as {
    elements: Array<{ id: number; lat?: number; lon?: number; tags?: Record<string, string> }>
  }

  const data: Place[] = (json.elements || [])
    .map((el) => {
      const t = el.tags || {}
      const latn = el.lat
      const lonn = el.lon
      if (!Number.isFinite(latn) || !Number.isFinite(lonn)) return null

      const category = inferCategory(t)
      const p: Place = {
        id: `osm:${category}:${el.id}`,
        name: t.name || t.operator || t.brand || "Unnamed",
        description: buildDescription(t),
        significance: t.amenity || t.tourism || t.railway || t.historic || "",
        travel_tips: tips(t, category),
        address:
          t["addr:full"] ||
          [t["addr:housenumber"], t["addr:street"], t["addr:city"], t["addr:postcode"]].filter(Boolean).join(", "),
        latitude: latn!,
        longitude: lonn!,
        category,
        tags: Object.keys(t),
      }
      return p
    })
    .filter(Boolean) as Place[]

  return new Response(JSON.stringify({ data }), {
    headers: { "content-type": "application/json", "cache-control": "s-maxage=60, stale-while-revalidate=300" },
  })
}

function inferCategory(tags: Record<string, string>): Place["category"] {
  if (tags.amenity === "restaurant") return "restaurant"
  if (tags.amenity === "cafe") return "cafe"
  if (tags.tourism === "hotel" || tags.tourism === "guest_house" || tags.tourism === "motel") return "hotel"
  if (tags.leisure === "park") return "park"
  if (
    tags.tourism === "attraction" ||
    !!tags.historic ||
    tags.amenity === "place_of_worship" ||
    tags.tourism === "museum"
  )
    return "attraction"
  if (tags.amenity === "bus_station" || tags.highway === "bus_stop" || tags.railway === "station") return "transport"
  return "landmark"
}

function buildDescription(tags: Record<string, string>) {
  const parts: string[] = []
  if (tags.cuisine) parts.push(`Cuisine: ${tags.cuisine}`)
  if (tags.opening_hours) parts.push(`Hours: ${tags.opening_hours}`)
  if (tags.brand) parts.push(`Brand: ${tags.brand}`)
  if (tags.operator) parts.push(`Operator: ${tags.operator}`)
  return parts.join(" · ")
}

function tips(tags: Record<string, string>, category: Place["category"]) {
  const t: string[] = []
  if (tags.phone) t.push(`Phone: ${tags.phone}`)
  if (tags.website) t.push(`Website: ${tags.website}`)
  if (category === "transport" && (tags.ref || tags.network))
    t.push(`Routes: ${[tags.ref, tags.network].filter(Boolean).join(" · ")}`)
  return t
}
