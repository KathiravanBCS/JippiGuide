
"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Destination = {
  id: string
  name: string
  description: string | null
  image_url: string | null
}


export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDestinations() {
      const { data, error } = await supabase.from("destinations").select("id, name, description, image_url")
      if (!error && data) setDestinations(data)
      setLoading(false)
    }
    fetchDestinations()
  }, [])

  return (
    <main className="max-w-6xl mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold mb-6">Destinations</h1>
      {loading ? (
        <div>Loading...</div>
      ) : destinations.length === 0 ? (
        <div>No destinations found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d) => (
            <Card key={d.id} className="overflow-hidden">
              <div className="relative h-44">
                <Image src={d.image_url || "/placeholder.svg"} alt={d.name} fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle>{d.name}</CardTitle>
                <CardDescription>{d.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/explore" className="underline text-sm">
                  Explore on the map
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
