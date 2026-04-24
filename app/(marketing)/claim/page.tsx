import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Claim Your Listing",
};

export default function ClaimPage() {
  return (
    <Container className="py-16">
      <div className="surface mx-auto max-w-3xl p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
          Claim
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Claim your listing</h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          Claim flow is not live yet, but Kspa.online is being prepared for spa
          owners who want to keep details current and reach new guests.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/login">
              Go to admin login
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/spas">Browse listings</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
