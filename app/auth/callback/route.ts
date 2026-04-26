import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertProfile } from "@/lib/profiles";

/**
 * Handles the redirect from a Supabase magic-link email.
 *
 * Flow:
 *   1. Exchange the `code` query param for a session.
 *   2. Look up the now-authenticated user's profile (role).
 *   3. If they're in spa_owners but not yet role='owner', upgrade them.
 *   4. Route by role:
 *        admin  → /admin
 *        owner  → /owner/dashboard
 *        others → signed out, redirected home with error
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/owner/dashboard";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/owner/login?error=${encodeURIComponent(
        "Missing sign-in code. Please request a new link."
      )}`
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/owner/login?error=${encodeURIComponent(exchangeError.message)}`
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(
      `${origin}/owner/login?error=${encodeURIComponent(
        "Sign-in succeeded but no email was returned."
      )}`
    );
  }

  // Fetch this user's profile to determine their role.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as string | undefined;

  if (role === "admin") {
    return NextResponse.redirect(`${origin}/admin`);
  }

  // Check if this email is an approved spa owner.
  const { data: ownerRow } = await supabase
    .from("spa_owners")
    .select("id")
    .eq("email", user.email)
    .limit(1)
    .maybeSingle();

  if (ownerRow) {
    // Ensure their profile reflects the owner role (idempotent).
    if (role !== "owner") {
      await upsertProfile(user.id, user.email, "owner");
    }
    const safeNext = next.startsWith("/") ? next : "/owner/dashboard";
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  // Not an admin, not an approved owner — deny access.
  await supabase.auth.signOut();
  return NextResponse.redirect(
    `${origin}/?error=${encodeURIComponent(
      "Your email is not associated with an approved spa. Submit a claim first."
    )}`
  );
}
