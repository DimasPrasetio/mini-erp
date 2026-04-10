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

export function SettingsPage() {
  const { activeTenant, activeTenantData, saveSettings } = useMockApp();

  if (!activeTenant || !activeTenantData) {
    return null;
  }

  const [businessLabelsJson, setBusinessLabelsJson] = useState(
    JSON.stringify(activeTenantData.settings.businessLabels, null, 2),
  );
  const [operationalRulesJson, setOperationalRulesJson] = useState(
    JSON.stringify(activeTenantData.settings.operationalRules, null, 2),
  );
  const [uiPreferencesJson, setUiPreferencesJson] = useState(
    JSON.stringify(activeTenantData.settings.uiPreferences, null, 2),
  );
  const [aiPreferencesJson, setAiPreferencesJson] = useState(
    JSON.stringify(activeTenantData.settings.aiPreferences, null, 2),
  );
  const [reportingPreferencesJson, setReportingPreferencesJson] = useState(
    JSON.stringify(activeTenantData.settings.reportingPreferences, null, 2),
  );

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Pengaturan</span>}
        description="Pengaturan tenant bisnis."
        title="Pengaturan Bisnis"
        actions={
          <Link className="button button-secondary" to="/settings/order-status">
            Konfigurasi Status Order
          </Link>
        }
      />

      <form
        className="page-shell"
        onSubmit={(event) => {
          event.preventDefault();
          saveSettings({
            ...activeTenantData.settings,
            businessLabels: safeParseJson(businessLabelsJson, activeTenantData.settings.businessLabels),
            operationalRules: safeParseJson(operationalRulesJson, activeTenantData.settings.operationalRules),
            uiPreferences: safeParseJson(uiPreferencesJson, activeTenantData.settings.uiPreferences),
            aiPreferences: safeParseJson(aiPreferencesJson, activeTenantData.settings.aiPreferences),
            reportingPreferences: safeParseJson(
              reportingPreferencesJson,
              activeTenantData.settings.reportingPreferences,
            ),
          });
        }}
      >
        <div className="grid-2">
          <SectionCard title="Profil Bisnis" description="Ringkasan identitas bisnis yang aktif.">
            <div className="kv-grid">
              <div className="kv-item">
                <span>Nama bisnis</span>
                <strong>{activeTenant.name}</strong>
              </div>
              <div className="kv-item">
                <span>Timezone</span>
                <strong>{activeTenant.timezone}</strong>
              </div>
              <div className="kv-item">
                <span>Mata uang</span>
                <strong>{activeTenant.currencyCode}</strong>
              </div>
              <div className="kv-item">
                <span>Bahasa Sistem</span>
                <strong>{activeTenant.locale}</strong>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Modul Sistem Aktif" description="Pengaturan fungsionalitas modul tambahan.">
            <div className="list-stack">
              {activeTenantData.settings.featureFlags.map((flag) => (
                <div className="kv-item" key={flag.key}>
                  <span>{flag.key}</span>
                  <strong>{flag.enabled ? "Aktif" : "Nonaktif"}</strong>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Label Bisnis" description="Label fitur berjalan.">
          <textarea className="textarea" onChange={(event) => setBusinessLabelsJson(event.target.value)} value={businessLabelsJson} />
        </SectionCard>

        <SectionCard title="Aturan Operasional" description="Manfaatkan teks format di bawah untuk merumuskan ulang langkah operasional.">
          <textarea className="textarea" onChange={(event) => setOperationalRulesJson(event.target.value)} value={operationalRulesJson} />
        </SectionCard>

        <div className="grid-3">
          <SectionCard title="Preferensi UI">
            <textarea className="textarea" onChange={(event) => setUiPreferencesJson(event.target.value)} value={uiPreferencesJson} />
          </SectionCard>
          <SectionCard title="Preferensi AI">
            <textarea className="textarea" onChange={(event) => setAiPreferencesJson(event.target.value)} value={aiPreferencesJson} />
          </SectionCard>
          <SectionCard title="Preferensi Reporting">
            <textarea
              className="textarea"
              onChange={(event) => setReportingPreferencesJson(event.target.value)}
              value={reportingPreferencesJson}
            />
          </SectionCard>
        </div>

        <div className="form-actions">
          <span className="helper-text">Perubahan konfigurasi akan langsung terasa di dashboard staf lainnya.</span>
          <Button type="submit">Simpan Pengaturan</Button>
        </div>
      </form>
    </div>
  );
}

export function OrderStatusSettingsPage() {
  const { activeTenantData, saveStatusDefinition, saveStatusTransition } = useMockApp();
  const [statusLabel, setStatusLabel] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [transitionLabel, setTransitionLabel] = useState("");
  const [fromStatusId, setFromStatusId] = useState("");
  const [toStatusId, setToStatusId] = useState("");

  if (!activeTenantData) {
    return null;
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Pengaturan &gt; Status Order</span>}
        description="Pengaturan transisi pesanan."
        title="Konfigurasi Status Order"
      />

      <div className="grid-2">
        <SectionCard title="Daftar Status" description="Semua titik status progres yang dikenali laporan harian.">
          <div className="list-stack">
            {activeTenantData.statusDefinitions
              .slice()
              .sort((left, right) => left.sortOrder - right.sortOrder)
              .map((status) => (
                <div className="list-item" key={status.id}>
                  <div className="inline-stack" style={{ justifyContent: "space-between" }}>
                    <strong>{status.label}</strong>
                    <Badge tone={statusTone(status.statusGroup)}>{status.statusGroup}</Badge>
                  </div>
                  <span className="muted">
                    kode: {status.code} · titik awal: {status.isInitial ? "ya" : "tidak"} · titik akhir: {status.isTerminal ? "ya" : "tidak"}
                  </span>
                </div>
              ))}
          </div>
        </SectionCard>

        <SectionCard title="Tambah Status" description="Mendaftarkan indikator pencatatan baru yang valid dalam keseharian operasional.">
          <form
            className="field-stack"
            onSubmit={(event) => {
              event.preventDefault();
              saveStatusDefinition({
                code: statusCode,
                label: statusLabel,
                statusGroup: "pending",
                applicableOrderKind: "all",
                isInitial: false,
                isTerminal: false,
                sortOrder: activeTenantData.statusDefinitions.length + 1,
                colorHex: "#12343B",
              });
              setStatusCode("");
              setStatusLabel("");
            }}
          >
            <div className="field">
              <label>Kode status</label>
              <input className="input" onChange={(event) => setStatusCode(event.target.value)} required value={statusCode} />
            </div>
            <div className="field">
              <label>Label status</label>
              <input className="input" onChange={(event) => setStatusLabel(event.target.value)} required value={statusLabel} />
            </div>
            <Button type="submit">Tambah Status</Button>
          </form>
        </SectionCard>
      </div>

      <div className="grid-2">
        <SectionCard title="Transisi Aktif" description="Daftar aturan perpindahan status yang diizinkan.">
          <div className="list-stack">
            {activeTenantData.statusTransitions.map((transition) => {
              const from = activeTenantData.statusDefinitions.find((status) => status.id === transition.fromStatusId);
              const to = activeTenantData.statusDefinitions.find((status) => status.id === transition.toStatusId);
              return (
                <div className="list-item" key={transition.id}>
                  <strong>{transition.transitionLabel}</strong>
                  <span className="muted">
                    {from?.label} -&gt; {to?.label}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Tambah Transisi" description="Batasi perpindahan rute antar status agar lebih logis dari A ke B.">
          <form
            className="field-stack"
            onSubmit={(event) => {
              event.preventDefault();
              saveStatusTransition({
                fromStatusId,
                toStatusId,
                transitionLabel,
                active: true,
              });
              setTransitionLabel("");
            }}
          >
            <div className="field">
              <label>Dari status</label>
              <SearchableSelect
                onChange={(val) => setFromStatusId(val)}
                value={fromStatusId}
                options={[
                  { value: "", label: "Pilih" },
                  ...activeTenantData.statusDefinitions.map((status) => ({ value: status.id, label: status.label }))
                ]}
              />
            </div>
            <div className="field">
              <label>Ke status</label>
              <SearchableSelect
                onChange={(val) => setToStatusId(val)}
                value={toStatusId}
                options={[
                  { value: "", label: "Pilih" },
                  ...activeTenantData.statusDefinitions.map((status) => ({ value: status.id, label: status.label }))
                ]}
              />
            </div>
            <div className="field">
              <label>Label transisi</label>
              <input className="input" onChange={(event) => setTransitionLabel(event.target.value)} required value={transitionLabel} />
            </div>
            <Button type="submit">Tambah Transisi</Button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}