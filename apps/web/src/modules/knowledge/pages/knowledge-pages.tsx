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

export function KnowledgePage() {
  const navigate = useNavigate();
  const { activeTenantData, archiveKnowledgeDocument, findMembershipName } = useMockApp();
  const [selectedId, setSelectedId] = useState(activeTenantData?.knowledgeDocuments[0]?.id);

  if (!activeTenantData) {
    return null;
  }

  const selectedDocument = activeTenantData.knowledgeDocuments.find((document) => document.id === selectedId);

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Knowledge Base</span>}
        description="Sistem referensi otomatis."
        title="Knowledge Base"
        actions={<Button onClick={() => navigate("/knowledge/upload")}>Upload Dokumen</Button>}
      />

      <div className="split-layout">
        <SectionCard title="Daftar Dokumen" description="Pusat referensi dan panduan operasi.">
          <div className="list-stack">
            {activeTenantData.knowledgeDocuments.map((document) => (
              <button
                className="list-item"
                key={document.id}
                onClick={() => setSelectedId(document.id)}
                type="button"
              >
                <div className="inline-stack" style={{ justifyContent: "space-between" }}>
                  <strong>{document.title}</strong>
                  <Badge
                    tone={
                      document.status === "ready"
                        ? "success"
                        : document.status === "processing"
                          ? "warning"
                          : document.status === "failed"
                            ? "danger"
                            : "neutral"
                    }
                  >
                    {document.status}
                  </Badge>
                </div>
                <span className="muted">
                  {document.documentType} · {formatDateTime(document.uploadedAt)}
                </span>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Detail Dokumen" description="Ikhtisar file beserta metadatanya.">
          {selectedDocument ? (
            <div className="list-stack">
              <div className="kv-item">
                <span>Judul</span>
                <strong>{selectedDocument.title}</strong>
              </div>
              <div className="kv-item">
                <span>File</span>
                <strong>{selectedDocument.fileName}</strong>
              </div>
              <div className="kv-item">
                <span>Diunggah oleh</span>
                <strong>{findMembershipName(selectedDocument.uploadedByMembershipId)}</strong>
              </div>
              <div className="kv-item">
                <span>Ringkasan</span>
                <strong>{selectedDocument.summary}</strong>
              </div>
              <Button onClick={() => archiveKnowledgeDocument(selectedDocument.id)} variant="danger">
                Arsipkan Dokumen
              </Button>
            </div>
          ) : (
            <EmptyState description="Pilih dokumen dari daftar untuk melihat detail." title="Belum ada dokumen terpilih" />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export function KnowledgeUploadPage() {
  const navigate = useNavigate();
  const { activeTenantData, saveKnowledgeDocument } = useMockApp();

  if (!activeTenantData) {
    return null;
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Knowledge Base &gt; Upload</span>}
        description="Upload ke dalam sistem."
        title="Upload Dokumen"
      />

      <form
        className="page-shell"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          saveKnowledgeDocument({
            title: String(formData.get("title")),
            documentType: formData.get("documentType") as "sop" | "policy" | "glossary" | "guide",
            status: "processing",
            uploadedByMembershipId: activeTenantData.memberships[0].id,
            summary: String(formData.get("summary")),
            fileName: String(formData.get("fileName")),
          });
          navigate("/knowledge");
        }}
      >
        <SectionCard title="Informasi Dokumen" description="Kategori serta rincian panduan baru.">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="title">Judul dokumen</label>
              <input className="input" id="title" name="title" required />
            </div>
            <div className="field">
              <label htmlFor="documentType">Tipe dokumen</label>
              <SearchableSelect
                id="documentType"
                name="documentType"
                defaultValue="sop"
                options={[
                  { value: "sop", label: "SOP" },
                  { value: "policy", label: "Policy" },
                  { value: "glossary", label: "Glossary" },
                  { value: "guide", label: "Guide" },
                ]}
              />
            </div>
            <div className="field form-grid-full">
              <label htmlFor="fileName">Nama file</label>
              <input className="input" id="fileName" name="fileName" placeholder="contoh: sop-retur-v3.pdf" required />
            </div>
            <div className="field form-grid-full">
              <label htmlFor="summary">Ringkasan isi</label>
              <textarea className="textarea" id="summary" name="summary" required />
            </div>
          </div>
        </SectionCard>

        <div className="form-actions">
          <Button onClick={() => navigate("/knowledge")} variant="secondary">
            Batal
          </Button>
          <Button type="submit">Upload Dokumen</Button>
        </div>
      </form>
    </div>
  );
}