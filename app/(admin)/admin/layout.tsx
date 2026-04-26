import type { Route } from "next";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(admin)/admin/actions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin" as Route);
  }

  // If this email owns a spa, they are an owner — never grant admin access,
  // even if ADMIN_EMAILS is unconfigured (fail-open).
  const { data: ownerRow } = await supabase
    .from("spa_owners")
    .select("id")
    .eq("email", user.email ?? "")
    .limit(1)
    .maybeSingle();

  if (ownerRow) {
    redirect("/owner/dashboard" as Route);
  }

  if (!isAdminEmail(user.email)) {
    // ADMIN_EMAILS is configured and this email isn't in the list.
    redirect("/owner/dashboard" as Route);
  }

  return (
    <Container className="py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Protected workspace
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
