import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { SpaEditorForm } from "@/components/admin/spa-editor-form";
import { SpaImageManager } from "@/components/admin/spa-image-manager";
import { verifyOwnerAccess } from "@/lib/owner-auth";
import { getAdminSpaById } from "@/lib/admin-spas";
import {
  uploadSpaLogoAction,
  uploadSpaGalleryImagesAction,
  setFeaturedSpaImageAction,
  reorderSpaImageAction,
  deleteSpaImageAction,
  updateSpaAction,
} from "@/app/(admin)/admin/spas/actions";
import { listSpaImagesBySpaId } from "@/lib/spa-images";
import { ChevronLeft } from "lucide-react";

type Props = {
  params: Promise<{ "spa-id": string }>;
};

export const metadata = {
  title: "Edit Spa | Owner Dashboard",
};

export default async function OwnerEditSpaPage({ params }: Props) {
  const { "spa-id": spaId } = await params;

  // Verify owner access
  await verifyOwnerAccess(spaId);

  // Fetch spa data
  const spa = await getAdminSpaById(spaId);
  if (!spa) {
    notFound();
  }

  // Fetch images
  const images = await listSpaImagesBySpaId(spaId);

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link
          href="/owner/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="size-4" />
          Back to dashboard
        </Link>

        <PageIntro
          eyebrow="Edit Spa"
          title={spa.name}
          description="Update your spa listing information"
        />

        {/* Image Manager */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          <SpaImageManager
            spa={{ id: spaId, name: spa.name, slug: spa.slug }}
            images={images}
            uploadLogoAction={uploadSpaLogoAction}
            uploadGalleryImagesAction={uploadSpaGalleryImagesAction}
            setFeaturedImageAction={setFeaturedSpaImageAction}
            reorderImagesAction={reorderSpaImageAction}
            deleteImageAction={deleteSpaImageAction}
          />
        </div>

        {/* Edit Form */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Spa Information</h2>
          <SpaEditorForm
            spa={spa}
            action={updateSpaAction}
            submitLabel="Update Spa"
          />
        </div>
      </div>
    </Container>
  );
}
