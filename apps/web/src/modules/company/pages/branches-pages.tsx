import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, DataTable, PageHeader, SectionCard } from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";

export function BranchesListPage() {
  const navigate = useNavigate();
  const { activeCompany, database, activeBranch, accessibleBranches, can } = useMockApp();

  if (!activeCompany) {
    return null;
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Cabang &amp; Lokasi</span>}
        description="Kelola daftar cabang dan lokasi operasional perusahaan Anda."
        title="Cabang & Lokasi"
        actions={
          can("branch.manage") ? (
            <Button onClick={() => navigate("/branches/create")}>+ Tambah Cabang</Button>
          ) : undefined
        }
      />

      <SectionCard
        title="Semua Cabang"
        description="Daftar cabang yang terdaftar di perusahaan ini."
      >
        <DataTable
          rows={database.branches}
          rowKey={(row) => row.id}
          columns={[
            {
              header: "Nama Cabang",
              render: (row) => (
                <div className="field-stack">
                  <strong>{row.name}</strong>
                  <span className="muted">{row.code}</span>
                  {row.id === activeBranch?.id ? (
                    <Badge tone="success">Aktif Saat Ini</Badge>
                  ) : null}
                </div>
              ),
            },
            {
              header: "Kota",
              render: (row) => row.city,
            },
            {
              header: "Alamat",
              render: (row) => row.address,
            },
            {
              header: "Lokasi Stok Default",
              render: (row) => row.defaultStockLocationLabel,
            },
            {
              header: "Status / Akses",
              render: (row) => {
                const hasAccess = accessibleBranches.some((b) => b.branch.id === row.id);
                return (
                  <div className="field-stack">
                    {row.isDefault && <Badge tone="info">Pusat</Badge>}
                    {hasAccess ? (
                      <Badge tone="success">Anda Memiliki Akses</Badge>
                    ) : (
                      <Badge tone="neutral">Tidak Ada Akses</Badge>
                    )}
                  </div>
                );
              },
            },
            ...(can("branch.manage")
              ? [
                  {
                    header: "Aksi",
                    render: (row: (typeof database.branches)[number]) => (
                      <Button
                        onClick={() => navigate(`/branches/${row.id}/edit`)}
                        variant="secondary"
                      >
                        Edit
                      </Button>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </SectionCard>
    </div>
  );
}

export function BranchFormPage() {
  const navigate = useNavigate();
  const { branchId } = useParams();
  const { database, saveBranch } = useMockApp();

  const existing = database.branches.find((branch) => branch.id === branchId);

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={
          <span>
            Dashboard &gt; Cabang &amp; Lokasi &gt; {existing ? existing.name : "Tambah Cabang"}
          </span>
        }
        description="Atur identitas, lokasi, dan label stok cabang."
        title={existing ? "Edit Cabang" : "Tambah Cabang"}
        actions={
          <Button onClick={() => navigate("/branches")} variant="ghost">
            &larr; Kembali
          </Button>
        }
      />

      <form
        className="page-shell"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          saveBranch({
            id: existing?.id,
            name: String(formData.get("name")),
            code: String(formData.get("code")),
            city: String(formData.get("city")),
            address: String(formData.get("address")),
            defaultStockLocationLabel: String(formData.get("defaultStockLocationLabel")),
            isDefault: existing?.isDefault ?? false,
          });
          navigate("/branches");
        }}
      >
        <SectionCard
          title="Identitas Cabang"
          description="Nama dan kode unik yang merepresentasikan cabang ini di seluruh sistem."
        >
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Nama cabang</label>
              <input
                className="input"
                defaultValue={existing?.name ?? ""}
                id="name"
                name="name"
                placeholder="Cabang Surabaya"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="code">Kode cabang</label>
              <input
                className="input"
                defaultValue={existing?.code ?? ""}
                id="code"
                maxLength={10}
                name="code"
                placeholder="SBY"
                required
                style={{ textTransform: "uppercase" }}
              />
              <span className="helper-text">
                Kode singkat unik, dipakai sebagai prefix nomor order. Contoh: JKT, BDG, SBY.
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Lokasi"
          description="Informasi geografis cabang untuk keperluan operasional dan pengiriman."
        >
          <div className="form-grid">
            <div className="field">
              <label htmlFor="city">Kota</label>
              <input
                className="input"
                defaultValue={existing?.city ?? ""}
                id="city"
                name="city"
                placeholder="Surabaya"
                required
              />
            </div>
            <div className="field form-grid-full">
              <label htmlFor="address">Alamat lengkap</label>
              <textarea
                className="textarea"
                defaultValue={existing?.address ?? ""}
                id="address"
                name="address"
                placeholder="Jl. Raya Darmo No. 1, Surabaya"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Pengaturan Inventori"
          description="Label lokasi stok yang akan dipakai sebagai default untuk cabang ini."
        >
          <div className="form-grid">
            <div className="field">
              <label htmlFor="defaultStockLocationLabel">Label lokasi stok default</label>
              <input
                className="input"
                defaultValue={existing?.defaultStockLocationLabel ?? ""}
                id="defaultStockLocationLabel"
                name="defaultStockLocationLabel"
                placeholder="Gudang Utama Surabaya"
                required
              />
              <span className="helper-text">
                Nama lokasi penyimpanan stok yang akan dipakai sebagai acuan di halaman inventori cabang ini.
              </span>
            </div>
          </div>
        </SectionCard>

        <div className="form-actions">
          <Button onClick={() => navigate("/branches")} type="button" variant="secondary">
            Batal
          </Button>
          <Button type="submit">{existing ? "Simpan Perubahan" : "Simpan Cabang"}</Button>
        </div>
      </form>
    </div>
  );
}
