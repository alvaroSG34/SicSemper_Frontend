import { AdminDashboardPage } from "@/presentation/components/features/admin/admin-dashboard-page";

type AdminPermissionsPageProps = {
  searchParams: Promise<{
    adminId?: string | string[];
  }>;
};

const normalizeAdminId = (value: string | string[] | undefined): string | null => {
  if (typeof value === "string") {
    return value.trim() || null;
  }
  if (Array.isArray(value) && value.length > 0) {
    return value[0]?.trim() || null;
  }
  return null;
};

export default async function AdminPermissionsPage({ searchParams }: AdminPermissionsPageProps) {
  const params = await searchParams;
  const activePermissionAdminId = normalizeAdminId(params.adminId);

  return (
    <AdminDashboardPage
      activeSection="admins"
      isAdminPermissionManagerVisible
      activePermissionAdminId={activePermissionAdminId}
    />
  );
}
