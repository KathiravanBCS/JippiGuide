
import Image from "next/image"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"


type Traveler = {
  id: string;
  name: string;
  bio: string;
  avatar_url: string;
};

export default async function TravelersPage() {
  const supabase = createClient();
  const { data: travelers, error } = await supabase
    .from("travelers")
    .select("id, name, bio, avatar_url");

  return (
    <main className="max-w-6xl mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold text-center">Trusted by Travelers Worldwide</h1>
      <p className="text-center text-muted-foreground mt-2">
        Hear what our community has to say about their unforgettable experiences with us.
      </p>
      <div className="mt-8 grid sm:grid-cols-3 gap-6">
        {(travelers as Traveler[] | null)?.map((t) => (
          <Card key={t.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image src={t.avatar_url || "/placeholder.svg"} alt={t.name} fill className="object-cover" />
            </div>
            <CardHeader>
              <CardTitle className="text-base">{t.name}</CardTitle>
              <CardDescription>{t.bio}</CardDescription>
            </CardHeader>
          </Card>
        ))}
        {(!travelers || travelers.length === 0) && (
          <div className="col-span-full text-center text-muted-foreground">No travelers found.</div>
        )}
      </div>
    </main>
  );
}
