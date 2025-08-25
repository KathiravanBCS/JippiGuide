export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const profileParam = searchParams.get("profile") ?? "driving"
  const profile = ["driving", "cycling", "foot"].includes(profileParam) ? profileParam : "driving"
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const vias = (searchParams.get("vias") ?? "").split("|").map((s) => s.trim())
  if (!from || !to) return Response.json({ error: "from and to required" }, { status: 400 })

  const [fromLat, fromLng] = from.split(",").map((n) => Number.parseFloat(n))
  const [toLat, toLng] = to.split(",").map((n) => Number.parseFloat(n))
  const coords = [
    [fromLng, fromLat],
    ...vias.filter(Boolean).map((v) =>
      v
        .split(",")
        .map((n) => Number.parseFloat(n))
        .reverse(),
    ),
    [toLng, toLat],
  ]
    .map((c) => c.join(","))
    .join(";")

  const url = `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) return Response.json({ error: "routing failed" }, { status: 502 })

  const json = (await res.json()) as any
  const route = json.routes?.[0]
  if (!route) return Response.json({ error: "no route" }, { status: 404 })

  return Response.json({
    geometry: route.geometry as { coordinates: [number, number][] },
    distance_km: route.distance / 1000,
    duration_hr: route.duration / 3600,
  })
}
