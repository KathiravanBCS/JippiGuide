export type Category =
  | "restaurant"
  | "cafe"
  | "hotel"
  | "park"
  | "attraction"
  | "fuel"
  | "shopping"
  | "museum"
  | "beach"
  | "viewpoint"
  | "transport"
  | "hospital"

export interface Place {
  id: string
  name: string
  description?: string
  category: Category
  city?: string
  country?: string
  address?: string
  latitude: number
  longitude: number
  website?: string
  images?: string[]
  rating?: number
  opening_hours?: string
  tags?: string[]
  // Optional OSM properties for transport
    priceLevel?: number
  transport?: {
    type?: "bus_station" | "bus_stop" | "railway_station"
    ref?: string
    operator?: string
    routes?: string
  }
}
