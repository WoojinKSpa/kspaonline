import type { Route } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import {
  ArrowRight,
  ExternalLink,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type FeaturedSpa = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string | null;
  summary: string | null;
  listing_categories: string[];
};

async function getFeaturedSpas(): Promise<FeaturedSpa[]> {
  const supabase = await createSupabaseServerClient();
  const queryFeaturedSpas = (orderBy: "created_at" | "id") =>
    supabase
      .from("spas")
      .select("id, slug, name, city, state, summary")
      .eq("status", "published")
      .eq("is_featured", true)
      .limit(6)
      .order(orderBy, { ascending: false });

  let data: Awaited<ReturnType<typeof queryFeaturedSpas>>["data"] = null;
  let error: Awaited<ReturnType<typeof queryFeaturedSpas>>["error"] = null;

  const createdAtResult = await queryFeaturedSpas("created_at");
  data = createdAtResult.data;
  error = createdAtResult.error;

  if (error?.message.includes("created_at")) {
    const fallbackResult = await queryFeaturedSpas("id");
    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    throw new Error(`Failed to load featured spas: ${error.message}`);
  }

  const baseSpas = (data ?? []).map((spa) => ({
    id: String(spa.id),
    slug: String(spa.slug),
    name: String(spa.name),
    city: String(spa.city),
    state: typeof spa.state === "string" ? spa.state : null,
    summary: typeof spa.summary === "string" ? spa.summary : null,
    listing_categories: [],
  }));

  const categorySelect: string = "id, listing_categories";
  const { data: categoryData } = await supabase
    .from("spas")
    .select(categorySelect)
    .in("id", baseSpas.map((spa) => spa.id));

  const categoriesBySpaId = new Map(
    ((categoryData ?? []) as unknown as Array<Record<string, unknown>>).map((spa) => [
      String(spa.id),
      Array.isArray(spa.listing_categories)
        ? spa.listing_categories.map((value) => String(value))
        : [],
    ])
  );

  return baseSpas.map((spa) => ({
    ...spa,
    listing_categories: categoriesBySpaId.get(spa.id) ?? [],
  }));
}

async function getPublishedStates() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spas")
    .select("state")
    .eq("status", "published")
    .not("state", "is", null)
    .order("state", { ascending: true });

  if (error) {
    throw new Error(`Failed to load states: ${error.message}`);
  }

  return [...new Set(
    (data ?? [])
      .map((row) => row.state?.trim())
      .filter((state): state is string => Boolean(state))
  )];
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}

export default async function HomePage() {
  noStore();

  const [featuredSpas, states] = await Promise.all([
    getFeaturedSpas(),
    getPublishedStates(),
  ]);

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-white/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,220,191,0.75),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.96))]" />
        <Container className="relative grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/10">
              Korean spa directory
            </Badge>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
              Find Korean Spas Near You
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Explore Korean spas, saunas, jjimjilbangs, and wellness spaces
              across the U.S.
            </p>

            <form action="/spas" className="mt-8 max-w-2xl">
              <div className="surface flex flex-col gap-3 p-3 shadow-[0_20px_60px_-30px_rgba(73,56,35,0.35)] sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[22px] px-3 py-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Search className="size-4" />
                  </div>
                  <input
                    type="text"
                    name="q"
                    placeholder="Search by spa name, city, or state"
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" size="lg" className="flex-1 sm:flex-none">
                    Search
                    <Search data-icon="inline-end" className="size-4" />
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/spas">
                  Browse Spas
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/claim">Add or Claim a Listing</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Live directory",
                  value: featuredSpas.length > 0 ? `${featuredSpas.length}+` : "Growing",
                },
                {
                  label: "Browse by state",
                  value: states.length > 0 ? String(states.length) : "Soon",
                },
                {
                  label: "Directory focus",
                  value: "Korean spas",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="surface p-5 shadow-[0_16px_44px_-34px_rgba(0,0,0,0.35)]"
                >
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface p-6 shadow-[0_24px_80px_-44px_rgba(53,37,21,0.45)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                  Why Kspa.online
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  A calmer way to discover Korean spas
                </h2>
              </div>
              <div className="rounded-full bg-secondary p-3 text-primary">
                <Sparkles className="size-5" />
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {[
                "Browse real spa listings with location and directory details in one place.",
                "See amenities, pricing clues, and first-timer guidance before you visit.",
                "Help spa owners keep details current so guests can discover them with confidence.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-border bg-background/80 px-5 py-4"
                >
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionIntro
            eyebrow="Featured Spas"
            title="A curated look at standout listings"
            description="Featured spas are published listings highlighted by owners or editors, designed to help visitors start with trusted options."
          />

          {featuredSpas.length === 0 ? (
            <div className="surface mt-10 p-10 text-center">
              <h3 className="text-2xl font-semibold">Featured spas coming soon.</h3>
              <p className="mt-3 text-muted-foreground">
                As more listings are published and curated, featured spas will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredSpas.map((spa) => (
                <div
                  key={spa.id}
                  className="surface group flex h-full flex-col p-6 shadow-[0_18px_52px_-38px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {spa.listing_categories[0] ? (
                        <p className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                          {spa.listing_categories[0]}
                        </p>
                      ) : null}
                      <h3 className="mt-3 text-2xl font-semibold leading-tight">
                        <Link
                          href={`/spas/${spa.slug}` as Route}
                          className="transition-colors hover:text-primary"
                        >
                          {spa.name}
                        </Link>
                      </h3>
                    </div>
                    <div className="rounded-full bg-secondary p-3 text-primary">
                      <MapPin className="size-4" />
                    </div>
                  </div>
                  <p className="mt-5 text-sm font-medium text-foreground">
                    {[spa.city, spa.state].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                    {spa.summary || "Published listing. Details will expand as more information is added."}
                  </p>
                  <Link
                    href={`/spas/${spa.slug}` as Route}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    View details
                    <ExternalLink className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="pb-20">
        <Container className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)]">
            <SectionIntro
              eyebrow="Browse by State"
              title="Start with the places already in the directory"
              description="Browse state-by-state and jump into the listings that are currently live."
            />

            {states.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">
                State listings will appear here as more published spas are added.
              </p>
            ) : (
              <div className="mt-8 flex flex-wrap gap-3">
                {states.map((state) => (
                  <Link
                    key={state}
                    href={{ pathname: "/spas", query: { state } }}
                    className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-secondary"
                  >
                    {state}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <div className="surface p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)]">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                First-Timer Guide
              </p>
              <h3 className="mt-3 text-3xl font-semibold">New to Korean Spas?</h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Kspa.online helps visitors understand amenities, etiquette,
                pricing, and what to expect so their first visit feels easier,
                calmer, and more informed.
              </p>
              <Button asChild variant="outline" size="lg" className="mt-6">
                <Link href="/guides/first-time-korean-spa">
                  Read the first-timer guide
                </Link>
              </Button>
            </div>

            <div className="surface p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)]">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                Owners
              </p>
              <h3 className="mt-3 text-3xl font-semibold">
                Own or manage a Korean spa?
              </h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Claim your listing, keep your details current, and help new
                guests discover your spa.
              </p>
              <Button asChild size="lg" className="mt-6">
                <Link href="/claim">Claim your listing</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
