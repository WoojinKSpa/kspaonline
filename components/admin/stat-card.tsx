import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  note?: string;
  href?: Route;
  /** Optional accent: "warning" for yellow, "danger" for red, "muted" for gray */
  accent?: "warning" | "danger" | "muted";
};

/**
 * Reusable stat card for the admin dashboard.
 * Wraps in a Link when `href` is provided.
 */
export function StatCard({ label, value, note, href, accent }: StatCardProps) {
  const accentClass =
    accent === "warning"
      ? "border-yellow-200 bg-yellow-50/50"
      : accent === "danger"
        ? "border-red-200 bg-red-50/50"
        : accent === "muted"
          ? "border-border bg-secondary/30"
          : "border-border bg-background";

  const inner = (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-colors",
        href && "hover:bg-secondary/40 cursor-pointer",
        accentClass
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {note && (
        <p className="mt-1.5 text-xs text-muted-foreground">{note}</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }

  return inner;
}
