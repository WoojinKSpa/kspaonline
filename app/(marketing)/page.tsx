import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { ArrowRight, BookOpen, ExternalLink, Globe, Leaf, MapPin, Search } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFirstGalleryImageUrls } from "@/lib/spa-images";
import { listPublishedBlogPostsByType } from "@/lib/blog-posts";
import type { BlogPost } from "@/lib/blog-posts";

// ── Hero background image ─────────────────────────────────────────────────────
// Upload your spa photo to Supabase Storage (or any HTTPS host) and paste the
// public URL here. Leave empty to fall back to a solid gradient background.
const HERO_IMAGE = "https://mqkjumltnmkpmkkqdmcn.supabase.co/storage/v1/object/public/Website/website_background.png";

// ── Types ─────────────────────────────────────────────────────────────────────

type FeaturedSpa = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string | null;
  summary: string | null;
  listing_categories: string[];
  coverImageUrl: string | null;
};

// ── Data fetchers ─────────────────────────────────────────────────────────────

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

  if (error) throw new Error(`Failed to load featured spas: ${error.message}`);

  const baseSpas = (data ?? []).map((spa) => ({
    id: String(spa.id),
    slug: String(spa.slug),
    name: String(spa.name),
    city: String(spa.city),
    state: typeof spa.state === "string" ? spa.state : null,
    summary: typeof spa.summary === "string" ? spa.summary : null,
    listing_categories: [],
  }));

  const { data: categoryData } = await supabase
    .from("spas")
    .select("id, listing_categories" as string)
    .in("id", baseSpas.map((spa) => spa.id));

  const categoriesBySpaId = new Map(
    ((categoryData ?? []) as unknown as Array<Record<string, unknown>>).map((spa) => [
      String(spa.id),
      Array.isArray(spa.listing_categories)
        ? spa.listing_categories.map((v) => String(v))
        : [],
    ])
  );

  const coverImages = await getFirstGalleryImageUrls(baseSpas.map((s) => s.id));

  return baseSpas.map((spa) => ({
    ...spa,
    listing_categories: categoriesBySpaId.get(spa.id) ?? [],
    coverImageUrl: coverImages.get(spa.id) ?? null,
  }));
}

async function getDirectoryStats() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spas")
    .select("state, country" as string)
    .eq("status", "published")
    .order("state", { ascending: true });

  if (error) throw new Error(`Failed to load directory stats: ${error.message}`);

  const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
  const states = [
    ...new Set(
      rows
        .map((row) => (typeof row.state === "string" ? row.state.trim() : ""))
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
  const countries = [
    ...new Set(
      rows
        .map((row) => (typeof row.country === "string" ? row.country.trim() : ""))
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));

  return { listingCount: rows.length, states, countries };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "Washington D.C.",
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
  NL: "Newfoundland", NS: "Nova Scotia", ON: "Ontario", PE: "Prince Edward Island",
  QC: "Quebec", SK: "Saskatchewan",
};

function stateLabel(state: string): string {
  return STATE_NAMES[state.toUpperCase()] ?? state;
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
      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  noStore();

  const [featuredSpas, directoryStats, recentPosts] = await Promise.all([
    getFeaturedSpas(),
    getDirectoryStats(),
    listPublishedBlogPostsByType("guide", 3),
  ]);
  const { countries, listingCount, states } = directoryStats;

  const heroStats = [
    { icon: Leaf,   label: "Spa Listings", value: listingCount },
    { icon: MapPin, label: "States",       value: states.length },
    { icon: Globe,  label: "Countries",    value: countries.length },
  ];

  return (
    <div className="pb-20">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[620px] items-center overflow-hidden lg:min-h-[740px]">
        {/* Background */}
        {HERO_IMAGE ? (
          <Image
            src={HERO_IMAGE}
            alt="Korean spa interior"
            fill
            priority
            className="object-cover object-center"
          />
        ) : (
          /* Fallback gradient when no image is set */
          <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(173,55%,14%)_0%,hsl(173,40%,22%)_45%,hsl(26,40%,22%)_100%)]" />
        )}

        {/* Dark overlay — heavier on the left so text stays legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        {/* Bottom fade so the section blends into the page */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/30 to-transparent" />

        {/* Content */}
        <Container className="relative z-10 py-20 lg:py-28">
          <div className="max-w-xl">
            {/* Badge */}
            <Badge className="mb-6 border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15">
              Korean spa directory
            </Badge>

            {/* Heading */}
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Find Korean<br className="hidden sm:block" /> Spas Near You
            </h1>

            {/* Subtext */}
            <p className="mt-6 max-w-md text-lg leading-8 text-white/75">
              Explore Korean spas, saunas, jjimjilbangs, and wellness spaces
              across the U.S.
            </p>

            {/* Search bar */}
            <form action="/spas" className="mt-8 max-w-lg">
              <div className="flex items-center overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
                <div className="flex flex-1 items-center gap-3 px-4 py-1">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search by spa name, city, or state"
                    className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="p-1.5">
                  <Button type="submit" size="default" className="rounded-xl px-5">
                    Search
                  </Button>
                </div>
              </div>
            </form>

            {/* CTA buttons */}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/spas">
                  Browse Spas
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:border-white/50 hover:bg-white/20 hover:text-white"
              >
                <Link href={"/submit" as Route}>Submit a spa</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-3">
              {heroStats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="size-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold leading-none text-white">{value}</p>
                    <p className="mt-1 text-xs text-white/60">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── First-timer callout ────────────────────────────────────────────── */}
      <section className="border-b border-border bg-secondary/40 py-14">
        <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-lg">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">First-timer guide</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">New to Korean Spas?</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Understand amenities, etiquette, pricing, and what to expect so your first visit feels easier and more relaxed.
            </p>
          </div>
          <Button asChild size="lg" variant="outline" className="shrink-0">
            <Link href="/guides/first-time-at-a-korean-spa">
              Read the first-timer guide →
            </Link>
          </Button>
        </Container>
      </section>

      {/* ── Featured Spas ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <Container>
          <SectionIntro
            eyebrow="Featured Spas"
            title="A curated collection of top Korean spa destinations."
            description="Exceptional listings chosen to help you find trusted, memorable experiences faster."
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
                  className="surface group flex h-full flex-col overflow-hidden shadow-[0_18px_52px_-38px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-0.5"
                >
                  {spa.coverImageUrl ? (
                    <Link href={`/spas/${spa.slug}` as Route} className="relative block h-48 w-full shrink-0 overflow-hidden">
                      <Image
                        src={spa.coverImageUrl}
                        alt={spa.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      />
                    </Link>
                  ) : (
                    <div className="flex h-48 w-full shrink-0 items-center justify-center bg-secondary/50">
                      <MapPin className="size-8 text-muted-foreground/30" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div>
                      {spa.listing_categories[0] && (
                        <p className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                          {spa.listing_categories[0]}
                        </p>
                      )}
                      <h3 className="mt-3 text-2xl font-semibold leading-tight">
                        <Link href={`/spas/${spa.slug}` as Route} className="transition-colors hover:text-primary">
                          {spa.name}
                        </Link>
                      </h3>
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">
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
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ── From the Guides ───────────────────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section className="bg-secondary/30 py-20">
          <Container>
            <div className="flex items-end justify-between gap-4">
              <SectionIntro
                eyebrow="From the Guides"
                title="Tips & Guides"
                description="Expert advice to help you make the most of your Korean spa experience."
              />
              <Link href={"/guides" as Route} className="shrink-0 text-sm font-medium text-primary hover:underline">
                All guides →
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post: BlogPost) => (
                <Link
                  key={post.id}
                  href={(`/guides/${post.slug}`) as Route}
                  className="group surface flex flex-col overflow-hidden shadow-[0_12px_36px_-28px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
                >
                  {post.featured_image_url ? (
                    <div className="relative h-44 w-full shrink-0 overflow-hidden">
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : (
                    <div className="flex h-32 w-full shrink-0 items-center justify-center bg-primary/5">
                      <BookOpen className="size-8 text-primary/20" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <p className="text-xs font-medium uppercase tracking-widest text-primary">Guide</p>
                    <h3 className="text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="flex-1 text-sm leading-6 text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="text-sm font-medium text-primary group-hover:underline">
                      Read guide →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Browse by Region + Owners ─────────────────────────────────────── */}
      <section className="pb-20 pt-20">
        <Container className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)]">
            <SectionIntro
              eyebrow="Browse by Region"
              title="Start with the places already in the directory"
              description="Explore listings by state, province, or region."
            />
            {states.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">
                Region listings will appear here as more published spas are added.
              </p>
            ) : (
              <div className="mt-8 flex flex-wrap gap-3">
                {states.map((state) => (
                  <Link
                    key={state}
                    href={{ pathname: "/spas", query: { state } }}
                    className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-secondary"
                  >
                    {stateLabel(state)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="surface p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)]">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Owners</p>
            <h3 className="mt-3 text-3xl font-semibold">Own or manage a Korean spa?</h3>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Claim your listing, keep your details current, and help new guests discover your spa.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href={"/claim" as Route}>Claim your listing</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
