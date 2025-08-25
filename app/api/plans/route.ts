import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function POST(req: NextRequest) {
  const { traveler_id, place_id } = await req.json()
  if (!traveler_id || !place_id) {
    return NextResponse.json({ error: "Missing traveler_id or place_id" }, { status: 400 })
  }

  // Insert into Supabase 'plans' table
  const { data, error } = await supabase
    .from("plans")
    .insert([{ traveler_id, place_id }])
    .select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, data })
}
