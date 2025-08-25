
"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useItinerary } from "@/hooks/use-itinerary"
import type { Place } from "@/types/place"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

type Package = {
  id: string
  name: string
  price: number | null
  description: string | null
  image_url: string | null
}

export default function PackagesPage() {
  const { add } = useItinerary()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPackages() {
      const { data, error } = await supabase.from("packages").select("id, name, price, description, image_url")
      if (!error && data) setPackages(data)
      setLoading(false)
    }
    fetchPackages()
  }, [])

  function addPkg(p: Package) {
    const place: Place = {
      id: `pkg-${p.id}`,
      name: p.name,
      description: p.description || "Travel package",
      category: "attraction",
      city: "Himachal",
      latitude: 31.1048,
      longitude: 77.1734,
      images: [],
    }
    add(place)
    toast({ title: "Added to plan", description: p.name })
  }

  return (
    <main className="max-w-6xl mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold mb-6">Our Travel Packages</h1>
      {loading ? (
        <div>Loading...</div>
      ) : packages.length === 0 ? (
        <div>No packages found.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image src={p.image_url || "/placeholder.svg"} alt={p.name} fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>{p.description || "Duration: 7 days / 6 nights"}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Button onClick={() => addPkg(p)}>Add to Plan</Button>
                <div className="text-lg font-semibold">
                  {p.price ? `₹ ${p.price}` : ""} <span className="text-sm text-muted-foreground">per person</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
