"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Users } from "lucide-react"

export function HeroSearch() {
  const [tab, setTab] = useState<"hotels" | "packages" | "activities" | "cabs">("hotels")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")
  const [guests, setGuests] = useState<number | undefined>()
  const router = useRouter()

  function submit() {
    const dest = destination.trim()
    if (!dest) {
      router.push("/explore")
      return
    }
    // Simple routing demo: send to /planner for routes, /explore with search for others
    if (tab === "cabs") {
      router.push(`/planner?to=${encodeURIComponent(dest)}`)
    } else {
      const params = new URLSearchParams()
      params.set("q", dest)
      router.push(`/explore?${params.toString()}`)
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        <TabsList className="mx-auto mb-2 grid w-full max-w-[520px] grid-cols-4 bg-white/20 backdrop-blur text-white">
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="cabs">Cabs</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <Card className="bg-white/70 backdrop-blur-xl p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Where are you going?"
                  className="pl-9"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="date" className="pl-9" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min={1}
                  placeholder="Add guests"
                  className="pl-9"
                  value={guests ?? ""}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </div>
            </div>
            <Button onClick={submit} className="mt-3 w-full bg-neutral-900 hover:bg-neutral-800">
              Search
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
