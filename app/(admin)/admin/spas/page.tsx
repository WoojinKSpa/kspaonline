import Link from "next/link";
import { Plus } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { spaCatalog } from "@/lib/mock-data";

export const metadata = {
  title: "Admin Spas",
};

export default function AdminSpaListPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageIntro
          eyebrow="Admin"
          title="Manage spa listings"
          description="Placeholder list view for future CRUD actions, filters, publishing state, and moderation."
        />
        <Button asChild>
          <Link href="/admin/spas/new">
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
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-2 py-3 font-medium">Name</th>
                <th className="px-2 py-3 font-medium">City</th>
                <th className="px-2 py-3 font-medium">Slug</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {spaCatalog.map((spa) => (
                <tr key={spa.id} className="border-b border-border last:border-b-0">
                  <td className="px-2 py-4 font-medium">{spa.name}</td>
                  <td className="px-2 py-4">{spa.city}</td>
                  <td className="px-2 py-4 text-muted-foreground">{spa.slug}</td>
                  <td className="px-2 py-4">Draft</td>
                  <td className="px-2 py-4">
                    <Link
                      className="font-medium text-primary"
                      href={`/admin/spas/${spa.id}`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

