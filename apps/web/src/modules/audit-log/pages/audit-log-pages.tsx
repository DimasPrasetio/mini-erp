import { DataTable, PageHeader, SectionCard } from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import { formatDateTime } from "../../../utils";

export function AuditLogsPage() {
  const { activeWorkspaceData } = useMockApp();

  if (!activeWorkspaceData) {
    return null;
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Audit Log</span>}
        description="Read-only log untuk menunjukkan bagaimana aksi penting nantinya bisa ditelusuri oleh owner dan admin."
        title="Audit Log"
      />

      <SectionCard title="Aktivitas Terbaru" description="Data audit mock juga ikut bertambah saat Anda mencoba create/edit dari halaman lain.">
        <DataTable
          columns={[
            {
              header: "Waktu",
              render: (entry) => formatDateTime(entry.happenedAt),
            },
            {
              header: "Aktor",
              render: (entry) => entry.actorName,
            },
            {
              header: "Aksi",
              render: (entry) => entry.actionKey,
            },
            {
              header: "Entitas",
              render: (entry) => (
                <div className="field-stack">
                  <strong>{entry.entityLabel}</strong>
                  <span className="muted">{entry.entityType}</span>
                </div>
              ),
            },
            {
              header: "Deskripsi",
              render: (entry) => entry.description,
            },
          ]}
          rowKey={(entry) => entry.id}
          rows={activeWorkspaceData.auditLogs}
        />
      </SectionCard>
    </div>
  );
}
