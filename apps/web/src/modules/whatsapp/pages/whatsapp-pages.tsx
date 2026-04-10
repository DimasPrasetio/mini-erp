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

export function WhatsappPage() {
  const { activeTenantData, updateTenantData, revokeWhatsappAuthorization, saveWhatsappAuthorization } = useMockApp();
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [accessLevel, setAccessLevel] = useState<"owner" | "authorized_party">("authorized_party");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!activeTenantData) {
    return null;
  }

  const handleModeChange = (mode: "bot_only" | "ai_only" | "hybrid") => {
    updateTenantData((td) => ({
      ...td,
      whatsappChannelStatus: { ...td.whatsappChannelStatus, mode }
    }));
  };

  const setChannelState = (newState: "connected" | "disconnected", newPhone: string = "") => {
    updateTenantData((td) => ({
      ...td,
      whatsappChannelStatus: {
        ...td.whatsappChannelStatus,
        state: newState,
        phone: newPhone,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Asisten WA</span>}
        description="Pusat kontrol dan diagnostik asisten otomasi Anda."
        title="Asisten WA"
      />

      {showAddDialog && (
        <div className="dialog-overlay">
          <div className="dialog-card">
            <div className="dialog-header">
              <h2>Tambah Otorisasi Baru</h2>
            </div>
            <form
              className="field-stack"
              onSubmit={(event) => {
                event.preventDefault();
                saveWhatsappAuthorization({ userName, phone, accessLevel, status: "active", isPrimaryOwner: false });
                setUserName("");
                setPhone("");
                setShowAddDialog(false);
              }}
            >
              <div className="dialog-body">
                <div className="field">
                  <label>Nama</label>
                  <input className="input" onChange={(event) => setUserName(event.target.value)} required value={userName} />
                </div>
                <div className="field">
                  <label>Nomor WA (contoh: 628...)</label>
                  <input className="input" onChange={(event) => setPhone(event.target.value)} required value={phone} />
                </div>
                <div className="field">
                  <label>Level akses</label>
                  <SearchableSelect
                    onChange={(val) => setAccessLevel(val as "owner" | "authorized_party")}
                    value={accessLevel}
                    options={[
                      { value: "authorized_party", label: "Authorized Party" },
                      { value: "owner", label: "Owner" },
                    ]}
                  />
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 24, justifyContent: "flex-end", display: "flex", gap: "1rem" }}>
                <Button onClick={() => setShowAddDialog(false)} variant="secondary">Batal</Button>
                <Button type="submit">Simpan Otorisasi</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid-2">
        <SectionCard title="Status Gateway" description="Kondisi koneksi gateway Anda saat ini.">
          {activeTenantData.whatsappChannelStatus.state === "connected" ? (
            <div className="list-stack">
              <div className="kv-item">
                <span>Status gateway</span>
                <strong style={{ color: "var(--color-success)" }}>Terhubung</strong>
              </div>
              <div className="kv-item">
                <span>Nomor terhubung</span>
                <strong>{activeTenantData.whatsappChannelStatus.phone || "-"}</strong>
              </div>
              <div className="kv-item">
                <span>Update terakhir</span>
                <strong>{formatDateTime(activeTenantData.whatsappChannelStatus.updatedAt)}</strong>
              </div>
              <div style={{ marginTop: "12px" }}>
                <Button variant="danger" onClick={() => setChannelState("disconnected")}>Putuskan Koneksi</Button>
              </div>
            </div>
          ) : activeTenantData.whatsappChannelStatus.state === "reconnecting" ? (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <div className="empty-state-mark">⏳</div>
              <h3>Sedang Menyambungkan Ulang...</h3>
              <p>Asisten WA sedang mencoba terhubung kembali ke sesi Baileys Anda. Mohon tunggu sesaat.</p>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              {showQr ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <div style={{ padding: "16px", background: "white", borderRadius: "8px" }}>
                    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="150" height="150" fill="white" />
                      <rect x="10" y="10" width="30" height="30" fill="black" />
                      <rect x="15" y="15" width="20" height="20" fill="white" />
                      <rect x="20" y="20" width="10" height="10" fill="black" />
                      <rect x="110" y="10" width="30" height="30" fill="black" />
                      <rect x="115" y="15" width="20" height="20" fill="white" />
                      <rect x="120" y="20" width="10" height="10" fill="black" />
                      <rect x="10" y="110" width="30" height="30" fill="black" />
                      <rect x="15" y="115" width="20" height="20" fill="white" />
                      <rect x="20" y="120" width="10" height="10" fill="black" />
                      <rect x="50" y="50" width="10" height="10" fill="black" />
                      <rect x="70" y="70" width="10" height="10" fill="black" />
                      <rect x="90" y="90" width="10" height="10" fill="black" />
                      <rect x="50" y="110" width="10" height="10" fill="black" />
                      <rect x="70" y="30" width="10" height="10" fill="black" />
                      <rect x="90" y="50" width="10" height="10" fill="black" />
                      <rect x="110" y="70" width="10" height="10" fill="black" />
                      <rect x="130" y="110" width="10" height="10" fill="black" />
                      <rect x="50" y="130" width="10" height="10" fill="black" />
                    </svg>
                  </div>
                  <h3>Scan QR Code</h3>
                  <p style={{ textAlign: "center", fontSize: "0.85rem" }}>Buka WhatsApp di HP Anda &gt; Perangkat Taut &gt; Tautkan Perangkat</p>
                  <div className="inline-stack" style={{ justifyContent: "center" }}>
                    <Button variant="secondary" onClick={() => setShowQr(false)}>Batal</Button>
                    <Button onClick={() => {
                      setChannelState("connected", "+6281122223333");
                      setShowQr(false);
                    }}>Simulasikan Scan Berhasil</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="empty-state-mark">🔌</div>
                  <h3>Gateway Terputus</h3>
                  <p>Silakan tautkan akun WhatsApp Anda untuk mengaktifkan mesin Asisten (Baileys).</p>
                  <Button onClick={() => setShowQr(true)}>Hubungkan WhatsApp (QR)</Button>
                </>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Mode Asisten" description="Respon otomatis sebagai bot statis atau AI canggih.">
          <div className="field-stack">
            <div className="field">
              <label>Pilih Mode</label>
              <SearchableSelect
                value={activeTenantData.whatsappChannelStatus.mode || "hybrid"}
                onChange={(val) => handleModeChange(val as any)}
                options={[
                  { value: "bot_only", label: "Hanya Bot Statis" },
                  { value: "ai_only", label: "Asisten Cerdas (AI)" },
                  { value: "hybrid", label: "Hybrid (A.I + Bot)" },
                ]}
              />
            </div>
            <Notice tone="info">
              Saat ini mode <strong>{activeTenantData.whatsappChannelStatus.mode || "hybrid"}</strong> diaktifkan. Perubahan mode diterapkan seketika pada sesi chat aktif.
            </Notice>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Daftar Nomor Terotorisasi"
        description="Kelola siapa saja yang memiliki hak akses untuk berinteraksi dengan layanan Asisten WA via chat."
        actions={<Button variant="secondary" onClick={() => setShowAddDialog(true)}>Tambah Otorisasi</Button>}
      >
        {activeTenantData.whatsappAuthorizations.length > 0 ? (
          <DataTable
            columns={[
              { header: "Nama", render: (entry) => entry.userName },
              { header: "Nomor", render: (entry) => entry.phone },
              { header: "Akses", render: (entry) => <Badge tone="neutral">{entry.accessLevel}</Badge> },
              { header: "Status", render: (entry) => <Badge tone={entry.status === "active" ? "success" : "warning"}>{entry.status}</Badge> },
              {
                header: "Aksi",
                render: (entry) =>
                  entry.status === "active" ? (
                    <Button onClick={() => revokeWhatsappAuthorization(entry.id)} variant="ghost">Cabut akses</Button>
                  ) : "-",
              },
            ]}
            rowKey={(entry) => entry.id}
            rows={activeTenantData.whatsappAuthorizations}
          />
        ) : (
          <EmptyState title="Tidak ada otorisasi" description="Belum ada nomor luar yang diberikan izin." />
        )}
      </SectionCard>
    </div>
  );
}