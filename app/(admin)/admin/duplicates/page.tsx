import type { Route } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/layout/page-intro";
import { listAdminSpas } from "@/lib/admin-spas";
import { detectDuplicates } from "@/lib/duplicate-detection";

export const metadata = {
  title: "Duplicate Detection | Admin",
};

export default async function AdminDuplicatesPage() {
  const spas = await listAdminSpas();
  const groups = detectDuplicates(spas);

  const totalFlagged = groups.reduce((acc, g) => acc + g.spas.length, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Admin"
        title="Duplicate detection"
        description="Listings that share a name, phone number, website domain, or address. Review and merge manually."
      />

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No duplicates found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            All {spas.length} listing{spas.length !== 1 ? "s" : ""} appear unique across
            name, phone, website, and address.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {totalFlagged} listing{totalFlagged !== 1 ? "s" : ""} across{" "}
            {groups.length} group{groups.length !== 1 ? "s" : ""} may be
            duplicates. No changes are made automatically.
          </p>

          <div className="flex flex-col gap-6">
            {groups.map((group, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-border"
              >
                {/* Group header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/30 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">
                      {group.spas.length} listings
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">
                      Flagged for:{" "}
                      <span className="font-medium text-foreground">
                        {group.reasons.join(", ")}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Spa rows */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="px-4 py-2 font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">City</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">State</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">Website</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">Phone</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">Address</th>
                        <th className="px-4 py-2 font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.spas.map((spa) => (
                        <tr
                          key={spa.id}
                          className="border-b border-border last:border-b-0 hover:bg-secondary/20"
                        >
                          <td className="px-4 py-3 font-medium">{spa.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{spa.city}</td>
                          <td className="px-4 py-3 text-muted-foreground">{spa.state ?? "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {spa.website ?? spa.business_website ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {spa.phone ?? spa.business_phone ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {spa.address_line_1 ?? "—"}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
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
