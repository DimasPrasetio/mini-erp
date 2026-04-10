import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  FilterBar,
  Notice,
  PageHeader,
  SectionCard,
  SearchableSelect,
} from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import type { Item } from "../../../types";
import { formatCurrency, formatDateTime } from "../../../utils";

function parseAttributes(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((result, line) => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length > 0) {
        result[key.trim()] = rest.join(":").trim();
      }
      return result;
    }, {});
}

function stringifyAttributes(attributes: Record<string, string>) {
  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

export function ItemsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeTenantData, can } = useMockApp();

  if (!activeTenantData) {
    return null;
  }

  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const itemType = searchParams.get("item_type") ?? "";
  const status = searchParams.get("status") ?? "active";
  const stockTracked = searchParams.get("stock_tracked") ?? "";

  const items = activeTenantData.items.filter((item) => {
    const matchesSearch =
      search.length === 0 ||
      item.itemCode.toLowerCase().includes(search) ||
      item.itemName.toLowerCase().includes(search);
    const matchesType = itemType.length === 0 || item.itemType === itemType;
    const matchesStatus = status === "all" || item.status === status;
    const matchesTracked =
      stockTracked.length === 0 ||
      (stockTracked === "true" ? item.stockTracked : !item.stockTracked);

    return matchesSearch && matchesType && matchesStatus && matchesTracked;
  });

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Produk</span>}
        description="Kelola daftar produk."
        title="Daftar Produk"
        actions={
          <div className="inline-stack">
            <Button className="button-secondary" onClick={() => navigate("/item-categories")}>
              Kelola Kategori
            </Button>
            {can("product.create") ? (
              <Button onClick={() => navigate("/items/create")}>Tambah Produk</Button>
            ) : null}
          </div>
        }
      />

      <FilterBar>
        <div className="field">
          <label htmlFor="item-search">Cari produk</label>
          <input
            className="input"
            id="item-search"
            onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              if (event.target.value) {
                next.set("search", event.target.value);
              } else {
                next.delete("search");
              }
              setSearchParams(next);
            }}
            placeholder="Cari kode atau nama produk"
            value={searchParams.get("search") ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="item-type">Tipe Produk</label>
          <SearchableSelect
            id="item-type"
            onChange={(val) => {
              const next = new URLSearchParams(searchParams);
              if (val) {
                next.set("item_type", val);
              } else {
                next.delete("item_type");
              }
              setSearchParams(next);
            }}
            value={itemType}
            options={[
              { value: "", label: "Semua tipe" },
              { value: "physical", label: "Barang fisik" },
              { value: "service", label: "Jasa" },
              { value: "bundle", label: "Bundle" },
              { value: "non_stock", label: "Non-stock" },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="item-status">Status</label>
          <SearchableSelect
            id="item-status"
            onChange={(val) => {
              const next = new URLSearchParams(searchParams);
              next.set("status", val);
              setSearchParams(next);
            }}
            value={status}
            options={[
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Nonaktif" },
              { value: "all", label: "Semua" },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="tracked">Pantau stok</label>
          <SearchableSelect
            id="tracked"
            onChange={(val) => {
              const next = new URLSearchParams(searchParams);
              if (val) {
                next.set("stock_tracked", val);
              } else {
                next.delete("stock_tracked");
              }
              setSearchParams(next);
            }}
            value={stockTracked}
            options={[
              { value: "", label: "Semua" },
              { value: "true", label: "Dipantau" },
              { value: "false", label: "Tanpa stok" },
            ]}
          />
        </div>
      </FilterBar>

      <SectionCard
        description={`${items.length} item cocok dengan filter saat ini.`}
        title="Daftar Produk"
      >
        {items.length > 0 ? (
          <DataTable
            columns={[
              {
                header: "Produk",
                render: (item) => (
                  <div className="field-stack">
                    <strong>{item.itemName}</strong>
                    <span className="muted">{item.itemCode}</span>
                  </div>
                ),
              },
              {
                header: "Kategori",
                render: (item) =>
                  activeTenantData.itemCategories.find((entry) => entry.id === item.categoryId)?.name ?? "-",
              },
              {
                header: "Tipe",
                render: (item) => <Badge tone="neutral">{item.itemType}</Badge>,
              },
              {
                header: "Harga Standar",
                align: "right",
                render: (item) => formatCurrency(item.standardPrice),
              },
              {
                header: "Stok",
                render: (item) => {
                  const balance = activeTenantData.stockBalances.find((entry) => entry.itemId === item.id);
                  return item.stockTracked ? (
                    <div className="field-stack">
                      <span className="strong">{balance?.availableQty ?? 0} tersedia</span>
                      <span className="muted">Minimum {item.minStockQty ?? 0}</span>
                    </div>
                  ) : (
                    <span className="muted">Tidak dipantau</span>
                  );
                },
              },
              {
                header: "Status",
                render: (item) => (
                  <Badge tone={item.status === "active" ? "success" : "warning"}>
                    {item.status === "active" ? "Aktif" : "Nonaktif"}
                  </Badge>
                ),
              },
              {
                header: "Aksi",
                render: (item) => (
                  <div className="inline-stack">
                    <Button onClick={() => navigate(`/items/${item.id}`)} variant="secondary">
                      Detail
                    </Button>
                  </div>
                ),
              },
            ]}
            rowKey={(item) => item.id}
            rows={items}
          />
        ) : (
          <EmptyState
            action={can("product.create") ? <Button onClick={() => navigate("/items/create")}>Tambah Produk</Button> : undefined}
            description="Belum ada produk yang cocok dengan filter ini. Ubah filter atau tambahkan produk baru."
            title="Daftar produk kosong"
          />
        )}
      </SectionCard>
    </div>
  );
}

export function ItemDetailPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { activeTenantData, archiveItem, can } = useMockApp();
  const [archiveOpen, setArchiveOpen] = useState(false);

  if (!activeTenantData) {
    return null;
  }

  const item = activeTenantData.items.find((entry) => entry.id === itemId);
  const balance = activeTenantData.stockBalances.find((entry) => entry.itemId === itemId);
  const category = activeTenantData.itemCategories.find((entry) => entry.id === item?.categoryId);

  if (!item) {
    return (
      <Notice tone="danger" title="Produk tidak ditemukan">
        Produk yang Anda cari tidak ada di tenant aktif.
      </Notice>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Produk &gt; {item.itemCode}</span>}
        description={item.summary}
        title={item.itemName}
        actions={
          <div className="inline-stack">
            <Button onClick={() => navigate(-1)} variant="ghost">
              &larr; Kembali
            </Button>
            {item.stockTracked ? (
              <Button onClick={() => navigate(`/stock/${item.id}`)} variant="secondary">
                Lihat Stok
              </Button>
            ) : null}
            {can("product.update") ? (
              <Button onClick={() => navigate(`/items/${item.id}/edit`)} variant="secondary">
                Edit
              </Button>
            ) : null}
            {can("product.archive") ? (
              <Button onClick={() => setArchiveOpen(true)} variant="danger">
                Arsipkan
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid-2">
        <SectionCard title="Informasi Dasar" description="Detail umum produk.">
          <div className="kv-grid">
            <div className="kv-item">
              <span>Kode Produk</span>
              <strong>{item.itemCode}</strong>
            </div>
            <div className="kv-item">
              <span>Kategori</span>
              <strong>{category?.name ?? "-"}</strong>
            </div>
            <div className="kv-item">
              <span>Tipe</span>
              <strong>{item.itemType}</strong>
            </div>
            <div className="kv-item">
              <span>Harga Standar</span>
              <strong>{formatCurrency(item.standardPrice)}</strong>
            </div>
            <div className="kv-item">
              <span>Satuan</span>
              <strong>{item.uom}</strong>
            </div>
            <div className="kv-item">
              <span>Status</span>
              <strong>{item.status === "active" ? "Aktif" : "Nonaktif"}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Atribut Produk" description="Informasi spesifik tambahan yang melengkapi detail produk.">
          <div className="list-stack">
            {Object.keys(item.attributes).length > 0 ? (
              Object.entries(item.attributes).map(([key, value]) => (
                <div className="kv-item" key={key}>
                  <span>{key}</span>
                  <strong>{value}</strong>
                </div>
              ))
            ) : (
              <Notice tone="info">Produk ini belum memiliki atribut tambahan.</Notice>
            )}
          </div>
        </SectionCard>
      </div>

      {item.stockTracked ? (
        <SectionCard title="Kondisi Stok" description="Informasi real-time ketersediaan produk ini.">
          <div className="metric-strip">
            <div className="metric-box">
              <span className="muted">On hand</span>
              <strong>{balance?.onHandQty ?? 0}</strong>
            </div>
            <div className="metric-box">
              <span className="muted">Reserved</span>
              <strong>{balance?.reservedQty ?? 0}</strong>
            </div>
            <div className="metric-box">
              <span className="muted">Available</span>
              <strong>{balance?.availableQty ?? 0}</strong>
            </div>
            <div className="metric-box">
              <span className="muted">Minimum</span>
              <strong>{item.minStockQty ?? 0}</strong>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <ConfirmDialog
        cancelLabel="Tahan dulu"
        confirmLabel="Ya, arsipkan"
        description={`Produk ${item.itemName} akan dipindahkan ke status nonaktif dan tidak muncul lagi di daftar aktif.`}
        onCancel={() => setArchiveOpen(false)}
        onConfirm={() => {
          archiveItem(item.id);
          setArchiveOpen(false);
          navigate("/items");
        }}
        open={archiveOpen}
        title="Arsipkan produk"
        tone="danger"
      />
    </div>
  );
}

export function ItemFormPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { activeTenantData, saveItem } = useMockApp();
  const existing = activeTenantData?.items.find((entry) => entry.id === itemId);
  const [attributes, setAttributes] = useState(stringifyAttributes(existing?.attributes ?? {}));

  if (!activeTenantData) {
    return null;
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={
          <span>
            Dashboard &gt; Produk &gt; {existing ? `${existing.itemCode} &gt; Edit` : "Tambah Produk"}
          </span>
        }
        description="Data identitas produk."
        title={existing ? "Edit Produk" : "Tambah Produk"}
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
          const savedId = saveItem({
            id: existing?.id,
            categoryId: (formData.get("categoryId") as string) || undefined,
            itemCode: String(formData.get("itemCode")),
            itemName: String(formData.get("itemName")),
            itemType: formData.get("itemType") as Item["itemType"],
            status: formData.get("status") as Item["status"],
            stockTracked: formData.get("stockTracked") === "on",
            uom: String(formData.get("uom")),
            minStockQty: Number(formData.get("minStockQty")) || undefined,
            standardPrice: Number(formData.get("standardPrice")) || undefined,
            attributes: parseAttributes(attributes),
            summary: String(formData.get("summary")),
          });
          navigate(`/items/${savedId}`);
        }}
      >
        <SectionCard title="Informasi Dasar" description="Identitas unik yang akan merepresentasikan produk Anda.">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="itemCode">Kode produk</label>
              <input className="input" defaultValue={existing?.itemCode ?? ""} id="itemCode" name="itemCode" required />
            </div>
            <div className="field">
              <label htmlFor="itemName">Nama produk</label>
              <input className="input" defaultValue={existing?.itemName ?? ""} id="itemName" name="itemName" required />
            </div>
            <div className="field">
              <label htmlFor="categoryId">Kategori</label>
              <SearchableSelect
                name="categoryId"
                id="categoryId"
                defaultValue={existing?.categoryId ?? ""}
                options={[
                  { value: "", label: "Tanpa kategori" },
                  ...activeTenantData.itemCategories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="itemType">Tipe Produk</label>
              <SearchableSelect
                name="itemType"
                id="itemType"
                defaultValue={existing?.itemType ?? "physical"}
                options={[
                  { value: "physical", label: "Barang fisik" },
                  { value: "service", label: "Jasa" },
                  { value: "bundle", label: "Bundle ringan" },
                  { value: "non_stock", label: "Non-stock" },
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="uom">Satuan</label>
              <input className="input" defaultValue={existing?.uom ?? ""} id="uom" name="uom" placeholder="sak, botol, sesi" required />
            </div>
            <div className="field">
              <label htmlFor="standardPrice">Harga standar</label>
              <input className="input" defaultValue={existing?.standardPrice ?? ""} id="standardPrice" min="0" name="standardPrice" type="number" />
            </div>
            <div className="field">
              <label htmlFor="minStockQty">Minimum stok</label>
              <input className="input" defaultValue={existing?.minStockQty ?? ""} id="minStockQty" min="0" name="minStockQty" type="number" />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <SearchableSelect
                name="status"
                id="status"
                defaultValue={existing?.status ?? "active"}
                options={[
                  { value: "active", label: "Aktif" },
                  { value: "inactive", label: "Nonaktif" },
                ]}
              />
            </div>
            <div className="field form-grid-full">
              <label>
                <input defaultChecked={existing?.stockTracked ?? true} name="stockTracked" type="checkbox" />
                <span style={{ marginLeft: 10 }}>Pantau stok produk ini</span>
              </label>
              <span className="helper-text">
                Jika aktif, halaman stok akan memantau produk ini terhadap batas minimum stok.
              </span>
            </div>
            <div className="field form-grid-full">
              <label htmlFor="summary">Ringkasan operasional</label>
              <textarea className="textarea" defaultValue={existing?.summary ?? ""} id="summary" name="summary" placeholder="Tulis konteks bisnis singkat produk ini." />
            </div>
            <div className="field form-grid-full">
              <label htmlFor="attributes">Atribut ringan</label>
              <textarea
                className="textarea"
                id="attributes"
                onChange={(event) => setAttributes(event.target.value)}
                placeholder={"brand: Sawargi\nsegment: Retail grosir"}
                value={attributes}
              />
              <span className="helper-text">Tulis satu atribut per baris dengan format key: value.</span>
            </div>
          </div>
        </SectionCard>

        <div className="form-actions">
          <Button onClick={() => navigate(existing ? `/items/${existing.id}` : "/items")} variant="secondary">
            Batal
          </Button>
          <Button type="submit">{existing ? "Simpan Perubahan" : "Simpan Produk"}</Button>
        </div>
      </form>
    </div>
  );
}

export function ItemCategoriesPage() {
  const { activeTenantData, notify } = useMockApp();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [parentId, setParentId] = useState("");

  if (!activeTenantData) {
    return null;
  }

  const parentCategories = activeTenantData.itemCategories.filter((c) => !c.parentCategoryId);
  const getChildren = (parentId: string) => activeTenantData.itemCategories.filter((c) => c.parentCategoryId === parentId);

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Produk &gt; Kategori</span>}
        description="Kelompokkan produk ke dalam kategori utama dan sub-kategori agar rapi dan mempermudah filter pencarian."
        title="Kategori Produk"
      />

      <div className="grid-2">
        <SectionCard title="Daftar Kategori" description="Daftar hierarki kategori (maksimal 2 level visual).">
          <div className="list-stack">
            {parentCategories.map((parent) => (
              <div key={parent.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Parent Kategori */}
                <div className="list-item" style={{ borderLeft: "4px solid var(--color-primary)" }}>
                  <div className="inline-stack" style={{ justifyContent: "space-between" }}>
                    <strong>{parent.name}</strong>
                    <Badge tone="neutral">{parent.code}</Badge>
                  </div>
                  <span className="muted">Kategori Utama</span>
                </div>

                {/* Sub Kategori */}
                <div style={{ paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {getChildren(parent.id).map((child) => (
                    <div className="list-item" key={child.id} style={{ padding: "12px", background: "var(--bg-canvas)" }}>
                      <div className="inline-stack" style={{ justifyContent: "space-between" }}>
                        <strong style={{ fontSize: "0.9rem" }}>↳ {child.name}</strong>
                        <Badge tone="neutral" subtle>{child.code}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tambah Kategori" description="Simpan kategori atau sub-kategori baru.">
          <form
            className="field-stack"
            onSubmit={(event) => {
              event.preventDefault();
              notify(
                "Kategori tersimpan",
                `Kategori ${name} berhasil ditambahkan ke hierarki kelas kategori Anda.`,
                "success",
              );
              setName("");
              setCode("");
              setParentId("");
            }}
          >
            <div className="field">
              <label htmlFor="category-parent">Kategori Induk (Opsional)</label>
              <SearchableSelect
                id="category-parent"
                onChange={(val) => setParentId(val)}
                value={parentId}
                options={[
                  { value: "", label: "-- Kategori Utama (Tidak Ada Induk) --" },
                  ...parentCategories.map((p: any) => ({ value: p.id, label: p.name })),
                ]}
              />
              <span className="helper-text">Pilih induk jika ini adalah sub-kategori. Kosongkan untuk kategori utama.</span>
            </div>
            <div className="field" style={{ marginTop: "12px" }}>
              <label htmlFor="category-name">Nama kategori</label>
              <input className="input" id="category-name" onChange={(event) => setName(event.target.value)} required value={name} />
            </div>
            <div className="field">
              <label htmlFor="category-code">Kode kategori</label>
              <input className="input" id="category-code" onChange={(event) => setCode(event.target.value)} required value={code} />
            </div>
            <div className="form-actions">
              <Link className="button button-secondary" to="/items">
                Kembali ke Produk
              </Link>
              <Button type="submit">Tambah Kategori</Button>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
