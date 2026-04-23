import { unstable_noStore as noStore } from "next/cache";
import { MapPin } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PublishedSpa = {
  id: string;
  name: string;
  city: string;
  state: string | null;
  summary: string | null;
};

export const metadata = {
  title: "Browse Spas",
};

export default async function SpasPage() {
  noStore();

  const supabase = await createSupabaseServerClient();
  const queryPublishedSpas = (orderBy: "created_at" | "id") =>
    supabase
      .from("spas")
      .select("id, name, city, state, summary")
      .eq("status", "published")
      .order(orderBy, { ascending: false });

  let { data, error } = await queryPublishedSpas("created_at");

  // Keep the preferred ordering when the schema supports it, but fall back
  // gracefully for older tables that have not added created_at yet.
  if (error?.message.includes("created_at")) {
    const fallbackResult = await queryPublishedSpas("id");
    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    throw new Error(`Failed to load spas: ${error.message}`);
  }

  const spas = (data ?? []) as PublishedSpa[];

  return (
    <Container className="py-16">
      <PageIntro
        eyebrow="Browse"
        title="Explore Korean spas by city and location."
        description="Browse published spa listings from the live directory."
      />

      {spas.length === 0 ? (
        <div className="mt-10 surface p-10 text-center">
          <h2 className="text-2xl font-semibold">No spas yet</h2>
          <p className="mt-3 text-muted-foreground">
            Published spa listings will appear here once they are added.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {spas.map((spa) => (
            <Card key={spa.id} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Published spa</p>
                    <CardTitle className="mt-2 text-xl">{spa.name}</CardTitle>
                  </div>
                  <div className="rounded-full bg-secondary p-3">
                    <MapPin className="size-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm font-medium text-foreground">
                  {[spa.city, spa.state].filter(Boolean).join(", ")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {spa.summary || "No summary available yet."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
