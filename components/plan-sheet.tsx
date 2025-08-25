"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useItinerary, totalPathDistanceKm } from "@/hooks/use-itinerary"
import { usePlanUI } from "@/hooks/use-plan-ui"
import { MapPin, Trash2 } from "lucide-react"

export function PlanSheet({ showTrigger = true }: { showTrigger?: boolean }) {
  const { items, remove, clear } = useItinerary()
  const { open, setOpen } = usePlanUI()

  const approxDist = useMemo(() => totalPathDistanceKm(items), [items])

  function share() {
    const text =
      "My travel plan:\n" +
      items.map((i, idx) => `${idx + 1}. ${i.name} (${i.category})`).join("\n") +
      (approxDist > 0 ? `\n\nApprox distance: ${approxDist.toFixed(1)} km` : "")
    navigator.clipboard?.writeText(text)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button variant="default">Plan ({items.length})</Button>
        </SheetTrigger>
      )}
      <SheetContent className="sm:max-w-xl z-[1300]">
        <SheetHeader>
          <SheetTitle>Your Plan</SheetTitle>
          <div className="text-sm text-muted-foreground">
            {items.length} items • Approx distance: {approxDist.toFixed(1)} km
          </div>
        </SheetHeader>
        <Separator className="my-3" />
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-3">
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground">No items yet. Add places from the results list.</div>
            )}
            {items.map((it, idx) => (
              <div key={it.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {idx + 1}. {it.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="capitalize">
                        {it.category}
                      </Badge>
                      {it.address && <span className="truncate">{it.address}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(it.id)} aria-label="Remove">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter className="mt-3">
          <div className="flex w-full items-center justify-between gap-2">
            <Button onClick={share} className="flex-1">
              Share/Copy
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => window.open("https://www.google.com/maps", "_blank")}
            >
              <MapPin className="w-4 h-4 mr-2" /> Open Maps
            </Button>
            <Button variant="destructive" onClick={clear}>
              Clear
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
