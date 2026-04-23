import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { SpaCard } from "@/components/spas/spa-card";
import { spaCatalog } from "@/lib/mock-data";

export const metadata = {
  title: "Browse Spas",
};

export default function SpasPage() {
  return (
    <Container className="py-16">
      <PageIntro
        eyebrow="Browse"
        title="Explore Korean spas by atmosphere, amenities, and city."
        description="This placeholder browse page is ready for search, filtering, featured collections, and live Supabase-backed listings."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {spaCatalog.map((spa) => (
          <SpaCard key={spa.id} spa={spa} />
        ))}
      </div>
    </Container>
  );
}

