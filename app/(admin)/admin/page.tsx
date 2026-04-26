import type { Route } from "next";
import Link from "next/link";

import { QualityBadge } from "@/components/admin/quality-badge";
import { StatCard } from "@/components/admin/stat-card";
import { PageIntro } from "@/components/layout/page-intro";
import { getAdminStats } from "@/lib/admin-stats";
import { getMissingFields } from "@/lib/quality-score";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-col gap-10">
      <PageIntro
        eyebrow="Admin"
        title="Directory dashboard"
        description="Live counts and data quality overview for all spa listings."
      />

      {/* ── All stat cards in one unified grid ──────────────── */}
      <section>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            label="Total spas"
            value={stats.total}
            href={"/admin/spas" as Route}
          />
          <StatCard
            label="Published"
            value={stats.published}
            href={"/admin/spas?status=published" as Route}
          />
          <StatCard
            label="Draft"
            value={stats.draft}
            href={"/admin/spas?status=draft" as Route}
            accent={stats.draft > 0 ? "warning" : undefined}
          />
          <StatCard
            label="Archived"
            value={stats.archived}
            href={"/admin/spas?status=archived" as Route}
            accent="muted"
          />
          <StatCard
            label="Featured"
            value={stats.featured}
          />
          <StatCard
            label="Duplicates"
            value={stats.possibleDuplicates}
            href={"/admin/duplicates" as Route}
            accent={stats.possibleDuplicates > 0 ? "warning" : undefined}
          />
          <StatCard
            label="No website"
            value={stats.missingWebsite}
            href={"/admin/spas?missing=website" as Route}
            accent={stats.missingWebsite > 0 ? "warning" : undefined}
          />
          <StatCard
            label="No phone"
            value={stats.missingPhone}
            href={"/admin/spas?missing=phone" as Route}
            accent={stats.missingPhone > 0 ? "warning" : undefined}
          />
          <StatCard
            label="No address"
            value={stats.missingAddress}
            href={"/admin/spas?missing=address" as Route}
            accent={stats.missingAddress > 0 ? "warning" : undefined}
          />
          <StatCard
            label="No hours"
            value={stats.missingHours}
            href={"/admin/spas?missing=hours" as Route}
            accent={stats.missingHours > 0 ? "warning" : undefined}
          />
          <StatCard
            label="No amenities"
            value={stats.missingAmenities}
            href={"/admin/spas?missing=amenities" as Route}
            accent={stats.missingAmenities > 0 ? "warning" : undefined}
          />
          <StatCard
            label="No images"
            value={stats.missingImages}
            href={"/admin/spas?missing=images" as Route}
            accent={stats.missingImages > 0 ? "danger" : undefined}
          />
        </div>
      </section>

      {/* ── Needs attention ─────────────────────────────────── */}
      {stats.needsAttention.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Listings needing attention
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Quality</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Missing</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {stats.needsAttention.map((spa) => {
                  const missing = getMissingFields(spa.quality.breakdown);
                  return (
                    <tr
                      key={spa.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3 font-medium">{spa.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {[spa.city, spa.state].filter(Boolean).join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <QualityBadge quality={spa.quality} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {missing.length === 0 ? (
                          <span className="text-green-700">All complete</span>
                        ) : (
                          missing.join(", ")
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={spa.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/spas/${spa.id}` as Route}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Recent imports ───────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Recent imports
          </h2>
          <Link
            href={"/admin/imports" as Route}
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {stats.recentImports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-8 text-center text-sm text-muted-foreground">
            No import history yet.{" "}
            <Link
              href={"/admin/imports" as Route}
              className="font-medium text-primary hover:underline"
            >
              Learn how to track imports.
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">File</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Inserted</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Updated</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Errors</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {stats.recentImports.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium">{run.filename}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(run.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{run.total_rows}</td>
                    <td className="px-4 py-3 tabular-nums text-green-700">{run.inserted_count}</td>
                    <td className="px-4 py-3 tabular-nums text-blue-700">{run.updated_count}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {run.error_count > 0 ? (
                        <span className="text-red-600">{run.error_count}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/imports/${run.id}` as Route}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "published"
      ? "bg-green-100 text-green-800"
      : status === "draft"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}
