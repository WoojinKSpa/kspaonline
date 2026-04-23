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
          business_email: spa.business_email,
          business_website: spa.business_website,
          business_phone: spa.business_phone,
          facebook_url: spa.facebook_url,
          instagram_url: spa.instagram_url,
          tiktok_url: spa.tiktok_url,
          twitter_url: spa.twitter_url,
          youtube_url: spa.youtube_url,
          day_pass_offered: spa.day_pass_offered,
          day_pass_price: spa.day_pass_price,
          listing_categories: spa.listing_categories,
          summary: spa.summary,
          description: spa.description ?? "",
          amenities: spa.amenities,
        }}
      />
    </div>
  );
}
