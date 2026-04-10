import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  Notice,
  PageHeader,
  SectionCard,
  SearchableSelect,
} from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import { ROLE_PERMISSIONS } from "../../../mock/permissions";
import {
  channelTone,
  compactNumber,
  formatCurrency,
  formatDateTime,
  formatRoleLabel,
  safeParseJson,
  statusTone,
} from "../../../utils";

const MODULES_LIST = [
  { key: "dashboard", label: "Dashboard", actions: ["view"] },
  { key: "product", label: "Produk & Item", actions: ["view", "create", "update", "archive"] },
  { key: "order", label: "Penjualan / Order", actions: ["view", "create", "update", "archive"] },
  { key: "stock", label: "Inventori Gudang", actions: ["view", "create", "update"] },
  { key: "reporting", label: "Laporan Bisnis", actions: ["view"] },
  { key: "user", label: "Pengguna & Tim", actions: ["view", "create", "update", "archive"] },
  { key: "tenant_config", label: "Pengaturan", actions: ["view", "manage"] },
  { key: "knowledge", label: "Basis Pengetahuan (AI)", actions: ["view", "create", "update", "archive"] },
  { key: "whatsapp", label: "Asisten WA Gateway", actions: ["view", "manage"] },
  { key: "audit_log", label: "Audit Log", actions: ["view"] },
];

const ACTIONS = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "archive", label: "Archive" },
  { key: "manage", label: "Manage" },
];

export function AuditLogsPage() {
  const { activeTenantData } = useMockApp();

  if (!activeTenantData) {
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
          rows={activeTenantData.auditLogs}
        />
      </SectionCard>
    </div>
  );
}