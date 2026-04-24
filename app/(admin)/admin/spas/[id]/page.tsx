import {
  deleteSpaImageAction,
  reorderSpaImageAction,
  setFeaturedSpaImageAction,
  updateSpaAction,
  uploadSpaGalleryImagesAction,
  uploadSpaLogoAction,
} from "@/app/(admin)/admin/spas/actions";
import { notFound } from "next/navigation";

import { SpaEditorForm } from "@/components/admin/spa-editor-form";
import { SpaImageManager } from "@/components/admin/spa-image-manager";
import { PageIntro } from "@/components/layout/page-intro";
import { getAdminSpaById } from "@/lib/admin-spas";
import { listSpaImagesBySpaId } from "@/lib/spa-images";

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

  const images = await listSpaImagesBySpaId(spa.id);

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Admin"
        title={`Edit ${spa.name}`}
        description="Update a spa listing with server-side admin actions."
      />
      <SpaImageManager
        logoAction={uploadSpaLogoAction.bind(null, spa.id, spa.slug)}
        galleryAction={uploadSpaGalleryImagesAction.bind(null, spa.id, spa.slug)}
        setFeaturedAction={setFeaturedSpaImageAction.bind(null, spa.id, spa.slug)}
        reorderImageAction={reorderSpaImageAction.bind(null, spa.id, spa.slug)}
        deleteImageAction={deleteSpaImageAction.bind(null, spa.id, spa.slug)}
        images={images}
      />
      <SpaEditorForm
        formAction={updateSpaAction.bind(null, id)}
        submitLabel="Save changes"
        defaultValues={{
          name: spa.name,
          slug: spa.slug,
          website: spa.website,
          phone: spa.phone,
          email: spa.email,
          address_line_1: spa.address_line_1,
          address_line_2: spa.address_line_2,
          city: spa.city,
          state: spa.state,
          postal_code: spa.postal_code,
          country: spa.country,
          hours_text: spa.hours_text,
          pricing_text: spa.pricing_text,
          what_to_know: spa.what_to_know,
          important_notes: spa.important_notes,
          google_review_url: spa.google_review_url,
          yelp_review_url: spa.yelp_review_url,
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
