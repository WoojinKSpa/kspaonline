import { PageIntro } from "@/components/layout/page-intro";
import { adminStats } from "@/lib/mock-data";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Admin"
        title="Directory dashboard"
        description="A placeholder operational view for future metrics, approval queues, and content management."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {adminStats.map((item) => (
          <div key={item.label} className="surface p-6">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
            <p className="mt-3 text-sm text-muted-foreground">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
