import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine role for smart routing
  let role: string | undefined;
  if (user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role as string | undefined;
    } catch {
      // profiles table not yet available — ignore
    }
  }

  const isAdmin = role === "admin";
  const isOwner = role === "owner";

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-background/80 backdrop-blur-xl">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
            K
          </div>
          <div>
            <p className="text-base font-semibold">{siteConfig.name}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Korean spa directory
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              {isOwner && (
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/owner/dashboard">Dashboard</Link>
                </Button>
              )}
              {!isAdmin && !isOwner && (
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/account">My account</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
