import { notFound } from "next/navigation";
import { Clock3, MapPinned, Sparkles, Ticket } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSpaBySlug, spaCatalog } from "@/lib/mock-data";

type SpaDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return spaCatalog.map((spa) => ({ slug: spa.slug }));
}

export async function generateMetadata({ params }: SpaDetailPageProps) {
  const { slug } = await params;
  const spa = getSpaBySlug(slug);

  if (!spa) {
    return { title: "Spa not found" };
  }

  return {
    title: spa.name,
    description: spa.description,
  };
}

export default async function SpaDetailPage({ params }: SpaDetailPageProps) {
  const { slug } = await params;
  const spa = getSpaBySlug(slug);

  if (!spa) {
    notFound();
  }

  return (
    <Container className="py-16">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="surface overflow-hidden p-8">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
            {spa.city}
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold">{spa.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {spa.description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Neighborhood", value: spa.neighborhood, icon: MapPinned },
              { label: "Hours", value: spa.hours, icon: Clock3 },
              { label: "Day pass", value: spa.priceLabel, icon: Ticket },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-secondary p-5">
                <item.icon className="size-5 text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[28px] border border-border bg-white p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Spa overview
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {spa.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3"
                >
                  <Sparkles className="size-4 text-primary" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Ready for future integrations</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
              <p>
                This placeholder detail view is structured to support editor
                notes, image galleries, reviews, maps, and claim status later.
              </p>
              <Button className="w-full" disabled>
                Claim flow coming later
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Directory data points</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-medium">{spa.slug}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">Published</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Admin owner</span>
                <span className="font-medium">Unassigned</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </Container>
  );
}

