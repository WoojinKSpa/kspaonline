/* eslint-disable @next/next/no-img-element */
import type { Route } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  Globe,
  Mail,
  Navigation,
  Phone,
  Share2,
  Star,
  XCircle,
  Heart,
  MessageSquare,
} from "lucide-react";

import {
  AMENITY_CATEGORIES,
  normalizeAmenitySelection,
} from "@/lib/amenities";
import { Container } from "@/components/layout/container";
import { SpaGalleryLightbox } from "@/components/spas/spa-gallery-lightbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listSpaImagesBySpaId } from "@/lib/spa-images";
import {
  getApprovedReviewSummary,
  getUserReviewForSpa,
  listApprovedReviewsBySpaId,
} from "@/lib/spa-reviews";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SpaDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ review_submitted?: string }>;
};

type PublicSpa = {
  id: string;
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
    .select("id, slug, name, city, state")
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

  const asNullableString = (value: unknown): string | null =>
    typeof value === "string" ? value : null;

  const asStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.map((item) => String(item)) : [];

  const asBoolean = (value: unknown): boolean =>
    typeof value === "boolean" ? value : Boolean(value);

  return {
    id: String(spa.id ?? ""),
    slug: spa.slug ?? slug,
    name: spa.name ?? "Untitled spa",
    city: spa.city ?? null,
    state: spa.state ?? null,
    summary: asNullableString(optionalData.summary),
    description: asNullableString(optionalData.description),
    address_line_1: asNullableString(optionalData.address_line_1),
    address_line_2: asNullableString(optionalData.address_line_2),
    postal_code: asNullableString(optionalData.postal_code),
    website: asNullableString(optionalData.website),
    phone: asNullableString(optionalData.phone),
    email: asNullableString(optionalData.email),
    business_website: asNullableString(optionalData.business_website),
    business_phone: asNullableString(optionalData.business_phone),
    business_email: asNullableString(optionalData.business_email),
    facebook_url: asNullableString(optionalData.facebook_url),
    instagram_url: asNullableString(optionalData.instagram_url),
    tiktok_url: asNullableString(optionalData.tiktok_url),
    twitter_url: asNullableString(optionalData.twitter_url),
    youtube_url: asNullableString(optionalData.youtube_url),
    hours_text: asNullableString(optionalData.hours_text),
    pricing_text: asNullableString(optionalData.pricing_text),
    day_pass_offered: asBoolean(optionalData.day_pass_offered),
    day_pass_price: asNullableString(optionalData.day_pass_price),
    listing_categories: asStringArray(optionalData.listing_categories),
    amenities: asStringArray(optionalData.amenities),
    what_to_know: asNullableString(optionalData.what_to_know),
    important_notes: asNullableString(optionalData.important_notes),
    google_review_url: asNullableString(optionalData.google_review_url),
    yelp_review_url: asNullableString(optionalData.yelp_review_url),
  } satisfies PublicSpa;
}

function joinParts(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ");
}

// ── Geocoding (Nominatim / OpenStreetMap — free, no API key) ─────────────────

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: { "User-Agent": "KSpaOnline/1.0 (hello@kspa.online)" },
        next: { revalidate: 60 * 60 * 24 }, // cache 24 h
      }
    );
    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

// ── Map card ─────────────────────────────────────────────────────────────────

function SpaMapCard({
  coords,
  address,
}: {
  coords: { lat: number; lon: number };
  address: string;
}) {
  const delta = 0.008;
  const bbox = [
    coords.lon - delta,
    coords.lat - delta,
    coords.lon + delta,
    coords.lat + delta,
  ].join(",");
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${encodeURIComponent(address)}`;

  return (
    <Card className="rounded-[24px] shadow-none">
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {/* Square map */}
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Spa location map"
            src={osmEmbed}
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>

        {/* Directions buttons */}
        <a
          href={appleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-secondary"
        >
          <Navigation className="size-4 text-primary" />
          Get directions · Apple Maps
        </a>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-secondary"
        >
          <Navigation className="size-4 text-primary" />
          Get directions · Google Maps
        </a>
      </CardContent>
    </Card>
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

  // Content from the rich-text editor is stored as HTML — render it as markup.
  // Plain-text legacy values (no tags) still display correctly via the prose styles.
  const isHtml = body.trimStart().startsWith("<");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isHtml ? (
          <div
            className="article-prose text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {body}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5 text-primary">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={
            star <= Math.round(rating)
              ? "size-4 fill-current"
              : "size-4 text-muted-foreground/30"
          }
        />
      ))}
    </div>
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

export default async function SpaDetailPage({
  params,
  searchParams,
}: SpaDetailPageProps) {
  noStore();

  const { slug } = await params;
  const query = await searchParams;
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
  const pricingLabel = spa.day_pass_offered ? "Day Pass" : "Pricing";
  const socialLinks = [
    { label: "Facebook", href: spa.facebook_url },
    { label: "Instagram", href: spa.instagram_url },
    { label: "TikTok", href: spa.tiktok_url },
    { label: "Twitter / X", href: spa.twitter_url },
    { label: "YouTube", href: spa.youtube_url },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));
  const enabledAmenities = new Set(normalizeAmenitySelection(spa.amenities));
  const primaryCategory = spa.listing_categories[0] ?? null;
  const secondaryCategories = spa.listing_categories.slice(1);
  const images = spa.id ? await listSpaImagesBySpaId(spa.id) : [];
  const logoImage = images.find((image) => image.kind === "logo") ?? null;
  const galleryImages = images.filter((image) => image.kind === "gallery");
  const featuredImage = galleryImages[0] ?? null;
  const galleryGridImages = galleryImages.slice(1, 5);
  const lightboxImages = galleryGridImages.map((image, index) => ({
    id: image.id,
    public_url: image.public_url,
    alt: `${spa.name} gallery photo ${index + 2}`,
  }));
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [reviewSummary, reviews, userReview, mapCoords] = await Promise.all([
    getApprovedReviewSummary(spa.id),
    listApprovedReviewsBySpaId(spa.id),
    user ? getUserReviewForSpa(spa.id, user.id) : Promise.resolve(null),
    fullAddress ? geocodeAddress(fullAddress) : Promise.resolve(null),
  ]);

  return (
    <Container className="py-16">
      <Link
        href={browseHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to spas
      </Link>

      {featuredImage ? (
        <Card className="mt-8 overflow-hidden">
          <img
            src={featuredImage.public_url}
            alt={`${spa.name} featured photo`}
            className="h-[300px] w-full object-cover md:h-[420px]"
          />
        </Card>
      ) : null}

      {query?.review_submitted ? (
        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Your review has been submitted and is pending approval.
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-semibold leading-tight">{spa.name}</h1>
                  {primaryCategory ? (
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                      {primaryCategory}
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <StarRating rating={reviewSummary.average} />
                    {reviewSummary.count > 0
                      ? `${reviewSummary.average.toFixed(1)} (${reviewSummary.count} review${
                          reviewSummary.count === 1 ? "" : "s"
                        })`
                      : "No reviews yet"}
                  </span>
                </div>
                {fullAddress ? (
                  <p className="mt-3 text-base text-muted-foreground">{fullAddress}</p>
                ) : location ? (
                  <p className="mt-3 text-base text-muted-foreground">{location}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {website ? (
                    <a
                      href={website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 hover:text-foreground"
                    >
                      <Globe className="size-4" />
                      Website
                    </a>
                  ) : null}
                  {email ? (
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex items-center gap-2 hover:text-foreground"
                    >
                      <Mail className="size-4" />
                      Email
                    </a>
                  ) : null}
                  {phone ? (
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex items-center gap-2 hover:text-foreground"
                    >
                      <Phone className="size-4" />
                      Phone
                    </a>
                  ) : null}
                </div>
                {spa.summary ? (
                  <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
                    {spa.summary}
                  </p>
                ) : null}
                <div className="mt-5">
                  {userReview?.status === "pending" ? (
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Your review is awaiting approval.
                    </p>
                  ) : userReview ? (
                    <Button asChild variant="outline">
                      <Link href={`/spas/${spa.slug}/review` as Route}>
                        Edit your review
                      </Link>
                    </Button>
                  ) : user ? (
                    <Button asChild>
                      <Link href={`/spas/${spa.slug}/review` as Route}>
                        <MessageSquare className="size-4" />
                        Write a review
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link
                        href={
                          "/signin?message=Please+sign+in+to+review" as Route
                        }
                      >
                        Sign in to review
                      </Link>
                    </Button>
                  )}
                </div>
                {secondaryCategories.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {secondaryCategories.map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {/* Claim Listing Button */}
                <div className="mt-6 border-t pt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Do you own or manage this spa?
                  </p>
                  <Link href={`/claim/${spa.slug}` as Route}>
                    <Button
                      variant="outline"
                      className="rounded-full w-full sm:w-auto"
                    >
                      <Heart className="mr-2 size-4" />
                      Claim this listing
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {spa.description ? (
              <div className="lg:col-span-2">
                <SectionCard title="About this spa" body={spa.description} />
              </div>
            ) : null}
            {spa.hours_text ? <SectionCard title="Hours" body={spa.hours_text} /> : null}
            <SectionCard title="What to know" body={spa.what_to_know} />
            <SectionCard title="Important notes" body={spa.important_notes} />
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
            {socialLinks.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="size-5 text-primary" />
                    Social links
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
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
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          {logoImage ? (
            <Card className="rounded-[24px] shadow-none">
              <CardContent className="flex min-h-[180px] items-center justify-center p-6">
                <img
                  src={logoImage.public_url}
                  alt={`${spa.name} logo`}
                  className="max-h-[140px] w-full object-contain object-center"
                />
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-[24px] shadow-none">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm">
              {spa.pricing_text && spa.pricing_text.trimStart().startsWith("<") ? (
                <div
                  className="article-prose text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: spa.pricing_text }}
                />
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">{pricingLabel}</span>
                  <span className="font-medium">{spa.day_pass_price || pricing || "N/A"}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-none">
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 pt-0 text-sm">
              {AMENITY_CATEGORIES.map((category) => (
                <div key={category.title}>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    {category.title}
                  </h3>
                  <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {category.items.map((amenity) => {
                      const enabled = enabledAmenities.has(amenity.label);
                      return (
                        <div
                          key={amenity.label}
                          className="inline-flex items-center gap-2 text-muted-foreground"
                        >
                          {enabled ? (
                            <CheckCircle2 className="size-4 text-green-600" />
                          ) : (
                            <XCircle className="size-4 text-foreground" />
                          )}
                          <span className={amenity.italic ? "italic" : undefined}>
                            {amenity.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <SpaGalleryLightbox images={lightboxImages} />

          {mapCoords && fullAddress ? (
            <SpaMapCard coords={mapCoords} address={fullAddress} />
          ) : null}
        </aside>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Guest reviews</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-3xl border border-border bg-background p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <StarRating rating={review.rating} />
                    <p className="mt-1 text-sm font-medium">
                      {review.user_display_name}
                    </p>
                  </div>
                  {review.created_at ? (
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(review.created_at))}
                    </p>
                  ) : null}
                </div>
                {review.title ? (
                  <h3 className="mt-4 text-lg font-semibold">{review.title}</h3>
                ) : null}
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {review.body}
                </p>
                {review.photos.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {review.photos.map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded-2xl border border-border"
                      >
                        <img
                          src={photo.image_url}
                          alt={`${spa.name} review photo`}
                          className="h-36 w-full object-cover transition hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No approved reviews yet.
            </p>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
