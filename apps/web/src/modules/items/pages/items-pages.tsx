import React, { useState } from "react";
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
import { formatCurrency } from "../../../utils";

type AttributeField = {
  id: string;
  name: string;
  value: string;
};

function createAttributeField(name = "", value = ""): AttributeField {
  return { id: `attribute-${crypto.randomUUID()}`, name, value };
}

function updateAttributeName(attributes: AttributeField[], attributeId: string, name: string) {
  return attributes.map((entry) => (entry.id === attributeId ? { ...entry, name } : entry));
}

function updateAttributeValue(attributes: AttributeField[], attributeId: string, value: string) {
  return attributes.map((entry) => (entry.id === attributeId ? { ...entry, value } : entry));
}

function removeAttribute(attributes: AttributeField[], attributeId: string) {
  return attributes.filter((entry) => entry.id !== attributeId);
}

export function ItemsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspaceData, can } = useMockApp();

  if (!activeWorkspaceData) {
    return null;
  }

  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const itemType = searchParams.get("item_type") ?? "";
  const status = searchParams.get("status") ?? "active";
  const stockTracked = searchParams.get("stock_tracked") ?? "";

  const items = activeWorkspaceData.items.filter((item) => {
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
                  activeWorkspaceData.itemCategories.find((entry) => entry.id === item.categoryId)?.name ?? "-",
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
                  const balance = activeWorkspaceData.stockBalances.find((entry) => entry.itemId === item.id);
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
  const { activeWorkspaceData, archiveItem, can } = useMockApp();
  const [archiveOpen, setArchiveOpen] = useState(false);

  if (!activeWorkspaceData) {
    return null;
  }

  const item = activeWorkspaceData.items.find((entry) => entry.id === itemId);
  const balance = activeWorkspaceData.stockBalances.find((entry) => entry.itemId === itemId);
  const category = activeWorkspaceData.itemCategories.find((entry) => entry.id === item?.categoryId);

  if (!item) {
    return (
      <Notice tone="danger" title="Produk tidak ditemukan">
        Produk yang Anda cari tidak tersedia pada context perusahaan saat ini.
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
  const { activeWorkspaceData, saveItem } = useMockApp();
  const existing = activeWorkspaceData?.items.find((entry) => entry.id === itemId);

  const [attributes, setAttributes] = useState<AttributeField[]>(() => {
    if (!existing?.attributes) return [];
    return Object.entries(existing.attributes).map(([name, value]) => createAttributeField(name, value));
  });

  if (!activeWorkspaceData) {
    return null;
  }

  const attributeKeySuggestions = Array.from(
    new Set(activeWorkspaceData.items.flatMap((item) => Object.keys(item.attributes))),
  ).map((key) => ({ label: key, value: key }));

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
          const attrsRecord: Record<string, string> = {};
          attributes.forEach((attr) => {
            if (attr.name.trim()) {
              attrsRecord[attr.name.trim()] = attr.value;
            }
          });
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
            attributes: attrsRecord,
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
                  ...activeWorkspaceData.itemCategories.map((category) => ({
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
          </div>
        </SectionCard>

        <SectionCard
          title="Atribut Produk"
          description="Catat data spesifik produk seperti brand, segmen pasar, bahan baku, dsb."
        >
          <div className="list-stack">
            {attributes.map((attr) => (
              <div
                key={attr.id}
                className="split-layout"
                style={{ alignItems: "flex-end", gap: "12px", borderBottom: "1px dashed var(--border-subtle)", paddingBottom: "12px" }}
              >
                <div className="field">
                  <label htmlFor={`item-attribute-name-${attr.id}`}>Nama Atribut (Contoh: Brand)</label>
                  <SearchableSelect
                    id={`item-attribute-name-${attr.id}`}
                    options={attributeKeySuggestions}
                    value={attr.name}
                    onChange={(val) => setAttributes((current) => updateAttributeName(current, attr.id, val))}
                    placeholder="Pilih atau ketik..."
                    allowCreate={true}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`item-attribute-value-${attr.id}`}>Keterangan</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      className="input"
                      id={`item-attribute-value-${attr.id}`}
                      style={{ flex: 1 }}
                      value={attr.value}
                      onChange={(e) => setAttributes((current) => updateAttributeValue(current, attr.id, e.target.value))}
                      placeholder="Isi nilai atribut"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setAttributes((current) => removeAttribute(current, attr.id))}
                      style={{ color: "var(--color-danger)" }}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAttributes((current) => [...current, createAttributeField()])}
              >
                + Tambah Atribut Baru
              </Button>
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

type CategoryNode = {
  id: string;
  code: string;
  name: string;
  parentCategoryId?: string;
  sortOrder: number;
  depth: number;
  children: CategoryNode[];
};

function buildCategoryTree(
  categories: { id: string; code: string; name: string; parentCategoryId?: string; sortOrder: number }[],
  parentId: string | undefined = undefined,
  depth = 0,
): CategoryNode[] {
  return categories
    .filter((c) => c.parentCategoryId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      ...c,
      depth,
      children: buildCategoryTree(categories, c.id, depth + 1),
    }));
}

function flattenCategoryTree(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((node) => [node, ...flattenCategoryTree(node.children)]);
}

function getDescendantIds(nodes: CategoryNode[], targetId: string): string[] {
  const target = flattenCategoryTree(nodes).find((n) => n.id === targetId);
  if (!target) return [];
  return [target.id, ...flattenCategoryTree(target.children).map((n) => n.id)];
}

type CategoryTreeNodeProps = {
  node: CategoryNode;
  onEdit: (node: CategoryNode) => void;
};

function CategoryTreeNode({ node, onEdit }: CategoryTreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const indent = node.depth * 20;

  return (
    <div>
      <div
        className="list-item"
        style={{
          marginLeft: indent,
          borderLeft: node.depth === 0
            ? "3px solid var(--color-primary)"
            : "3px solid var(--border-subtle)",
        }}
      >
        <div className="inline-stack" style={{ justifyContent: "space-between" }}>
          <div className="inline-stack" style={{ gap: "6px", minWidth: 0 }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                  padding: "0 2px",
                  flexShrink: 0,
                }}
              >
                {expanded ? "▾" : "▸"}
              </button>
            ) : (
              <span style={{ width: "14px", flexShrink: 0, display: "inline-block" }} />
            )}
            <div style={{ minWidth: 0 }}>
              <strong style={{ fontSize: node.depth === 0 ? "0.95rem" : "0.875rem" }}>
                {node.name}
              </strong>
              {node.depth > 0 && (
                <span className="muted" style={{ fontSize: "0.75rem", marginLeft: "6px" }}>
                  Level {node.depth}
                </span>
              )}
            </div>
          </div>
          <div className="inline-stack" style={{ gap: "6px", flexShrink: 0 }}>
            <Badge tone="neutral" subtle>{node.code}</Badge>
            <Button onClick={() => onEdit(node)} variant="secondary" size="sm">
              Edit
            </Button>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <CategoryTreeNode key={child.id} node={child} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ItemCategoriesPage() {
  const { activeWorkspaceData, saveItemCategory } = useMockApp();
  const [editingId, setEditingId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [parentId, setParentId] = useState("");

  if (!activeWorkspaceData) {
    return null;
  }

  const tree = buildCategoryTree(activeWorkspaceData.itemCategories);
  const flat = flattenCategoryTree(tree);

  const excludedIds = editingId ? getDescendantIds(tree, editingId) : [];
  const parentOptions = [
    { value: "", label: "— Kategori Utama (tanpa induk) —" },
    ...flat
      .filter((n) => !excludedIds.includes(n.id))
      .map((n) => ({
        value: n.id,
        label: "\u00A0".repeat(n.depth * 4) + (n.depth > 0 ? "↳ " : "") + n.name,
      })),
  ];

  function handleEdit(node: CategoryNode) {
    setEditingId(node.id);
    setName(node.name);
    setCode(node.code);
    setParentId(node.parentCategoryId ?? "");
  }

  function handleReset() {
    setEditingId(undefined);
    setName("");
    setCode("");
    setParentId("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveItemCategory({
      id: editingId,
      name,
      code,
      parentCategoryId: parentId || undefined,
    });
    handleReset();
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Produk &gt; Kategori</span>}
        description="Kelompokkan produk ke dalam hierarki kategori tanpa batas kedalaman."
        title="Kategori Produk"
      />

      <div className="grid-2">
        <SectionCard
          title="Hierarki Kategori"
          description="Klik ▸ untuk expand, klik Edit untuk mengubah entri."
        >
          <div className="list-stack">
            {tree.length > 0 ? (
              tree.map((node) => (
                <CategoryTreeNode key={node.id} node={node} onEdit={handleEdit} />
              ))
            ) : (
              <EmptyState
                title="Belum ada kategori"
                description="Tambahkan kategori pertama menggunakan form di sebelah kanan."
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={editingId ? "Edit Kategori" : "Tambah Kategori"}
          description={
            editingId
              ? "Perbarui nama, kode, atau posisi induk kategori ini."
              : "Tambah kategori baru pada level mana pun dalam hierarki."
          }
        >
          <form className="field-stack" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="category-parent">Kategori Induk</label>
              <SearchableSelect
                id="category-parent"
                onChange={(val) => setParentId(val)}
                value={parentId}
                options={parentOptions}
              />
              <span className="helper-text">
                Kosongkan untuk menjadikan kategori utama (level 0).
              </span>
            </div>
            <div className="field">
              <label htmlFor="category-name">Nama kategori</label>
              <input
                className="input"
                id="category-name"
                onChange={(e) => setName(e.target.value)}
                required
                value={name}
              />
            </div>
            <div className="field">
              <label htmlFor="category-code">Kode kategori</label>
              <input
                className="input"
                id="category-code"
                onChange={(e) => setCode(e.target.value)}
                required
                value={code}
              />
            </div>
            <div className="form-actions">
              {editingId ? (
                <Button onClick={handleReset} type="button" variant="secondary">
                  Batal Edit
                </Button>
              ) : (
                <Link className="button button-secondary" to="/items">
                  Kembali ke Produk
                </Link>
              )}
              <Button type="submit">{editingId ? "Simpan Perubahan" : "Tambah Kategori"}</Button>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
