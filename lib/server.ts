import { createClient } from "@supabase/supabase-js"

let serverClient: ReturnType<typeof createClient> | null = null

export function getSupabaseServer() {
  if (serverClient) return serverClient
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  serverClient = createClient(url, key, { auth: { persistSession: false } })
  return serverClient
}
