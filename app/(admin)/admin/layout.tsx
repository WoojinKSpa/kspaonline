import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Container } from "@/components/layout/container";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Container className="py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}

