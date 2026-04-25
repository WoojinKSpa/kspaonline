import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

// Get the authenticated user's email
export async function getOwnerEmail(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.email ?? null;
}

// Check if user owns a specific spa
export async function checkOwnerAccess(
  spa_id: string,
  email: string
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("spa_owners")
    .select("id")
    .eq("spa_id", spa_id)
    .eq("email", email)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

// Verify owner access and throw redirect if not authorized
export async function verifyOwnerAccess(spa_id: string): Promise<string> {
  const email = await getOwnerEmail();

  if (!email) {
    redirect("/login?redirectTo=/owner/dashboard");
  }

  const hasAccess = await checkOwnerAccess(spa_id, email);

  if (!hasAccess) {
    redirect("/owner/dashboard?error=You+do+not+own+this+spa");
  }

  return email;
}

// Verify owner is authenticated
export async function verifyOwnerAuthenticated(): Promise<string> {
  const email = await getOwnerEmail();

  if (!email) {
    redirect("/login?redirectTo=/owner/dashboard");
  }

  return email;
}
