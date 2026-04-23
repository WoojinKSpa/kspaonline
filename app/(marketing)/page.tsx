import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, Waves } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SpaCard } from "@/components/spas/spa-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { featuredSpas, marketHighlights } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-white/50">
        <div className="absolute inset-0 bg-soft-grid bg-[size:48px_48px] opacity-20" />
        <Container className="relative grid min-h-[calc(100svh-5rem)] items-center gap-14 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="max-w-2xl">
            <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/10">
              Curated Korean spa discovery
            </Badge>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight sm:text-6xl">
              Find the right jjimjilbang, sauna, or wellness retreat near you.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Kspa.online helps people browse Korean spas with confidence through
              city-based discovery, amenity highlights, and a future-ready admin
              workflow backed by Supabase.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/spas">
                  Explore spas
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Admin login</Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {marketHighlights.map((item) => (
                <div
                  key={item.label}
                  className="surface p-4 shadow-soft shadow-black/5"
                >
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface relative overflow-hidden p-6 shadow-soft shadow-black/10 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
            <div className="relative flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    Featured city
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Los Angeles county
                  </h2>
                </div>
                <div className="rounded-full bg-secondary p-3 text-secondary-foreground">
                  <Waves className="size-5" />
                </div>
              </div>
              <div className="overflow-hidden rounded-[24px] border border-border bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.18),_transparent_45%),linear-gradient(135deg,#0f172a_0%,#1f2937_55%,#164e63_100%)] p-6 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                  Launch structure
                </p>
                <ul className="mt-5 flex flex-col gap-4 text-sm text-white/80">
                  <li className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 size-4 shrink-0" />
                    Public browsing designed for trust, clarity, and location
                    scanning.
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    Detail pages are ready for hours, amenities, pricing, and
                    editorial content.
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="mt-0.5 size-4 shrink-0" />
                    Admin routes are scaffolded for future CRUD, auth guards,
                    and moderation tools.
                  </li>
                </ul>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {featuredSpas.slice(0, 2).map((spa) => (
                  <SpaCard key={spa.id} spa={spa} compact />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="max-w-md">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Why this structure
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              A flexible foundation for discovery first, operations second.
            </h2>
            <p className="mt-4 text-muted-foreground">
              The public experience stays calm and editorial, while the admin
              side uses modular building blocks that can grow into a full
              directory workflow without a rewrite.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Directory-first data model",
                body: "Designed for spa profiles, neighborhoods, amenities, and future moderation fields.",
              },
              {
                title: "Supabase-ready backend",
                body: "Environment helpers and auth client setup are included so data and login can be wired in cleanly.",
              },
              {
                title: "shadcn-compatible UI system",
                body: "Reusable components and design tokens make it easy to add forms, dialogs, and tables later.",
              },
            ].map((item) => (
              <div key={item.title} className="surface p-6">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

