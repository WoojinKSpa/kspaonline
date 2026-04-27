import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(marketing)/account/actions";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My Account | KSpa.online",
};

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?message=Please+sign+in+to+view+your+account" as Route);
  }

  // Fetch role so we can show role-appropriate content
  let role: string | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = (profile?.role as string) ?? null;
  } catch {
    // profiles table not yet migrated — treat as regular user
  }

  const isAdmin = role === "admin";
  const isOwner = role === "owner";

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">My account</h1>
        <p className="mb-10 text-muted-foreground">
          Manage your KSpa.online profile.
        </p>

        <div className="flex flex-col gap-6">
          {/* Profile card — shown to everyone */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account details.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium capitalize">
                  {isAdmin ? "Admin" : isOwner ? "Spa owner" : "Member"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Member since
                </span>
                <span className="text-sm font-medium">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Admin quick-access card */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin dashboard</CardTitle>
                <CardDescription>
                  Manage spa listings, duplicates, imports, and more.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Spas", href: "/admin/spas" },
                    { label: "Duplicates", href: "/admin/duplicates" },
                    { label: "Imports", href: "/admin/imports" },
                  ].map((link) => (
                    <Button key={link.href} asChild variant="outline" className="justify-start">
                      <Link href={link.href as Route}>{link.label}</Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spa owner quick-access card */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Your spa</CardTitle>
                <CardDescription>
                  Manage your spa listing and details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href={"/owner/dashboard" as Route}>Go to spa dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reviews — only shown to regular members */}
          {!isAdmin && !isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>
                  Your spa reviews will appear here once the review system is
                  live.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Coming soon — you&apos;ll be able to share
                  your experiences at Korean spas across the country.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <form action={signOutAction}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Container>
  );
}
