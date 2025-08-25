
import Image from "next/image"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"


type Story = {
  id: string;
  title: string;
  image_url: string;
};

export default async function StoriesPage() {
  const supabase = createClient();
  const { data: stories, error } = await supabase
    .from("stories")
    .select("id, title, image_url")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-6xl mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold mb-6">Travel Stories</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(stories as Story[] | null)?.map((s) => (
          <Card key={s.id} className="overflow-hidden">
            <div className="relative h-44">
              <Image src={s.image_url || "/placeholder.svg"} alt={s.title} fill className="object-cover" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{s.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
        {(!stories || stories.length === 0) && (
          <div className="col-span-full text-center text-muted-foreground">No stories found.</div>
        )}
      </div>
    </main>
  );
}
