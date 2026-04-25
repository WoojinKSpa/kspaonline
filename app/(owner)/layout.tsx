import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { verifyOwnerAuthenticated } from "@/lib/owner-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ownerSignOutAction } from "./actions";

async function OwnerLayoutContent({ children }: { children: React.ReactNode }) {
  // Verify user is authenticated
  const email = await verifyOwnerAuthenticated();

  // Check if user owns any spas
  const supabase = await createSupabaseServerClient();
  const { data: owner, error } = await supabase
    .from("spa_owners")
    .select("id")
    .eq("email", email)
    .single();

  if (error || !owner) {
    redirect("/?error=You+do+not+own+any+spas" as Route);
  }

  return (
    <div>
      {/* Owner Header */}
      <div className="border-b bg-gray-50">
        <Container className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Signed in as {email}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/">Back to site</Link>
              </Button>
              <form action={ownerSignOutAction}>
                <Button type="submit" variant="ghost" className="rounded-full">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}

export const metadata = {
  title: "Owner Dashboard",
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <OwnerLayoutContent>{children}</OwnerLayoutContent>;
}
