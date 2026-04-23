import { SpaEditorForm } from "@/components/admin/spa-editor-form";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata = {
  title: "New Spa",
};

export default function NewSpaPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Admin"
        title="Create a new spa"
        description="This placeholder editor form is designed to become a Supabase-backed create flow."
      />
      <SpaEditorForm submitLabel="Create spa" />
    </div>
  );
}

