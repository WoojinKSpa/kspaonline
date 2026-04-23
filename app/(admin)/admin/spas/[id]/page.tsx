import { updateSpaAction } from "@/app/(admin)/admin/spas/actions";
import { notFound } from "next/navigation";

import { SpaEditorForm } from "@/components/admin/spa-editor-form";
import { PageIntro } from "@/components/layout/page-intro";
import { getAdminSpaById } from "@/lib/admin-spas";

type AdminSpaEditPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: AdminSpaEditPageProps) {
  const { id } = await params;
  const spa = await getAdminSpaById(id);

  return {
    title: spa ? `Edit ${spa.name}` : "Edit Spa",
  };
}

export default async function AdminSpaEditPage({
  params,
}: AdminSpaEditPageProps) {
  const { id } = await params;
  const spa = await getAdminSpaById(id);

  if (!spa) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Admin"
        title={`Edit ${spa.name}`}
        description="Update a spa listing with server-side admin actions."
      />
      <SpaEditorForm
        formAction={updateSpaAction.bind(null, id)}
        submitLabel="Save changes"
        defaultValues={{
          name: spa.name,
          slug: spa.slug,
          city: spa.city,
          state: spa.state,
          status: spa.status,
          is_featured: spa.is_featured,
          summary: spa.summary,
          description: spa.description ?? "",
          amenities: spa.amenities.join(", "),
        }}
      />
    </div>
  );
}
