export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")
  const limit = Number.parseInt(searchParams.get("limit") || "5", 10)

  if (!q) return Response.json({ results: [] })

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(q)}`
  const res = await fetch(url, {
    headers: { "User-Agent": "travel-planner-demo/1.0 (https://vercel.com)" },
    next: { revalidate: 60 },
  })
  if (!res.ok) return Response.json({ results: [] }, { status: 502 })

  const json = (await res.json()) as any[]
  const results = json.map((r) => ({
    lat: Number.parseFloat(r.lat),
    lng: Number.parseFloat(r.lon),
    label: r.display_name as string,
  }))
  return Response.json({ results })
}
