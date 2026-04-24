import type { Route } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { deleteSpaAction } from "@/app/(admin)/admin/spas/actions";
import { DeleteSpaButton } from "@/components/admin/delete-spa-button";
import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAdminSpas } from "@/lib/admin-spas";

export const metadata = {
  title: "Admin Spas",
};

export default async function AdminSpaListPage() {
  const spas = await listAdminSpas();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageIntro
          eyebrow="Admin"
          title="Manage spa listings"
          description="View every spa in the directory and update draft, published, archived, and featured states."
        />
        <Button asChild>
          <Link href={"/admin/spas/new" as Route}>
            <Plus data-icon="inline-start" />
            Add spa
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current listings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {spas.length === 0 ? (
            <div className="rounded-3xl bg-secondary/60 px-6 py-10 text-center text-sm text-muted-foreground">
              No spas have been created yet.
            </div>
          ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-2 py-3 font-medium">Name</th>
                <th className="px-2 py-3 font-medium">Location</th>
                <th className="px-2 py-3 font-medium">Slug</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">Featured</th>
                <th className="px-2 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {spas.map((spa) => (
                <tr key={spa.id} className="border-b border-border last:border-b-0">
                  <td className="px-2 py-4 font-medium">{spa.name}</td>
                  <td className="px-2 py-4">
                    {[spa.city, spa.state].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-2 py-4 text-muted-foreground">{spa.slug}</td>
                  <td className="px-2 py-4">
                    <Badge variant="secondary">{spa.status}</Badge>
                  </td>
                  <td className="px-2 py-4">
                    {spa.is_featured ? (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                        Featured
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                    <Link
                      className="font-medium text-primary"
                      href={`/admin/spas/${spa.id}` as Route}
                    >
                      Edit
                    </Link>
                    <DeleteSpaButton
                      action={deleteSpaAction}
                      id={spa.id}
                      name={spa.name}
                      slug={spa.slug}
                    />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
