import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  DataTable,
  Notice,
  PageHeader,
  SearchableSelect,
  SectionCard,
} from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import type { PermissionCode, RoleCode } from "../../../types";
import { formatRoleLabel, safeParseJson, statusTone } from "../../../utils";

const MODULES_LIST: Array<{ key: string; label: string; actions: string[] }> = [
  { key: "dashboard", label: "Dashboard", actions: ["view"] },
  { key: "product", label: "Produk & Item", actions: ["view", "create", "update", "archive"] },
  { key: "order", label: "Penjualan / Order", actions: ["view", "create", "update", "archive"] },
  { key: "stock", label: "Inventori Gudang", actions: ["view", "create", "update"] },
  { key: "reporting", label: "Laporan Bisnis", actions: ["view"] },
  { key: "user", label: "Pengguna & Tim", actions: ["view", "create", "update", "archive"] },
  { key: "company_config", label: "Pengaturan Perusahaan", actions: ["view", "manage"] },
  { key: "branch", label: "Cabang & Lokasi", actions: ["view", "manage"] },
  { key: "role", label: "Role & Akses", actions: ["manage"] },
  { key: "knowledge", label: "Knowledge Base", actions: ["view", "create", "update", "archive"] },
  { key: "whatsapp", label: "Asisten WA Gateway", actions: ["view", "manage"] },
  { key: "audit_log", label: "Audit Log", actions: ["view"] },
];

function toPermissions(key: string, actions: string[]) {
  return actions.map((action) => `${key}.${action}` as PermissionCode);
}

function stringifyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function addPermission(currentPermissions: PermissionCode[], permission: PermissionCode) {
  return [...currentPermissions, permission];
}

function removePermission(currentPermissions: PermissionCode[], permission: PermissionCode) {
  return currentPermissions.filter((entry) => entry !== permission);
}

type PermissionToggleProps = Readonly<{
  permission: PermissionCode;
  checked: boolean;
  onToggle: (permission: PermissionCode, checked: boolean) => void;
}>;

function PermissionToggle({ permission, checked, onToggle }: PermissionToggleProps) {
  return (
    <label className="pill">
      <input
        checked={checked}
        onChange={(event) => onToggle(permission, event.target.checked)}
        type="checkbox"
      />
      <span>{permission.split(".")[1]}</span>
    </label>
  );
}

export function SettingsPage() {
  const { activeCompany, activeCompanyData, activeBranch, accessibleBranches, saveSettings } = useMockApp();
  const currentSettings = activeCompanyData?.settings;

  const [businessLabelsJson, setBusinessLabelsJson] = useState(
    stringifyJson(currentSettings?.businessLabels ?? {}),
  );
  const [operationalRulesJson, setOperationalRulesJson] = useState(
    stringifyJson(currentSettings?.operationalRules ?? {}),
  );
  const [uiPreferencesJson, setUiPreferencesJson] = useState(
    stringifyJson(currentSettings?.uiPreferences ?? {}),
  );
  const [aiPreferencesJson, setAiPreferencesJson] = useState(
    stringifyJson(currentSettings?.aiPreferences ?? {}),
  );
  const [reportingPreferencesJson, setReportingPreferencesJson] = useState(
    stringifyJson(currentSettings?.reportingPreferences ?? {}),
  );

  useEffect(() => {
    if (!currentSettings) {
      return;
    }

    setBusinessLabelsJson(stringifyJson(currentSettings.businessLabels));
    setOperationalRulesJson(stringifyJson(currentSettings.operationalRules));
    setUiPreferencesJson(stringifyJson(currentSettings.uiPreferences));
    setAiPreferencesJson(stringifyJson(currentSettings.aiPreferences));
    setReportingPreferencesJson(stringifyJson(currentSettings.reportingPreferences));
  }, [currentSettings]);

  if (!activeCompany || !activeCompanyData || !currentSettings) {
    return null;
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Pengaturan</span>}
        description="Pengaturan perusahaan yang berlaku lintas cabang."
        title="Pengaturan Perusahaan"
        actions={
          <div className="inline-stack">
            <Link className="button button-secondary" to="/settings/order-status">
              Status Order
            </Link>
            <Link className="button button-secondary" to="/settings/roles">
              Role & Akses
            </Link>
          </div>
        }
      />

      <form
        className="page-shell"
        onSubmit={(event) => {
          event.preventDefault();
          saveSettings({
            ...activeCompanyData.settings,
            businessLabels: safeParseJson(businessLabelsJson, activeCompanyData.settings.businessLabels),
            operationalRules: safeParseJson(
              operationalRulesJson,
              activeCompanyData.settings.operationalRules,
            ),
            uiPreferences: safeParseJson(uiPreferencesJson, activeCompanyData.settings.uiPreferences),
            aiPreferences: safeParseJson(aiPreferencesJson, activeCompanyData.settings.aiPreferences),
            reportingPreferences: safeParseJson(
              reportingPreferencesJson,
              activeCompanyData.settings.reportingPreferences,
            ),
          });
        }}
      >
        <div className="grid-2">
          <SectionCard title="Profil Perusahaan" description="Identitas bisnis utama.">
            <div className="kv-grid">
              <div className="kv-item">
                <span>Nama perusahaan</span>
                <strong>{activeCompany.name}</strong>
              </div>
              <div className="kv-item">
                <span>Timezone</span>
                <strong>{activeCompany.timezone}</strong>
              </div>
              <div className="kv-item">
                <span>Mata uang</span>
                <strong>{activeCompany.currencyCode}</strong>
              </div>
              <div className="kv-item">
                <span>Bahasa sistem</span>
                <strong>{activeCompany.locale}</strong>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Ringkasan Cabang" description="Context kerja aktif dan jumlah cabang.">
            <div className="list-stack">
              <div className="kv-item">
                <span>Cabang aktif</span>
                <strong>{activeBranch?.name ?? "-"}</strong>
              </div>
              <div className="kv-item">
                <span>Cabang yang dapat diakses</span>
                <strong>{accessibleBranches.length}</strong>
              </div>
              {activeCompanyData.settings.featureFlags.map((flag) => (
                <div className="kv-item" key={flag.key}>
                  <span>{flag.key}</span>
                  <strong>{flag.enabled ? "Aktif" : "Nonaktif"}</strong>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Label Bisnis" description="Label utama untuk istilah operasional.">
          <textarea
            className="textarea"
            onChange={(event) => setBusinessLabelsJson(event.target.value)}
            value={businessLabelsJson}
          />
        </SectionCard>

        <SectionCard title="Aturan Operasional" description="Aturan default yang dipakai lintas cabang.">
          <textarea
            className="textarea"
            onChange={(event) => setOperationalRulesJson(event.target.value)}
            value={operationalRulesJson}
          />
        </SectionCard>

        <div className="grid-3">
          <SectionCard title="Preferensi UI">
            <textarea
              className="textarea"
              onChange={(event) => setUiPreferencesJson(event.target.value)}
              value={uiPreferencesJson}
            />
          </SectionCard>
          <SectionCard title="Preferensi AI">
            <textarea
              className="textarea"
              onChange={(event) => setAiPreferencesJson(event.target.value)}
              value={aiPreferencesJson}
            />
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
          <span className="helper-text">Perubahan akan langsung terasa pada seluruh cabang yang aktif.</span>
          <Button type="submit">Simpan Pengaturan</Button>
        </div>
      </form>
    </div>
  );
}

export function OrderStatusSettingsPage() {
  const { activeCompanyData, saveStatusDefinition, saveStatusTransition } = useMockApp();
  const [statusLabel, setStatusLabel] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [transitionLabel, setTransitionLabel] = useState("");
  const [fromStatusId, setFromStatusId] = useState("");
  const [toStatusId, setToStatusId] = useState("");

  if (!activeCompanyData) {
    return null;
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Pengaturan &gt; Status Order</span>}
        description="Status order ini berlaku untuk seluruh cabang."
        title="Konfigurasi Status Order"
      />

      <div className="grid-2">
        <SectionCard title="Daftar Status" description="Semua titik status progres yang dikenali laporan harian.">
          <div className="list-stack">
            {activeCompanyData.statusDefinitions
              .slice()
              .sort((left, right) => left.sortOrder - right.sortOrder)
              .map((status) => (
                <div className="list-item" key={status.id}>
                  <div className="inline-stack" style={{ justifyContent: "space-between" }}>
                    <strong>{status.label}</strong>
                    <Badge tone={statusTone(status.statusGroup)}>{status.statusGroup}</Badge>
                  </div>
                  <span className="muted">
                    kode: {status.code} | titik awal: {status.isInitial ? "ya" : "tidak"} | titik
                    akhir: {status.isTerminal ? "ya" : "tidak"}
                  </span>
                </div>
              ))}
          </div>
        </SectionCard>

        <SectionCard title="Tambah Status" description="Mendaftarkan indikator pencatatan baru yang valid.">
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
                sortOrder: activeCompanyData.statusDefinitions.length + 1,
                colorHex: "#12343B",
              });
              setStatusCode("");
              setStatusLabel("");
            }}
          >
            <div className="field">
              <label htmlFor="status-code-input">Kode status</label>
              <input
                className="input"
                id="status-code-input"
                onChange={(event) => setStatusCode(event.target.value)}
                required
                value={statusCode}
              />
            </div>
            <div className="field">
              <label htmlFor="status-label-input">Label status</label>
              <input
                className="input"
                id="status-label-input"
                onChange={(event) => setStatusLabel(event.target.value)}
                required
                value={statusLabel}
              />
            </div>
            <Button type="submit">Tambah Status</Button>
          </form>
        </SectionCard>
      </div>

      <div className="grid-2">
        <SectionCard title="Transisi Aktif" description="Daftar aturan perpindahan status yang diizinkan.">
          <div className="list-stack">
            {activeCompanyData.statusTransitions.map((transition) => {
              const from = activeCompanyData.statusDefinitions.find(
                (status) => status.id === transition.fromStatusId,
              );
              const to = activeCompanyData.statusDefinitions.find(
                (status) => status.id === transition.toStatusId,
              );
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

        <SectionCard title="Tambah Transisi" description="Batasi perpindahan rute antar status agar tetap logis.">
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
              <label htmlFor="transition-from-status">Dari status</label>
              <SearchableSelect
                id="transition-from-status"
                onChange={(value) => setFromStatusId(value)}
                options={[
                  { value: "", label: "Pilih" },
                  ...activeCompanyData.statusDefinitions.map((status) => ({
                    value: status.id,
                    label: status.label,
                  })),
                ]}
                value={fromStatusId}
              />
            </div>
            <div className="field">
              <label htmlFor="transition-to-status">Ke status</label>
              <SearchableSelect
                id="transition-to-status"
                onChange={(value) => setToStatusId(value)}
                options={[
                  { value: "", label: "Pilih" },
                  ...activeCompanyData.statusDefinitions.map((status) => ({
                    value: status.id,
                    label: status.label,
                  })),
                ]}
                value={toStatusId}
              />
            </div>
            <div className="field">
              <label htmlFor="transition-label-input">Label transisi</label>
              <input
                className="input"
                id="transition-label-input"
                onChange={(event) => setTransitionLabel(event.target.value)}
                required
                value={transitionLabel}
              />
            </div>
            <Button type="submit">Tambah Transisi</Button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}

export function RolesSettingsPage() {
  const {
    activeCompanyData,
    saveRoleDefinition,
    deleteRoleDefinition,
    saveRolePermissions,
  } = useMockApp();
  const [selectedRoleCode, setSelectedRoleCode] = useState<RoleCode>();
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");

  const selectedRole = useMemo(
    () => activeCompanyData?.roleDefinitions.find((role) => role.code === selectedRoleCode),
    [activeCompanyData, selectedRoleCode],
  );
  const selectedPermissions = selectedRoleCode
    ? activeCompanyData?.rolePermissions[selectedRoleCode] ?? []
    : [];

  const handlePermissionToggle = (permission: PermissionCode, checked: boolean) => {
    if (!selectedRoleCode) {
      return;
    }

    if (checked) {
      saveRolePermissions(selectedRoleCode, addPermission(selectedPermissions, permission));
      return;
    }

    saveRolePermissions(selectedRoleCode, removePermission(selectedPermissions, permission));
  };

  if (!activeCompanyData) {
    return null;
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Pengaturan &gt; Role &amp; Akses</span>}
        description="Kelola role perusahaan dan permission yang melekat pada setiap role."
        title="Role & Akses"
      />

      <div className="grid-2">
        <SectionCard title="Daftar Role" description="Role sistem dan role kustom perusahaan.">
          <DataTable
            columns={[
              {
                header: "Role",
                render: (role) => (
                  <div className="field-stack">
                    <strong>{role.name}</strong>
                    <span className="muted">{formatRoleLabel(role.code)}</span>
                  </div>
                ),
              },
              {
                header: "Tipe",
                render: (role) => (
                  <Badge tone={role.isSystem ? "neutral" : "info"}>
                    {role.isSystem ? "Sistem" : "Kustom"}
                  </Badge>
                ),
              },
              {
                header: "Aksi",
                render: (role) => (
                  <div className="inline-stack">
                    <Button
                      onClick={() => {
                        setSelectedRoleCode(role.code);
                        setRoleName(role.name);
                        setRoleDescription(role.description);
                      }}
                      variant="secondary"
                    >
                      Atur
                    </Button>
                    {role.isSystem ? null : (
                      <Button onClick={() => deleteRoleDefinition(role.code)} variant="danger">
                        Hapus
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            rowKey={(role) => String(role.code)}
            rows={activeCompanyData.roleDefinitions}
          />
        </SectionCard>

        <SectionCard title="Tambah / Edit Role" description="Role baru berlaku di level perusahaan.">
          <form
            className="field-stack"
            onSubmit={(event) => {
              event.preventDefault();
              saveRoleDefinition(
                selectedRoleCode
                  ? {
                      code: selectedRoleCode,
                      name: roleName,
                      description: roleDescription,
                    }
                  : {
                      name: roleName,
                      description: roleDescription,
                    },
              );
              setSelectedRoleCode(undefined);
              setRoleName("");
              setRoleDescription("");
            }}
          >
            <div className="field">
              <label htmlFor="role-name-input">Nama role</label>
              <input
                className="input"
                id="role-name-input"
                onChange={(event) => setRoleName(event.target.value)}
                required
                value={roleName}
              />
            </div>
            <div className="field">
              <label htmlFor="role-description-input">Deskripsi</label>
              <textarea
                className="textarea"
                id="role-description-input"
                onChange={(event) => setRoleDescription(event.target.value)}
                value={roleDescription}
              />
            </div>
            <div className="form-actions">
              <Button
                onClick={() => {
                  setSelectedRoleCode(undefined);
                  setRoleName("");
                  setRoleDescription("");
                }}
                type="button"
                variant="secondary"
              >
                Reset
              </Button>
              <Button type="submit">{selectedRole ? "Simpan Role" : "Tambah Role"}</Button>
            </div>
          </form>
        </SectionCard>
      </div>

      <SectionCard
        title="Matriks Hak Akses"
        description="Pilih role terlebih dahulu, lalu nyalakan izin yang dibutuhkan."
      >
        {selectedRoleCode ? (
          <div className="list-stack">
            {MODULES_LIST.map((module) => (
              <div className="list-item" key={module.key}>
                <div className="inline-stack" style={{ justifyContent: "space-between" }}>
                  <strong>{module.label}</strong>
                  <div className="inline-stack">
                    {toPermissions(module.key, module.actions).map((permission) => (
                      <PermissionToggle
                        checked={selectedPermissions.includes(permission)}
                        key={permission}
                        onToggle={handlePermissionToggle}
                        permission={permission}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Notice tone="info">Pilih salah satu role untuk mulai mengatur permission.</Notice>
        )}
      </SectionCard>
    </div>
  );
}
