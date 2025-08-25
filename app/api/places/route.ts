import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { SAMPLE_PLACES } from "@/data/places"
import type { Place } from "@/types/place"

function kmToLat(km: number) {
  return km / 110.574
}
function kmToLng(km: number, lat: number) {
  return km / (111.32 * Math.cos((lat * Math.PI) / 180))
}

async function hasPlacesTable(client: any): Promise<boolean> {
  try {
    const { error } = await client.from("places").select("id", { head: true, count: "exact" }).limit(1)
    // If error is present, table likely does not exist or schema not synced
    return !error
  } catch {
    return false
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""
  const lat = Number.parseFloat(searchParams.get("lat") ?? "0")
  const lng = Number.parseFloat(searchParams.get("lng") ?? "0")
  const radiusKm = Number.parseFloat(searchParams.get("radiusKm") ?? "20")
  const limit = Number.parseInt(searchParams.get("limit") ?? "50", 10)

  try {
    const supabase = getSupabaseServer()
    let results: Place[] = []

    if (supabase && (await hasPlacesTable(supabase))) {
      let query = supabase.from("places").select("*").limit(limit)

      if (q) {
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%`)
      }
      if (category) {
        query = query.eq("category", category)
      }
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const latDelta = kmToLat(radiusKm)
        const lngDelta = kmToLng(radiusKm, lat || 0)
        query = query
          .gte("latitude", lat - latDelta)
          .lte("latitude", lat + latDelta)
          .gte("longitude", lng - lngDelta)
          .lte("longitude", lng + lngDelta)
      }

      const { data } = await query
      if (data) {
        results = data as any as Place[]
      }
    }

    // Fallback (or if Supabase returned no results)
    if (!results || results.length === 0) {
      results = SAMPLE_PLACES.slice(0, Math.max(1, limit))
      if (q) {
        const qq = q.toLowerCase()
        results = results.filter(
          (p) =>
            p.name.toLowerCase().includes(qq) ||
            (p.description?.toLowerCase() ?? "").includes(qq) ||
            (p.city?.toLowerCase() ?? "").includes(qq),
        )
      }
      if (category) results = results.filter((p) => p.category === category)
    }

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      results = results
        .map((p) => ({ ...p, distance_km: haversine(lat, lng, p.latitude, p.longitude) }))
        .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0))
    }

    return NextResponse.json({ data: results })
  } catch (err) {
    // Last-resort safety: return sample data with minimal processing
    let results = SAMPLE_PLACES
    if (
      Number.isFinite(Number.parseFloat(searchParams.get("lat") ?? "NaN")) &&
      Number.isFinite(Number.parseFloat(searchParams.get("lng") ?? "NaN"))
    ) {
      const latF = Number.parseFloat(searchParams.get("lat") ?? "0")
      const lngF = Number.parseFloat(searchParams.get("lng") ?? "0")
      results = results
        .map((p) => ({ ...p, distance_km: haversine(latF, lngF, p.latitude, p.longitude) }))
        .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0))
    }
    return NextResponse.json({ data: results })
  }
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
