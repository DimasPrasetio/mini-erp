import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  FilterBar,
  Notice,
  PageHeader,
  SectionCard,
  SearchableSelect,
} from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import { formatDateTime } from "../../../utils";

function getFormTextValue(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value : "";
}

export function StockListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspaceData, can } = useMockApp();

  if (!activeWorkspaceData) {
    return null;
  }

  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const criticalOnly = searchParams.get("critical_only") === "true";

  const rows = activeWorkspaceData.stockBalances.filter((balance) => {
    const item = activeWorkspaceData.items.find((entry) => entry.id === balance.itemId);
    if (!item) {
      return false;
    }
    const matchesSearch =
      search.length === 0 ||
      item.itemName.toLowerCase().includes(search) ||
      item.itemCode.toLowerCase().includes(search);
    const matchesCritical = !criticalOnly || balance.availableQty <= (item.minStockQty ?? 0);
    return matchesSearch && matchesCritical;
  });

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Stok</span>}
        description="Ketersediaan rincian barang."
        title="Saldo Stok"
        actions={
          <div className="inline-stack">
            <Link className="button button-secondary" to="/stock/movements">
              Riwayat Mutasi
            </Link>
            {can("stock.create") ? (
              <Button onClick={() => navigate("/stock/adjustments/create")}>Penyesuaian Stok</Button>
            ) : null}
          </div>
        }
      />

      <FilterBar>
        <div className="field">
          <label htmlFor="stock-search">Cari item</label>
          <input
            className="input"
            id="stock-search"
            onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              if (event.target.value) {
                next.set("search", event.target.value);
              } else {
                next.delete("search");
              }
              setSearchParams(next);
            }}
            placeholder="Cari kode atau nama item"
            value={searchParams.get("search") ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="critical-only">Tampilan</label>
          <SearchableSelect
            id="critical-only"
            onChange={(val) => {
              const next = new URLSearchParams(searchParams);
              if (val === "true") {
                next.set("critical_only", "true");
              } else {
                next.delete("critical_only");
              }
              setSearchParams(next);
            }}
            value={criticalOnly ? "true" : ""}
            options={[
              { value: "", label: "Semua produk dipantau" },
              { value: "true", label: "Stok kritis saja" },
            ]}
          />
        </div>
      </FilterBar>

      <SectionCard description={`${rows.length} item dipantau pada lokasi saat ini.`} title="Saldo Per Item">
        {rows.length > 0 ? (
          <DataTable
            columns={[
              {
                header: "Item",
                render: (balance) => {
                  const item = activeWorkspaceData.items.find((entry) => entry.id === balance.itemId);
                  return (
                    <div className="field-stack">
                      <strong>{item?.itemName}</strong>
                      <span className="muted">{item?.itemCode}</span>
                    </div>
                  );
                },
              },
              {
                header: "Fisik",
                render: (balance) => balance.onHandQty,
              },
              {
                header: "Dipesan",
                render: (balance) => balance.reservedQty,
              },
              {
                header: "Tersedia",
                render: (balance) => {
                  const item = activeWorkspaceData.items.find((entry) => entry.id === balance.itemId);
                  const isCritical = balance.availableQty <= (item?.minStockQty ?? 0);
                  return (
                    <div className="inline-stack">
                      <strong>{balance.availableQty}</strong>
                      {isCritical ? <Badge tone="danger">Kritis</Badge> : <Badge tone="success">Aman</Badge>}
                    </div>
                  );
                },
              },
              {
                header: "Update Terakhir",
                render: (balance) => formatDateTime(balance.updatedAt),
              },
              {
                header: "Aksi",
                render: (balance) => (
                  <div className="inline-stack">
                    <Button onClick={() => navigate(`/stock/${balance.itemId}`)} variant="secondary">
                      Detail
                    </Button>
                  </div>
                ),
              },
            ]}
            rowKey={(balance) => balance.id}
            rows={rows}
          />
        ) : (
          <EmptyState
            description="Belum ada produk yang dipantau atau filter terlalu sempit."
            title="Saldo stok kosong"
          />
        )}
      </SectionCard>
    </div>
  );
}

export function StockDetailPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const { activeWorkspaceData, can } = useMockApp();

  if (!activeWorkspaceData) {
    return null;
  }

  const item = activeWorkspaceData.items.find((entry) => entry.id === itemId);
  const balance = activeWorkspaceData.stockBalances.find((entry) => entry.itemId === itemId);
  const movements = activeWorkspaceData.stockMovements
    .filter((movement) => movement.itemId === itemId)
    .sort((left, right) => right.movedAt.localeCompare(left.movedAt));

  if (!item) {
    return (
      <Notice tone="danger" title="Item stok tidak ditemukan">
        Detail item yang Anda cari tidak tersedia pada cabang aktif.
      </Notice>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Stok &gt; {item.itemCode}</span>}
        description={`Informasi stok dan riwayat mutasi terbaru untuk produk: ${item.itemName}.`}
        title={item.itemName}
        actions={
          <div className="inline-stack">
            <Button onClick={() => navigate(-1)} variant="ghost">
              &larr; Kembali
            </Button>
            {can("stock.create") ? (
              <Button onClick={() => navigate(`/stock/adjustments/create?item_id=${item.id}`)}>
                Sesuaikan Stok
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="metric-strip">
        <div className="metric-box">
          <span className="muted">Fisik</span>
          <strong>{balance?.onHandQty ?? 0}</strong>
        </div>
        <div className="metric-box">
          <span className="muted">Dipesan</span>
          <strong>{balance?.reservedQty ?? 0}</strong>
        </div>
        <div className="metric-box">
          <span className="muted">Tersedia</span>
          <strong>{balance?.availableQty ?? 0}</strong>
        </div>
        <div className="metric-box">
          <span className="muted">Minimum</span>
          <strong>{item.minStockQty ?? 0}</strong>
        </div>
      </div>

      <SectionCard title="Riwayat Mutasi" description="Pergerakan stok keluar dan masuk terkait barang ini.">
        <DataTable
          columns={[
            {
              header: "Waktu",
              render: (movement) => formatDateTime(movement.movedAt),
            },
            {
              header: "Tipe",
              render: (movement) => <Badge tone={movement.movementType === "out" ? "danger" : "info"}>{movement.movementType}</Badge>,
            },
            {
              header: "Qty",
              render: (movement) => movement.quantity,
            },
            {
              header: "Saldo",
              render: (movement) => `${movement.balanceBefore} -> ${movement.balanceAfter}`,
            },
            {
              header: "Alasan",
              render: (movement) => movement.reasonText,
            },
          ]}
          rowKey={(movement) => movement.id}
          rows={movements}
        />
      </SectionCard>
    </div>
  );
}

export function StockAdjustmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedItemId = searchParams.get("item_id") ?? "";
  const { activeWorkspaceData, saveStockAdjustment } = useMockApp();

  if (!activeWorkspaceData) {
    return null;
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Stok &gt; Penyesuaian</span>}
        description="Koreksi jumlah stok."
        title="Penyesuaian Stok"
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
          const itemId = getFormTextValue(formData, "itemId");
          saveStockAdjustment({
            itemId,
            movementType: formData.get("movementType") as "in" | "out" | "adjustment",
            quantity: Number(formData.get("quantity")),
            reasonText: getFormTextValue(formData, "reasonText"),
          });
          navigate(`/stock/${itemId}`);
        }}
      >
        <SectionCard title="Input Penyesuaian" description="Tentukan tipe perubahan stok yang akan dilakukan dengan saksama.">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="itemId">Item</label>
              <SearchableSelect
                id="itemId"
                name="itemId"
                defaultValue={preselectedItemId || activeWorkspaceData.items[0]?.id}
                options={activeWorkspaceData.items.filter((item) => item.stockTracked).map((item) => ({ value: item.id, label: item.itemName }))}
              />
            </div>
            <div className="field">
              <label htmlFor="movementType">Tipe mutasi</label>
              <SearchableSelect
                id="movementType"
                name="movementType"
                defaultValue="adjustment"
                options={[
                  { value: "adjustment", label: "Koreksi Stok" },
                  { value: "in", label: "Stok Masuk" },
                  { value: "out", label: "Stok Keluar" },
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <input className="input" defaultValue={1} id="quantity" min="1" name="quantity" type="number" />
            </div>
            <div className="field form-grid-full">
              <label htmlFor="reasonText">Alasan penyesuaian</label>
              <textarea className="textarea" id="reasonText" name="reasonText" placeholder="Contoh: koreksi hasil stock opname pagi" required />
            </div>
          </div>
        </SectionCard>

        <div className="form-actions">
          <Button onClick={() => navigate(preselectedItemId ? `/stock/${preselectedItemId}` : "/stock")} variant="secondary">
            Batal
          </Button>
          <Button type="submit">Simpan Penyesuaian</Button>
        </div>
      </form>
    </div>
  );
}

export function StockMovementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspaceData } = useMockApp();

  if (!activeWorkspaceData) {
    return null;
  }

  const movementType = searchParams.get("movement_type") ?? "";
  const movements = activeWorkspaceData.stockMovements.filter(
    (movement) => movementType.length === 0 || movement.movementType === movementType,
  );

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Stok &gt; Riwayat Mutasi</span>}
        description="Awasi seluruh riwayat pergerakan stok keluar-masuk secara menyeluruh."
        title="Riwayat Mutasi"
      />

      <FilterBar>
        <div className="field">
          <label htmlFor="movement-type">Tipe mutasi</label>
          <SearchableSelect
            id="movement-type"
            onChange={(val) => {
              const next = new URLSearchParams(searchParams);
              if (val) {
                next.set("movement_type", val);
              } else {
                next.delete("movement_type");
              }
              setSearchParams(next);
            }}
            value={movementType}
            options={[
              { value: "", label: "Semua" },
              { value: "in", label: "Masuk" },
              { value: "out", label: "Keluar" },
              { value: "adjustment", label: "Koreksi" },
            ]}
          />
        </div>
      </FilterBar>

      <SectionCard title="Riwayat Mutasi" description="Seluruh riwayat transisi terekam.">
        <DataTable
          columns={[
            {
              header: "Item",
              render: (movement) =>
                activeWorkspaceData.items.find((item) => item.id === movement.itemId)?.itemName ?? "-",
            },
            {
              header: "Waktu",
              render: (movement) => formatDateTime(movement.movedAt),
            },
            {
              header: "Tipe",
              render: (movement) => <Badge tone="accent">{movement.movementType}</Badge>,
            },
            {
              header: "Qty",
              render: (movement) => movement.quantity,
            },
            {
              header: "Alasan",
              render: (movement) => movement.reasonText,
            },
          ]}
          rowKey={(movement) => movement.id}
          rows={movements}
        />
      </SectionCard>
    </div>
  );
}
