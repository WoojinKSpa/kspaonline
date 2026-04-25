import { headers } from "next/headers";

/**
 * Returns true if the given email should be granted admin access.
 *
 * Behaviour:
 *  - If ADMIN_EMAILS is not set (or empty), ALL authenticated users are
 *    treated as admins — this preserves the original behaviour and avoids
 *    locking everyone out before the env var is configured.
 *  - Once ADMIN_EMAILS is set (comma-separated), only listed addresses
 *    pass; everyone else is routed to /owner/dashboard.
 *
 * Set ADMIN_EMAILS in Vercel / .env.local to enable role separation.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  // Not configured yet — fail open so existing admins aren't locked out.
  if (allowed.length === 0) return true;
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
