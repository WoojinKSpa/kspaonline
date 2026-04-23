import Link from "next/link";

import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 py-8">
      <Container className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Kspa.online. Built for spa discovery and admin publishing.</p>
        <div className="flex items-center gap-5">
          <Link href="/spas">Browse</Link>
          <Link href="/login">Login</Link>
        </div>
      </Container>
    </footer>
  );
}

