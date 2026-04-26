import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { isAdminEmail } from "@/lib/auth-helpers";

type MiddlewareCookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: MiddlewareCookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isOwnerRoute = pathname.startsWith("/owner") && pathname !== "/owner/login";
  const isAdminLoginRoute = pathname === "/login";
  const isOwnerLoginRoute = pathname === "/owner/login";

  // Unauthenticated guards
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (isOwnerRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/owner/login";
    return NextResponse.redirect(url);
  }

  // Authenticated: determine role by checking spa_owners first (owners are
  // never admins), then fall back to ADMIN_EMAILS allowlist.
  if (user) {
    const { data: ownerRow } = await supabase
      .from("spa_owners")
      .select("id")
      .eq("email", user.email ?? "")
      .limit(1)
      .maybeSingle();

    const isOwner = !!ownerRow;
    const isAdmin = !isOwner && isAdminEmail(user.email);

    // Block owners from /admin
    if (isOwner && isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/owner/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Redirect away from login pages for authenticated users
    if (isAdminLoginRoute || isOwnerLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = isAdmin ? "/admin" : "/owner/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
