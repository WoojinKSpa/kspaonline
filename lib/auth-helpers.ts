import { headers } from "next/headers";

/**
 * Returns true if the given email is configured as an admin via the
 * ADMIN_EMAILS env var (comma-separated). Comparison is case-insensitive.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

/**
 * Resolve the site's absolute base URL from request headers, falling back to
 * the NEXT_PUBLIC_SITE_URL env var. Used for building magic-link redirect URLs.
 */
export async function getSiteOrigin(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;

  return "http://localhost:3000";
}
