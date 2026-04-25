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

  if (!isAdminEmail(user.email)) {
    // Authenticated but not an admin (e.g. an owner who magic-link'd in).
    // Send them to their own dashboard.
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
