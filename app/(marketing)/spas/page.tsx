/* eslint-disable @next/next/no-img-element */
import type { Route } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { ArrowUpRight, MapPin, Search, Star, X } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SPA_IMAGE_BUCKET } from "@/lib/spa-images";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { getActiveSponsoredSpas } from "@/lib/ad-campaigns";
import { SponsoredCard } from "@/components/ads/sponsored-card";
import { ImpressionTracker } from "@/components/ads/impression-tracker";

type SpasPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PublishedSpa = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  summary: string | null;
  is_featured: boolean;
  listing_categories: string[];
  featured_image_url: string | null;
  review_count: number;
};

type FilterOptions = {
  countries: string[];
  states: string[];
  cities: string[];
};

type DirectoryFilters = {
  country: string;
  state: string;
  city: string;
  postal_code: string;
  q: string;
};

const SPA_SELECT: string =
  "id, slug, name, city, state, postal_code, country, summary, is_featured, listing_categories";
const FILTER_OPTION_SELECT: string = "country, state, city";

export const metadata = {
  title: "Browse Spas",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function cleanParam(value: string | string[] | undefined) {
  return firstParam(value).trim().slice(0, 120);
}

function cleanSearchTerm(value: string) {
  return value.replace(/[^a-zA-Z0-9\s.-]/g, " ").replace(/\s+/g, " ").trim();
}

function uniqueSorted(values: Array<unknown>) {
  return [...new Set(
    values
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
}

function toPublishedSpa(row: Record<string, unknown>): PublishedSpa {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    city: String(row.city),
    state: typeof row.state === "string" ? row.state : null,
    postal_code: typeof row.postal_code === "string" ? row.postal_code : null,
    country: typeof row.country === "string" ? row.country : null,
    summary: typeof row.summary === "string" ? row.summary : null,
    is_featured: Boolean(row.is_featured),
    listing_categories: Array.isArray(row.listing_categories)
      ? row.listing_categories.map((value) => String(value))
      : [],
    featured_image_url: null,
    review_count: 0,
  };
}

async function getSpaCardMeta(spaIds: string[]) {
  const meta = new Map<
    string,
    { featured_image_url: string | null; review_count: number }
  >();

  spaIds.forEach((spaId) => {
    meta.set(spaId, { featured_image_url: null, review_count: 0 });
  });

  if (spaIds.length === 0) {
    return meta;
  }

  const supabase = createSupabaseAdminClient();
  const { data: imageRows } = await supabase
    .from("spa_images")
    .select("spa_id, storage_path, sort_order")
    .eq("kind", "gallery")
    .in("spa_id", spaIds)
    .order("sort_order", { ascending: true });

  for (const row of (imageRows ?? []) as Array<Record<string, unknown>>) {
    const spaId = typeof row.spa_id === "string" ? row.spa_id : null;
    const storagePath =
      typeof row.storage_path === "string" ? row.storage_path : null;

    if (!spaId || !storagePath || meta.get(spaId)?.featured_image_url) {
      continue;
    }

    const { data } = supabase.storage
      .from(SPA_IMAGE_BUCKET)
      .getPublicUrl(storagePath);

    meta.set(spaId, {
      review_count: meta.get(spaId)?.review_count ?? 0,
      featured_image_url: data.publicUrl,
    });
  }

  const { data: reviewRows, error: reviewError } = await supabase
    .from("spa_reviews")
    .select("spa_id")
    .eq("status", "approved")
    .in("spa_id", spaIds);

  if (!reviewError) {
    for (const row of (reviewRows ?? []) as Array<Record<string, unknown>>) {
      const spaId = typeof row.spa_id === "string" ? row.spa_id : null;
      if (!spaId) continue;

      const current = meta.get(spaId) ?? {
        featured_image_url: null,
        review_count: 0,
      };

      meta.set(spaId, {
        ...current,
        review_count: current.review_count + 1,
      });
    }
  }

  return meta;
}

async function getFilterOptions(): Promise<FilterOptions> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spas")
    .select(FILTER_OPTION_SELECT)
    .eq("status", "published");

  if (error) {
    throw new Error(`Failed to load spa filter options: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;

  return {
    countries: uniqueSorted(rows.map((row) => row.country)),
    states: uniqueSorted(rows.map((row) => row.state)),
    cities: uniqueSorted(rows.map((row) => row.city)),
  };
}

async function getPublishedSpas(filters: DirectoryFilters) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("spas")
    .select(SPA_SELECT)
    .eq("status", "published");

  if (filters.country) {
    query = query.ilike("country", filters.country);
  }

  if (filters.state) {
    query = query.ilike("state", filters.state);
  }

  if (filters.city) {
    query = query.ilike("city", filters.city);
  }

  if (filters.postal_code) {
    query = query.ilike("postal_code", `${filters.postal_code}%`);
  }

  const searchTerm = cleanSearchTerm(filters.q);

  if (searchTerm) {
    const searchPattern = `%${searchTerm}%`;
    query = query.or(
      [
        `name.ilike.${searchPattern}`,
        `city.ilike.${searchPattern}`,
        `state.ilike.${searchPattern}`,
        `postal_code.ilike.${searchPattern}`,
        `country.ilike.${searchPattern}`,
      ].join(",")
    );
  }

  const { data, error } = await query
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load spas: ${error.message}`);
  }

  const spas = ((data ?? []) as unknown as Array<Record<string, unknown>>).map(
    toPublishedSpa
  );
  const cardMeta = await getSpaCardMeta(spas.map((spa) => spa.id));

  return spas.map((spa) => ({
    ...spa,
    ...(cardMeta.get(spa.id) ?? {}),
  }));
}

function SelectField({
  label,
  name,
  value,
  options,
  placeholder,
}: {
  label: string;
  name: keyof DirectoryFilters;
  value: string;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={value}
        className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default async function SpasPage({ searchParams }: SpasPageProps) {
  noStore();

  const params = await searchParams;
  const filters: DirectoryFilters = {
    country: cleanParam(params?.country),
    state: cleanParam(params?.state),
    city: cleanParam(params?.city),
    postal_code: cleanParam(params?.postal_code),
    q: cleanParam(params?.q),
  };

  const hasFilters = Object.values(filters).some(Boolean);
  const [spas, filterOptions, sponsoredCampaigns] = await Promise.all([
    getPublishedSpas(filters),
    getFilterOptions(),
    getActiveSponsoredSpas(),
  ]);
  const sponsoredSlice = sponsoredCampaigns.slice(0, 3);

  return (
    <Container className="py-16">
      <PageIntro
        eyebrow="Browse"
        title="Explore Korean spas by city and location."
        description="Search published spa listings by place, ZIP code, or spa name."
      />

      <form
        action="/spas"
        className="surface mt-10 grid gap-4 p-5 shadow-[0_18px_52px_-38px_rgba(0,0,0,0.35)]"
      >
        <div className="grid gap-4 lg:grid-cols-[1.35fr_repeat(4,minmax(0,1fr))]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="q">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="q"
                name="q"
                defaultValue={filters.q}
                placeholder="Spa name, city, state, ZIP, or country"
                className="pl-10"
              />
            </div>
          </div>

          <SelectField
            label="Country"
            name="country"
            value={filters.country}
            options={filterOptions.countries}
            placeholder="Any country"
          />
          <SelectField
            label="State"
            name="state"
            value={filters.state}
            options={filterOptions.states}
            placeholder="Any state"
          />
          <SelectField
            label="City"
            name="city"
            value={filters.city}
            options={filterOptions.cities}
            placeholder="Any city"
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="postal_code">ZIP/Postal Code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              defaultValue={filters.postal_code}
              placeholder="92111"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {spas.length} {spas.length === 1 ? "spa" : "spas"} found
          </p>
          <div className="flex flex-wrap gap-3">
            {hasFilters ? (
              <Button asChild variant="outline">
                <Link href="/spas">
                  <X data-icon="inline-start" className="size-4" />
                  Clear filters
                </Link>
              </Button>
            ) : null}
            <Button type="submit">
              Search spas
              <Search data-icon="inline-end" className="size-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Sponsored placements — up to 3, shown above organic results */}
      {sponsoredSlice.length > 0 && (
        <>
          <ImpressionTracker campaignIds={sponsoredSlice.map((c) => c.id)} />
          <div className="mt-10">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Sponsored
            </p>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sponsoredSlice.map((campaign) => (
                <SponsoredCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              All listings
            </p>
          </div>
        </>
      )}

      {spas.length === 0 ? (
        <div className="mt-10 surface p-10 text-center">
          <h2 className="text-2xl font-semibold">
            {hasFilters ? "No spas match your filters" : "No spas yet"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {hasFilters
              ? "Try clearing a filter or searching a broader city, state, ZIP, or spa name."
              : "Published spa listings will appear here once they are added."}
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {spas.map((spa) => (
            <Card key={spa.id} className="h-full overflow-hidden">
              {spa.featured_image_url ? (
                <Link href={`/spas/${spa.slug}` as Route} aria-label={spa.name}>
                  <img
                    src={spa.featured_image_url}
                    alt={`${spa.name} featured photo`}
                    className="h-48 w-full object-cover transition duration-300 hover:scale-[1.02]"
                  />
                </Link>
              ) : (
                <Link
                  href={`/spas/${spa.slug}` as Route}
                  aria-label={spa.name}
                  className="flex h-48 w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(14,108,93,0.18),transparent_34%),linear-gradient(135deg,#f4eee5,#fffaf3_48%,#edf4ef)]"
                >
                  <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    Kspa.online
                  </div>
                </Link>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {spa.listing_categories[0] ? (
                      <Badge variant="secondary" className="rounded-full">
                        {spa.listing_categories[0]}
                      </Badge>
                    ) : null}
                    <CardTitle className="mt-2 text-xl">
                      <Link
                        href={`/spas/${spa.slug}` as Route}
                        className="hover:underline"
                      >
                        {spa.name}
                      </Link>
                    </CardTitle>
                    <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="size-4 fill-primary text-primary" />
                      {spa.review_count}{" "}
                      {spa.review_count === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                  <div className="rounded-full bg-secondary p-3">
                    <MapPin className="size-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm font-medium text-foreground">
                  {[spa.city, spa.state, spa.postal_code].filter(Boolean).join(", ")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {spa.summary || "No summary available yet."}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/spas/${spa.slug}` as Route}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    View details
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
