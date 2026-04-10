import { useState } from "react";
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
import { formatDateTime } from "../../../utils";

export function WhatsappPage() {
  const { activeWorkspaceData, updateWorkspaceData, revokeWhatsappAuthorization, saveWhatsappAuthorization } = useMockApp();
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [accessLevel, setAccessLevel] = useState<"owner" | "authorized_party">("authorized_party");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!activeWorkspaceData) {
    return null;
  }

  const handleModeChange = (mode: "bot_only" | "ai_only" | "hybrid") => {
    updateWorkspaceData((ws) => ({
      ...ws,
      whatsappChannelStatus: { ...ws.whatsappChannelStatus, mode }
    }));
  };

  const setChannelState = (newState: "connected" | "disconnected", newPhone: string = "") => {
    updateWorkspaceData((ws) => ({
      ...ws,
      whatsappChannelStatus: {
        ...ws.whatsappChannelStatus,
        state: newState,
        phone: newPhone,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const channelState = activeWorkspaceData.whatsappChannelStatus.state;
  let gatewayStatusContent: React.ReactNode;

  if (channelState === "connected") {
    gatewayStatusContent = (
      <div className="list-stack">
        <div className="kv-item">
          <span>Status gateway</span>
          <strong style={{ color: "var(--color-success)" }}>Terhubung</strong>
        </div>
        <div className="kv-item">
          <span>Nomor terhubung</span>
          <strong>{activeWorkspaceData.whatsappChannelStatus.phone || "-"}</strong>
        </div>
        <div className="kv-item">
          <span>Update terakhir</span>
          <strong>{formatDateTime(activeWorkspaceData.whatsappChannelStatus.updatedAt)}</strong>
        </div>
        <div style={{ marginTop: "12px" }}>
          <Button variant="danger" onClick={() => setChannelState("disconnected")}>Putuskan Koneksi</Button>
        </div>
      </div>
    );
  } else if (channelState === "reconnecting") {
    gatewayStatusContent = (
      <div className="empty-state" style={{ padding: "32px 16px" }}>
        <div className="empty-state-mark">⏳</div>
        <h3>Sedang Menyambungkan Ulang...</h3>
        <p>Asisten WA sedang mencoba terhubung kembali ke sesi Baileys Anda. Mohon tunggu sesaat.</p>
      </div>
    );
  } else if (showQr) {
    gatewayStatusContent = (
      <div className="empty-state" style={{ padding: "32px 16px" }}>
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
            <Button type="button" variant="secondary" onClick={() => setShowQr(false)}>Batal</Button>
            <Button type="button" onClick={() => {
              setChannelState("connected", "+6281122223333");
              setShowQr(false);
            }}>Simulasikan Scan Berhasil</Button>
          </div>
        </div>
      </div>
    );
  } else {
    gatewayStatusContent = (
      <div className="empty-state" style={{ padding: "32px 16px" }}>
        <div className="field-stack" style={{ alignItems: "center" }}>
          <div className="empty-state-mark">🔌</div>
          <h3>Gateway Terputus</h3>
          <p>Silakan tautkan akun WhatsApp Anda untuk mengaktifkan mesin Asisten (Baileys).</p>
          <Button type="button" onClick={() => setShowQr(true)}>Hubungkan WhatsApp (QR)</Button>
        </div>
      </div>
    );
  }

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
                  <label htmlFor="wa-user-name">Nama</label>
                  <input className="input" id="wa-user-name" onChange={(event) => setUserName(event.target.value)} required value={userName} />
                </div>
                <div className="field">
                  <label htmlFor="wa-user-phone">Nomor WA (contoh: 628...)</label>
                  <input className="input" id="wa-user-phone" onChange={(event) => setPhone(event.target.value)} required value={phone} />
                </div>
                <div className="field">
                  <label htmlFor="wa-access-level">Level akses</label>
                  <SearchableSelect
                    id="wa-access-level"
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
                <Button type="button" onClick={() => setShowAddDialog(false)} variant="secondary">Batal</Button>
                <Button type="submit">Simpan Otorisasi</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid-2">
        <SectionCard title="Status Gateway" description="Kondisi koneksi gateway Anda saat ini.">
          {gatewayStatusContent}
        </SectionCard>

        <SectionCard title="Mode Asisten" description="Respon otomatis sebagai bot statis atau AI canggih.">
          <div className="field-stack">
            <div className="field">
              <label htmlFor="wa-mode-select">Pilih Mode</label>
              <SearchableSelect
                id="wa-mode-select"
                value={activeWorkspaceData.whatsappChannelStatus.mode || "hybrid"}
                onChange={(val) => handleModeChange(val as any)}
                options={[
                  { value: "bot_only", label: "Hanya Bot Statis" },
                  { value: "ai_only", label: "Asisten Cerdas (AI)" },
                  { value: "hybrid", label: "Hybrid (A.I + Bot)" },
                ]}
              />
            </div>
            <Notice tone="info">
              Saat ini mode <strong>{activeWorkspaceData.whatsappChannelStatus.mode || "hybrid"}</strong> diaktifkan. Perubahan mode diterapkan seketika pada sesi chat aktif.
            </Notice>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Daftar Nomor Terotorisasi"
        description="Kelola siapa saja yang memiliki hak akses untuk berinteraksi dengan layanan Asisten WA via chat."
        actions={<Button variant="secondary" onClick={() => setShowAddDialog(true)}>Tambah Otorisasi</Button>}
      >
        {activeWorkspaceData.whatsappAuthorizations.length > 0 ? (
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
            rows={activeWorkspaceData.whatsappAuthorizations}
          />
        ) : (
          <EmptyState title="Tidak ada otorisasi" description="Belum ada nomor luar yang diberikan izin." />
        )}
      </SectionCard>
    </div>
  );
}
