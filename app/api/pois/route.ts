import type { Place, Category } from "@/types/place"

type Body = {
  points: { lat: number; lng: number }[]
  radius?: number
  types?: Category[]
  minRating?: number
  limit?: number
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return Response.json({ data: [] })
  }

  const points = (body.points ?? []).slice(0, 12)
  const radius = Math.max(300, Math.min(body.radius ?? 1200, 3000))
  const types = (body.types && body.types.length ? body.types : ["restaurant", "hotel", "attraction"]) as Category[]
  const limit = Math.min(Math.max(body.limit ?? 180, 1), 400)
  const minRating = Math.max(0, Math.min(body.minRating ?? 3.5, 5))

  const placesMap: Record<string, Place> = {}

  for (const p of points) {
    const clauses: string[] = []
    const perPoint = Math.max(10, Math.floor(limit / Math.max(1, points.length)))

    if (types.includes("restaurant")) clauses.push(nodeAround(radius, p, 'amenity="restaurant"'))
    if (types.includes("cafe")) clauses.push(nodeAround(radius, p, 'amenity="cafe"'))
    if (types.includes("hotel")) clauses.push(nodeAround(radius, p, 'tourism="hotel"'))
    if (types.includes("park")) clauses.push(nodeAround(radius, p, 'leisure="park"'))
    if (types.includes("attraction")) {
      clauses.push(nodeAround(radius, p, 'tourism="attraction"'))
      clauses.push(nodeAround(radius, p, "historic"))
    }
    if (types.includes("fuel")) clauses.push(nodeAround(radius, p, 'amenity="fuel"'))
    if (types.includes("transport")) {
      clauses.push(nodeAround(radius, p, 'amenity="bus_station"'))
      clauses.push(nodeAround(radius, p, 'highway="bus_stop"'))
      clauses.push(nodeAround(radius, p, 'railway="station"'))
    }

    const overpass = `[out:json][timeout:25];(${clauses.join("")});out body ${perPoint};`
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: "data=" + encodeURIComponent(overpass),
      // cache revalidate to be friendly
      next: { revalidate: 60 },
    })
    if (!res.ok) continue
    const json = (await res.json()) as { elements: any[] }
    for (const el of json.elements ?? []) {
      if (!el || !el.tags) continue
      const k = `osm-${el.type}-${el.id}`
      if (placesMap[k]) continue

      const category: Category = pickCategory(el.tags)
      const place: Place = {
        id: k,
        name: el.tags.name || defaultName(category),
        description: el.tags.description || undefined,
        category,
        address: [el.tags["addr:housenumber"], el.tags["addr:street"], el.tags["addr:city"]].filter(Boolean).join(" "),
        city: el.tags["addr:city"],
        country: el.tags["addr:country"],
        latitude: el.lat ?? el.center?.lat ?? 0,
        longitude: el.lon ?? el.center?.lon ?? 0,
        website: el.tags.website || el.tags.url,
        opening_hours: el.tags.opening_hours,
        rating: synthRating(el.tags),
        tags: Object.keys(el.tags),
        transport: category === "transport" ? transportInfo(el.tags) : undefined,
      }
      if ((place.rating ?? 0) >= minRating) placesMap[k] = place
      if (Object.keys(placesMap).length >= limit) break
    }
    if (Object.keys(placesMap).length >= limit) break
  }

  return Response.json({ data: Object.values(placesMap) })
}

function nodeAround(radius: number, p: { lat: number; lng: number }, cond: string) {
  return `node(around:${radius},${p.lat},${p.lng})[${cond}];`
}

function pickCategory(tags: Record<string, string>): Category {
  if (tags.amenity === "restaurant") return "restaurant"
  if (tags.amenity === "cafe") return "cafe"
  if (tags.tourism === "hotel") return "hotel"
  if (tags.leisure === "park") return "park"
  if (tags.amenity === "fuel") return "fuel"
  if (tags.tourism === "attraction" || tags.historic) return "attraction"
  if (tags.amenity === "bus_station" || tags.highway === "bus_stop" || tags.railway === "station") return "transport"
  return "attraction"
}

function defaultName(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function transportInfo(tags: Record<string, string>) {
  const type =
    (tags.amenity === "bus_station" && "bus_station") ||
    (tags.highway === "bus_stop" && "bus_stop") ||
    (tags.railway === "station" && "railway_station") ||
    undefined
  return {
    type,
    ref: tags.ref,
    operator: tags.operator,
    routes: tags.routes,
  }
}

// OSM does not include ratings; synthesize a stable pseudo-rating to allow filtering
function synthRating(tags: Record<string, string>): number {
  const base = (tags.name?.length ?? 10) % 10
  const add = Object.keys(tags).length % 5
  const r = 3 + ((base + add) % 20) / 10 // 3.0 .. 5.0
  return Math.min(5, Math.max(3, Number.parseFloat(r.toFixed(1))))
}
