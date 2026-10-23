import { AdminLandingEventEditor } from "@/presentation/components/features/admin/admin-landing-event-editor";

export default async function EditLandingEventPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminLandingEventEditor eventId={(await params).id} />;
}
