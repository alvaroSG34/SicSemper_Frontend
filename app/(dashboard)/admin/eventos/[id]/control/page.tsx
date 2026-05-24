import { AdminEventControlPage } from "@/presentation/components/features/admin/admin-event-control-page";

type AdminEventControlRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminEventControlRoute({ params }: AdminEventControlRouteProps) {
  const { id } = await params;
  return <AdminEventControlPage eventId={id} />;
}

