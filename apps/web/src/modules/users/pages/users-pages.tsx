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

function RoleMatrixConfigurator({ matrix, setMatrix, roles }: any) {
  const togglePermission = (role: string, perm: string) => {
    setMatrix((prev: any) => {
      const rolePerms = prev[role] || [];
      if (rolePerms.includes(perm)) {
        return { ...prev, [role]: rolePerms.filter((p: string) => p !== perm) };
      }
      return { ...prev, [role]: [...rolePerms, perm] };
    });
  };

  return (
    <SectionCard
      title="Konfigurasi Matriks Hak Akses"
      description="Atur batasan hak akses (permission) untuk masing-masing role secara spesifik."
    >

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "12px", borderBottom: "2px solid var(--border-subtle)", color: "var(--text-muted)" }}>Modul</th>
              {roles.map((r: any) => (
                <th key={r.code} style={{ textAlign: "center", padding: "12px", borderBottom: "2px solid var(--border-subtle)" }}>
                  <Badge tone={r.code === 'owner' ? 'accent' : 'neutral'}>{r.name}</Badge>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES_LIST.map(mod => (
              <tr key={mod.key} style={{ borderBottom: "1px dashed var(--border-subtle)" }}>
                <td style={{ padding: "16px 12px", width: "220px" }}>
                  <strong>{mod.label}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>Module: {mod.key}</div>
                </td>
                {roles.map((r: any) => {
                  const role = r.code;
                  return (
                    <td key={role} style={{ padding: "16px 12px", textAlign: "center", verticalAlign: "top" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                        {mod.actions.map(actKey => {
                          const actLabel = ACTIONS.find(a => a.key === actKey)?.label || actKey;
                          const permCode = `${mod.key}.${actKey}`;
                          const isGranted = matrix[role]?.includes(permCode);
                          const isOwner = role === 'owner';

                          const disabled = isOwner;

                          return (
                            <button
                              key={actKey}
                              type="button"
                              onClick={() => !disabled && togglePermission(role, permCode)}
                              style={{
                                padding: "4px 8px",
                                fontSize: "0.75rem",
                                borderRadius: "4px",
                                border: isGranted ? "1px solid var(--color-success)" : "1px dashed var(--border-subtle)",
                                background: isGranted ? "rgba(var(--color-success-rgb), 0.15)" : "transparent",
                                color: isGranted ? "var(--color-success)" : "var(--text-muted)",
                                cursor: disabled ? "not-allowed" : "pointer",
                                opacity: disabled ? 0.7 : 1,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                transition: "all 0.2s ease"
                              }}
                            >
                              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isGranted ? "var(--color-success)" : "var(--text-muted)", transition: "background 0.2s ease" }} />
                              {actLabel}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-actions" style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <Button variant="secondary" onClick={() => { }}>Reset ke Default</Button>
        <Button onClick={() => { }}>Simpan Konfigurasi</Button>
      </div>
    </SectionCard>
  );
}

export function UsersListPage() {
  const navigate = useNavigate();
  const { activeTenantData, database, setMembershipStatus } = useMockApp();
  const [activeTab, setActiveTab] = useState<"users" | "role_list" | "matrix">("users");
  const [permissionsMatrix, setPermissionsMatrix] = useState(() => ({ ...ROLE_PERMISSIONS }));
  const [roles, setRoles] = useState([
    { code: "owner", name: "Owner", description: "Akses Super Admin, tidak terbatas.", isSystem: true },
    { code: "admin", name: "Admin", description: "Administrator dengan wewenang fungsional tinggi.", isSystem: true },
    { code: "staff", name: "Staff", description: "Staff operasional terbawah.", isSystem: true },
  ]);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState({ code: "", name: "", description: "" });

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newRole.code || newRole.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (!code) return;

    // Check if editing existing
    const existingIndex = roles.findIndex(r => r.code === code);
    if (existingIndex >= 0) {
      const nextRoles = [...roles];
      nextRoles[existingIndex] = { ...newRole, code, isSystem: roles[existingIndex].isSystem };
      setRoles(nextRoles);
    } else {
      setRoles(prev => [...prev, { ...newRole, code, isSystem: false }]);
      setPermissionsMatrix((prev: any) => ({ ...prev, [code]: [] }));
    }

    setShowRoleDialog(false);
    setNewRole({ code: "", name: "", description: "" });
  };

  if (!activeTenantData) {
    return null;
  }

  const rows = activeTenantData.memberships.map((membership) => {
    const user = database.users.find((entry) => entry.id === membership.userId);
    return {
      membership,
      user,
    };
  });

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Pengguna</span>}
        description="Kelola hak akses tim dan batasan matriks role."
        title="Pengguna & Role"
        actions={<Button onClick={() => navigate("/users/create")}>Tambah Pengguna</Button>}
      />

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab("users")}
          style={{ padding: '8px 16px', borderBottom: activeTab === 'users' ? '2px solid var(--color-primary)' : '2px solid transparent', fontWeight: activeTab === 'users' ? 600 : 400, color: activeTab === 'users' ? 'var(--color-primary)' : 'var(--text-muted)', cursor: "pointer", background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none" }}
          type="button"
        >
          Anggota Tim
        </button>
        <button
          onClick={() => setActiveTab("role_list")}
          style={{ padding: '8px 16px', borderBottom: activeTab === 'role_list' ? '2px solid var(--color-primary)' : '2px solid transparent', fontWeight: activeTab === 'role_list' ? 600 : 400, color: activeTab === 'role_list' ? 'var(--color-primary)' : 'var(--text-muted)', cursor: "pointer", background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none" }}
          type="button"
        >
          Manajemen Role
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          style={{ padding: '8px 16px', borderBottom: activeTab === 'matrix' ? '2px solid var(--color-primary)' : '2px solid transparent', fontWeight: activeTab === 'matrix' ? 600 : 400, color: activeTab === 'matrix' ? 'var(--color-primary)' : 'var(--text-muted)', cursor: "pointer", background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none" }}
          type="button"
        >
          Matriks Hak Akses
        </button>
      </div>

      {showRoleDialog && (
        <div className="dialog-overlay">
          <div className="dialog-card">
            <div className="dialog-header">
              <h2>{roles.find(r => r.code === newRole.code) ? "Edit Role" : "Tambah Role Baru"}</h2>
            </div>
            <form className="field-stack" onSubmit={handleSaveRole}>
              <div className="dialog-body">
                <div className="field">
                  <label>Nama Role *</label>
                  <input className="input" autoFocus value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} placeholder="Contoh: Manajer, Kurir" required />
                </div>
                <div className="field">
                  <label>Kode Role (Sistem)</label>
                  <input className="input" value={newRole.code} disabled placeholder="(Auto-generated)" />
                  <span className="muted" style={{ fontSize: "0.8rem", marginTop: "4px", display: "inline-block" }}>Akan digenerate otomatis jika kosong.</span>
                </div>
                <div className="field">
                  <label>Keterangan (Opsional)</label>
                  <input className="input" value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} placeholder="Tugas dan batasan profil..." />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 24, justifyContent: "flex-end", display: "flex", gap: "1rem" }}>
                <Button onClick={() => setShowRoleDialog(false)} variant="secondary">Batal</Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "users" ? (
        <SectionCard description="Daftar seluruh staf beserta jabatan dan otorisasi mereka." title="Anggota Tim">
          <DataTable
            columns={[
              {
                header: "Nama",
                render: (row) => (
                  <div className="field-stack">
                    <strong>{row.user?.fullName ?? row.membership.displayTitle}</strong>
                    <span className="muted">{row.user?.email ?? "-"}</span>
                  </div>
                ),
              },
              {
                header: "Jabatan",
                render: (row) => row.membership.displayTitle,
              },
              {
                header: "Role",
                render: (row) => (
                  <div className="inline-stack">
                    {row.membership.roleCodes.map((role) => (
                      <Badge key={role} tone="neutral">
                        {formatRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                ),
              },
              {
                header: "Status",
                render: (row) => (
                  <div className="inline-stack">
                    <Badge tone={row.membership.status === "active" ? "success" : "warning"}>
                      {row.membership.status}
                    </Badge>
                    <Button
                      onClick={() =>
                        setMembershipStatus(
                          row.membership.id,
                          row.membership.status === "active" ? "inactive" : "active",
                        )
                      }
                      variant="ghost"
                    >
                      {row.membership.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  </div>
                ),
              },
              {
                header: "Aksi",
                render: (row) => (
                  <div className="inline-stack">
                    <Button onClick={() => navigate(`/users/${row.membership.id}/edit`)} variant="secondary">
                      Detail
                    </Button>
                  </div>
                ),
              },
            ]}
            rowKey={(row) => row.membership.id}
            rows={rows}
          />
        </SectionCard>
      ) : activeTab === "role_list" ? (
        <SectionCard
          description="Kelola daftar struktur jabatan (role) kustom sebelum memodifikasi izin matriksnya."
          title="Manajemen Role"
          actions={<Button onClick={() => { setNewRole({ code: "", name: "", description: "" }); setShowRoleDialog(true); }}>+ Tambah Role</Button>}
        >
          <DataTable
            columns={[
              { header: "Kode", render: (row: any) => <code>{row.code}</code> },
              { header: "Nama Role", render: (row: any) => <strong>{row.name}</strong> },
              { header: "Keterangan", render: (row: any) => <span className="muted">{row.description || "-"}</span> },
              { header: "Status", render: (row: any) => row.isSystem ? <Badge tone="neutral">Bawaan Sistem</Badge> : <Badge tone="info">Custom</Badge> },
              {
                header: "Aksi", render: (row: any) => row.isSystem ? (
                  <span className="muted">-</span>
                ) : (
                  <div className="inline-stack">
                    <Button variant="secondary" onClick={() => { setNewRole(row); setShowRoleDialog(true); }}>Edit</Button>
                    <Button variant="danger" onClick={() => setRoles(prev => prev.filter(r => r.code !== row.code))}>Hapus</Button>
                  </div>
                )
              }
            ]}
            rows={roles}
            rowKey={(r) => r.code}
          />
        </SectionCard>
      ) : (
        <RoleMatrixConfigurator matrix={permissionsMatrix} setMatrix={setPermissionsMatrix} roles={roles} />
      )}
    </div>
  );
}

export function UserFormPage() {
  const navigate = useNavigate();
  const { membershipId } = useParams();
  const { activeTenantData, database, saveUserMembership } = useMockApp();

  if (!activeTenantData) {
    return null;
  }

  const membership = activeTenantData.memberships.find((entry) => entry.id === membershipId);
  const user = database.users.find((entry) => entry.id === membership?.userId);

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Pengguna &gt; {membership ? "Edit" : "Tambah"}</span>}
        description="Tentukan peran dan batasan yang diperbolehkan bagi setiap pengguna secara fleksibel."
        title={membership ? "Edit Pengguna" : "Tambah Pengguna"}
        actions={
          <Button onClick={() => navigate(-1)} variant="ghost">
            &larr; Kembali
          </Button>
        }
      />

      <form
        className="page-shell"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const roleCodes = ["owner", "admin", "staff"].filter((role) =>
            formData.getAll("roleCodes").includes(role),
          ) as ("owner" | "admin" | "staff")[];
          saveUserMembership({
            id: membership?.id,
            userId: user?.id,
            fullName: String(formData.get("fullName")),
            email: String(formData.get("email")),
            username: String(formData.get("username")),
            phone: String(formData.get("phone") ?? ""),
            displayTitle: String(formData.get("displayTitle")),
            status: formData.get("status") as "active" | "inactive",
            roleCodes,
          });
          navigate("/users");
        }}
      >
        <SectionCard title="Data Pengguna" description="Profil anggota.">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="fullName">Nama lengkap</label>
              <input className="input" defaultValue={user?.fullName ?? ""} id="fullName" name="fullName" required />
            </div>
            <div className="field">
              <label htmlFor="displayTitle">Jabatan</label>
              <input className="input" defaultValue={membership?.displayTitle ?? ""} id="displayTitle" name="displayTitle" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input className="input" defaultValue={user?.email ?? ""} id="email" name="email" required type="email" />
            </div>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input className="input" defaultValue={user?.username ?? ""} id="username" name="username" required />
            </div>
            <div className="field">
              <label htmlFor="phone">No. WhatsApp</label>
              <input className="input" defaultValue={user?.phone ?? ""} id="phone" name="phone" />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <SearchableSelect
                name="status"
                id="status"
                defaultValue={membership?.status ?? "active"}
                options={[
                  { value: "active", label: "Aktif" },
                  { value: "inactive", label: "Nonaktif" },
                ]}
              />
            </div>
            <div className="field form-grid-full">
              <label>Role yang dimiliki</label>
              <div className="inline-stack">
                {(["owner", "admin", "staff"] as const).map((role) => (
                  <label className="pill" key={role}>
                    <input
                      defaultChecked={membership?.roleCodes.includes(role) ?? role === "staff"}
                      name="roleCodes"
                      type="checkbox"
                      value={role}
                    />
                    <span>{formatRoleLabel(role)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="form-actions">
          <Button onClick={() => navigate("/users")} variant="secondary">
            Batal
          </Button>
          <Button type="submit">{membership ? "Simpan Perubahan" : "Tambah Pengguna"}</Button>
        </div>
      </form>
    </div>
  );
}