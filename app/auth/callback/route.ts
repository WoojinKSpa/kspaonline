import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-helpers";

/**
 * Handles the redirect from a Supabase magic-link email.
 *
 * Flow:
 *   1. Exchange the `code` query param for a session.
 *   2. Look up the now-authenticated user.
 *   3. Route them based on role:
 *      - Admin (in ADMIN_EMAILS env var) → /admin
 *      - Owner (row in spa_owners) → /owner/dashboard
 *      - Neither → sign them out and bounce home with an error.
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
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/owner/login?error=${encodeURIComponent(exchangeError.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(
      `${origin}/owner/login?error=${encodeURIComponent(
        "Sign-in succeeded but no email was returned."
      )}`
    );
  }

  // Admins always go to /admin, regardless of `next`.
  if (isAdminEmail(user.email)) {
    return NextResponse.redirect(`${origin}/admin`);
  }

  // For non-admins, verify they own at least one spa before granting access.
  const { data: ownerRow } = await supabase
    .from("spa_owners")
    .select("id")
    .eq("email", user.email)
    .limit(1)
    .maybeSingle();

  if (!ownerRow) {
    // Authenticated but not authorized — sign them out so they don't linger.
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(
        "Your email is not associated with any spa. Submit a claim from a spa listing first."
      )}`
    );
  }

  // Whitelist `next` to internal paths only.
  const safeNext = next.startsWith("/") ? next : "/owner/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
