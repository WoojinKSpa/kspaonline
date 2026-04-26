import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

type MiddlewareCookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

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
  const isAdminRoute     = pathname.startsWith("/admin");
  const isOwnerRoute     = pathname.startsWith("/owner") && pathname !== "/owner/login";
  const isAdminLogin     = pathname === "/login";
  const isOwnerLogin     = pathname === "/owner/login";

  // ── Unauthenticated guards ───────────────────────────────────
  if (!user) {
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
    if (isOwnerRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/owner/login";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // ── Authenticated: fetch role from profiles ──────────────────
  // The anon client runs as the authenticated user, so RLS
  // "users can read own profile" allows this read.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as string | undefined;
  const isAdmin = role === "admin";
  const isOwner = role === "owner";

  // Block owners (and everyone else) from /admin
  if (isAdminRoute && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = isOwner ? "/owner/dashboard" : "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Redirect away from login pages for already-authenticated users
  if (isAdminLogin || isOwnerLogin) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : isOwner ? "/owner/dashboard" : "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
