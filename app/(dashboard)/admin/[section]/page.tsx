import { notFound } from "next/navigation";
import { AdminDashboardPage } from "@/presentation/components/features/admin/admin-dashboard-page";
import { isAdminSectionId } from "@/presentation/components/features/admin/admin-routes";

type AdminSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
};

export default async function AdminSectionPage({ params }: AdminSectionPageProps) {
  const { section } = await params;

  if (!isAdminSectionId(section)) {
    notFound();
  }

  return <AdminDashboardPage activeSection={section} />;
}
