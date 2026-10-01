import { PageTitle, Notice } from "@/components/admin/ui";
import { RegistrationsView } from "@/components/admin/RegistrationsView";
import { listRegistrations, sheetsEnabled, type AdminRegistration } from "@/lib/server/sheets";

export default async function AdminRegistrationsPage() {
  if (!sheetsEnabled) {
    return (
      <>
        <PageTitle title="Заявки" />
        <Notice tone="warn">
             <code className="font-mono">SHEETS_WEBHOOK_URL</code> і{" "}
        
        </Notice>
      </>
    );
  }

  let registrations: AdminRegistration[] = [];
  let error: string | null = null;
  try {
    registrations = await listRegistrations();
  } catch (err) {
    error = err instanceof Error ? err.message : "Не вдалося завантажити заявки";
  }

  return <RegistrationsView registrations={registrations} error={error} />;
}
