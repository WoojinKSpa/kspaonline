import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

const links: Array<{ href: Route; label: string }> = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/spas", label: "Spas" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/spas/new", label: "Add spa" },
];

export function AdminSidebar() {
  return (
    <aside className="surface h-fit p-4">
      <p className="px-3 py-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
        Admin
      </p>
      <nav className="mt-2 flex flex-col gap-1">
        {links.map((link) => (
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
      </nav>
    </aside>
  );
}
