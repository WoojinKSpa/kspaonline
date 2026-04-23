import type { Route } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  ChevronLeft,
  Clock3,
  Globe,
  Mail,
  MapPin,
  Phone,
  Receipt,
  ScrollText,
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
  summary: string | null;
  description: string | null;
  hours_text: string | null;
  pricing_text: string | null;
  what_to_know: string | null;
  important_notes: string | null;
  google_review_url: string | null;
  yelp_review_url: string | null;
};

async function getPublishedSpaBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spas")
    .select(
      "slug, name, city, state, address_line_1, address_line_2, postal_code, website, phone, email, summary, description, hours_text, pricing_text, what_to_know, important_notes, google_review_url, yelp_review_url"
    )
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load spa: ${error.message}`);
  }

  return (data as PublicSpa | null) ?? null;
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

  return (
    <Container className="py-16">
      <Link
        href={browseHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to spas
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
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
            <InfoBlock icon={Receipt} label="Pricing" value={spa.pricing_text} />
          </div>

          {spa.description ? (
            <div className="mt-10 rounded-[28px] border border-border bg-white p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                About this spa
              </p>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-muted-foreground">
                {spa.description}
              </p>
            </div>
          ) : null}
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

              {spa.website ? (
                <div>
                  <p className="text-muted-foreground">Website</p>
                  <a
                    href={spa.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-2 font-medium text-primary hover:underline"
                  >
                    <Globe className="size-4" />
                    Visit website
                  </a>
                </div>
              ) : null}

              {spa.phone ? (
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${spa.phone}`}
                    className="mt-1 inline-flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    <Phone className="size-4 text-primary" />
                    {spa.phone}
                  </a>
                </div>
              ) : null}

              {spa.email ? (
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${spa.email}`}
                    className="mt-1 inline-flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    <Mail className="size-4 text-primary" />
                    {spa.email}
                  </a>
                </div>
              ) : null}

              {!fullAddress && !spa.website && !spa.phone && !spa.email ? (
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

          <SectionCard title="What to know" body={spa.what_to_know} />
          <SectionCard title="Important notes" body={spa.important_notes} />

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
