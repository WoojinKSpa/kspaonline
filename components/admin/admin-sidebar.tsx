import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

const links: Array<{ href: Route; label: string; section?: string }> = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/spas", label: "Spas" },
  { href: "/admin/duplicates", label: "Duplicates" },
  { href: "/admin/imports", label: "Imports" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/spas/new", label: "Add spa" },
  { href: "/admin/ads", label: "Ad Campaigns", section: "Monetization" },
  { href: "/admin/advertising-leads", label: "Ad Leads", section: "Monetization" },
];

export function AdminSidebar() {
  const sections = links.reduce<Array<{ section: string | undefined; items: typeof links }>>((acc, link) => {
    const last = acc[acc.length - 1];
    if (!last || last.section !== link.section) {
      acc.push({ section: link.section, items: [link] });
    } else {
      last.items.push(link);
    }
    return acc;
  }, []);

  return (
    <aside className="surface h-fit p-4">
      <nav className="flex flex-col gap-1">
        {sections.map((group, i) => (
          <div key={i}>
            {group.section && (
              <p className="mt-4 px-3 pb-1 pt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
                {group.section}
              </p>
            )}
            {!group.section && i === 0 && (
              <p className="px-3 py-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                Admin
              </p>
            )}
            {group.items.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-2xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
