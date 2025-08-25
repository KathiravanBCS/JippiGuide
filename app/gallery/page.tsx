
"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

type GalleryItem = {
  id: string
  title: string
  image_url: string | null
}

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGallery() {
      const { data, error } = await supabase.from("gallery").select("id, title, image_url")
      if (!error && data) setGallery(data)
      setLoading(false)
    }
    fetchGallery()
  }, [])

  return (
    <main className="max-w-6xl mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold mb-6">Gallery</h1>
      {loading ? (
        <div>Loading...</div>
      ) : gallery.length === 0 ? (
        <div>No images found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-2xl">
              <Image
                src={g.image_url || "/placeholder.svg"}
                alt={g.title}
                width={800}
                height={600}
                className="object-cover w-full h-48 md:h-60"
              />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
