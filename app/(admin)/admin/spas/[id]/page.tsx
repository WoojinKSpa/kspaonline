import { notFound } from "next/navigation";

import { SpaEditorForm } from "@/components/admin/spa-editor-form";
import { PageIntro } from "@/components/layout/page-intro";
import { getSpaById } from "@/lib/mock-data";

type AdminSpaEditPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: AdminSpaEditPageProps) {
  const { id } = await params;
  const spa = getSpaById(id);

  return {
    title: spa ? `Edit ${spa.name}` : "Edit Spa",
  };
}

export default async function AdminSpaEditPage({
  params,
}: AdminSpaEditPageProps) {
  const { id } = await params;
  const spa = getSpaById(id);

  if (!spa) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Admin"
        title={`Edit ${spa.name}`}
        description="Placeholder edit screen for future update, media management, and moderation tools."
      />
      <SpaEditorForm
        submitLabel="Save changes"
        defaultValues={{
          name: spa.name,
          slug: spa.slug,
          city: spa.city,
          neighborhood: spa.neighborhood,
          description: spa.description,
        }}
      />
    </div>
  );
}

