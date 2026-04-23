import type { Route } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ChevronLeft,
  Clock3,
  CreditCard,
  Globe,
  Info,
  LayoutGrid,
  Mail,
  MapPin,
  Phone,
  Receipt,
  ScrollText,
  Share2,
  Star,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SpaDetailPageProps = {
  params: Promise<{ slug: string }>;
};

type PublicSpa = {
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  postal_code: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  business_website: string | null;
  business_phone: string | null;
  business_email: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  summary: string | null;
  description: string | null;
  hours_text: string | null;
  pricing_text: string | null;
  day_pass_offered: boolean;
  day_pass_price: string | null;
  listing_categories: string[];
  amenities: string[];
  what_to_know: string | null;
  important_notes: string | null;
  google_review_url: string | null;
  yelp_review_url: string | null;
};

async function getPublishedSpaBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spas")
    .select("slug, name, city, state")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load spa: ${error.message}`);
  }

  const spa = data as Partial<PublicSpa> | null;

  if (!spa) {
    return null;
  }

  const optionalFields = [
    "summary",
    "description",
    "address_line_1",
    "address_line_2",
    "postal_code",
    "website",
    "phone",
    "email",
    "business_website",
    "business_phone",
    "business_email",
    "facebook_url",
    "instagram_url",
    "tiktok_url",
    "twitter_url",
    "youtube_url",
    "hours_text",
    "pricing_text",
    "day_pass_offered",
    "day_pass_price",
    "listing_categories",
    "amenities",
    "what_to_know",
    "important_notes",
    "google_review_url",
    "yelp_review_url",
  ] as const;

  const optionalFieldResults = await Promise.all(
    optionalFields.map(async (field) => {
      const result = await supabase
        .from("spas")
        .select(field)
        .eq("status", "published")
        .eq("slug", slug)
        .maybeSingle();

      if (result.error) {
        if (result.error.message.includes(field)) {
          return [field, null] as const;
        }

        throw new Error(`Failed to load spa: ${result.error.message}`);
      }

      const row = (result.data ?? null) as Record<string, unknown> | null;

      return [field, row?.[field] ?? null] as const;
    })
  );

  const optionalData = optionalFieldResults.reduce<
    Partial<Record<(typeof optionalFields)[number], unknown | null>>
  >((accumulator, [field, value]) => {
    accumulator[field] = value;
    return accumulator;
  }, {});

  return {
    slug: spa.slug ?? slug,
    name: spa.name ?? "Untitled spa",
    city: spa.city ?? null,
    state: spa.state ?? null,
    summary: optionalData.summary ?? null,
    description: optionalData.description ?? null,
    address_line_1: optionalData.address_line_1 ?? null,
    address_line_2: optionalData.address_line_2 ?? null,
    postal_code: optionalData.postal_code ?? null,
    website: optionalData.website ?? null,
    phone: optionalData.phone ?? null,
    email: optionalData.email ?? null,
    business_website: optionalData.business_website ?? null,
    business_phone: optionalData.business_phone ?? null,
    business_email: optionalData.business_email ?? null,
    facebook_url: optionalData.facebook_url ?? null,
    instagram_url: optionalData.instagram_url ?? null,
    tiktok_url: optionalData.tiktok_url ?? null,
    twitter_url: optionalData.twitter_url ?? null,
    youtube_url: optionalData.youtube_url ?? null,
    hours_text: optionalData.hours_text ?? null,
    pricing_text: optionalData.pricing_text ?? null,
    day_pass_offered: Boolean(optionalData.day_pass_offered),
    day_pass_price:
      typeof optionalData.day_pass_price === "string"
        ? optionalData.day_pass_price
        : null,
    listing_categories: Array.isArray(optionalData.listing_categories)
      ? optionalData.listing_categories.map((value) => String(value))
      : [],
    amenities: Array.isArray(optionalData.amenities)
      ? optionalData.amenities.map((value) => String(value))
      : [],
    what_to_know: optionalData.what_to_know ?? null,
    important_notes: optionalData.important_notes ?? null,
    google_review_url: optionalData.google_review_url ?? null,
    yelp_review_url: optionalData.yelp_review_url ?? null,
  } satisfies PublicSpa;
}

function joinParts(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ");
}

function InfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value?: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-3xl bg-secondary p-5">
      <Icon className="size-5 text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-line font-medium">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  body,
}: {
  title: string;
  body?: string | null;
}) {
  if (!body) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
          {body}
        </p>
      </CardContent>
    </Card>
  );
}

function ListCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof MapPin;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export async function generateMetadata({ params }: SpaDetailPageProps) {
  const { slug } = await params;
  const spa = await getPublishedSpaBySlug(slug);

  if (!spa) {
    return { title: "Spa not found" };
  }

  return {
    title: spa.name,
    description: spa.summary || spa.description || "Published spa listing",
  };
}

export default async function SpaDetailPage({ params }: SpaDetailPageProps) {
  noStore();

  const { slug } = await params;
  const spa = await getPublishedSpaBySlug(slug);

  if (!spa) {
    notFound();
  }

  const location = joinParts([spa.city, spa.state]);
  const fullAddress = joinParts([
    spa.address_line_1,
    spa.address_line_2,
    location,
    spa.postal_code,
  ]);
  const browseHref: Route = "/spas";
  const website = spa.business_website || spa.website;
  const phone = spa.business_phone || spa.phone;
  const email = spa.business_email || spa.email;
  const pricing =
    spa.pricing_text ||
    (spa.day_pass_offered
      ? spa.day_pass_price
        ? `Day pass available · ${spa.day_pass_price}`
        : "Day pass available"
      : null);
  const socialLinks = [
    { label: "Facebook", href: spa.facebook_url },
    { label: "Instagram", href: spa.instagram_url },
    { label: "TikTok", href: spa.tiktok_url },
    { label: "Twitter / X", href: spa.twitter_url },
    { label: "YouTube", href: spa.youtube_url },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <Container className="py-16">
      <Link
        href={browseHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to spas
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface overflow-hidden p-8">
          <div className="flex flex-wrap items-center gap-3">
            {location ? (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                {location}
              </Badge>
            ) : null}
            <Badge variant="secondary">Published</Badge>
          </div>

          <h1 className="mt-4 text-4xl font-semibold">{spa.name}</h1>

          {spa.summary ? (
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
              {spa.summary}
            </p>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <InfoBlock icon={MapPin} label="Location" value={fullAddress || location} />
            <InfoBlock icon={Clock3} label="Hours" value={spa.hours_text} />
            <InfoBlock icon={Receipt} label="Pricing" value={pricing} />
          </div>

          <div className="mt-10 grid gap-4 xl:grid-cols-2">
            {spa.description ? (
              <div className="rounded-[28px] border border-border bg-white p-6 xl:col-span-2">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  About this spa
                </p>
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-muted-foreground">
                  {spa.description}
                </p>
              </div>
            ) : null}
            <SectionCard title="What to know" body={spa.what_to_know} />
            <SectionCard title="Important notes" body={spa.important_notes} />
            <ListCard
              title="Listing categories"
              icon={LayoutGrid}
              items={spa.listing_categories}
            />
            <ListCard title="Amenities" icon={Info} items={spa.amenities} />
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Directory details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              {fullAddress ? (
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="mt-1 font-medium">{fullAddress}</p>
                </div>
              ) : null}

              {website ? (
                <div>
                  <p className="text-muted-foreground">Website</p>
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    <Globe className="size-4" />
                    Visit website
                  </a>
                </div>
              ) : null}

              {phone ? (
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${phone}`}
                    className="mt-1 inline-flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    <Phone className="size-4 text-primary" />
                    {phone}
                  </a>
                </div>
              ) : null}

              {email ? (
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-1 inline-flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    <Mail className="size-4 text-primary" />
                    {email}
                  </a>
                </div>
              ) : null}

              {!fullAddress && !website && !phone && !email ? (
                <p className="text-muted-foreground">
                  Additional directory contact details are not available yet.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {(spa.google_review_url || spa.yelp_review_url) ? (
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                {spa.google_review_url ? (
                  <a
                    href={spa.google_review_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-2xl border border-border px-4 py-3 font-medium hover:bg-secondary"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Star className="size-4 text-primary" />
                      Google reviews
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </a>
                ) : null}
                {spa.yelp_review_url ? (
                  <a
                    href={spa.yelp_review_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-2xl border border-border px-4 py-3 font-medium hover:bg-secondary"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Star className="size-4 text-primary" />
                      Yelp reviews
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {(spa.day_pass_offered || spa.day_pass_price) ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="size-5 text-primary" />
                  Day pass
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Offered</span>
                  <span className="font-medium">
                    {spa.day_pass_offered ? "Yes" : "No"}
                  </span>
                </div>
                {spa.day_pass_price ? (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">{spa.day_pass_price}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {socialLinks.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="size-5 text-primary" />
                  Social links
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between rounded-2xl border border-border px-4 py-3 font-medium hover:bg-secondary"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </a>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Listing status</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
              <ScrollText className="size-4 text-primary" />
              This spa is currently published in the public directory.
            </CardContent>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
