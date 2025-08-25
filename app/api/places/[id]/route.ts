import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase/server"
import { SAMPLE_PLACES } from "@/data/places"
import type { Place } from "@/types/place"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServer()
  let place: Place | null = null
  if (supabase) {
    const { data, error } = await supabase.from("places").select("*").eq("id", params.id).single()
    if (!error && data) place = data as any as Place
  }
  if (!place) place = SAMPLE_PLACES.find((p) => p.id === params.id) ?? null
  if (!place) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ data: place })
}
